import { INewsProvider } from './NewsProviderTemplate';

export default class CurrentsApi implements INewsProvider {
  static id = 'currentsapi';
  static provider = 'Currents API';
  static description = 'Fetches news from currentsapi.services';
  static logo = 'https://avatars.githubusercontent.com/u/52959491?s=200&v=4';

  id = CurrentsApi.id;
  provider = CurrentsApi.provider;
  description = CurrentsApi.description;
  logo = CurrentsApi.logo;

  async getSettings(): Promise<any> {
    const res = await fetch(`/api/news-source/settings/${this.id}`);
    if (!res.ok) return { apiKey: '', language: 'en', category: '' };
    return await res.json();
  }

  async saveSettings(settings: any): Promise<void> {
    await fetch(`/api/news-source/settings/${this.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
  }

  async fetchNews(params?: { keywords?: string; category?: string; language?: string }): Promise<any[]> {
    const settings = await this.getSettings();
    const apiKey = settings.apiKey;
    const language = params?.language || settings.language || 'en';
    const category = params?.category || settings.category || '';
    const keywords = params?.keywords || '';

    if (!apiKey) {
      throw new Error('Currents API key is not set.');
    }

    const url = new URL('https://api.currentsapi.services/v1/latest-news');
    url.searchParams.append('apiKey', apiKey);
    url.searchParams.append('language', language);
    if (category) url.searchParams.append('category', category);
    if (keywords) url.searchParams.append('keywords', keywords);

    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error(`Failed to fetch news: ${res.statusText}`);
    }
    const data = await res.json();
    return data.news || [];
  }
}