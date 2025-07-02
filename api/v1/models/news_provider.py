from data.db import Base
from sqlalchemy import Boolean, Column, Integer, String


class NewsProvider(Base):
    __tablename__ = "news_providers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    code = Column(String, unique=True, index=True)  # Public identifier (e.g. 'cnn', 'reuters')
    title = Column(String, index=True)
    logo = Column(String)
    enabled = Column(Boolean, default=True)