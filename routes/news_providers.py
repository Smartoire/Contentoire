from data.db import db
from flask import Blueprint, abort, flash, redirect, render_template, request, url_for
from models.news_provider import NewsProvider

news_provider_bp = Blueprint('news_provider', __name__, url_prefix='/providers/news')

# Get all news providers
@news_provider_bp.route('/', methods=['GET'])
def dashboard():
    providers = NewsProvider.query.all()
    cards = []
    for provider in providers:
        card = {
            'id': provider.id,
            'logo': provider.logo,
            'title': provider.provider_name,
            'enabled':  provider.enabled,
            'options': {
            'description': provider.description,
            'endpoint': provider.endpoint,
            'access_token': provider.access_token_secret
            }
        }
        cards.append(card)
    return render_template('news_providers.html', cards=cards)

# Create a new news provider
@news_provider_bp.route('/', methods=['POST'])
def create_news_provider():
    # Use request.form for HTML form submissions
    provider_name = request.form.get('provider-name')
    endpoint = request.form.get('provider-endpoint')
    logo = request.form.get('provider-logo')
    access_token = request.form.get('provider-access-token')
    description = request.form.get('provider-description')

    if not provider_name or not endpoint or not logo or not access_token or not description:
        abort(400, "Missing required fields")

    provider = NewsProvider(
        provider_name=provider_name,
        endpoint=endpoint,
        logo=logo,
        description=description,
        access_token_secret=access_token,
        enabled=True )
    db.session.add(provider)
    db.session.commit()
    flash('News provider created successfully', 'success')
    return redirect(url_for('news_provider.dashboard'))


# Update an existing news provider
@news_provider_bp.route('/<int:provider_id>', methods=['PATCH', 'POST', 'PUT'])
def update_news_provider(provider_id):
    provider = NewsProvider.query.get_or_404(provider_id)
    provider.provider_name = request.form.get('provider-name')
    provider.endpoint = request.form.get('provider-endpoint')
    provider.logo = request.form.get('provider-logo')
    provider.access_token_secret = request.form.get('provider-access-token')
    provider.description = request.form.get('provider-description')
    db.session.commit()
    flash('News provider updated successfully', 'success')
    return redirect(url_for('news_provider.dashboard'))

# Delete a news provider
@news_provider_bp.route('/<int:provider_id>', methods=['DELETE'])
def delete_news_provider(provider_id):
    provider = NewsProvider.query.get_or_404(provider_id)
    db.session.delete(provider)
    db.session.commit()
    flash('News provider deleted successfully', 'success')
    return redirect(url_for('news_provider.dashboard'))
