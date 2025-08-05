import React from 'react';
import { View, StyleSheet, Platform, Text, ViewStyle, TextStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { BottomTabBarProps, BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { ParamListBase, TabNavigationState } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabBarIconProps = {
  focused: boolean;
  color: string;
  size: number;
};

interface CustomTabBarProps extends Omit<BottomTabBarProps, 'state' | 'descriptors' | 'navigation'> {
  badgeCounts?: {
    waiting?: number;
    scheduled?: number;
  };
  state: TabNavigationState<ParamListBase>;
  descriptors: {
    [key: string]: {
      options: BottomTabNavigationOptions & {
        title?: string;
        tabBarIcon?: (props: { focused: boolean; color: string; size: number }) => React.ReactNode;
      };
    };
  };
}

export const CustomTabBar = (props: CustomTabBarProps) => {
  const { bottom } = useSafeAreaInsets();
  const { badgeCounts = {}, state, descriptors } = props;

  // Calculate badge positions based on tab count
  const getBadgePosition = (index: number, total: number) => {
    const tabWidth = 100 / total;
    return `${(index + 0.5) * tabWidth}%`;
  };

  return (
    <View style={[styles.container, { paddingBottom: bottom }]}>
      <BlurView
        intensity={100}
        tint="light"
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const color = isFocused ? '#007AFF' : '#8E8E93';

          let icon: React.ReactNode = null;
          if (options.tabBarIcon) {
            icon = options.tabBarIcon({
              focused: isFocused,
              color,
              size: 24,
            });
          }

          const badgeCount = route.name === 'waiting' 
            ? badgeCounts.waiting 
            : route.name === 'scheduled' 
              ? badgeCounts.scheduled 
              : 0;

          return (
            <View key={route.key} style={styles.tab}>
              <View style={styles.iconContainer}>
                {icon}
                {badgeCount ? (
                  <View style={[
                    styles.badge,
                    route.name === 'waiting' ? styles.waitingBadge : styles.scheduledBadge,
                  ]}>
                    <Text style={styles.badgeText}>
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text
                style={[
                  styles.label,
                  { color },
                  isFocused ? styles.activeLabel : {},
                ]}
              >
                {options.title || route.name}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    overflow: 'hidden',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  activeLabel: {
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    top: -4,
  },
  waitingBadge: {
    backgroundColor: '#FF3B30',
  },
  scheduledBadge: {
    backgroundColor: '#007AFF',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 4,
    textAlign: 'center',
  },
});
