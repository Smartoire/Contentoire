import { createLogger } from './logger';

const logger = createLogger('MockAuthService');

interface User {
  id: string;
  email: string;
  name: string;
  photo?: string;
}

interface AuthResult {
  user: User;
  token: string;
}

// Mock user database
const mockUsers: User[] = [
  {
    id: 'mock-user-1',
    email: 'user@example.com',
    name: 'Test User',
    photo: 'https://i.pravatar.cc/150?img=1',
  },
];

class MockAuthService {
  private currentUser: User | null = null;
  private token: string | null = null;

  // Simulate network delay
  private async simulateNetwork() {
    return new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
  }

  // Generate a mock JWT token
  private generateToken(userId: string): string {
    return `mock-jwt-token-${userId}-${Date.now()}`;
  }

  // Mock email/password login
  async signInWithEmailAndPassword(email: string, password: string): Promise<AuthResult> {
    logger.info('Attempting email/password login', { email });
    await this.simulateNetwork();

    const user = mockUsers.find(u => u.email === email);
    
    if (!user || password !== 'password') { // Simple password for demo
      const error = new Error('Invalid email or password');
      logger.error('Login failed', { email, error });
      throw error;
    }

    this.currentUser = user;
    this.token = this.generateToken(user.id);
    
    logger.info('Login successful', { userId: user.id, email });
    return { user, token: this.token };
  }

  // Mock Google sign-in
  async signInWithGoogle(): Promise<AuthResult> {
    logger.info('Attempting Google sign-in');
    await this.simulateNetwork();

    // For demo, always return the first mock user
    const user = mockUsers[0];
    this.currentUser = user;
    this.token = this.generateToken(user.id);
    
    logger.info('Google sign-in successful', { userId: user.id, email: user.email });
    return { user, token: this.token };
  }

  // Sign out
  async signOut(): Promise<void> {
    logger.info('Signing out', { userId: this.currentUser?.id });
    await this.simulateNetwork();
    
    this.currentUser = null;
    this.token = null;
    logger.info('Sign out successful');
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.currentUser && !!this.token;
  }

  // Get current token
  getCurrentToken(): string | null {
    return this.token;
  }
}

export const mockAuthService = new MockAuthService();
