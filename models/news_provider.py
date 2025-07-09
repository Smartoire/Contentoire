from data.db import db


class NewsProvider(db.Model):
  __tablename__ = 'news_providers'

  id = db.Column(db.Integer, primary_key=True, autoincrement=True)
  provider_name = db.Column(db.String, nullable=False)
  endpoint = db.Column(db.String, nullable=False)
  description = db.Column(db.String, nullable=False)
  logo = db.Column(db.String, nullable=False)
  access_token_secret = db.Column(db.String, nullable=False)
  enabled = db.Column(db.Boolean, default=True)
