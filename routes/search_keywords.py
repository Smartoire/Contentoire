from data.db import db
from flask import (
    Blueprint,
    abort,
    flash,
    jsonify,
    redirect,
    render_template,
    request,
    url_for,
)
from models.provider import FeedProvider, MediaProvider, NewsProvider, SearchKeyword

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
def get_news_provider_keywords(news_id):
    """
    Retrieve all keywords and indicate which ones are related to a specific news provider.

    Args:
        news_id (int): The ID of the news provider to retrieve related keywords for.

    Returns:
        dict: A dictionary containing a list of keywords, where each keyword is represented
              by a dictionary with 'id', 'keyword', and 'selected' keys. The 'selected' key
              is True if the keyword is related to the specified news provider, otherwise False.
    """
    news_provider = NewsProvider.query.get_or_404(news_id)
    related_keyword_ids = {keyword.id for keyword in news_provider.keywords}
    
    # Get all keywords and check if they're related to this news provider
    all_keywords = SearchKeyword.query.all()
    
    return {
        'keywords': [
            {
                'id': keyword.id,
                'keyword': keyword.keyword,
                'selected': keyword.id in related_keyword_ids
            }
            for keyword in all_keywords
        ]
    }

@keywords_bp.route('/news/<int:news_id>', methods=['POST'])
def set_news_provider_keywords(news_id):
    """
    Set the keywords for a specific news provider.

    Args:
        news_id (int): The ID of the news provider to set keywords for.

    Returns:
        dict: A dictionary containing a list of keywords, where each keyword is represented
              by a dictionary with 'id', 'keyword', and 'selected' keys. The 'selected' key
              is True if the keyword is related to the specified news provider, otherwise False.
    """
    try:
        news_provider = NewsProvider.query.get_or_404(news_id)
        selected_keywords = [int(k) for k in request.form.getlist('keywords[]')]
        
        # Remove all current relationships
        news_provider.keywords = []
        db.session.commit()
        
        # Add new selected keywords
        if selected_keywords:
            news_provider.keywords = SearchKeyword.query.filter(SearchKeyword.id.in_(selected_keywords)).all()
            db.session.commit()
            flash('Keywords updated successfully', 'success')
            return jsonify({"status": "success", "message": "Changes saved."})
    except Exception:
        db.session.rollback()
        flash('Keywords updated failed', 'error')
        return jsonify({"status": "error", "message": "Failed to update keywords."})

# Get media providers related to a keyword
@keywords_bp.route('/media/<int:media_id>', methods=['GET'])
def get_media_provider_keywords(media_id):
    """
    Retrieve all keywords and indicate which ones are related to a specific media provider.

    Args:
        media_id (int): The ID of the media provider to retrieve related keywords for.

    Returns:
        dict: A dictionary containing a list of keywords, where each keyword is represented
              by a dictionary with 'id', 'keyword', and 'selected' keys. The 'selected' key
              is True if the keyword is related to the specified media provider, otherwise False.
    """
    media_provider = MediaProvider.query.get_or_404(media_id)
    related_keyword_ids = {keyword.id for keyword in media_provider.keywords}
    
    # Get all keywords and check if they're related to this media provider
    all_keywords = SearchKeyword.query.all()
    
    return {
        'keywords': [
            {
                'id': keyword.id,
                'keyword': keyword.keyword,
                'selected': keyword.id in related_keyword_ids
            }
            for keyword in all_keywords
        ]
    }

@keywords_bp.route('/media/<int:media_id>', methods=['POST'])
def set_media_provider_keywords(media_id):
    """
    Set the keywords for a specific media provider.

    Args:
        news_id (int): The ID of the news provider to set keywords for.

    Returns:
        dict: A dictionary containing a list of keywords, where each keyword is represented
              by a dictionary with 'id', 'keyword', and 'selected' keys. The 'selected' key
              is True if the keyword is related to the specified news provider, otherwise False.
    """
    try:
        media_provider = MediaProvider.query.get_or_404(media_id)
        selected_keywords = [int(k) for k in request.form.getlist('keywords[]')]
        
        # Remove all current relationships
        media_provider.keywords = []
        db.session.commit()
        
        # Add new selected keywords
        if selected_keywords:
            media_provider.keywords = SearchKeyword.query.filter(SearchKeyword.id.in_(selected_keywords)).all()
            db.session.commit()
            flash('Keywords updated successfully', 'success')
            return jsonify({"status": "success", "message": "Changes saved."})
    except Exception:
        db.session.rollback()
        flash('Keywords updated failed', 'error')
        return jsonify({"status": "error", "message": "Failed to update keywords."})



# Get media providers related to a keyword
@keywords_bp.route('/rss/<int:rss_id>', methods=['GET'])
def get_rss_feed_keywords(rss_id):
    """
    Retrieve all keywords and indicate which ones are related to a specific rss feed.

    Args:
        rss_id (int): The ID of the rss feed to retrieve related keywords for.

    Returns:
        dict: A dictionary containing a list of keywords, where each keyword is represented
              by a dictionary with 'id', 'keyword', and 'selected' keys. The 'selected' key
              is True if the keyword is related to the specified rss feed, otherwise False.
    """
    rss_feed = FeedProvider.query.get_or_404(rss_id)
    related_keyword_ids = {keyword.id for keyword in rss_feed.keywords}

    # Get all keywords and check if they're related to this rss feed
    all_keywords = SearchKeyword.query.all()
    
    return {
        'keywords': [
            {
                'id': keyword.id,
                'keyword': keyword.keyword,
                'selected': keyword.id in related_keyword_ids
            }
            for keyword in all_keywords
        ]
    }

@keywords_bp.route('/rss/<int:rss_id>', methods=['POST'])
def set_rss_feed_keywords(rss_id):
    """
    Set the keywords for a specific rss feed.

    Args:
        rss_id (int): The ID of the rss feed to set keywords for.

    Returns:
        dict: A dictionary containing a list of keywords, where each keyword is represented
              by a dictionary with 'id', 'keyword', and 'selected' keys. The 'selected' key
              is True if the keyword is related to the specified rss feed, otherwise False.
    """
    try:
        rss_feed = FeedProvider.query.get_or_404(rss_id)
        selected_keywords = [int(k) for k in request.form.getlist('keywords[]')]
        
        # Remove all current relationships
        rss_feed.keywords = []
        db.session.commit()
        
        # Add new selected keywords
        if selected_keywords:
            rss_feed.keywords = SearchKeyword.query.filter(SearchKeyword.id.in_(selected_keywords)).all()
            db.session.commit()
            flash('Keywords updated successfully', 'success')
            return jsonify({"status": "success", "message": "Changes saved."})
    except Exception:
        db.session.rollback()
        flash('Keywords updated failed', 'error')
        return jsonify({"status": "error", "message": "Failed to update keywords."})

