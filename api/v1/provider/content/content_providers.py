from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

router = APIRouter()

class ContentProvider(BaseModel):
    id: str
    title: str
    logo: str
    enabled: bool = True

content_providers: List[ContentProvider] = []

@router.get("/api/content-providers", response_model=List[ContentProvider])
def list_content_providers():
    return content_providers

@router.post("/api/content-providers", response_model=ContentProvider)
def create_content_provider(provider: ContentProvider):
    content_providers.append(provider)
    return provider

@router.put("/api/content-providers/{provider_id}", response_model=ContentProvider)
def update_content_provider(provider_id: str, provider: ContentProvider):
    for idx, p in enumerate(content_providers):
        if p.id == provider_id:
            content_providers[idx] = provider
            return provider
    raise HTTPException(status_code=404, detail="Provider not found")

@router.delete("/api/content-providers/{provider_id}")
def delete_content_provider(provider_id: str):
    global content_providers
    content_providers = [p for p in content_providers if p.id != provider_id]
    return {"ok": True}
