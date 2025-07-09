from data.db import db


class SearchKeyword(db.Model):
  __tablename__ = 'search_keywords'

  id = db.Column(db.Integer, primary_key=True, autoincrement=True)
  keyword = db.Column(db.String, nullable=False)
  region = db.Column(db.String, nullable=False, default='CA')
  language = db.Column(db.String, nullable=False, default='en')
  category = db.Column(db.String, nullable=True)
  sub_category = db.Column(db.String, nullable=True)
  description = db.Column(db.String, nullable=True)
  enabled = db.Column(db.Boolean, default=True)
