from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

router = APIRouter()

class SocialMedia(BaseModel):
    id: str
    title: str
    logo: str
    enabled: bool = True

social_medias: List[SocialMedia] = []

@router.get("/api/social-medias", response_model=List[SocialMedia])
def list_social_medias():
    return social_medias

@router.post("/api/social-medias", response_model=SocialMedia)
def create_social_media(media: SocialMedia):
    social_medias.append(media)
    return media

@router.put("/api/social-medias/{media_id}", response_model=SocialMedia)
def update_social_media(media_id: str, media: SocialMedia):
    for idx, m in enumerate(social_medias):
        if m.id == media_id:
            social_medias[idx] = media
            return media
    raise HTTPException(status_code=404, detail="Social media not found")

@router.delete("/api/social-medias/{media_id}")
def delete_social_media(media_id: str):
    global social_medias
    social_medias = [m for m in social_medias if m.id != media_id]
    return {"ok": True}
