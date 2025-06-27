import { IAuthProvider } from './authProviderTemplate';

export default class LinkedInAuthProvider implements IAuthProvider {
  static id = 'linkedin';
  static provider = 'LinkedIn';
  static description = 'Authenticate users with LinkedIn OAuth2.';
  static logo = '/logos/linkedin.png';

  id = LinkedInAuthProvider.id;
  provider = LinkedInAuthProvider.provider;
  description = LinkedInAuthProvider.description;
  logo = LinkedInAuthProvider.logo;

  // Example: settings file path (could be replaced with DB or API)
  private settingsPath = `/home/vahid/Projects/Contentoire/panel/auth-providers/settings/${this.id}.json`;

  async getSettings(): Promise<any> {
    // Replace with your preferred storage (DB, API, etc)
    try {
      const res = await fetch(`/api/auth-provider/settings/${this.id}`);
      if (!res.ok) return {};
      return await res.json();
    } catch {
      return {};
    }
  }

  async saveSettings(settings: any): Promise<void> {
    await fetch(`/api/auth-provider/settings/${this.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
  }
}
