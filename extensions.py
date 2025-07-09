from authlib.integrations.flask_client import OAuth
from flask_login import LoginManager
from models.user import User

oauth = OAuth()
login_manager = LoginManager()
@login_manager.user_loader
def load_user(user_id):
    return User.query.filter_by(alternative_id=user_id).first()

social_media_providers = [
    'reddit',
    'instagram',
    'tiktok',
    'facebook',
    'twitter',
    'linkedin',
]