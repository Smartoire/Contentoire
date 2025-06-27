from sqlalchemy import Column, String, Boolean
from data.db import Base

class SocialMediaDB(Base):
    __tablename__ = "social_medias"
    id = Column(String, primary_key=True, index=True)
    title = Column(String, index=True)
    logo = Column(String)
    enabled = Column(Boolean, default=True)
