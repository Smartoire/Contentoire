import { INewsProvider } from './NewsProviderTemplate';

export default class WorldNewsApi implements INewsProvider {
  static id = 'worldnewsapi';
  static provider = 'World News API';
  static description = 'Fetches news from worldnewsapi.com';
  static logo = 'https://worldnewsapi.com/img/world-news-api-logo-black.svg';

  id = WorldNewsApi.id;
  provider = WorldNewsApi.provider;
  description = WorldNewsApi.description;
  logo = WorldNewsApi.logo;

  async getSettings(): Promise<any> {
    const res = await fetch(`/api/news-source/settings/${this.id}`);
    if (!res.ok) {
      return {
        apiKey: '',
        language: 'en',
        number: 10,
        sourceCountries: '',
        topic: '',
        text: '',
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

  async fetchNews(params?: { text?: string; topic?: string; language?: string; number?: number; sourceCountries?: string }): Promise<any[]> {
    const settings = await this.getSettings();
    const apiKey = settings.apiKey;
    const language = params?.language || settings.language || 'en';
    const topic = params?.topic || settings.topic || '';
    const text = params?.text || settings.text || '';
    const number = params?.number || settings.number || 10;
    const sourceCountries = params?.sourceCountries || settings.sourceCountries || '';

    if (!apiKey) {
      throw new Error('WorldNewsAPI API key is not set.');
    }

    const url = new URL('https://api.worldnewsapi.com/search-news');
    url.searchParams.append('api-key', apiKey);
    url.searchParams.append('language', language);
    url.searchParams.append('number', String(number));
    if (topic) url.searchParams.append('topic', topic);
    if (text) url.searchParams.append('text', text);
    if (sourceCountries) url.searchParams.append('source-countries', sourceCountries);

    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error(`Failed to fetch news: ${res.statusText}`);
    }
    const data = await res.json();
    return data.news || [];
  }
}