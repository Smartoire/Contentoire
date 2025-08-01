import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet, Platform } from 'react-native';
import { onAuthStateChanged, User } from 'firebase/auth';
import * as Sentry from '@sentry/react-native';

// Initialize Sentry
import { initializeSentry } from '@/config/sentry';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useColorScheme } from '@/hooks/useColorScheme';
import { auth } from '@/config/firebase';

// Initialize Sentry
initializeSentry();

// Simple loading component
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" />
    </View>
  );
}

// Main layout component
function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();

  // Set up auth state listener
  useEffect(() => {
    let isMounted = true;
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!isMounted) return;
      
      setUser(currentUser);
      setIsReady(true);
      
      // Handle routing based on auth state
      const currentRoute = segments[0] as string | undefined;
      
      if (!currentUser) {
        // If user is not logged in and not in auth group, redirect to login
        if (currentRoute !== '(auth)') {
          // Use type assertion to satisfy TypeScript
          (router as any).replace('/(auth)/login');
        }
      } else if (currentRoute === '(auth)') {
        // If user is logged in but in auth group, redirect to waiting list
        (router as any).replace('/(tabs)/waitingList');
      }
    }, (error) => {
      console.error('Auth state error:', error);
      if (isMounted) {
        setIsReady(true);
      }
    });

    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (isMounted) {
        setTimedOut(true);
        setIsReady(true);
      }
    }, 5000);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  // Show loading screen while initializing
  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: Platform.OS === 'ios' ? 'default' : 'fade',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen 
            name="edit-profile" 
            options={{ 
              title: 'Edit Profile',
              presentation: 'modal',
            }} 
          />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

// Wrap with Sentry for error tracking
export default Sentry.wrap(RootLayout);

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});