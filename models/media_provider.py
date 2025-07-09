from data.db import db


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
