import os

from data.db import db
from extensions import oauth
from flask import Blueprint, redirect, url_for
from flask_login import login_user
from models.user import User

google_bp = Blueprint('google', __name__, url_prefix='/auth/google')

oauth.register(
    name='google',
    client_id=os.environ.get("GOOGLE_CLIENT_ID"),
    client_secret=os.environ.get("GOOGLE_CLIENT_SECRET"),
    access_token_url='https://accounts.google.com/o/oauth2/token',
    access_token_params=None,
    authorize_url='https://accounts.google.com/o/oauth2/auth',
    authorize_params=None,
    api_base_url='https://www.googleapis.com/oauth2/v2/',
    client_kwargs={
        'scope': 'email profile',
        'prompt': 'consent',
        'access_type': 'offline'
    }
)

@google_bp.route('/')
def login():
    redirect_uri = url_for('google.authorized', _external=True)
    return oauth.google.authorize_redirect(redirect_uri)

@google_bp.route('/authorized')
def authorized():
    token = oauth.google.authorize_access_token()
    resp = oauth.google.get('userinfo')
    user_info = resp.json()
    user = User.query.filter_by(email=user_info['email']).first()
    if not user:
        user = User(email=user_info['email'], username=user_info['email'], first_name=user_info['given_name'], last_name=user_info['family_name'], picture_url=user_info['picture'])
        db.session.add(user)
        db.session.commit()
    login_user(user)
    return redirect(url_for('main.index'))