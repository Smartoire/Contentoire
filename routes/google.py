import os

from data.db import db  # Import the database instance
from flask import redirect, url_for
from flask_dance.contrib.google import google, make_google_blueprint
from flask_login import login_user
from models.user import User

# Register the Google OAuth blueprint (do this in your app factory or main app file)
google_bp = make_google_blueprint(
    client_id=os.environ.get("GOOGLE_CLIENT_ID"),
    client_secret=os.environ.get("GOOGLE_CLIENT_SECRET"),
    redirect_url="/contentoire/auth/google/authorized",
    scope=[
        "openid",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile"
    ],
)

@google_bp.route('/auth/google')
def oauth_login_google():
    if not google.authorized:
        return redirect(url_for("google.login"))
    resp = google.get("/oauth2/v2/userinfo")
    user_info = resp.json()
    user = User.query.filter_by(email=user_info['email']).first()
    if not user:
        user = User(email=user_info['email'])
        db.session.add(user)
        db.session.commit()
    login_user(user)
    return redirect(url_for('dashboard.index'))
