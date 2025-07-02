from typing import List

from fastapi import APIRouter, HTTPException
from models.social_media import SocialMedia

router = APIRouter(prefix="/api/social")

social_medias: List[SocialMedia] = []

@router.get("/", response_model=List[SocialMedia])
def list_social_medias():
    return social_medias

@router.post("/", response_model=SocialMedia)
def create_social_media(media: SocialMedia):
    social_medias.append(media)
    return media

@router.put("/{media_id}", response_model=SocialMedia)
def update_social_media(media_id: str, media: SocialMedia):
    for idx, m in enumerate(social_medias):
        if m.id == media_id:
            social_medias[idx] = media
            return media
    raise HTTPException(status_code=404, detail="Social media not found")

@router.delete("/{media_id}")
def delete_social_media(media_id: str):
    global social_medias
    social_medias = [m for m in social_medias if m.id != media_id]
    return {"ok": True}
