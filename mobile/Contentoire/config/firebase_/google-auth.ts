import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from './auth';

// Required for Google OAuth
WebBrowser.maybeCompleteAuthSession();

// Google OAuth configuration
const googleConfig = {
  expoClientId: process.env.GOOGLE_EXPO_CLIENT_ID,
  iosClientId: process.env.GOOGLE_IOS_CLIENT_ID,
  androidClientId: process.env.GOOGLE_ANDROID_CLIENT_ID,
  webClientId: process.env.GOOGLE_WEB_CLIENT_ID,
  scopes: ['profile', 'email'],
};

// Initialize Google Auth Request
export const [request, response, promptAsync] = Google.useAuthRequest({
  ...googleConfig,
  redirectUri: WebBrowser.makeRedirectUri({
    useProxy: true,
  }),
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
      
      // Create a Firebase credential with the Google access token
      const credential = GoogleAuthProvider.credential(
        authentication?.idToken,
        authentication?.accessToken
      );

      // Sign in with the credential
      const userCredential = await signInWithCredential(auth, credential);
      return userCredential.user;
    }
    return null;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const googleProvider = new GoogleAuthProvider();
