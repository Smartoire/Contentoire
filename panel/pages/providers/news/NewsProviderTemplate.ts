// News source interface for dynamic registration
export interface INewsProvider {
  id: string;
  provider: string;
  description: string;
  logo: string; // <-- Add logo property
  getSettings(): Promise<any>;
  saveSettings(settings: any): Promise<void>;
  fetchNews(params?: any): Promise<any[]>;
}

// Example News Source Template
export class NewsProviderTemplate implements INewsProvider {
  static id = 'template-source';
  static provider = 'Template News Source';
  static description = 'A template for implementing a news source.';
  static logo = 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Bitmap_Icon_News.png'; // <-- Add logo

  id = NewsProviderTemplate.id;
  provider = NewsProviderTemplate.provider;
  description = NewsProviderTemplate.description;
  logo = NewsProviderTemplate.logo; // <-- Instance property

  // Example: settings file path (could be replaced with DB)
  private settingsPath = `/home/vahid/Projects/Contentoire/panel/news-sources/settings/${this.id}.json`;

  async getSettings(): Promise<any> {
    // Replace with your preferred storage (DB, file, etc)
    try {
      const fs = await import('fs/promises');
      const data = await fs.readFile(this.settingsPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return {};
    }
  }

  async saveSettings(settings: any): Promise<void> {
    const fs = await import('fs/promises');
    await fs.writeFile(this.settingsPath, JSON.stringify(settings, null, 2), 'utf-8');
  }

  async fetchNews(params?: any): Promise<any[]> {
    // Implement your news fetching logic here
    // Example: return dummy news
    return [
      {
        title: 'Sample News',
        content: 'This is a sample news item.',
        date: new Date().toISOString(),
      },
    ];
  }
}

// Export as default for dynamic import
export default NewsProviderTemplate;
