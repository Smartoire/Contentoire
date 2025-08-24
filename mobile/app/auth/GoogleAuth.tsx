import { useCallback, useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import { Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { createLogger } from '@/services/logger';

const logger = createLogger('GoogleAuth');

// Initialize for web browser support
WebBrowser.maybeCompleteAuthSession();

// Configuration
const AUTH_TOKEN_KEY = 'auth_token';
const USER_INFO_KEY = 'user_info';
const API_BASE_URL = 'https://contentoire.smartoire.com';

// Scopes for Google OAuth
const SCOPES = ['openid', 'profile', 'email'];

// Get client IDs from app config
import Constants from 'expo-constants';

// Get client IDs from app config
const getClientId = (platform: 'expo' | 'ios' | 'android' | 'web'): string => {
  const clientId = Constants.expoConfig?.extra?.[`google${platform.charAt(0).toUpperCase() + platform.slice(1)}ClientId`];

  if (!clientId) {
    console.error(`Missing required Google ${platform} client ID in app config`);
    return '';
  }

  return clientId;
};

// Platform-specific client IDs
const CLIENT_IDS = {
  expo: getClientId('expo'),
  ios: getClientId('ios'),
  android: getClientId('android'),
  web: getClientId('web'),
};

export interface UserInfo {
  email: string;
  name: string;
  picture?: string;
  id: string;
}

interface GoogleAuthResult {
  isLoading: boolean;
  userInfo: UserInfo | null;
  authError: string | null;
  handleGoogleSignIn: () => Promise<void>;
  handleSignOut: () => Promise<void>;
}

export const useGoogleAuth = (): GoogleAuthResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  logger.debug('Initializing GoogleAuth');

  // Validate required client IDs for the current platform
  useEffect(() => {
    logger.debug('Validating client IDs for platform:', Platform.OS);

    if (Platform.OS === 'ios' && !CLIENT_IDS.ios) {
      const errorMsg = 'Missing required Google iOS client ID';
      logger.error(errorMsg);
      setAuthError('Google Sign-In is not properly configured for iOS');
    } else if (Platform.OS === 'android' && !CLIENT_IDS.android) {
      const errorMsg = 'Missing required Google Android client ID';
      logger.error(errorMsg);
      setAuthError('Google Sign-In is not properly configured for Android');
    } else if (Platform.OS === 'web' && !CLIENT_IDS.web) {
      const errorMsg = 'Missing required Google Web client ID';
      logger.error(errorMsg);
      setAuthError('Google Sign-In is not properly configured for Web');
    } else if (!CLIENT_IDS.expo) {
      const errorMsg = 'Missing required Google Expo client ID';
      logger.error(errorMsg);
      setAuthError('Google Sign-In is not properly configured');
    } else {
      logger.debug('All required client IDs are present');
    }
  }, []);

  // Configure Google OAuth
  const authConfig = {
    clientId: CLIENT_IDS.expo,
    iosClientId: CLIENT_IDS.ios,
    androidClientId: CLIENT_IDS.android,
    webClientId: CLIENT_IDS.web,
    scopes: SCOPES,
    responseType: 'id_token' as const,
    selectAccount: true,
    shouldAutoExchangeCode: false,
    extraParams: {
      access_type: 'offline',
      prompt: 'select_account',
    },
    // Use Expo's auth proxy for development
    ...(__DEV__ && Platform.OS !== 'web'
      ? {
        expoClientId: CLIENT_IDS.expo,
        expoClientSecret: undefined, // Not needed for PKCE flow
        projectNameForProxy: '@smartoire/contentoire',
      }
      : {
        // For production, use the custom scheme
        redirectUri: 'contentoire://auth'
      }
    ),
  };

  logger.debug('Initializing Google Auth with config:', {
    ...authConfig,
    clientId: authConfig.clientId ? '***' : 'MISSING',
    iosClientId: authConfig.iosClientId ? '***' : 'MISSING',
    androidClientId: authConfig.androidClientId ? '***' : 'MISSING',
    webClientId: authConfig.webClientId ? '***' : 'MISSING',
  });

  const [request, response, promptAsync] = Google.useAuthRequest(authConfig);

  if (!promptAsync) {
    logger.error('Google auth request initialization failed');
    throw new Error('Failed to initialize Google authentication');
  }

  // Check if user is already authenticated on app load
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const [token, userData] = await Promise.all([
          SecureStore.getItemAsync(AUTH_TOKEN_KEY),
          SecureStore.getItemAsync(USER_INFO_KEY)
        ]);

        if (token && userData) {
          const user = JSON.parse(userData);
          setUserInfo(user);
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
      }
    };

    checkAuthState();
  }, []);

  // Handle Google OAuth response
  useEffect(() => {
    const handleAuthResponse = async () => {
      if (!response) return;

      logger.debug('Received auth response:', {
        type: response.type,
        ...(response.type === 'error' ? { error: response.error } : {}),
        ...(response.type === 'success' ? { hasAuth: !!(response as any).authentication } : {})
      });

      if (response.type === 'success' && (response as any).authentication?.idToken) {
        const authentication = (response as any).authentication;
        try {
          logger.debug('Processing successful authentication');
          setIsLoading(true);

          // Send the ID token to our backend for verification
          logger.debug('Sending ID token to backend for verification');
          const backendResponse = await fetch(`${API_BASE_URL}/users/google_login.php`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              idToken: authentication.idToken,
            }),
          });

          if (!backendResponse.ok) {
            const responseData = await backendResponse.json();
            logger.debug('Backend response:', {
              status: backendResponse.status,
              data: { ...responseData, token: responseData.token ? '***' : 'MISSING' }
            });

            const errorMsg = responseData.error || 'Failed to authenticate with backend';
            logger.error('Backend authentication failed:', {
              status: backendResponse.status,
              error: errorMsg
            });
            throw new Error(errorMsg);
          }

          const { token, user: userData } = await backendResponse.json();
          logger.debug('Successfully authenticated with backend', {
            userId: userData?.id,
            email: userData?.email
          });

          if (!token) {
            throw new Error('No authentication token received from server');
          }

          // Store the token and user info
          logger.debug('Storing auth data in SecureStore');
          try {
            const userInfo = {
              id: userData.id || userData.email,
              email: userData.email,
              name: userData.name || userData.email.split('@')[0],
              picture: userData.picture,
            };
            await Promise.all([
              SecureStore.setItemAsync(AUTH_TOKEN_KEY, token),
              SecureStore.setItemAsync(USER_INFO_KEY, JSON.stringify(userInfo))
            ]);
            logger.debug('Auth data stored successfully');

            setUserInfo(userInfo);
            logger.debug('Navigation to main app');
            router.replace('/(tabs)');
          } catch (storageError) {
            logger.error('Failed to store auth data:', storageError);
            throw new Error('Failed to save authentication data');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to sign in with Google';
          logger.error('Error during Google sign in:', {
            error: errorMessage,
            stack: error instanceof Error ? error.stack : undefined
          });

          Alert.alert(
            'Authentication Error',
            errorMessage
          );
        } finally {
          setIsLoading(false);
        }
      } else if (response.type === 'error') {
        logger.error('Authentication error:', response.error);
        Alert.alert(
          'Authentication Error',
          response.error?.message || 'Failed to sign in with Google. Please try again.'
        );
      }
    };

    if (response) {
      handleAuthResponse();
    }
  }, [response]);

  // Handle Google Sign In button press
  const handleGoogleSignIn = useCallback(async () => {
    try {
      await promptAsync();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start Google sign in';
      logger.error('Error during Google sign in:', {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      });

      Alert.alert(
        'Error',
        'Failed to start Google sign in. Please try again.'
      );
    }
  }, [promptAsync]);

  if (!promptAsync) {
    return {
      isLoading: false,
      userInfo: null,
      authError: 'Google authentication not available',
      handleGoogleSignIn: async () => { },
      handleSignOut: async () => { }
    };
  }

  // Handle Sign Out
  const handleSignOut = useCallback(async () => {
    logger.debug('Initiating sign out');
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(AUTH_TOKEN_KEY),
        SecureStore.deleteItemAsync(USER_INFO_KEY),
      ]);
      logger.debug('Successfully signed out and cleared storage');
      setUserInfo(null);
      router.replace('/login');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during sign out';
      logger.error('Error signing out:', {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      });

      Alert.alert(
        'Error',
        'Failed to sign out. Please try again.'
      );
    }
  }, [router]);

  return {
    isLoading,
    userInfo,
    authError,
    handleGoogleSignIn: handleGoogleSignIn,
    handleSignOut,
  };
};

export default useGoogleAuth;
