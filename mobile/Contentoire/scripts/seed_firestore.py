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

def generate_mock_post(post_id: str, status: str, days_in_future: int = 0) -> dict[str, any]:
    """Generate a mock post with the given status"""
    # More diverse content options
    titles = [
        "The Future of AI in Content Creation",
        "How to Build a Successful Content Strategy",
        "10 Tips for Engaging Social Media Content",
        "The Rise of Video Content in 2025",
        "Content Marketing Trends You Can't Ignore",
        "Maximizing Engagement with Interactive Content",
        "The Power of Storytelling in Digital Marketing",
        "SEO Best Practices for 2025",
        "Creating Viral Content: Myths and Realities",
        "The Psychology Behind Shareable Content",
        "Leveraging User-Generated Content for Growth",
        "Content Personalization: Beyond Just a Name",
        "The Role of AI in Content Curation",
        "Building a Content Calendar That Works",
        "The Impact of Voice Search on Content Strategy"
    ]
    
    contents = [
        "This is a sample content for testing the Contentoire app. It demonstrates how posts will look in the queue.",
        "Another test post to populate the Firestore database with sample data for development and testing purposes.",
        "Content creation is evolving rapidly. Stay ahead of the curve with these insights and strategies for success.",
        "Testing the queuing system with various post lengths and content types to ensure everything displays correctly.",
        "This post is part of a series of test data used to verify the functionality of the Contentoire application.",
        "Engaging content is key to building a loyal audience. Learn how to create posts that resonate with your followers.",
        "The digital landscape is constantly changing. Stay updated with the latest trends in content marketing.",
        "Quality content drives traffic and builds trust. Discover how to create valuable content for your audience.",
        "From ideation to publication, learn the secrets of effective content creation that converts.",
        "Content is king, but distribution is queen. Master both to succeed in today's digital world."
    ]
    
    image_urls = [
        "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&auto=format&fit=crop"
    ]
    
    source_urls = [
        "https://example.com/ai-content-creation",
        "https://example.com/content-strategy-guide",
        "https://example.com/social-media-tips",
        "https://example.com/video-content-trends",
        "https://example.com/marketing-trends-2025",
        "https://example.com/engagement-strategies",
        "https://example.com/storytelling-marketing",
        "https://example.com/seo-best-practices"
    ]

    platforms = ["twitter", "linkedin", "facebook", "instagram", "tiktok"]
    
    # Generate random timestamps
    now = datetime.utcnow()
    created_at = now - timedelta(days=random.randint(1, 30))
    
    if status == 'scheduled':
        scheduled_time = now + timedelta(days=random.randint(1, 30))
    else:  # waiting
        scheduled_time = now + timedelta(days=random.randint(31, 90))
    
    # Add some variation to the timestamps
    scheduled_time += timedelta(
        hours=random.randint(0, 23),
        minutes=random.randint(0, 59)
    )
    
    return {
        'id': post_id,
        'title': random.choice(titles),
        'content': random.choice(contents),
        'imageUrl': random.choice(image_urls),
        'sourceUrl': random.choice(source_urls),
        'status': status,
        'platform': random.choice(platforms),
        'createdAt': created_at,
        'scheduledTime': scheduled_time if status == 'scheduled' else None,
        'suggestedTime': scheduled_time if status == 'waiting' else None,
        'likes': random.randint(0, 1000),
        'shares': random.randint(0, 500),
        'isPublished': status == 'scheduled',
        'tags': random.sample(["marketing", "technology", "business", "social media", "content", "ai", "trends"], k=random.randint(1, 3))
    }

def seed_firestore():
    # Initialize Firebase Admin
    cred = credentials.Certificate({
        "type": "service_account",
        "project_id": os.getenv("FIREBASE_PROJECT_ID"),
        "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
        "private_key": os.getenv("FIREBASE_PRIVATE_KEY").replace('\\n', '\n'),
        "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
        "client_id": os.getenv("FIREBASE_CLIENT_ID"),
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": os.getenv("FIREBASE_CLIENT_CERT_URL")
    })
    
    try:
        firebase_admin.initialize_app(cred)
    except ValueError:
        # App already exists
        pass
    
    db = firestore.client()
    
    # Clear existing posts
    print("Clearing existing posts...")
    batch = db.batch()
    posts_ref = db.collection('posts')
    for doc in posts_ref.stream():
        batch.delete(doc.reference)
    batch.commit()
    
    print("\nAdding new posts...")
    for i in range(1, 41):
        status = 'scheduled' if i % 2 == 0 else 'waiting'
        post_id = f"{status}_{i:02}"
        post = generate_mock_post(post_id, status)
        
        # Convert datetime objects to Firestore timestamps
        post_data = post.copy()
        post_data['createdAt'] = firestore.SERVER_TIMESTAMP
        
        if status == 'scheduled':
            post_data['scheduledTime'] = post['scheduledTime']
        else:
            post_data['suggestedTime'] = post['suggestedTime']
        
        # Remove None values and the id field (used as document ID)
        post_data = {k: v for k, v in post_data.items() if v is not None and k != 'id'}
        
        # Add to Firestore
        doc_ref = db.collection('posts').document(post_id)
        doc_ref.set(post_data)
        print(f"Added {status} post: {post_id}")
    
    print("\nSeeding complete!")


if __name__ == "__main__":
    seed_firestore()
