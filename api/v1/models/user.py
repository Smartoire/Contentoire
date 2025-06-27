from data.db import Base
from sqlalchemy import Boolean, Column, String
from sqlalchemy.orm import relationship


class UserDB(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String)
    disabled = Column(Boolean, default=False)
    mfa_enabled = Column(Boolean, default=False)
    mfa_secret = Column(String, nullable=True)
    trusted_devices = Column(String, nullable=True)  # comma-separated tokens

    slots = relationship("UserSlotDB", back_populates="user")
