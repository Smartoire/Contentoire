import os
import sys

# Add the parent directory (project root) to the Python path
sys.path.append(os.path.abspath(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))

from datetime import datetime, timedelta

import worldnewsapi
from data.db import db
from models.news import News
from models.provider import NewsProvider
from worldnewsapi.rest import ApiException
from wsgi import create_app

app = create_app()

with app.app_context():
    newsapi_provider = NewsProvider.query.filter_by(provider_name='World News API').first()
    if not newsapi_provider or not newsapi_provider.enabled:
        print("World News API provider not available")
        exit(1)

    newsapi_configuration = worldnewsapi.Configuration(api_key={'apiKey': newsapi_provider.access_token_secret})

    try:
        # Create API client with debug mode enabled
        api_client = worldnewsapi.ApiClient(configuration=newsapi_configuration)
        api_client.configuration.debug = True
        newsapi_api_instance = worldnewsapi.NewsApi(api_client)
        
        for keyword in newsapi_provider.keywords:
            print(f"Searching for keyword: {keyword.keyword}")

            # Get the request parameters
            params = {}
            params['number'] = 20
            params['text'] = keyword.keyword
            # params['entities'] = 'LOC:British Columbia'
            params['earliest_publish_date'] = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
            params['min_sentiment'] = -0.1
            params['max_sentiment'] = 1
            params['sort_direction'] = 'desc'
            params['sort'] = 'publish-time'

            if keyword.language:
                params['language'] = keyword.language
            if keyword.region:
                params['source_country'] = keyword.region
            if keyword.category:
                params['categories'] = keyword.category

            # Make the API call
            response = newsapi_api_instance.search_news(**params)
            
            # Print response details
            print("\nResponse Details:")
            print(f"  Retrieved {len(response.news)} articles")
            print(f"  Total available: {response.available}")
            print(f"  Offset: {response.offset}")
            print(f"  Number: {response.number}")
            
            # Print news articles
            # print("\nNews Articles:")
            for news in response.news:
                # print(f"  Title: {news.title}")
                # print(f"  Authors: {news.authors}")
                # print(f"  URL: {news.url}")
                # print(f"  Published Date: {news.publish_date}")
                # print(f"  Language: {news.language}")
                # print(f"  Sentiment: {news.sentiment}")
                # # print(f"  Text: {news.text}")
                # print(f"  Summary: {news.summary}")

                # Convert authors list to string
                authors_str = ', '.join(news.authors) if news.authors else ''
                
                # Convert sentiment to string
                sentiment_str = str(news.sentiment) if news.sentiment else ''
                
                # Create options string
                options_str = f"sentiment:{sentiment_str};published_date:{news.publish_date}"
                
                new_news = News(
                    title=news.title,
                    url=news.url,
                    published_date=news.publish_date,
                    language=news.language,
                    summary=news.summary,
                    authors=authors_str,
                    news_text=news.text,
                    options=options_str,
                    provider_id=newsapi_provider.id,
                    keyword_id=keyword.id
                )
                db.session.add(new_news)
                db.session.commit()

    except ApiException as e:
        print("Exception when calling World News API: %s\n" % e)
        print("Status: %s" % e.status)
        print("Reason: %s" % e.reason)
        print("Body: %s" % e.body)
        print("Headers: %s" % e.headers)
        exit(1)

    print("News list retrieved successfully")
    exit(0)
