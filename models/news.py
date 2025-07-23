from datetime import datetime

from data.db import db


class News(db.Model):
  __tablename__ = 'news'

  id = db.Column(db.Integer, primary_key=True, autoincrement=True)
  title = db.Column(db.String, nullable=False)
  authors = db.Column(db.String, nullable=True)
  news_text = db.Column(db.String, nullable=True)
  url = db.Column(db.String, nullable=True)
  published_date = db.Column(db.String, nullable=True)
  language = db.Column(db.String, nullable=True)
  summary = db.Column(db.String, nullable=True)
  options = db.Column(db.String, nullable=True)
  add_date = db.Column(db.DateTime, nullable=False, default=datetime.now())
  provider_id = db.Column(db.Integer, db.ForeignKey('news_providers.id'), nullable=True)
  keyword_id = db.Column(db.Integer, db.ForeignKey('search_keywords.id'), nullable=True)
  feed_id = db.Column(db.Integer, db.ForeignKey('feed_providers.id'), nullable=True)
  processed = db.Column(db.DateTime, nullable=True)
