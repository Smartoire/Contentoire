export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  publishedAt: string;
  url: string;
  imageUrl: string;
  keywords: string[];
}

export interface ScheduledPost {
  id: string;
  title: string;
  content: string;
  platform: string;
  scheduledFor: Date;
  status: 'scheduled' | 'published' | 'failed';
  newsItemId?: string;
}