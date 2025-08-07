import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { authService } from '@/services/authService';

export default function IndexScreen() {
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const user = authService.getCurrentUser();
      
      // Simulate auth check delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (user) {
        router.replace('/(tabs)');
      } else {
        router.replace('/login');
      }
    } catch (error) {
      router.replace('/login');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Loading screen - could add a splash screen component here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
});