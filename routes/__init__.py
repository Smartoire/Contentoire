from .auth.google import google_bp
from .main import main_bp
from .media_providers import media_provider_bp
from .news_providers import news_provider_bp
from .rssfeeds import rssfeeds_bp
from .scheduler import scheduler_bp
from .search_keywords import keywords_bp
from .users import users_bp

blueprints = [main_bp, google_bp, news_provider_bp, users_bp, media_provider_bp, keywords_bp, 
              scheduler_bp, rssfeeds_bp]
