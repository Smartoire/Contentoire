import os
import sys

# Add the parent directory (project root) to the Python path
sys.path.append(os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

import asyncio

from dotenv import load_dotenv
from telegram import Bot, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.error import NetworkError, TelegramError, TimedOut
from telegram.request import HTTPXRequest
from wsgi import create_app

load_dotenv()  # This loads variables from .env into os.environ

# Bot token (DO NOT hardcode in real-world, use environment variable or config)
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
USER_CHAT_ID = 62717266  # Replace with dynamic user ID if needed

request = HTTPXRequest(read_timeout=30, connect_timeout=30)

bot = Bot(token=TELEGRAM_BOT_TOKEN, request=request)

post_options = [
    {"id": 1, "text": "Post A"},
    {"id": 2, "text": "Post B"},
    {"id": 3, "text": "Post C"},
]

keyboard = [
    [InlineKeyboardButton(p["text"], callback_data=f"post_{p['id']}")]
    for p in post_options
]

markup = InlineKeyboardMarkup(keyboard)

async def send_message():
    try:
        await bot.send_message(chat_id=USER_CHAT_ID, text="Choose a post:", reply_markup=markup)
    except TimedOut:
        print("❌ Connection to Telegram timed out.")
    except NetworkError:
        print("❌ Network error.")
    except TelegramError as e:
        print(f"❌ Telegram error: {e}")

app = create_app()
with app.app_context():
    #asyncio.run(get_me())
    markup = InlineKeyboardMarkup(keyboard)
    asyncio.run(send_message())
