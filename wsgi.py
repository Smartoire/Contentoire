import os

from data.db import db
from extensions import login_manager
from flask import Flask
from flask_migrate import Migrate

migrate = Migrate()

def create_app():
    app = Flask(__name__, static_url_path='/contentoire/static')
    app.secret_key = 'A7mtDLkPuOtapdz0wi0huD4YXP0rN1By'

    login_manager.login_view = 'auth.login'
    login_manager.init_app(app)

    basedir = os.path.dirname(os.path.abspath(__file__))
    # Configure SQLite database
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'data/contentoire.db')
    print(f"Database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    migrate.init_app(app, db)

    # Import and register blueprints
    from routes import blueprints
    for bp in blueprints:
        # If the blueprint has a url_prefix, combine it with '/contentoire'
        bp_prefix = getattr(bp, 'url_prefix', None)
        if bp_prefix:
            app.register_blueprint(bp, url_prefix=f'/contentoire{bp_prefix}')
        else:
            app.register_blueprint(bp, url_prefix='/contentoire')


    # Function to check and print registered blueprints and routes
    def check_blueprints():
        print("Registered Blueprints and Routes:")
        for bp in app.blueprints:
            print(f"Blueprint registered: {bp}")
        for rule in app.url_map.iter_rules():
            print(f"Route: {rule.rule}, Endpoint: {rule.endpoint}")

    check_blueprints()
    return app

app = create_app()

if __name__ == "__main__":
    context = ('../certs/gpu.pem', '../certs/gpu-key.pem')
    app.run(host='0.0.0.0', ssl_context=context, debug=True, port=8443)
