import { getMessaging, isSupported, Messaging, getToken, onMessage } from 'firebase/messaging';
import { app } from './config';

export let messaging: Messaging | null = null;

// Initialize Firebase Cloud Messaging
export const initializeMessaging = async (): Promise<Messaging | null> => {
  try {
    const isSupportedResult = await isSupported();
    if (isSupportedResult) {
      messaging = getMessaging(app);
      return messaging;
    }
    console.log('Firebase Messaging is not supported in this environment');
    return null;
  } catch (error) {
    console.error('Error initializing Firebase Messaging:', error);
    return null;
  }
};

// Get FCM token
export const getFCMToken = async (): Promise<string | null> => {
  if (!messaging) {
    console.log('Firebase Messaging is not available');
    return null;
  }

  try {
    const token = await getToken(messaging, {
      vapidKey: process.env.FIREBASE_VAPID_KEY
    });
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

// Listen for foreground messages
export const onMessageListener = (callback: (payload: any) => void) => {
  if (!messaging) {
    console.log('Firebase Messaging is not available');
    return () => {}; // Return empty cleanup function
  }
  return onMessage(messaging, callback);
};
