from data.db import db
from flask import Blueprint, abort, flash, redirect, render_template, request, url_for
from flask_login import login_required
from models.user import User

users_bp = Blueprint('users', __name__, url_prefix='/users')

# Get all news providers
@users_bp.route('/', methods=['GET'])
@login_required
def dashboard():
    users = User.query.all()
    cards = []
    for user in users:
        card = {
            'id': user.id,
            'logo': user.picture_url,
            'title': user.username + ' - ' + user.email,
            'enabled':  user.is_active,
            'options': {
            'email': user.email,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'picture_url': user.picture_url
            }
        }
        cards.append(card)
        print(card)
    return render_template('users.html', cards=cards)

@users_bp.route('/', methods=['POST'])
@login_required
def create_user():
    provider_name = request.form.get('provider-name')
    endpoint = request.form.get('provider-endpoint')
    logo = request.form.get('provider-logo')
    access_token = request.form.get('provider-access-token')
    description = request.form.get('provider-description')

    if not provider_name or not endpoint or not logo or not access_token or not description:
        abort(400, "Missing required fields")

    provider = User(
        provider_name=provider_name,
        endpoint=endpoint,
        logo=logo,
        description=description,
        access_token_secret=access_token,
        enabled=True )
    db.session.add(provider)
    db.session.commit()
    flash('News provider created successfully', 'success')
    return redirect(url_for('users.dashboard'))


@users_bp.route('/<int:provider_id>', methods=['PATCH', 'POST', 'PUT'])
@login_required
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    user.username = request.form.get('username')
    user.email = request.form.get('email')
    user.first_name = request.form.get('first_name')
    user.last_name = request.form.get('last_name')
    user.picture_url = request.form.get('picture_url')
    user.mfa_enabled = request.form.get('mfa_enabled')
    user.comments = request.form.get('comments')

    db.session.commit()
    flash('User updated successfully', 'success')
    return redirect(url_for('users.dashboard'))

@users_bp.route('/<int:user_id>', methods=['DELETE'])
@login_required
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    flash('User deleted successfully', 'success')
    return redirect(url_for('users.dashboard'))
