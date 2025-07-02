from data.db import Base
from sqlalchemy import Boolean, Column, String


class AuthProviderDB(Base):
    __tablename__ = "auth_providers"
    id = Column(String, primary_key=True, index=True)
    title = Column(String, index=True)
    logo = Column(String)
    enabled = Column(Boolean, default=True)
