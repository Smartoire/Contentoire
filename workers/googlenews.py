import json
from pprint import pprint
from urllib.parse import quote, urlparse

import feedparser
import newspaper
import requests
from bs4 import BeautifulSoup


def get_decoding_params(gn_art_id):
    print(f"Fetching decoding parameters for article ID: {gn_art_id}")
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 6.2; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36'}
    response = requests.get(f"https://news.google.com/articles/{gn_art_id}", headers=headers)
    for header, value in response.headers.items():
        print(f"{header}: {value}")
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "lxml")
    div = soup.select_one("c-wiz > div")
    print("sign",div.get("data-n-a-sg"))
    print("timestamp",div.get("data-n-a-ts"))
    return {
        "signature": div.get("data-n-a-sg"),
        "timestamp": div.get("data-n-a-ts"),
        "gn_art_id": gn_art_id,
    }


def decode_urls(articles):
    articles_reqs = [
        [
            "Fbv4je",
            f'["garturlreq",[["X","X",["X","X"],null,null,1,1,"US:en",null,1,null,null,null,null,null,0,1],"X","X",1,[1,1,1],1,1,null,0,0,null,0],"{art["gn_art_id"]}","{art["signature"]}","{art["timestamp"]}"]'
        ]
        for art in articles
    ]
    print("articles",articles_reqs)
    payload = f"f.req={quote(json.dumps([articles_reqs]))}"
    headers = {"content-type": "application/x-www-form-urlencoded;charset=UTF-8"}
    response = requests.post(
        url="https://news.google.com/_/DotsSplashUi/data/batchexecute",
        headers=headers,
        data=payload,
    )
    response.raise_for_status()
    print("response", response.text)
    return [json.loads(res[2])[1] for res in json.loads(response.text.split("\n\n")[1])[:-2]]

# Example usage
feed_url = "https://news.google.com/rss/search?q=canada"
feed = feedparser.parse(feed_url)
articles_params = [get_decoding_params(urlparse(entry.link).path.split("/")[-1]) for entry in feed.entries[:5]]
decoded_urls = decode_urls(articles_params)
for url in decoded_urls:
    response = requests.get(url, allow_redirects=True)
    print("Response: ", response.text)
    print("Response URL: ", response.url)

    article = newspaper.Article(response.url)
    article.download()
    pprint(article.html)
    article.parse()
    print("Authors: ", article.authors)
    print("Text: ", article.text)

    article.nlp()
    print("Summary: ", article.summary)
    print("Keywords: ", article.keywords)

    html = requests.get(url).text
    text = newspaper.fulltext(html)
    print("Text: ", text)
    print("\n\n------------------------\n")
    