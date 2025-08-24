import React, { useEffect, useState } from 'react';
import { Tabs, router } from 'expo-router';
import { Chrome as Home, Calendar, User } from 'lucide-react-native';
import { authService } from '@/services/authService';
import { ActivityIndicator, View, StyleSheet, StatusBar } from 'react-native';
import { Screen } from '@/components/Screen';
import { createLogger } from '@/services/logger';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';

const logger = createLogger('TabLayout');

export default function TabLayout() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      logger.debug('Checking authentication status');
      try {
        const user = authService.getCurrentUser();
        logger.debug('Current user', {
          userId: user?.uid,
          hasUser: !!user
        });

        if (!user) {
          logger.info('No authenticated user found, redirecting to login');
          router.replace('/login');
        } else {
          logger.info('User authenticated', {
            userId: user.uid,
            email: user.email
          });
        }
      } catch (error) {
        logger.error('Error checking authentication status', error);
        router.replace('/login');
      } finally {
        logger.debug('Finished auth check');
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    logger.debug('Showing loading indicator during auth check');
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={['bottom']}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E5E5EA',
            height: 80,
            paddingBottom: 20,
            paddingTop: 10,
          },
          headerShown: false,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ size, color }: { size: number; color: string }) => (
              <Home size={size} color={color} strokeWidth={2} />
            ),
          }}
        />
        <Tabs.Screen
          name="schedule"
          options={{
            title: 'Schedule',
            tabBarIcon: ({ size, color }: { size: number; color: string }) => (
              <Calendar size={size} color={color} strokeWidth={2} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ size, color }: { size: number; color: string }) => (
              <User size={size} color={color} strokeWidth={2} />
            ),
          }}
        />
      </Tabs>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});