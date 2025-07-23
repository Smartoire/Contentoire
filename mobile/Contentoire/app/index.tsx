import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { router } from 'expo-router';
import { useEffect } from 'react';

export default function Index() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      // If not authenticated, redirect to sign-in
      router.replace('/(auth)/sign-in');
    }
  }, [user, loading]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!user) {
    return null; // This will be briefly shown before the redirect happens
  }

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome, {user.email}!</Text>
      <Text style={styles.subtitle}>You are now logged in.</Text>
      {/* Add your main app content here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
