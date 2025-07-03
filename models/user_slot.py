from data.db import db


class UserSlot(db.Model):
    __tablename__ = "user_slots"
    id = db.Column(db.String, primary_key=True, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    provider = db.Column(db.String)
    provider_user_id = db.Column(db.String)
    user = db.relationship("User", back_populates="slots")
