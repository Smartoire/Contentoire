import os

from extensions import login_manager  # Import the login manager from your app
from flask import Blueprint, flash, redirect, render_template, request, url_for
from flask_login import current_user, login_required, login_user, logout_user
from models.user import User  # Import User from models

# Initialize Flask-Login

# Create a Blueprint for authentication routes
auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

# Dummy user store for demonstration
users = {'admin': {'password': 'adminpass'}}

def get_enabled_providers():
    providers = []
    env = os.environ
    if env.get("GOOGLE_CLIENT_ID"):
        providers.append("google")
    if env.get("FACEBOOK_CLIENT_ID"):
        providers.append("facebook")
    if env.get("APPLE_CLIENT_ID"):
        providers.append("apple")
    if env.get("TWITTER_CLIENT_ID"):
        providers.append("twitter")
    if env.get("GITHUB_CLIENT_ID"):
        providers.append("github")
    if env.get("GITLAB_CLIENT_ID"):
        providers.append("gitlab")
    if env.get("BITBUCKET_CLIENT_ID"):
        providers.append("bitbucket")
    if env.get("DISCORD_CLIENT_ID"):
        providers.append("discord")
    if env.get("LINKEDIN_CLIENT_ID"):
        providers.append("linkedin")
    return providers

@login_manager.user_loader
def load_user(user_id):
    return User.query.filter_by(alternative_id=user_id).first()

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard.index'))
    enabled_providers = get_enabled_providers()
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user = users.get(username)
        if user and user['password'] == password:
            login_user(User(username))
            return redirect(url_for('dashboard.index'))
        else:
            flash('Invalid credentials')
    return render_template('login.html',enabled_providers=enabled_providers)

@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('auth.login'))

