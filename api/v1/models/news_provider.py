from sqlalchemy import Column, String, Boolean
from data.db import Base

class NewsProviderDB(Base):
    __tablename__ = "news_providers"
    id = Column(String, primary_key=True, index=True)
    title = Column(String, index=True)
    logo = Column(String)
    enabled = Column(Boolean, default=True)
