from data.db import db

keyword_medias = db.Table(
    'keyword_media',
    db.Column('keyword_id', db.Integer, db.ForeignKey('search_keywords.id'), primary_key=True),
    db.Column('media_id', db.Integer, db.ForeignKey('media_providers.id'), primary_key=True)
)

keyword_news_providers = db.Table(
    'keyword_news_provider',
    db.Column('keyword_id', db.Integer, db.ForeignKey('search_keywords.id'), primary_key=True),
    db.Column('news_provider_id', db.Integer, db.ForeignKey('news_providers.id'), primary_key=True)
)

keyword_feed_providers = db.Table(
    'keyword_feed_provider',
    db.Column('keyword_id', db.Integer, db.ForeignKey('search_keywords.id'), primary_key=True),
    db.Column('feed_provider_id', db.Integer, db.ForeignKey('feed_providers.id'), primary_key=True)
)


class MediaProvider(db.Model):
  __tablename__ = 'media_providers'

  id = db.Column(db.Integer, primary_key=True, autoincrement=True)
  media_name = db.Column(db.String, nullable=False)
  provider_name = db.Column(db.String, nullable=False)
  client_id = db.Column(db.String, nullable=False)
  client_secret = db.Column(db.String, nullable=False)
  description = db.Column(db.String, nullable=True)
  parameters = db.Column(db.String, nullable=True)
  enabled = db.Column(db.Boolean, default=True)
  keywords = db.relationship('SearchKeyword', secondary=keyword_medias, back_populates='medias')


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
  medias = db.relationship('MediaProvider', secondary=keyword_medias, back_populates='keywords')
  news = db.relationship('NewsProvider', secondary=keyword_news_providers, back_populates='keywords')
  feeds = db.relationship('FeedProvider', secondary=keyword_feed_providers, back_populates='keywords')


class NewsProvider(db.Model):
  __tablename__ = 'news_providers'

  id = db.Column(db.Integer, primary_key=True, autoincrement=True)
  provider_name = db.Column(db.String, nullable=False)
  endpoint = db.Column(db.String, nullable=False)
  description = db.Column(db.String, nullable=False)
  logo = db.Column(db.String, nullable=False)
  access_token_secret = db.Column(db.String, nullable=False)
  enabled = db.Column(db.Boolean, default=True)
  keywords = db.relationship('SearchKeyword', secondary=keyword_news_providers, back_populates='news')

class FeedProvider(db.Model):
  __tablename__ = 'feed_providers'

  id = db.Column(db.Integer, primary_key=True, autoincrement=True)
  provider_name = db.Column(db.String, nullable=False)
  endpoint = db.Column(db.String, nullable=False)
  description = db.Column(db.String, nullable=True)
  logo = db.Column(db.String, nullable=False)
  access_token_secret = db.Column(db.String, nullable=True)
  enabled = db.Column(db.Boolean, default=True)
  keywords = db.relationship('SearchKeyword', secondary=keyword_feed_providers, back_populates='feeds')
