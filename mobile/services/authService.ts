import { createLogger } from './logger';
import * as FileSystem from 'expo-file-system';
import { getInfoAsync, downloadAsync, cacheDirectory } from 'expo-file-system';

const logger = createLogger('AuthService');

// Helper function to get cached image path
const getCachedImagePath = (url: string): string => {
  if (!url) return '';
  const filename = url.split('/').pop() || '';
  return `${cacheDirectory}${filename}`;
};

// Function to cache an image
const cacheImage = async (url: string): Promise<string> => {
  try {
    if (!url) return url;
    
    const cachedPath = getCachedImagePath(url);
    const fileInfo = await getInfoAsync(cachedPath);
    
    if (fileInfo.exists) {
      logger.debug('Using cached image:', cachedPath);
      return cachedPath;
    }
    
    logger.debug('Downloading image to cache:', url);
    const { uri } = await downloadAsync(url, cachedPath);
    return uri;
  } catch (error) {
    logger.error('Error caching image:', error);
    return url; // Return original URL if caching fails
  }
};

const API_BASE_URL = 'https://contentoire.smartoire.com';

export interface User {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  profileImage: string;
  // Add other user fields as needed from your API
}

interface AuthResult {
  user: User;
  token: string;
}

class AuthService {
  private currentUser: User | null = null;
  private authToken: string | null = null;

  async signInWithEmailAndPassword(email: string, password: string): Promise<AuthResult> {
    logger.info('Attempting to sign in', { email });
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/login.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          username: email, // Using email as the username
          password,
        }),
      });

      const responseData = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        logger.error(`Login failed with status: ${response.status}`, { response: responseData });
        throw new Error(
          responseData.message || 
          responseData.error || 
          `Login failed with status ${response.status}`
        );
      }

      if (!responseData.token) {
        logger.error('No token in response:', responseData);
        throw new Error('No authentication token received from server');
      }
      
      const { token } = responseData;

      // Store the token for future requests
      this.authToken = token;
      
      // Create user object from response data
      const user: User = {
        id: responseData.id,
        email: responseData.email,
        username: responseData.username,
        firstName: responseData.first_name,
        lastName: responseData.last_name,
        fullName: responseData.full_name,
        profileImage: await cacheImage(`${API_BASE_URL}/users/photo/${responseData.id}`),
      };

      logger.debug('User data received', { user });

      this.currentUser = user;
      logger.info('Sign in successful', { id: user.id, email });
      
      return {
        user,
        token,
      };
    } catch (error) {
      logger.error('Sign in failed', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    const userId = this.currentUser?.id;
    logger.info('Signing out user', { userId });
    
    try {
      // Clear the auth token and current user
      this.authToken = null;
      this.currentUser = null;
      logger.info('Sign out successful', { userId });
    } catch (error) {
      logger.error('Sign out failed', error);
      throw error;
    }
  }

  getCurrentUser(): User | null {
    const user = this.currentUser;
    logger.debug('Getting current user', { 
      userId: user?.id, 
      hasUser: !!user 
    });
    return user;
  }

  // Get the authentication token for API requests
  getAuthToken(): string | null {
    return this.authToken;
  }

  // Note: This is a placeholder. You'll need to implement the actual registration
  // endpoint on your server if needed
  async createUserWithEmailAndPassword(email: string, password: string): Promise<AuthResult> {
    logger.info('Creating new user account', { email });
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/register.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Registration failed');
      }
      
      const { token } = await response.json();
      
      if (!token) {
        throw new Error('No token received after registration');
      }

      this.authToken = token;
      
      // Get the user data from the response
      const responseData = await response.json();
      
      // Create user object from response data
      const user: User = {
        id: responseData.id,
        email: responseData.email,
        username: responseData.username,
        firstName: responseData.first_name,
        lastName: responseData.last_name,
        fullName: responseData.full_name,
        profileImage: await cacheImage(`${API_BASE_URL}/users/photo/${responseData.id}`),
      };

      this.currentUser = user;
      logger.info('User account created successfully', { id: user.id });
      
      return {
        user,
        token,
      };
    } catch (error) {
      logger.error('User creation failed', error);
      throw error;
    }
  }
}

export const authService = new AuthService();