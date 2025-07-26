import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="waitingList"
        options={{
          title: 'Waiting List',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="waitingList" color={color} />,
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="queued"
        options={{
          title: 'Queued',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="queued" color={color} />,
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="feedsList"
        options={{
          title: 'Feeds List',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="feeds" color={color} />,
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="settings" color={color} />,
          tabBarLabel: () => null,
        }}
      />
    </Tabs>
  );
}