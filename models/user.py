from data.db import db

user_permissions = db.Table(
    'user_permissions',
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('permission_id', db.Integer, db.ForeignKey('permission.id'), primary_key=True)
)

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True, index=True, autoincrement=True)
    username = db.Column(db.String, unique=True, index=True)
    email = db.Column(db.String, unique=True, index=True)
    full_name = db.Column(db.String, nullable=True)
    hashed_password = db.Column(db.String)
    is_active = db.Column(db.Boolean, default=True)
    mfa_enabled = db.Column(db.Boolean, default=False)
    mfa_secret = db.Column(db.String, nullable=True)
    trusted_devices = db.Column(db.String, nullable=True)  # comma-separated tokens
    permissions = db.relationship('Permission', secondary=user_permissions, back_populates='users')
    slots = db.relationship("UserSlot", back_populates="user")

class Permission(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True, nullable=False)
    users = db.relationship('User', secondary=user_permissions, back_populates='permissions')

from .user_slot import UserSlot  # Import UserSlot to avoid circular import issues

User.slots = db.relationship("UserSlot", back_populates="user")  # Establish relationship
UserSlot.user = db.relationship("User", back_populates="slots")  # Establish