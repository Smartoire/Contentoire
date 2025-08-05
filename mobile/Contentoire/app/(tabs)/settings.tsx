import { ThemedText } from '@/components/ThemedText';
import { auth } from '@/config/firebase';
import { useAuth } from '@/hooks/useAuth';
import { useRefresh } from '@/hooks/useRefresh';
import { FontAwesome, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import React, { useCallback, useState } from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Switch,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface SocialMediaToggle {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  enabled: boolean;
}

interface UserParameter {
  id: string;
  name: string;
  value: string;
  type: 'text' | 'number';
  placeholder: string;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user, userProfile, toggleMedia } = useAuth();
  const { refreshAll } = useRefresh();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // User parameters state
  const [userParams, setUserParams] = useState<UserParameter[]>([
    {
      id: 'postingFrequency',
      name: 'Posting Frequency (hours)',
      value: '24',
      type: 'number',
      placeholder: '24',
    },
    {
      id: 'timeZone',
      name: 'Time Zone',
      value: 'UTC',
      type: 'text',
      placeholder: 'UTC',
    },
    {
      id: 'maxPostsPerDay',
      name: 'Max Posts Per Day',
      value: '5',
      type: 'number',
      placeholder: '5',
    },
  ]);

  const socialMediaPlatforms: SocialMediaToggle[] = [
    {
      id: 'twitter',
      name: 'Twitter',
      icon: <FontAwesome name="twitter" size={20} color="white" />,
      color: '#1DA1F2',
      enabled: userProfile?.enabledMedia?.includes('twitter') || false,
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: <FontAwesome name="instagram" size={20} color="white" />,
      color: '#E4405F',
      enabled: userProfile?.enabledMedia?.includes('instagram') || false,
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: <FontAwesome5 name="facebook" size={20} color="white" />,
      color: '#1877F2',
      enabled: userProfile?.enabledMedia?.includes('facebook') || false,
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: <FontAwesome5 name="linkedin" size={20} color="white" />,
      color: '#0A66C2',
      enabled: userProfile?.enabledMedia?.includes('linkedin') || false,
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: <FontAwesome5 name="tiktok" size={20} color="white" />,
      color: '#000000',
      enabled: userProfile?.enabledMedia?.includes('tiktok') || false,
    },
  ];

  const handleRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await refreshAll();
      Alert.alert('Success', 'All data has been refreshed.');
    } catch (error) {
      console.error('Error refreshing data:', error);
      Alert.alert('Error', 'Failed to refresh data. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshAll]);

  const handleSignOut = useCallback(async () => {
    try {
      setIsSigningOut(true);
      await signOut(auth);
      router.replace('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    } finally {
      setIsSigningOut(false);
    }
  }, [router]);

  const handleEditProfile = useCallback(() => {
    router.push('/(tabs)/edit-profile');
  }, [router]);

  const handleToggleMedia = useCallback(async (platform: string) => {
    try {
      await toggleMedia(platform);
    } catch (error) {
      console.error('Error toggling media:', error);
      Alert.alert('Error', 'Failed to update media settings. Please try again.');
    }
  }, [toggleMedia]);

  const handleParameterChange = useCallback((id: string, value: string) => {
    setUserParams(prev => 
      prev.map(param => 
        param.id === id ? { ...param, value } : param
      )
    );
  }, []);

  const renderSocialMediaToggle = (platform: SocialMediaToggle) => (
    <View key={platform.id} style={styles.toggleContainer}>
      <View style={styles.toggleHeader}>
        <View style={[styles.platformIcon, { backgroundColor: platform.color }]}>
          {platform.icon}
        </View>
        <View style={styles.toggleInfo}>
          <ThemedText style={styles.platformName}>{platform.name}</ThemedText>
          <ThemedText style={styles.platformStatus}>
            {platform.enabled ? 'Enabled' : 'Disabled'}
          </ThemedText>
        </View>
      </View>
      <Switch
        value={platform.enabled}
        onValueChange={() => handleToggleMedia(platform.id)}
        trackColor={{ false: '#767577', true: platform.color }}
        thumbColor={platform.enabled ? '#f4f3f4' : '#f4f3f4'}
      />
    </View>
  );

  const renderUserParameter = (param: UserParameter) => (
    <View key={param.id} style={styles.parameterContainer}>
      <ThemedText style={styles.parameterLabel}>{param.name}</ThemedText>
      <TextInput
        style={styles.parameterInput}
        value={param.value}
        onChangeText={(value) => handleParameterChange(param.id, value)}
        placeholder={param.placeholder}
        keyboardType={param.type === 'number' ? 'numeric' : 'default'}
      />
    </View>
  );

  const renderActionButton = (
    title: string,
    icon: React.ReactNode,
    color: string,
    onPress: () => void,
    isLoading = false
  ) => (
    <TouchableOpacity
      style={[styles.actionButton, { backgroundColor: color }]}
      onPress={onPress}
      disabled={isLoading}
    >
      <View style={styles.actionButtonContent}>
        {icon}
        <ThemedText style={styles.actionButtonText}>
          {isLoading ? 'Loading...' : title}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* User Info Section */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>User Information</ThemedText>
        <View style={styles.userInfo}>
          <ThemedText style={styles.userEmail}>{user?.email}</ThemedText>
          <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
            <Ionicons name="person" size={16} color="#007AFF" />
            <ThemedText style={styles.editProfileText}>Edit Profile</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* User Parameters Section */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Posting Parameters</ThemedText>
        {userParams.map(renderUserParameter)}
      </View>

      {/* Social Media Section */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Social Media Platforms</ThemedText>
        {socialMediaPlatforms.map(renderSocialMediaToggle)}
      </View>

      {/* Actions Section */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Actions</ThemedText>
        {renderActionButton(
          'Refresh Data',
          <Ionicons name="refresh" size={20} color="white" />,
          '#007AFF',
          handleRefresh,
          isRefreshing
        )}
        {renderActionButton(
          'Sign Out',
          <Ionicons name="log-out" size={20} color="white" />,
          '#FF3B30',
          handleSignOut,
          isSigningOut
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  editProfileText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 4,
  },
  parameterContainer: {
    marginBottom: 16,
  },
  parameterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  parameterInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  toggleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  platformIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  toggleInfo: {
    flex: 1,
  },
  platformName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  platformStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  actionButton: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
