import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { ActivityIndicator, View } from 'react-native';

/**
 * This is the main entry point of the app.
 * It checks authentication status and redirects accordingly.
 */
export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // If user is logged in, redirect to waitingList tab, otherwise to login
  return <Redirect href={user ? '/(tabs)/waitingList' : '/login'} />;
}
