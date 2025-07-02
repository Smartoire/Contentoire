from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class UserModel(BaseModel):
    id: str
    name: str
    email: str
    avatar: Optional[str] = None
    enabled: bool = True

users: List[UserModel] = []

@router.get("/api/users", response_model=List[UserModel])
def list_users():
    return users

@router.post("/api/users", response_model=UserModel)
def create_user(user: UserModel):
    users.append(user)
    return user

@router.put("/api/users/{user_id}", response_model=UserModel)
def update_user(user_id: str, user: UserModel):
    for idx, u in enumerate(users):
        if u.id == user_id:
            users[idx] = user
            return user
    raise HTTPException(status_code=404, detail="User not found")

@router.delete("/api/users/{user_id}")
def delete_user(user_id: str):
    global users
    users = [u for u in users if u.id != user_id]
    return {"ok": True}
