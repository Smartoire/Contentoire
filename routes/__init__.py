from .auth import auth_bp
from .dashboard import dashboard_bp
from .google import google_bp

blueprints = [auth_bp, dashboard_bp, google_bp]
