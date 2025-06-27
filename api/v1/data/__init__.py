import os

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.secret_key = 'your-unique-secret-key'

    basedir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'contentoire.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///../data/contentoire.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

    db.init_app(app)
    migrate.init_app(app, db)

    # Import and register blueprints
