from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import Boolean, Column, String
from sqlalchemy.orm import Session

from Contentoire.api.v1.main import Base, get_db

router = APIRouter()

class NewsProviderDB(Base):
    __tablename__ = "news_providers"
    id = Column(String, primary_key=True, index=True)
    title = Column(String, index=True)
    logo = Column(String)
    enabled = Column(Boolean, default=True)

class NewsProvider(BaseModel):
    id: str
    title: str
    logo: str
    enabled: bool = True

    class Config:
        orm_mode = True

# Create tables
Base.metadata.create_all(bind=router.dependencies[0].dependency.__self__.bind if router.dependencies else None)

@router.get("/api/news-providers", response_model=List[NewsProvider])
def list_news_providers(db: Session = Depends(get_db)):
    return db.query(NewsProviderDB).all()

@router.post("/api/news-providers", response_model=NewsProvider)
def create_news_provider(provider: NewsProvider, db: Session = Depends(get_db)):
    db_provider = NewsProviderDB(**provider.dict())
    db.add(db_provider)
    db.commit()
    db.refresh(db_provider)
    return db_provider

@router.put("/api/news-providers/{provider_id}", response_model=NewsProvider)
def update_news_provider(provider_id: str, provider: NewsProvider, db: Session = Depends(get_db)):
    db_provider = db.query(NewsProviderDB).filter(NewsProviderDB.id == provider_id).first()
    if not db_provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    for key, value in provider.dict().items():
        setattr(db_provider, key, value)
    db.commit()
    db.refresh(db_provider)
    return db_provider

@router.delete("/api/news-providers/{provider_id}")
def delete_news_provider(provider_id: str, db: Session = Depends(get_db)):
    db_provider = db.query(NewsProviderDB).filter(NewsProviderDB.id == provider_id).first()
    if not db_provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    db.delete(db_provider)
    db.commit()
    return {"ok": True}
