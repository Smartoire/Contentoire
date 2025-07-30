import os
import re
import sys
import tempfile
import shutil
from datetime import datetime

import feedparser
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

# Add the parent directory (project root) to the Python path
sys.path.append(os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

from data.db import db
from models.news import News
from models.provider import FeedProvider
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
                        
                        # Skip video content
                        if any(video in news_url for video in ['/video/', '/videos/', 'youtube.com', 'youtu.be', 'vimeo.com']):
                            print(f"  Skipping video content: {news_url}")
                            continue
                            
                        options = Options()
                        options.add_argument('--headless=new')
                        options.add_argument('--no-sandbox')
                        options.add_argument('--disable-dev-shm-usage')
                        options.add_argument('--disable-gpu')
                        options.add_argument('--disable-extensions')
                        options.add_argument('--disable-software-rasterizer')
                        options.add_argument('--disable-blink-features=AutomationControlled')
                        options.add_experimental_option('excludeSwitches', ['enable-automation'])
                        options.add_experimental_option('useAutomationExtension', False)
                        
                        # Set a modern user agent
                        user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                        options.add_argument(f'user-agent={user_agent}')
                        
                        # Retry logic
                        max_retries = 1
                        for attempt in range(max_retries):
                            user_data_dir = tempfile.mkdtemp()
                            options.add_argument(f'--user-data-dir={user_data_dir}')
                            driver = None
                            try:
                                print(f"  Loading {news_url} (attempt {attempt + 1}/{max_retries})...")
                                driver = webdriver.Chrome(options=options)
                                driver.set_page_load_timeout(15)
                                driver.set_script_timeout(15)
                                
                                # Set additional CDP parameters
                                driver.execute_cdp_cmd('Network.setUserAgentOverride', {"userAgent": user_agent})
                                driver.execute_cdp_cmd('Network.enable', {})
                                
                                # Try to get the page
                                driver.get(news_url)
                                
                                # Wait for content to load
                                WebDriverWait(driver, 15).until(
                                    lambda d: d.execute_script('return document.readyState') == 'complete'
                                )
                                
                                # Try to find and extract main article content
                                try:
                                    # Common article selectors - add more as needed
                                    article_selectors = [
                                        'article',
                                        'main',
                                        '[role="main"]',
                                        '.article-content',
                                        '.post-content',
                                        '.entry-content',
                                        '#content',
                                        '#main-content',
                                        'div[class*="content"]',
                                        'div[class*="article"]'
                                    ]
                                    
                                    # Try to find article content using different selectors
                                    article_element = None
                                    for selector in article_selectors:
                                        try:
                                            elements = driver.find_elements(By.CSS_SELECTOR, selector)
                                            if elements:
                                                # Find the largest element that might contain the article
                                                article_element = max(elements, key=lambda e: len(e.text))
                                                if len(article_element.text) > 500:  # Minimum content length
                                                    break
                                        except:
                                            continue
                                    
                                    if article_element:
                                        # Get the text content
                                        html = article_element.get_attribute('innerHTML')
                                        soup = BeautifulSoup(html, 'html.parser')
                                        
                                        # Remove script and style elements
                                        for script in soup(['script', 'style', 'nav', 'footer', 'header', 'iframe']):
                                            script.decompose()
                                            
                                        # Get clean text
                                        text = soup.get_text(separator='\n', strip=True)
                                        content = '\n'.join([line for line in text.split('\n') if line.strip()])
                                        
                                        if not content or len(content) < 100:  # If content is too short, try full page
                                            raise Exception("Article content too short, trying full page")
                                    else:
                                        raise Exception("No article content found")
                                        
                                except Exception as e:
                                    print(f"  Content extraction warning: {str(e).split('\n')[0]}")
                                    # Fall back to full page extraction
                                    html = driver.page_source
                                    soup = BeautifulSoup(html, 'html.parser')
                                    
                                    # Remove unwanted elements
                                    for element in soup(['script', 'style', 'nav', 'footer', 'header', 'iframe']):
                                        element.decompose()
                                    
                                    text = soup.get_text(separator='\n', strip=True)
                                    content = '\n'.join([line for line in text.split('\n') if line.strip()])
                                
                                if not content or len(content) < 100:
                                    raise Exception("Insufficient content extracted")
                                    
                                break  # Success, exit retry loop
                                
                            except Exception as e:
                                error_msg = str(e).split('\n')[0]
                                print(f"  Attempt {attempt + 1} failed: {error_msg}")
                                if attempt == max_retries - 1:  # Last attempt failed
                                    print(f"  Failed to extract content from {news_url}")
                                    content = "[Content could not be loaded]"
                                    continue  # Skip to next article
                            finally:
                                if driver:
                                    try:
                                        driver.quit()
                                    except:
                                        pass
                                try:
                                    shutil.rmtree(user_data_dir, ignore_errors=True)
                                except:
                                    pass

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
