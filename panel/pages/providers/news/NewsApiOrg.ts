import { INewsProvider } from './NewsProviderTemplate';

export default class NewsApiOrg implements INewsProvider {
  static id = 'newsapiorg';
  static provider = 'NewsAPI.org';
  static description = 'Fetches news from newsapi.org';
  static logo = 'https://newsapi.org/images/n-logo-border.png';

  id = NewsApiOrg.id;
  provider = NewsApiOrg.provider;
  description = NewsApiOrg.description;
  logo = NewsApiOrg.logo;

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
      throw new Error('NewsAPI.org API key is not set.');
    }

    const url = new URL('https://newsapi.org/v2/top-headlines');
    if (q) url.searchParams.append('q', q);
    if (category) url.searchParams.append('category', category);
    if (language) url.searchParams.append('language', language);
    if (country) url.searchParams.append('country', country);
    url.searchParams.append('apiKey', apiKey);

    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error(`Failed to fetch news: ${res.statusText}`);
    }
    const data = await res.json();
    return data.articles || [];
  }
}