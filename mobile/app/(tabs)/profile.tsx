import { router } from 'expo-router';
import { Bell, CircleHelp as HelpCircle, LogOut, Shield } from 'lucide-react-native';
import React from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { authService } from '@/services/authService';
import Toast from 'react-native-toast-message';

export default function ProfileScreen() {
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            // Handle logout logic here
            // Clear any stored authentication data

            // Show success toast
            Toast.show({
              type: 'success',
              text1: 'Logged Out',
              text2: 'You have been successfully logged out',
              position: 'top',
              visibilityTime: 2000,
            });

            // Navigate to login screen after a short delay
            setTimeout(() => {
              router.replace('/login');
            }, 500);
          }
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: Bell,
      title: 'Notifications',
      subtitle: 'Manage your notification preferences',
      onPress: () => Alert.alert('Coming Soon', 'Notifications settings'),
    },
    {
      icon: Shield,
      title: 'Privacy & Security',
      subtitle: 'Control your privacy settings',
      onPress: () => Alert.alert('Coming Soon', 'Privacy settings'),
    },
    {
      icon: HelpCircle,
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      onPress: () => Alert.alert('Coming Soon', 'Help center'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.userInfo}>
        {authService.getCurrentUser()?.profileImage ? (
          <Image
            source={{ uri: authService.getCurrentUser()?.profileImage }}
            style={styles.profileImage}
            cachePolicy="memory-disk"
            transition={200}
          />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {authService.getCurrentUser()?.fullName
                ?.split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .substring(0, 2)}
            </Text>
          </View>
        )}
        <Text style={styles.userName}>
          {authService.getCurrentUser()?.fullName || 'Guest User'}
        </Text>
        <Text style={styles.userEmail}>
          {authService.getCurrentUser()?.email || 'No email available'}
        </Text>
      </View>

      <View style={styles.menu}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={styles.menuItemIcon}>
              <item.icon size={24} color="#007AFF" strokeWidth={2} />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>{item.title}</Text>
              <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LogOut size={20} color="#FF3B30" strokeWidth={2} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 16,
    paddingBottom: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 22,
  },
  userInfo: {
    alignItems: 'center',
    padding: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#8E8E93',
  },
  menu: {
    paddingHorizontal: 16,
    gap: 2,
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 2,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 18,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
});