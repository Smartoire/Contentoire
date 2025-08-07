import { useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as SecureStore from 'expo-secure-store';
import { Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';

// Initialize for web browser support
WebBrowser.maybeCompleteAuthSession();

// Configuration
const AUTH_TOKEN_KEY = 'auth_token';
const USER_INFO_KEY = 'user_info';

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

export const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // Validate required client IDs for the current platform
  useEffect(() => {
    if (Platform.OS === 'ios' && !CLIENT_IDS.ios) {
      console.error('Missing required Google iOS client ID');
      setAuthError('Google Sign-In is not properly configured for iOS');
    } else if (Platform.OS === 'android' && !CLIENT_IDS.android) {
      console.error('Missing required Google Android client ID');
      setAuthError('Google Sign-In is not properly configured for Android');
    } else if (Platform.OS === 'web' && !CLIENT_IDS.web) {
      console.error('Missing required Google Web client ID');
      setAuthError('Google Sign-In is not properly configured for Web');
    } else if (!CLIENT_IDS.expo) {
      console.error('Missing required Google Expo client ID');
      setAuthError('Google Sign-In is not properly configured');
    }
  }, []);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: CLIENT_IDS.expo,
    iosClientId: CLIENT_IDS.ios,
    androidClientId: CLIENT_IDS.android,
    webClientId: CLIENT_IDS.web,
    scopes: SCOPES,
    responseType: 'id_token',
    selectAccount: true,
  });

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
      if (response?.type === 'success') {
        const { authentication } = response;
        if (authentication?.accessToken) {
          try {
            setIsLoading(true);
            // Get user info from Google
            const userInfoResponse = await fetch(
              'https://www.googleapis.com/userinfo/v2/me',
              {
                headers: { Authorization: `Bearer ${authentication.accessToken}` },
              }
            );

            if (!userInfoResponse.ok) {
              throw new Error('Failed to fetch user info');
            }

            const userInfo = await userInfoResponse.json();

            // Store the token and user info
            await Promise.all([
              SecureStore.setItemAsync(AUTH_TOKEN_KEY, authentication.accessToken),
              SecureStore.setItemAsync(USER_INFO_KEY, JSON.stringify(userInfo))
            ]);

            setUserInfo(userInfo);

            // Navigate to the app
            router.replace('/(tabs)');

            Toast.show({
              type: 'success',
              text1: 'Welcome!',
              text2: `Signed in as ${userInfo.email}`,
            });
          } catch (error) {
            console.error('Error during Google sign in:', error);
            Alert.alert(
              'Authentication Error',
              'Failed to sign in with Google. Please try again.'
            );
          } finally {
            setIsLoading(false);
          }
        }
      } else if (response?.type === 'error') {
        console.error('Authentication error:', response.error);
        Alert.alert(
          'Authentication Error',
          'Failed to sign in with Google. Please try again.'
        );
      }
    };

    if (response) {
      handleAuthResponse();
    }
  }, [response]);

  // Handle Google Sign In button press
  const handleGoogleSignIn = async () => {
    try {
      await promptAsync();
    } catch (error) {
      console.error('Error during Google sign in:', error);
      Alert.alert(
        'Error',
        'Failed to start Google sign in. Please try again.'
      );
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(AUTH_TOKEN_KEY),
        SecureStore.deleteItemAsync(USER_INFO_KEY)
      ]);

      setUserInfo(null);

      Toast.show({
        type: 'success',
        text1: 'Signed out',
        text2: 'You have been signed out successfully',
      });
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert(
        'Error',
        'Failed to sign out. Please try again.'
      );
    }
  };

  return {
    isLoading,
    userInfo,
    authError,
    handleGoogleSignIn: promptAsync,
    handleSignOut,
  };
};

export default useGoogleAuth;
