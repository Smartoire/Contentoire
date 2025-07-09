from data.db import db
from flask_login import UserMixin

user_permissions = db.Table(
    'user_permissions',
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('permission_id', db.Integer, db.ForeignKey('permission.id'), primary_key=True)
)

class User(db.Model, UserMixin):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True, index=True, autoincrement=True)
    username = db.Column(db.String, unique=True, index=True, nullable=False, default="")
    email = db.Column(db.String, unique=True, index=True, nullable=False, default="")
    first_name = db.Column(db.String, nullable=True)
    last_name = db.Column(db.String, nullable=True)
    hashed_password = db.Column(db.String)
    is_active = db.Column(db.Boolean, default=True)
    mfa_enabled = db.Column(db.Boolean, default=False)
    mfa_secret = db.Column(db.String, nullable=True)
    trusted_devices = db.Column(db.String, nullable=True)  # comma-separated tokens
    permissions = db.relationship('Permission', secondary=user_permissions, back_populates='users')
    picture_url = db.Column(db.String, nullable=True)
    comments = db.Column(db.String, nullable=True)

class Permission(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True, nullable=False)
    users = db.relationship('User', secondary=user_permissions, back_populates='permissions')
