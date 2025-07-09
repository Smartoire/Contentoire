from data.db import db
from extensions import social_media_providers
from flask import Blueprint, abort, flash, redirect, render_template, request, url_for
from models.media_provider import MediaProvider

media_provider_bp = Blueprint('media_provider', __name__, url_prefix='/providers/media')

# Get all media providers
@media_provider_bp.route('/', methods=['GET'])
def dashboard():
    providers = MediaProvider.query.all()
    cards = []
    for provider in providers:
        card = {
            'id': provider.id,
            'logo': 'fab fa-'+provider.provider_name,
            'title': provider.media_name,
            'enabled':  provider.enabled,
            'options': {
                'provider_name': provider.provider_name,
                'client_id': provider.client_id,
                'client_secret': provider.client_secret,
                'parameters': provider.parameters,
                'description': provider.description,
            }
        }
        cards.append(card)
    return render_template('media_providers.html', cards=cards, social_media_providers=social_media_providers)

# Create a new media provider
@media_provider_bp.route('/', methods=['POST'])
def create_media_provider():
    # Use request.form for HTML form submissions
    provider_name = request.form.get('provider-name')
    media_name = request.form.get('media_name')
    client_id = request.form.get('client-id')
    client_secret = request.form.get('client-secret')
    description = request.form.get('description')
    parameters = request.form.get('parameters')

    if not provider_name or not client_id or not client_secret:
        abort(400, "Missing required fields")

    if not media_name:
        media_name = provider_name

    provider = MediaProvider(
        provider_name=provider_name,
        media_name=media_name,
        client_id=client_id,
        client_secret=client_secret,
        description=description,
        parameters=parameters,
        enabled=True )
    db.session.add(provider)
    db.session.commit()
    flash('Media provider created successfully', 'success')
    return redirect(url_for('media_provider.dashboard'))


# Update an existing media provider
@media_provider_bp.route('/<int:provider_id>', methods=['PATCH', 'POST', 'PUT'])
def update_media_provider(provider_id):
    provider = MediaProvider.query.get_or_404(provider_id)
    provider.provider_name = request.form.get('provider-name')
    db.session.commit()
    flash('Media provider updated successfully', 'success')
    return redirect(url_for('media_provider.dashboard'))

# Delete a media provider
@media_provider_bp.route('/<int:provider_id>', methods=['DELETE'])
def delete_media_provider(provider_id):
    provider = MediaProvider.query.get_or_404(provider_id)
    db.session.delete(provider)
    db.session.commit()
    flash('Media provider deleted successfully', 'success')
    return redirect(url_for('media_provider.dashboard'))
