import { Stack } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const [fontsLoaded] = useFonts({
    // Add your custom fonts here if needed
    // Example:
    // 'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen 
          name="(auth)/sign-in" 
          options={{
            headerShown: true,
            title: 'Sign In',
          }}
        />
        <Stack.Screen 
          name="index" 
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </AuthProvider>
  );
}

export default RootLayout;
