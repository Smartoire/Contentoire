import { INewsProvider } from './NewsProviderTemplate';

export default class NewsDataIo implements INewsProvider {
  static id = 'newsdataio';
  static provider = 'NewsData.io';
  static description = 'Fetches news from newsdata.io';
  static logo = 'https://gdm-catalog-fmapi-prod.imgix.net/ProductLogo/34b9a1cc-4872-45b5-87e5-db35415b4305.png';

  id = NewsDataIo.id;
  provider = NewsDataIo.provider;
  description = NewsDataIo.description;
  logo = NewsDataIo.logo;

  async getSettings(): Promise<any> {
    const res = await fetch(`/api/news-source/settings/${this.id}`);
    if (!res.ok) {
      return {
        apiKey: '',
        language: 'en',
        category: '',
        country: '',
      };
    }
    return await res.json();
  }

  async saveSettings(settings: any): Promise<void> {
    await fetch(`/api/news-source/settings/${this.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
  }

  async fetchNews(params?: { q?: string; category?: string; language?: string; country?: string }): Promise<any[]> {
    const settings = await this.getSettings();
    const apiKey = settings.apiKey;
    const language = params?.language || settings.language || 'en';
    const category = params?.category || settings.category || '';
    const country = params?.country || settings.country || '';
    const q = params?.q || '';

    if (!apiKey) {
      throw new Error('NewsData.io API key is not set.');
    }

    const url = new URL('https://newsdata.io/api/1/news');
    url.searchParams.append('apikey', apiKey);
    if (q) url.searchParams.append('q', q);
    if (category) url.searchParams.append('category', category);
    if (language) url.searchParams.append('language', language);
    if (country) url.searchParams.append('country', country);

    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error(`Failed to fetch news: ${res.statusText}`);
    }
    const data = await res.json();
    return data.results || [];
  }
}