import os

from extensions import login_manager
from flask import Blueprint, flash, redirect, render_template, request, url_for
from flask_login import current_user, login_required, login_user, logout_user
from models.user import User
from werkzeug.security import check_password_hash

main_bp = Blueprint('main', __name__)

@main_bp.route('/', methods=['GET'])
@login_required
def index():
    return render_template('index.html')

def get_enabled_providers():
    providers = []

    for key, value in os.environ.items():
        if key.endswith("_CLIENT_ID"):
            provider = key[:-11].lower()
            providers.append(provider)

    return providers


@login_manager.user_loader
def load_user(user_id):
    return User.query.filter_by(id=user_id).first()


@main_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
    enabled_providers = get_enabled_providers()
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.hashed_password, password):
            login_user(user)
            return redirect(url_for('main.index'))
        else:
            flash('Invalid credentials')
    return render_template('login.html', enabled_providers=enabled_providers)


@main_bp.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('main.login'))