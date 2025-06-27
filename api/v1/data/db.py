from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

db = SQLAlchemy()

basedir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SQLALCHEMY_DATABASE_URL = 'sqlite:///' + os.path.join(basedir, 'contentoire.db')
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Alembic migration support for FastAPI/SQLAlchemy
# To use migrations, install alembic: pip install alembic

'''
# Initialize Alembic (run once in your api/data directory):
alembic init alembic

# Edit alembic.ini to set sqlalchemy.url to your SQLite path:
# sqlalchemy.url = sqlite:///./data/contentoire.db

# Edit alembic/env.py to import your models' Base:
# from data.db import Base
# target_metadata = Base.metadata

# Create a migration:
alembic revision --autogenerate -m "Initial migration"

# Apply migrations:
alembic upgrade head
'''
