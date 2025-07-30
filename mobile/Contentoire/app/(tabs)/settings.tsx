import { Image } from 'expo-image';
import { Platform, StyleSheet, View, ActivityIndicator } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { HelloWave } from '@/components/HelloWave';
import { useRefresh } from '@/hooks/useRefresh';

export default function SettingsScreen() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { refreshAll } = useRefresh();

  const handleRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await refreshAll();
      // Navigate to home tab after refresh
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshAll, router]);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/Contentoire.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Settings</ThemedText>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <ActivityIndicator color="#007AFF" />
          ) : (
            <Ionicons name="refresh" size={24} color="#007AFF" />
          )}
          <ThemedText style={styles.refreshText}>
            {isRefreshing ? 'Refreshing...' : 'Refresh All Data'}
          </ThemedText>
        </TouchableOpacity>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <TouchableOpacity style={styles.button}>
          <ThemedText type="subtitle">Test button</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  titleContainer: {
    alignItems: 'flex-start',
    gap: 16,
    padding: 16,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  refreshText: {
    marginLeft: 8,
    color: '#007AFF',
    fontWeight: '500',
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
