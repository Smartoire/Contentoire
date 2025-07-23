import os
import sys

# Add the parent directory (project root) to the Python path
sys.path.append(os.path.abspath(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))

import requests
from data.db import db
from models.news import News
from models.provider import NewsProvider
from wsgi import create_app

app = create_app()

with app.app_context():
    newsapi_provider = NewsProvider.query.filter_by(provider_name='NewsData.io').first()
    if not newsapi_provider or not newsapi_provider.enabled:
        print("NewsData.io provider not available")
        exit(1)

    try:
        for keyword in newsapi_provider.keywords:
            print(f"Searching for keyword: {keyword.keyword}")

            # Get the request parameters
            params = {}
            params['q'] = keyword.keyword
            params['removeduplicate'] = 1
            params['apikey'] = newsapi_provider.access_token_secret

            if keyword.language:
                params['language'] = keyword.language
            if keyword.region:
                params['country'] = keyword.region
            if keyword.category:
                params['category'] = keyword.category

            # Make the API call
            response = requests.get(f"{newsapi_provider.endpoint}", params=params)

            # pprint(response.json())
            # Print response details
            print("\nResponse Details:")
            print(f"  Retrieved {len(response.json()['results'])} articles")
            print(f"  Total available: {response.json()['totalResults']}")
            
            # Print news articles
            # print("\nNews Articles:")
            for news in response.json()['results']:
                # print(f"  Title: {news['title']}")
                # print(f"  Authors: {news['creator']}")
                # print(f"  URL: {news['link']}")
                # print(f"  Published Date: {news['pubDate']}")
                # print(f"  Language: {news['language']}")
                # print(f"  Sentiment: {news['sentiment']}")
                # print(f"  Summary: {news['description']}")
                # print(f"  Keywords: {news['keywords']}")

                new_news = News(
                    title=news['title'],
                    url=news['link'],
                    published_date=news['pubDate'],
                    language=news['language'],
                    summary=news['description'] if news['description'] else '',
                    authors=','.join(news['creator']) if news['creator'] else None,
                    news_text=news['description'] if news['description'] else '',
                    options=','.join(news['keywords']) if news['keywords'] else None,
                    provider_id=newsapi_provider.id,
                    keyword_id=keyword.id
                )
                db.session.add(new_news)
                db.session.commit()

    except Exception as e:
        print("Exception when calling NewsData API: %s\n" % e)
        exit(1)

    print("News list retrieved successfully")
    exit(0)
