from sqlalchemy import Column, String, Boolean
from data.db import Base

class ContentProviderDB(Base):
    __tablename__ = "content_providers"
    id = Column(String, primary_key=True, index=True)
    title = Column(String, index=True)
    logo = Column(String)
    enabled = Column(Boolean, default=True)
