import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, View, Platform, StyleSheet, AppState, AppStateStatus } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { auth } from '@/config/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

// Custom loading component
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" />
    </View>
  );
}

// This is the root layout for the app
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const segments = useSegments();
  const rootNavigationState = useRootNavigationState();

  // Handle app state changes (for Android recovery)
  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    console.log('App state changed to:', nextAppState);
    if (nextAppState === 'active' && Platform.OS === 'android' && !isInitialized) {
      console.log('Android app became active, forcing initialization');
      setIsInitialized(true);
      setTimedOut(true);
    }
  }, [isInitialized]);

  // Set timeout to prevent getting stuck on splash screen
  useEffect(() => {
    if (!isInitialized) {
      const timer = setTimeout(() => {
        console.warn('Auth initialization timed out, proceeding anyway');
        setTimedOut(true);
        // Force initialization on timeout
        setIsInitialized(true);
      }, Platform.OS === 'android' ? 3000 : 5000);

      return () => clearTimeout(timer);
    }
  }, [isInitialized]);

  // Listen for app state changes (for Android)
  useEffect(() => {
    if (Platform.OS === 'android') {
      const subscription = AppState.addEventListener('change', handleAppStateChange);
      return () => subscription.remove();
    }
  }, [handleAppStateChange]);

  // Handle auth state changes
  useEffect(() => {
    console.log('Setting up auth state listener...');

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Auth state changed, user:', currentUser ? 'signed in' : 'signed out');

      try {
        setUser(currentUser);

        // Skip the initial check to prevent flash of content
        if (!isInitialized) {
          console.log('Initial auth check complete');
          setIsInitialized(true);
          return;
        }

        // Only redirect if navigation is ready
        if (!rootNavigationState?.key) {
          console.log('Navigation not ready yet, skipping redirect');
          return;
        }

        const currentRoute = segments[0] || '';
        const isLoginPage = currentRoute === 'login';
        console.log(`Current route: ${currentRoute}, isLoginPage: ${isLoginPage}`);

        // Redirect logic based on auth state and current route
        if (!currentUser && !isLoginPage) {
          console.log('Redirecting to login');
          router.replace('/login');
        } else if (currentUser && isLoginPage) {
          console.log('Redirecting to tabs');
          router.replace('/(tabs)');
        }
      } catch (error) {
        console.error('Error in auth state change handler:', error);
        // Ensure we don't get stuck in loading state
        if (!isInitialized) {
          setIsInitialized(true);
        }
      }
    }, (error) => {
      console.error('Auth state listener error:', error);
      // Ensure we don't get stuck in loading state
      if (!isInitialized) {
        setIsInitialized(true);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      console.log('Cleaning up auth state listener');
      unsubscribe();
    };
  }, [isInitialized, router, rootNavigationState?.key, segments]);

  // Show loading screen while fonts are loading or auth is initializing
  if (!fontsLoaded) {
    console.log('Waiting for fonts to load...');
    return <LoadingScreen />;
  }

  // On Android, we'll show the loading screen until we either initialize or time out
  if (!isInitialized && !timedOut) {
    console.log('Waiting for auth initialization...');
    return <LoadingScreen />;
  }

  // If we've timed out or on Android, force initialization
  if (!isInitialized && (timedOut || Platform.OS === 'android')) {
    console.warn('Forcing initialization (timeout or Android)');
    setIsInitialized(true);

    // On Android, we'll also force a re-render after a short delay
    if (Platform.OS === 'android') {
      useEffect(() => {
        const timer = setTimeout(() => {
          console.log('Android: Forcing re-render');
          setTimedOut(true);
        }, 1000);
        return () => clearTimeout(timer);
      }, []);
    }
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{
        headerShown: false,
        animation: Platform.OS === 'ios' ? 'default' : 'fade',
      }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="login"
          options={{
            title: 'Sign In',
            animationTypeForReplace: user ? 'pop' : 'push',
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});
