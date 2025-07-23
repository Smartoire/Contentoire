import os
import sys

# Add the parent directory (project root) to the Python path
sys.path.append(os.path.abspath(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))

from datetime import datetime, timedelta

import requests
from data.db import db
from models.news import News
from models.provider import NewsProvider
from wsgi import create_app

app = create_app()

with app.app_context():
    newsapi_provider = NewsProvider.query.filter_by(provider_name='Currents API').first()
    if not newsapi_provider or not newsapi_provider.enabled:
        print("Currents API provider not available")
        exit(1)

    try:
        for keyword in newsapi_provider.keywords:
            print(f"Searching for keyword: {keyword.keyword}")

            # Get the request parameters
            params = {}
            params['keyword'] = keyword.keyword
            params['type'] = 1
            params['page_size'] = 20
            params['start_date'] = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
            params['apiKey'] = newsapi_provider.access_token_secret
            params['language'] = keyword.language if keyword.language else 'en'
            if keyword.category:
                params['category'] = keyword.category
            if keyword.region:
                params['country'] = keyword.region

            # Make the API call
            response = requests.get(f"{newsapi_provider.endpoint}", params=params)
            print(params)
            print(newsapi_provider.endpoint)
            print(response)

            # pprint(response.json())
            # Print response details
            print("\nResponse Details:")
            print(f"  Retrieved {len(response.json()['news'])} articles")
            
            # Print news articles
            # print("\nNews Articles:")
            for news in response.json()['news']:
                # print(f"  Title: {news['title']}")
                # print(f"  Authors: {news['author']}")
                # print(f"  URL: {news['url']}")
                # print(f"  Published Date: {news['published']}")
                # print(f"  Summary: {news['description']}")

                new_news = News(
                    title=news['title'],
                    url=news['url'],
                    published_date=news['published'],
                    language=news['language'],
                    summary=news['description'] if news['description'] else '',
                    authors=news['author'] if news['author'] else None,
                    news_text=news['description'] if news['description'] else '',
                    options=f"category:{', '.join(news['category'])}" if news['category'] else None,
                    provider_id=newsapi_provider.id,
                    keyword_id=keyword.id
                )
                db.session.add(new_news)
                db.session.commit()

    except Exception as e:
        print("Exception when calling News API: %s\n" % e)
        exit(1)

    print("News list retrieved successfully")
    exit(0)
