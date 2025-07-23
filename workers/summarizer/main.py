import os
import sqlite3

import torch
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig,
    pipeline,
)

torch.cuda.empty_cache()  # Clear GPU memory if needed

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype="float16",  # Match input type
    bnb_4bit_use_double_quant=True,
    bnb_4bit_quant_type="nf4"
)

# print("✅ CUDA available:", torch.cuda.is_available())
# print("📊 CUDA device:", torch.cuda.get_device_name(0) if torch.cuda.is_available() else "None")

model_id = "microsoft/phi-2"

tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    quantization_config=bnb_config,
    device_map="auto",
    trust_remote_code=True
)

pipe = pipeline("text-generation", model=model, tokenizer=tokenizer)

def summerize_news(title, summary, full_text):
    output = ""
    prompt = f"""For this article:
Title: {title}
Abstract: {summary}
Article: {full_text[:2000]}
---
Your task: Please summerize these in 1-2 sentence summary in a neutral tone
=*=*=
"""
    torch.cuda.empty_cache()  # Clear GPU memory if needed
    with torch.no_grad():
        output = pipe(prompt, max_new_tokens=200, do_sample=True, temperature=0.7, pad_token_id=tokenizer.eos_token_id)[0]['generated_text']
    
    new_summary = output.split("=*=*=\n")[1]
    
    prompt = f"""For this article:
{new_summary}
---
Your task: Please generate a catchy title(under 200 characters)
=*=*=
"""
    torch.cuda.empty_cache()  # Clear GPU memory if needed
    with torch.no_grad():
        output = pipe(prompt, max_new_tokens=200, do_sample=True, temperature=0.7, pad_token_id=tokenizer.eos_token_id)[0]['generated_text']
    new_title = output.split("=*=*=\n")[1]
    return new_title, new_summary

basedir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
db_path = '/' + os.path.join(basedir, 'data/contentoire.db')
def load_news():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    cursor.execute("CREATE TABLE IF NOT EXISTS summerized_news (id INTEGER PRIMARY KEY, title TEXT, summary TEXT)")
    conn.commit()


    cursor.execute("SELECT id, title, news_text, summary FROM news WHERE processed IS NULL")
    rows = cursor.fetchall()

    for row in rows:
        id, title, news_text, summary = row
        new_title, new_summary = summerize_news(title, summary, news_text)

        cursor.execute("INSERT INTO summerized_news (id, title, summary) VALUES (?, ?, ?)", (id,new_title, new_summary))

        cursor.execute("UPDATE news SET processed = CURRENT_TIMESTAMP WHERE id = ?", (id,))
        conn.commit()
        print(f"New Title:\n {new_title}\n===\n")

    conn.close()

load_news()