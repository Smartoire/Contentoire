import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timedelta
import random
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def initialize_firebase():
    # Initialize Firebase Admin with service account
    cred = credentials.Certificate({
        "type": "service_account",
        "project_id": os.getenv('FIREBASE_PROJECT_ID'),
        "private_key_id": os.getenv('FIREBASE_PRIVATE_KEY_ID'),
        "private_key": os.getenv('FIREBASE_PRIVATE_KEY').replace('\\n', '\n'),
        "client_email": os.getenv('FIREBASE_CLIENT_EMAIL'),
        "client_id": os.getenv('FIREBASE_CLIENT_ID'),
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": os.getenv('FIREBASE_CLIENT_CERT_URL')
    })
    
    try:
        firebase_admin.initialize_app(cred)
    except ValueError as e:
        # App already exists
        pass
    
    return firestore.client()

def generate_mock_post(post_id, status, days_in_future=0):
    """Generate a mock post with the given status"""
    titles = [
        "The Future of AI in Content Creation",
        "How to Build a Successful Content Strategy",
        "10 Tips for Engaging Social Media Content",
        "The Rise of Video Content in 2025",
        "Content Marketing Trends You Can't Ignore"
    ]
    
    contents = [
        "This is a sample content for testing the Contentoire app. It demonstrates how posts will look in the queue.",
        "Another test post to populate the Firestore database with sample data for development and testing purposes.",
        "Content creation is evolving rapidly. Stay ahead of the curve with these insights and strategies for success.",
        "Testing the queuing system with various post lengths and content types to ensure everything displays correctly.",
        "This post is part of a series of test data used to verify the functionality of the Contentoire application."
    ]
    
    image_urls = [
        "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop"
    ]
    
    source_urls = [
        "https://example.com/ai-content-creation",
        "https://example.com/content-strategy",
        "https://example.com/social-media-tips",
        "https://example.com/video-content-trends",
        "https://example.com/marketing-trends"
    ]
    
    # Randomly select content
    idx = random.randint(0, 4)
    
    # Generate timestamps
    now = datetime.utcnow()
    scheduled_time = now + timedelta(days=days_in_future, hours=random.randint(1, 24))
    suggested_time = now + timedelta(days=days_in_future + random.randint(1, 7), hours=random.randint(1, 24))
    
    return {
        "id": post_id,
        "title": titles[idx],
        "content": contents[idx],
        "imageUrl": image_urls[idx],
        "sourceUrl": source_urls[idx],
        "scheduledTime": scheduled_time,
        "suggestedTime": suggested_time if status == 'waiting' else scheduled_time,
        "status": status,
        "createdAt": now
    }

def seed_firestore():
    db = initialize_firebase()
    
    # Clear existing posts (optional, be careful in production)
    # Uncomment the following lines if you want to clear the collection first
    # docs = db.collection('posts').stream()
    # for doc in docs:
    #     doc.reference.delete()
    
    # Add 5 scheduled posts
    for i in range(5):
        post_data = generate_mock_post(f"scheduled_{i+1}", "scheduled", days_in_future=i+1)
        db.collection('posts').document(post_data["id"]).set({
            "title": post_data["title"],
            "content": post_data["content"],
            "imageUrl": post_data["imageUrl"],
            "sourceUrl": post_data["sourceUrl"],
            "scheduledTime": firestore.SERVER_TIMESTAMP if i == 0 else post_data["scheduledTime"],
            "suggestedTime": post_data["suggestedTime"],
            "status": post_data["status"],
            "createdAt": firestore.SERVER_TIMESTAMP
        })
        print(f"Added scheduled post: {post_data['id']}")
    
    # Add 5 waiting posts
    for i in range(5):
        post_data = generate_mock_post(f"waiting_{i+1}", "waiting", days_in_future=i+2)
        db.collection('posts').document(post_data["id"]).set({
            "title": post_data["title"],
            "content": post_data["content"],
            "imageUrl": post_data["imageUrl"],
            "sourceUrl": post_data["sourceUrl"],
            "scheduledTime": None,
            "suggestedTime": post_data["suggestedTime"],
            "status": post_data["status"],
            "createdAt": firestore.SERVER_TIMESTAMP
        })
        print(f"Added waiting post: {post_data['id']}")
    
    print("\nSeeding complete!")

if __name__ == "__main__":
    seed_firestore()
