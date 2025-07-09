from data.db import db
from flask import Blueprint, abort, flash, redirect, render_template, request, url_for
from models.provider import SearchKeyword, NewsProvider

keywords_bp = Blueprint('keywords', __name__, url_prefix='/providers/keywords')

# Get all keywords
@keywords_bp.route('/', methods=['GET'])
def dashboard():
    keywords = SearchKeyword.query.all()
    cards = []
    for keyword in keywords:
        card = {
            'id': keyword.id,
            'logo': 'fa fa-tag',
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
    return render_template('search_keywords.html', cards=cards)

# Create a new media provider
@keywords_bp.route('/', methods=['POST'])
def add_keyword():
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

# Get news providers related to a keyword
@keywords_bp.route('/news/<int:news_id>', methods=['GET'])
def news_providers(news_id):
    news_provider = NewsProvider.query.get_or_404(news_id)
    related_keyword_ids = {keyword.id for keyword in news_provider.keywords}
    
    # Get all keywords and check if they're related to this news provider
    all_keywords = SearchKeyword.query.all()
    
    return {
        'keywords': [
            {
                'id': keyword.id,
                'keyword': keyword.keyword,
                'assigned': keyword.id in related_keyword_ids
            }
            for keyword in all_keywords
        ]
    }

