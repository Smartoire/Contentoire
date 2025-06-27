# ...existing code from /home/vahid/Projects/Contentoire/api/routes/auth_providers.py...
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/api/v1/providers/auth")

class AuthProvider(BaseModel):
    id: str
    title: str
    logo: str
    enabled: bool = True

auth_providers: List[AuthProvider] = []

@router.get("/", response_model=List[AuthProvider])
def list_auth_providers():
    return auth_providers

@router.post("/", response_model=AuthProvider)
def create_auth_provider(provider: AuthProvider):
    auth_providers.append(provider)
    return provider

@router.put("/{provider_id}", response_model=AuthProvider)
def update_auth_provider(provider_id: str, provider: AuthProvider):
    for idx, p in enumerate(auth_providers):
        if p.id == provider_id:
            auth_providers[idx] = provider
            return provider
    raise HTTPException(status_code=404, detail="Provider not found")

@router.delete("/{provider_id}")
def delete_auth_provider(provider_id: str):
    global auth_providers
    auth_providers = [p for p in auth_providers if p.id != provider_id]
    return {"ok": True}
