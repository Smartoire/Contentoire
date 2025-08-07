import { NewsItem } from '@/types/news';

// Mock news data for demonstration
const mockNews: NewsItem[] = [
  {
    id: '1',
    title: 'Revolutionary AI Technology Transforms Digital Marketing Landscape',
    summary: 'Recent breakthroughs in artificial intelligence are reshaping how businesses approach digital marketing, with new tools offering unprecedented personalization.',
    content: 'Full article content here...',
    source: 'TechCrunch',
    publishedAt: '2025-01-20T10:30:00Z',
    url: 'https://example.com/article1',
    imageUrl: 'https://images.pexels.com/photos/8439093/pexels-photo-8439093.jpeg',
    keywords: ['technology', 'AI', 'marketing'],
  },
  {
    id: '2',
    title: 'Social Media Engagement Reaches All-Time High in 2025',
    summary: 'New data reveals that social media engagement has reached unprecedented levels, with users spending more time interacting with content than ever before.',
    content: 'Full article content here...',
    source: 'Social Media Today',
    publishedAt: '2025-01-20T08:15:00Z',
    url: 'https://example.com/article2',
    imageUrl: 'https://images.pexels.com/photos/267389/pexels-photo-267389.jpeg',
    keywords: ['social media', 'engagement', 'trends'],
  },
  {
    id: '3',
    title: 'Mobile App Development Trends That Will Define 2025',
    summary: 'Industry experts identify key trends in mobile app development that are expected to shape the landscape throughout 2025 and beyond.',
    content: 'Full article content here...',
    source: 'App Developer Magazine',
    publishedAt: '2025-01-19T16:45:00Z',
    url: 'https://example.com/article3',
    imageUrl: 'https://images.pexels.com/photos/699459/pexels-photo-699459.jpeg',
    keywords: ['mobile', 'development', 'trends'],
  },
];

class NewsService {
  async fetchNewsByKeyword(keyword: string): Promise<NewsItem[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Filter mock data based on keyword
    return mockNews.filter(item =>
      item.keywords.some(k => k.toLowerCase().includes(keyword.toLowerCase())) ||
      item.title.toLowerCase().includes(keyword.toLowerCase()) ||
      item.summary.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  async summarizeArticle(content: string): Promise<string> {
    // Simulate AI summarization
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return a mock summary
    return content.substring(0, 200) + '...';
  }
}

export const newsService = new NewsService();