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
    newsapi_provider = NewsProvider.query.filter_by(provider_name='News API').first()
    if not newsapi_provider or not newsapi_provider.enabled:
        print("News API provider not available")
        exit(1)

    try:
        for keyword in newsapi_provider.keywords:
            print(f"Searching for keyword: {keyword.keyword}")

            # Get the request parameters
            params = {}
            params['q'] = keyword.keyword
            params['pageSize'] = 20
            params['from'] = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
            params['sortBy'] = 'publishedAt'
            params['apiKey'] = newsapi_provider.access_token_secret
            params['language'] = keyword.language if keyword.language else 'en'

            # Make the API call
            response = requests.get(f"{newsapi_provider.endpoint}", params=params)
            print(params)
            print(newsapi_provider.endpoint)
            print(response)

            # Print response details
            print("\nResponse Details:")
            print(f"  Retrieved {len(response.json()['articles'])} articles")
            print(f"  Total available: {response.json()['totalResults']}")
            
            # Print news articles
            # print("\nNews Articles:")
            for news in response.json()['articles']:
                # print(f"  Title: {news['title']}")
                # print(f"  Authors: {news['author']}")
                # print(f"  URL: {news['url']}")
                # print(f"  Published Date: {news['publishedAt']}")
                # print(f"  Summary: {news['description']}")

                new_news = News(
                    title=news['title'],
                    url=news['url'],
                    published_date=news['publishedAt'],
                    language='en',
                    summary=news['description'] if news['description'] else '',
                    authors=news['author'] if news['author'] else None,
                    news_text=news['content'] if news['content'] else '',
                    options=f"source:{news['source']['name']}" if news['source']['name'] else None,
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
