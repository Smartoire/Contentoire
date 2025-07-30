import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { initializeAuth, GoogleAuthProvider, Auth, getAuth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getReactNativePersistence } from 'firebase/auth';
import {
  signInWithCredential,
  linkWithCredential,
  signInWithEmailLink,
  sendSignInLinkToEmail,
  isSignInWithEmailLink
} from "firebase/auth";
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
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
  throw new Error('Google OAuth configuration is incomplete. Please check your environment variables.');
}

// // Email Link Authentication
export const sendSignInLink = async (email: string) => {
  const actionCodeSettings = {
    url: 'https://contentoire.com/finishSignUp',
    handleCodeInApp: true,
  };

  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  await AsyncStorage.setItem('emailForSignIn', email);
};

// // Handle email link sign in
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