import secrets
from typing import Optional

import pyotp
from Contentoire.api.data.db import get_db
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from models.user import UserDB
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy.orm import Session

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class User(BaseModel):
    id: str
    username: str
    email: str
    full_name: Optional[str] = None
    disabled: Optional[bool] = None
    mfa_enabled: Optional[bool] = None

    class Config:
        orm_mode = True

class UserInDB(User):
    hashed_password: str
    mfa_secret: Optional[str] = None
    trusted_devices: Optional[str] = None

class MFAVerifyRequest(BaseModel):
    mfa_code: str
    device_token: Optional[str] = None

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_user_by_username(db: Session, username: str):
    return db.query(UserDB).filter(UserDB.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(UserDB).filter(UserDB.email == email).first()

def create_guest_user(db: Session, email: str) -> UserDB:
    import uuid
    user = UserDB(
        id=str(uuid.uuid4()),
        username=email,
        email=email,
        full_name=None,
        hashed_password=pwd_context.hash(secrets.token_urlsafe(16)),
        disabled=False,
        mfa_enabled=False,
        mfa_secret=None,
        trusted_devices=None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def authenticate_user_db(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user

def is_trusted_device(user: UserDB, device_token: Optional[str]) -> bool:
    if not user.trusted_devices or not device_token:
        return False
    return device_token in user.trusted_devices.split(",")

def add_trusted_device(user: UserDB, device_token: str, db: Session):
    tokens = set(user.trusted_devices.split(",")) if user.trusted_devices else set()
    tokens.add(device_token)
    user.trusted_devices = ",".join(tokens)
    db.commit()

def get_enabled_auth_providers():
    # Query your auth_providers table for enabled providers
    # For demo, return ["local", "google", ...]
    return ["local"]

# Example: authenticate with external provider (stub)
def authenticate_with_provider(provider: str, form_data: OAuth2PasswordRequestForm):
    # Implement OAuth2/OpenID Connect flow for Google, Facebook, etc.
    # Return user info if successful, else None
    return None

def generate_device_token():
    return secrets.token_urlsafe(32)

@router.post("/token")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
    request: Request = None
):
    enabled_providers = get_enabled_auth_providers()
    user = None

    # Try local DB auth if enabled
    if "local" in enabled_providers:
        user = authenticate_user_db(db, form_data.username, form_data.password)

    # If not found, try by email and create guest if not exists
    if not user:
        user = get_user_by_email(db, form_data.username)
        if not user:
            user = create_guest_user(db, form_data.username)

    # Try external providers if enabled and not found in local
    if not user:
        for provider in enabled_providers:
            if provider != "local":
                user = authenticate_with_provider(provider, form_data)
                if user:
                    break

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")

    # MFA check
    device_token = request.cookies.get("trusted_device") if request else None
    if user.mfa_enabled and not is_trusted_device(user, device_token):
        # Return a response indicating MFA required
        return {
            "mfa_required": True,
            "mfa_type": "totp",
            "user_id": user.id,
            "detail": "MFA required. Please provide TOTP code."
        }

    # Return a fake JWT token for demo (replace with real JWT in production)
    return {"access_token": user.username + "_token", "token_type": "bearer"}

@router.post("/verify-mfa")
async def verify_mfa(
    req: MFAVerifyRequest,
    db: Session = Depends(get_db)
):
    # Find user by context (in real app, use session or temp token)
    # For demo, assume user_id is passed as query param or in req
    user_id = req.device_token  # For demo, use device_token as user_id
    user = db.query(UserDB).filter(UserDB.id == user_id).first()
    if not user or not user.mfa_enabled or not user.mfa_secret:
        raise HTTPException(status_code=400, detail="MFA not enabled for user")

    totp = pyotp.TOTP(user.mfa_secret)
    if not totp.verify(req.mfa_code):
        raise HTTPException(status_code=401, detail="Invalid MFA code")

    # Mark device as trusted if requested
    device_token = generate_device_token()
    add_trusted_device(user, device_token, db)

    # Return JWT and set trusted device token (frontend should store as cookie)
    return {
        "access_token": user.username + "_token",
        "token_type": "bearer",
        "trusted_device": device_token
    }

@router.get("/users/me", response_model=User)
async def read_users_me(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # For demonstration, extract username from token
    username = token.replace("_token", "")
    user = get_user_by_username(db, username)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    return user
