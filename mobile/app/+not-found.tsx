import { Stack, router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';

export default function NotFoundScreen() {
  useEffect(() => {
    // Show toast message
    Toast.show({
      type: 'error',
      text1: 'Page Not Found',
      text2: 'Redirecting to home screen...',
      position: 'top',
      visibilityTime: 3000,
    });

    // Redirect to home screen after a short delay
    const timer = setTimeout(() => {
      router.replace('/');
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Stack.Screen options={{ title: 'Redirecting...' }} />
      <View style={styles.container} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
