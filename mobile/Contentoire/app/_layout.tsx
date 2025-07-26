import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View, Platform, StyleSheet } from 'react-native';
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
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const segments = useSegments();
  const rootNavigationState = useRootNavigationState();

  // Handle auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      // Skip the initial check to prevent flash of content
      if (!isInitialized) {
        setIsInitialized(true);
        return;
      }

      // Only redirect if navigation is ready
      if (!rootNavigationState?.key) return;

      const currentRoute = segments[0] || '';
      const isLoginPage = currentRoute === 'login';

      // Redirect logic based on auth state and current route
      if (!currentUser && !isLoginPage) {
        // User is not signed in and the current page isn't the login page
        router.replace('/login');
      } else if (currentUser && isLoginPage) {
        // User is signed in and the current page is the login page
        router.replace('/(tabs)');
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [isInitialized, router, rootNavigationState?.key, segments]);

  // Show loading screen while fonts are loading or auth is initializing
  if (!fontsLoaded || !isInitialized) {
    return <LoadingScreen />;
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
    backgroundColor: '#fff',
  },
});
