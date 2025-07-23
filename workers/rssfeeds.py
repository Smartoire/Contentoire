import os
import re
import sys

import feedparser
from bs4 import BeautifulSoup

# Add the parent directory (project root) to the Python path
sys.path.append(os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

from data.db import db
from models.news import News
from models.provider import FeedProvider
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from wsgi import create_app

app = create_app()

with app.app_context():
    rss_providers = FeedProvider.query.filter_by(enabled=True).all()
    content = ''
    summary = ''
    news_url = ''
    try:
        for rss in rss_providers:
            print(f"Searching for feed: {rss.provider_name}")

            feeds = feedparser.parse(rss.endpoint)
            print("\nResponse Details:")
            print(f"  Retrieved {len(feeds.entries)} articles")

            # Print news articles
            # print("\nNews Articles:")
            
            for entry in feeds.entries:
                try:
                    if entry.id is not None:
                        existing_news = News.query.filter_by(options=entry.id).first()
                        if existing_news:
                            print(f"Article with ID {entry.id} already exists in the database. Skipping.")
                            continue

                    title = BeautifulSoup(entry.title or '', 'html.parser').get_text()

                    print(f"Found article: {entry.title}")
                    match = re.search(r'url=([^&]+)', entry.link)
                    if match:
                        news_url = match.group(1)
                        options = Options()
                        options.headless = True
                        driver = webdriver.Chrome(options=options)
                        driver.set_page_load_timeout(30)

                        try:
                            driver.get(news_url)
                            html = driver.page_source
                            driver.quit()
                            text = BeautifulSoup(html, 'html.parser').get_text()
                            content = '\n'.join([line for line in text.split('\n') if line.strip() != ''])
                        except Exception as e:
                            content = f"Error loading page: {e}"
                            continue

                    authors_str = ', '.join(entry.author) if entry.author else ''

                    if entry.content and entry.content[0] and 'value' in entry.content[0]:
                        summary = BeautifulSoup(entry.content[0]['value'], 'html.parser').get_text()

                    # print(f"  Title: {entry.title}")
                    # print(f"  Authors: {authors_str}")
                    # print(f"  URL: {news_url}")
                    # print(f"  Published Date: {entry.published}")
                    # print(f"  Summary: {summary}")
                    # print(f"  Content: ({len(content)}) {content[:2000]}")

                    new_news = News(
                        title=entry.title,
                        url=news_url,
                        published_date=entry.published,
                        summary=summary or '',
                        authors=authors_str,
                        news_text=content or '',
                        options=f"{entry.id or ''}",
                        feed_id =rss.id,
                    )
                    db.session.add(new_news)
                    db.session.commit()

                except Exception as e:
                    print(f"Error processing entry: {e}")
                    continue

    except Exception as e:
        print("Exception when calling RSS Feeds: %s\n" % e)
        exit(1)

    print("News list retrieved successfully")
    exit(0)
