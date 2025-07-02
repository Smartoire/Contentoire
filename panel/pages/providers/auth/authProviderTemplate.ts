// Auth provider interface for dynamic registration
export interface IAuthProvider {
  id: string;
  provider: string;
  description: string;
  logo: string;
  getSettings(): Promise<any>;
  saveSettings(settings: any): Promise<void>;
  authenticate(params?: any): Promise<any>;
}

// Example Auth Provider Template
export class AuthProviderTemplate implements IAuthProvider {
  static id = 'template-auth';
  static provider = 'Template Auth Provider';
  static description = 'A template for implementing an authentication provider.';
  static logo = 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Bitmap_Icon_News.png';

  id = AuthProviderTemplate.id;
  provider = AuthProviderTemplate.provider;
  description = AuthProviderTemplate.description;
  logo = AuthProviderTemplate.logo;

  async getSettings(): Promise<any> {
    try {
      const data = localStorage.getItem(`auth-provider-${this.id}`);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      return {};
    }
  }

  async saveSettings(settings: any): Promise<void> {
    localStorage.setItem(`auth-provider-${this.id}`, JSON.stringify(settings));
  }

  async authenticate(params?: any): Promise<any> {
    // Implement authentication logic here
    return {};
  }
}

// Export as default for dynamic import
export default AuthProviderTemplate;
