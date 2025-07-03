from typing import List

from Contentoire.api.data.db import Base, get_db
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import Boolean, Column, String
from sqlalchemy.orm import Session

router = APIRouter(prefix="/providers/news")


@router.get("/", response_model=List[NewsProvider])
def list_news_providers(db: Session = Depends(get_db)):
    return db.query(NewsProviderDB).all()

@router.post("/", response_model=NewsProvider)
def create_news_provider(provider: NewsProvider, db: Session = Depends(get_db)):
    db_provider = NewsProviderDB(**provider.dict())
    db.add(db_provider)
    db.commit()
    db.refresh(db_provider)
    return db_provider

@router.put("/{provider_id}", response_model=NewsProvider)
def update_news_provider(provider_id: str, provider: NewsProvider, db: Session = Depends(get_db)):
    db_provider = db.query(NewsProviderDB).filter(NewsProviderDB.id == provider_id).first()
    if not db_provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    for key, value in provider.dict().items():
        setattr(db_provider, key, value)
    db.commit()
    db.refresh(db_provider)
    return db_provider

@router.delete("/{provider_id}")
def delete_news_provider(provider_id: str, db: Session = Depends(get_db)):
    db_provider = db.query(NewsProviderDB).filter(NewsProviderDB.id == provider_id).first()
    if not db_provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    db.delete(db_provider)
    db.commit()
    return {"ok": True}
