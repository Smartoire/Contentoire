from data.db import db
from flask import Blueprint, abort, flash, redirect, render_template, request, url_for
from models.provider import SearchKeyword, MediaProvider, NewsProvider
from models.news import News

scheduler_bp = Blueprint('scheduler', __name__, url_prefix='/scheduler')

@scheduler_bp.route('/', methods=['GET'])
def dashboard():
    return render_template('calendar.html')

@scheduler_bp.route('/panel', methods=['GET'])
def planner():
    return render_template('planner.html')

@scheduler_bp.route('/news', methods=['GET'])
def news_dashboard():
    news = News.query.all()
    return render_template('news.html', news=news)
