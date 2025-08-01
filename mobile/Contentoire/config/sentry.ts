import { Platform } from 'react-native';

// Import Sentry with dynamic import to handle cases where it's not available
type SentryType = typeof import('@sentry/react-native');
let Sentry: SentryType | undefined;

try {
  Sentry = require('@sentry/react-native');
} catch (e) {
  console.warn('Sentry not available, running in development mode');
}

export function initializeSentry() {
  if (__DEV__ || !Sentry) {
    // Don't initialize Sentry in development or if not available
    console.log('Sentry is disabled in development mode');
    return;
  }

  try {
    Sentry.init({
      dsn: 'https://558930794917b7a5e441a6a87109fe7d@o4509766045204480.ingest.us.sentry.io/4509766046384128',
      
      // Enable more context data in events (IP, cookies, user info, etc.)
      sendDefaultPii: true,
      
      // Performance monitoring
      tracesSampleRate: 1.0,
      
      // Session Replay configuration
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      
      // Native crash reporting
      enableNative: true,
      
      // Session tracking
      autoSessionTracking: true,
      
      // Error reporting
      attachStacktrace: true,
      
      // Environment configuration
      enabled: !__DEV__,
      debug: __DEV__,
      environment: __DEV__ ? 'development' : 'production',
      
      // Integrations
      integrations: [
        Sentry.mobileReplayIntegration(),
        Sentry.feedbackIntegration()
      ],
      
      // Uncomment to enable Spotlight in development
      // spotlight: __DEV__
    });
  } catch (error) {
    console.error('Failed to initialize Sentry:', error);
  }

  // Add user context when available
  // This should be called after authentication
  // Example: 
  // import { auth } from '@/config/firebase';
  // onAuthStateChanged(auth, (user) => {
  //   if (user) {
  //     Sentry?.setUser({ 
  //       id: user.uid,
  //       email: user.email || undefined,
  //     });
  //   } else {
  //     Sentry?.setUser(null);
  //   }
  // });

  // Add tags for better filtering in Sentry
  if (Sentry) {
    Sentry.setTag('environment', __DEV__ ? 'development' : 'production');
    Sentry.setTag('app', 'Contentoire');
    Sentry.setTag('platform', Platform.OS);
  }
}
