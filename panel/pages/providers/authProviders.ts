// Auth provider interface and template

export interface IAuthProvider {
  id: string;
  title: string;
  logo: string;
  getSettings(): Promise<any>;
  saveSettings(settings: any): Promise<void>;
  enabled: boolean;
}

// Example Auth Provider Template
export class AuthProviderTemplate implements IAuthProvider {
  static id = 'template-auth';
  static title = 'Template Auth Provider';
  static logo = '/logos/template-auth.png';

  id = AuthProviderTemplate.id;
  title = AuthProviderTemplate.title;
  logo = AuthProviderTemplate.logo;
  enabled = true;

  async getSettings(): Promise<any> {
    // Replace with your backend API call
    const res = await fetch(`/api/auth-provider/settings/${this.id}`);
    if (!res.ok) return {};
    return await res.json();
  }

  async saveSettings(settings: any): Promise<void> {
    await fetch(`/api/auth-provider/settings/${this.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
  }
}

// Sample Auth Providers
export const authProviders: IAuthProvider[] = [
  {
    id: 'google',
    title: 'Google',
    logo: '/logos/google.png',
    enabled: true,
    async getSettings() {
      const res = await fetch('/api/auth-provider/settings/google');
      if (!res.ok) return {};
      return await res.json();
    },
    async saveSettings(settings: any) {
      await fetch('/api/auth-provider/settings/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
    },
  },
  {
    id: 'facebook',
    title: 'Facebook',
    logo: '/logos/facebook.png',
    enabled: true,
    async getSettings() {
      const res = await fetch('/api/auth-provider/settings/facebook');
      if (!res.ok) return {};
      return await res.json();
    },
    async saveSettings(settings: any) {
      await fetch('/api/auth-provider/settings/facebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
    },
  },
  {
    id: 'apple',
    title: 'Apple',
    logo: '/logos/apple.png',
    enabled: true,
    async getSettings() {
      const res = await fetch('/api/auth-provider/settings/apple');
      if (!res.ok) return {};
      return await res.json();
    },
    async saveSettings(settings: any) {
      await fetch('/api/auth-provider/settings/apple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
    },
  },
  {
    id: 'twitter',
    title: 'Twitter',
    logo: '/logos/twitter.png',
    enabled: true,
    async getSettings() {
      const res = await fetch('/api/auth-provider/settings/twitter');
      if (!res.ok) return {};
      return await res.json();
    },
    async saveSettings(settings: any) {
      await fetch('/api/auth-provider/settings/twitter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
    },
  },
  {
    id: 'linkedin',
    title: 'LinkedIn',
    logo: '/logos/linkedin.png',
    enabled: true,
    async getSettings() {
      const res = await fetch('/api/auth-provider/settings/linkedin');
      if (!res.ok) return {};
      return await res.json();
    },
    async saveSettings(settings: any) {
      await fetch('/api/auth-provider/settings/linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
    },
  },
];
