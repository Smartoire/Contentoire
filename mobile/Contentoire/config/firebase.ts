import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { initializeAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getMessaging, isSupported, Messaging, getToken, onMessage } from 'firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getReactNativePersistence } from '@firebase/auth';
import {
  signInWithCredential,
  linkWithCredential,
  signInWithEmailLink,
  sendSignInLinkToEmail,
  isSignInWithEmailLink
} from "firebase/auth";
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import { Platform } from 'react-native';
export { type User } from 'firebase/auth';
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};


// Validate required Firebase configuration
const requiredConfig = ['apiKey', 'authDomain', 'projectId'];
const missingConfig = requiredConfig.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);

if (missingConfig.length > 0) {
  console.error('Missing required Firebase configuration:', missingConfig.join(', '));
  throw new Error('Firebase configuration is incomplete. Please check your environment variables.');
}

export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
export const db = getFirestore(app);

// Initialize messaging only if supported
export const messaging = getMessaging(app);

export const googleProvider = new GoogleAuthProvider();

export const requestUserPermission = async () => {
  try {
    // Check if messaging is supported in the current environment
    const isMessagingSupported = await isSupported();
    if (!isMessagingSupported) {
      console.log('Firebase Messaging is not supported in this environment');
      return null;
    }

    // Request notification permissions
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      console.log('Notification permission granted');
      try {
        const token = await getToken(messaging, {
          vapidKey: process.env.FIREBASE_VAPID_KEY || ''
        });
        console.log('FCM Token:', token);
        return token;
      } catch (tokenError) {
        console.error('Error getting FCM token:', tokenError);
        return null;
      }
    } else {
      console.log('Notification permission not granted');
      return null;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
};

// Listen for FCM messages when app is in foreground
export const onMessageListener = (callback: (payload: any) => void) => {
  return onMessage(messaging, callback);
};

// Google Sign In Configuration
WebBrowser.maybeCompleteAuthSession();

const useProxy = Platform.select({ web: false, default: true });
const redirectUri = AuthSession.makeRedirectUri({
  scheme: 'contentoire',
  path: 'google-auth',
  // useProxy is automatically handled by makeRedirectUri in expo-auth-session
});

// Google Auth configuration from environment variables
const googleConfig = {
  expoClientId: process.env.GOOGLE_EXPO_CLIENT_ID || '',
  iosClientId: process.env.GOOGLE_IOS_CLIENT_ID || '',
  androidClientId: process.env.GOOGLE_ANDROID_CLIENT_ID || '',
  webClientId: process.env.GOOGLE_WEB_CLIENT_ID || '',
  scopes: ['profile', 'email'],
};

// Validate Google OAuth configuration
const requiredOAuth = ['expoClientId', 'iosClientId', 'androidClientId', 'webClientId'];
const missingOAuth = requiredOAuth.filter(key => !googleConfig[key as keyof typeof googleConfig]);

if (missingOAuth.length > 0) {
  console.error('Missing required Google OAuth configuration:', missingOAuth.join(', '));
  throw new Error('Google OAuth configuration is incomplete. Please check your environment variables.');
}

// Initialize Google Auth Request
const [request, response, promptAsync] = Google.useAuthRequest({
  ...googleConfig,
  redirectUri,
});

/**
* Sign in with Google using Firebase Authentication
*/
export const signInWithGoogle = async () => {
  try {
    // Start the authentication flow
    const result = await promptAsync();

    if (result?.type === 'success') {
      const { authentication } = result;
      if (!authentication) throw new Error('No authentication data');

      // Create a Firebase credential with the Google ID token and access token
      const credential = GoogleAuthProvider.credential(
        authentication.idToken,
        authentication.accessToken
      );

      // Sign in with the credential
      await signInWithCredential(auth, credential);

      return { success: true };
    }

    return { success: false, error: 'Authentication was cancelled' };
  } catch (error) {
    console.error('Google Sign In Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
};

// Email Link Authentication
export const sendSignInLink = async (email: string) => {
  const actionCodeSettings = {
    url: 'https://contentoire.com/finishSignUp',
    handleCodeInApp: true,
  };

  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  await AsyncStorage.setItem('emailForSignIn', email);
};

// Handle email link sign in
export const handleEmailLinkSignIn = async (url: string) => {
  if (isSignInWithEmailLink(auth, url)) {
    const email = await AsyncStorage.getItem('emailForSignIn');
    if (email) {
      await signInWithEmailLink(auth, email, url);
      await AsyncStorage.removeItem('emailForSignIn');
    }
  }
};

