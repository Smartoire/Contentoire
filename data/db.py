from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

'''
flask db init         # Only once, to initialize migrations folder
flask db migrate -m "Initial migration"
flask db upgrade
'''