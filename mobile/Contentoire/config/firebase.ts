import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth, getReactNativePersistence, GoogleAuthProvider, initializeAuth, isSignInWithEmailLink, sendSignInLinkToEmail, signInWithEmailLink } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';
export { type User } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.FIREBASE_APP_ID || '1:123456789:web:demo',
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || 'G-DEMO'
};

// Log configuration status for debugging
console.log('Firebase Config Status:', {
  apiKey: !!firebaseConfig.apiKey,
  authDomain: !!firebaseConfig.authDomain,
  projectId: !!firebaseConfig.projectId,
  storageBucket: !!firebaseConfig.storageBucket,
  messagingSenderId: !!firebaseConfig.messagingSenderId,
  appId: !!firebaseConfig.appId,
  measurementId: !!firebaseConfig.measurementId
});

// Validate required Firebase configuration
const requiredConfig = ['apiKey', 'authDomain', 'projectId'];
const missingConfig = requiredConfig.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);

if (missingConfig.length > 0) {
  console.error('Missing required Firebase configuration:', missingConfig.join(', '));
  console.error('Please check your environment variables. Make sure you have a .env file with the required Firebase configuration.');
  // Don't throw error in development, just log it
  if (__DEV__) {
    console.warn('Firebase configuration is incomplete. The app may not work properly.');
  } else {
    throw new Error('Firebase configuration is incomplete. Please check your environment variables.');
  }
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

let auth: Auth;
if (Platform.OS !== 'web') {
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (e) {
    // If already initialized
    auth = getAuth(app);
  }
} else {
  auth = getAuth(app); // For web
}

// Firestore
const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

// Google Sign In Configuration
WebBrowser.maybeCompleteAuthSession();

const redirectUri = AuthSession.makeRedirectUri({
  scheme: 'contentoire',
  path: 'google-auth',
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
  console.error('Please check your environment variables. Make sure you have a .env file with the required Google OAuth configuration.');
  // Don't throw error in development, just log it
  if (__DEV__) {
    console.warn('Google OAuth configuration is incomplete. Google Sign-In may not work properly.');
  } else {
    throw new Error('Google OAuth configuration is incomplete. Please check your environment variables.');
  }
}

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

export const handleSignOut = async () => {
  try {
    await auth.signOut();
    router.replace('/login');
  } catch (error) {
    console.error('Error signing out: ', error);
  }
};

export { app, auth, db };
