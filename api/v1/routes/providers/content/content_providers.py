from typing import List

from fastapi import APIRouter, HTTPException
from models.content_provider import ContentProvider

router = APIRouter(prefix="/providers/content")

content_providers: List[ContentProvider] = []

@router.get("/", response_model=List[ContentProvider])
def list_content_providers():
    return content_providers

@router.post("/", response_model=ContentProvider)
def create_content_provider(provider: ContentProvider):
    content_providers.append(provider)
    return provider

@router.put("/{provider_id}", response_model=ContentProvider)
def update_content_provider(provider_id: str, provider: ContentProvider):
    for idx, p in enumerate(content_providers):
        if p.id == provider_id:
            content_providers[idx] = provider
            return provider
    raise HTTPException(status_code=404, detail="Provider not found")

@router.delete("/{provider_id}")
def delete_content_provider(provider_id: str):
    global content_providers
    content_providers = [p for p in content_providers if p.id != provider_id]
    return {"ok": True}
