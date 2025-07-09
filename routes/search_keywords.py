from data.db import db
from extensions import social_media_providers
from flask import Blueprint, abort, flash, redirect, render_template, request, url_for
from models.search_keyword import SearchKeyword

keywords_bp = Blueprint('keywords', __name__, url_prefix='/providers/keywords')

# Get all keywords
@keywords_bp.route('/', methods=['GET'])
def dashboard():
    keywords = SearchKeyword.query.all()
    cards = []
    for keyword in keywords:
        card = {
            'id': keyword.id,
            'logo': 'fab fa-keyword',
            'title': keyword.keyword,
            'enabled':  keyword.enabled,
            'options': {
                'category': keyword.category,
                'sub_category': keyword.sub_category,
                'region': keyword.region,
                'language': keyword.language,
                'description': keyword.description,
            }
        }
        cards.append(card)
    return render_template('media_providers.html', cards=cards, social_media_providers=social_media_providers)

# Create a new media provider
@keywords_bp.route('/', methods=['POST'])
def create_media_provider():
    # Use request.form for HTML form submissions
    search_keyword = request.form.get('search_keyword')
    category = request.form.get('category')
    sub_category = request.form.get('sub_category')
    region = request.form.get('region')
    language = request.form.get('language')
    description = request.form.get('description')

    if not search_keyword:
        abort(400, "Missing required fields")

    keyword = SearchKeyword(
        keyword=search_keyword,
        category=category,
        sub_category=sub_category,
        region=region,
        language=language,
        description=description,
        enabled=True )
    db.session.add(keyword)
    db.session.commit()
    flash('Keyword created successfully', 'success')
    return redirect(url_for('keywords.dashboard'))


# Update an existing media provider
@keywords_bp.route('/<int:keyword_id>', methods=['PATCH', 'POST', 'PUT'])
def update_keyword(keyword_id):
    keyword = SearchKeyword.query.get_or_404(keyword_id)
    keyword.keyword = request.form.get('keyword')
    db.session.commit()
    flash('Keyword updated successfully', 'success')
    return redirect(url_for('keywords.dashboard'))

# Delete a media provider
@keywords_bp.route('/<int:keyword_id>', methods=['DELETE'])
def delete_keyword(keyword_id):
    keyword = SearchKeyword.query.get_or_404(keyword_id)
    db.session.delete(keyword)
    db.session.commit()
    flash('Keyword deleted successfully', 'success')
    return redirect(url_for('keywords.dashboard'))
