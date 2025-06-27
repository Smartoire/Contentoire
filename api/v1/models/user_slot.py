from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from data.db import Base

class UserSlotDB(Base):
    __tablename__ = "user_slots"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    provider = Column(String)
    provider_user_id = Column(String)
    user = relationship("UserDB", back_populates="slots")
