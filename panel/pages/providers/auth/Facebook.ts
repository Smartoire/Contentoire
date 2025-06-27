import { IAuthProvider } from './authProviderTemplate';

export default class FacebookAuthProvider implements IAuthProvider {
  static id = 'facebook';
  static provider = 'Facebook';
  static description = 'Authenticate users with Facebook OAuth2.';
  static logo = '/logos/facebook.png';

  id = FacebookAuthProvider.id;
  provider = FacebookAuthProvider.provider;
  description = FacebookAuthProvider.description;
  logo = FacebookAuthProvider.logo;

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
