from data.db import db
from flask import Blueprint, abort, flash, redirect, render_template, request, url_for
from models.provider import FeedProvider, SearchKeyword, keyword_feed_providers

rssfeeds_bp = Blueprint('rssfeeds', __name__, url_prefix='/providers/rss')

# Get all media providers
@rssfeeds_bp.route('/', methods=['GET'])
def dashboard():
    providers = FeedProvider.query.all()
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
    return render_template('rssfeeds.html', cards=cards)


# Create a new news provider
@rssfeeds_bp.route('/', methods=['POST'])
def create_rss_feed():
    # Use request.form for HTML form submissions
    provider_name = request.form.get('provider-name')
    endpoint = request.form.get('provider-endpoint')
    logo = request.form.get('provider-logo')
    access_token = request.form.get('provider-access-token')
    description = request.form.get('description')

    if not provider_name or not endpoint or not logo:
        abort(400, "Missing required fields")

    provider = FeedProvider(
        provider_name=provider_name,
        endpoint=endpoint,
        logo=logo,
        description=description,
        access_token_secret=access_token,
        enabled=True )
    db.session.add(provider)
    db.session.commit()
    flash('RSS feed created successfully', 'success')
    return redirect(url_for('rssfeeds.dashboard'))


# Update an existing RSS feed
@rssfeeds_bp.route('/<int:provider_id>', methods=['PATCH', 'POST', 'PUT'])
def update_rss_feed(provider_id):
    provider = FeedProvider.query.get_or_404(provider_id)
    provider.provider_name = request.form.get('provider-name')
    provider.endpoint = request.form.get('provider-endpoint')
    provider.logo = request.form.get('provider-logo')
    provider.access_token_secret = request.form.get('provider-access-token')
    provider.description = request.form.get('description')
    db.session.commit()
    flash('RSS feed updated successfully', 'success')
    return redirect(url_for('rssfeeds.dashboard'))

# Get keywords for a RSS feed
@rssfeeds_bp.route('/<int:provider_id>/keywords', methods=['GET'])
def get_provider_keywords(provider_id):
    provider = FeedProvider.query.get_or_404(provider_id)
    keywords = SearchKeyword.query.all()
    selected_keywords = [k.keyword for k in provider.keywords]
    return {
        'keywords': [{'id': k.id, 'keyword': k.keyword, 'selected': k.keyword in selected_keywords} 
                    for k in keywords]
    }

# Update keywords for a RSS feed
@rssfeeds_bp.route('/<int:provider_id>/keywords', methods=['POST'])
def update_provider_keywords(provider_id):
    provider = FeedProvider.query.get_or_404(provider_id)
    selected_keywords = request.form.getlist('keywords[]')
    
    # Clear existing relationships
    db.session.query(keyword_feed_providers).filter_by(feed_provider_id=provider_id).delete()

    # Create new relationships
    for keyword in selected_keywords:
        keyword_obj = SearchKeyword.query.filter_by(keyword=keyword).first()
        if keyword_obj:
            db.session.execute(
                keyword_feed_providers.insert().values(
                    feed_provider_id=provider_id,
                    keyword_id=keyword_obj.id
                )
            )
    
    db.session.commit()
    flash('Keywords updated successfully', 'success')
    return redirect(url_for('news_provider.dashboard'))

# Delete a news provider
@rssfeeds_bp.route('/<int:provider_id>', methods=['DELETE'])
def delete_news_provider(provider_id):
    provider = FeedProvider.query.get_or_404(provider_id)
    db.session.delete(provider)
    db.session.commit()
    flash('News provider deleted successfully', 'success')
    return redirect(url_for('news_provider.dashboard'))
