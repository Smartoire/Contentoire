// Firebase Authentication Service
// Note: Firebase configuration needs to be set up manually

interface User {
  uid: string;
  email: string;
  displayName?: string;
}

interface AuthResult {
  user: User;
  token: string;
}

class AuthService {
  private currentUser: User | null = null;

  async signInWithEmailAndPassword(email: string, password: string): Promise<AuthResult> {
    // Simulate Firebase auth
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock successful authentication
    const user: User = {
      uid: 'mock-user-id',
      email,
      displayName: 'John Doe',
    };

    this.currentUser = user;
    
    return {
      user,
      token: 'mock-firebase-token',
    };
  }

  async signOut(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    this.currentUser = null;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  async createUserWithEmailAndPassword(email: string, password: string): Promise<AuthResult> {
    // Simulate Firebase user creation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const user: User = {
      uid: 'new-user-id',
      email,
    };

    this.currentUser = user;
    
    return {
      user,
      token: 'mock-firebase-token',
    };
  }
}

export const authService = new AuthService();