from gnews import GNews
from pprint import pprint
import newspaper
import requests
import json

news = GNews(language='en', country='CA', period='2d', max_results=5)
report = news.get_news('Public Library')
for news in report:
    pprint(news)
    print("Title: ", news['title'])
    print("URL: ", news['url'])
    print("Description: ", news['description'])
    print("Published Date: ", news['published date'])
    print("Publisher: ", news['publisher']['title'])
    exit(0)

    response = requests.get(news['url'], allow_redirects=True)
    print(response.text)
    print(response.url)

    article = newspaper.Article(news['url'])
    article.download()

    pprint(article.html)
    article.parse()
    print("Authors: ", article.authors)
    print("Text: ", article.text)

    article.nlp()
    print("Summary: ", article.summary)
    print("Keywords: ", article.keywords)

    html = requests.get(news['url']).text
    text = newspaper.fulltext(html)
    print("Text: ", text)
    print("\n\n------------------------\n")
    

    