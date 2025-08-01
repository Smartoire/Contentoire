import { Image } from 'expo-image';
import { 
  StyleSheet, 
  View, 
  ActivityIndicator, 
  Alert, 
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { 
  Ionicons, 
  FontAwesome, 
  FontAwesome5
} from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { useAuth } from '@/hooks/useAuth';
import { useRefresh } from '@/hooks/useRefresh';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

type ButtonConfig = {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  onPress: () => void;
  isLoading?: boolean;
  isActive?: boolean;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 8,
  },
  buttonWrapper: {
    width: (Dimensions.get('window').width - 64) / 2,
    aspectRatio: 1,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  buttonContent: {
    alignItems: 'center',
    padding: 8,
  },
  iconContainer: {
    marginBottom: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});

const SettingsButton: React.FC<ButtonConfig> = ({
  id,
  title,
  icon,
  color,
  onPress,
  isLoading = false,
  isActive = true,
}) => {
  const buttonColor = isActive ? color : '#CCCCCC';
  
  return (
    <View key={id} style={styles.buttonWrapper}>
      <TouchableOpacity
        style={[styles.settingsButton, { backgroundColor: buttonColor }]}
        onPress={onPress}
        disabled={isLoading || !isActive}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <View style={styles.buttonContent}>
            <View style={styles.iconContainer}>{icon}</View>
            <ThemedText style={styles.buttonText}>{title}</ThemedText>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default function SettingsScreen() {
  const router = useRouter();
  const { user, userProfile, toggleMedia } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { refreshAll } = useRefresh();

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

  const buttons: ButtonConfig[] = [
    {
      id: 'refresh',
      title: 'Refresh',
      icon: <Ionicons name="refresh" size={24} color="white" />,
      color: '#007AFF',
      onPress: handleRefresh,
      isLoading: isRefreshing,
    },
    {
      id: 'edit-profile',
      title: 'Edit Profile',
      icon: <Ionicons name="person" size={24} color="white" />,
      color: '#34C759',
      onPress: handleEditProfile,
    },
    {
      id: 'twitter',
      title: 'Twitter',
      icon: <FontAwesome name="twitter" size={24} color="white" />,
      color: '#1DA1F2',
      onPress: () => handleToggleMedia('twitter'),
      isActive: userProfile?.enabledMedia?.includes('twitter') || false,
    },
    {
      id: 'instagram',
      title: 'Instagram',
      icon: <FontAwesome name="instagram" size={24} color="white" />,
      color: '#E4405F',
      onPress: () => handleToggleMedia('instagram'),
      isActive: userProfile?.enabledMedia?.includes('instagram') || false,
    },
    {
      id: 'facebook',
      title: 'Facebook',
      icon: <FontAwesome5 name="facebook" size={24} color="white" />,
      color: '#1877F2',
      onPress: () => handleToggleMedia('facebook'),
      isActive: userProfile?.enabledMedia?.includes('facebook') || false,
    },
    {
      id: 'linkedin',
      title: 'LinkedIn',
      icon: <FontAwesome5 name="linkedin" size={24} color="white" />,
      color: '#0A66C2',
      onPress: () => handleToggleMedia('linkedin'),
      isActive: userProfile?.enabledMedia?.includes('linkedin') || false,
    },
    {
      id: 'tiktok',
      title: 'TikTok',
      icon: <FontAwesome5 name="tiktok" size={24} color="white" />,
      color: '#000000',
      onPress: () => handleToggleMedia('tiktok'),
      isActive: userProfile?.enabledMedia?.includes('tiktok') || false,
    },
    {
      id: 'sign-out',
      title: 'Sign Out',
      icon: <Ionicons name="log-out" size={24} color="white" />,
      color: '#FF3B30',
      onPress: handleSignOut,
      isLoading: isSigningOut,
    },
  ];

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/Contentoire.png')}
          style={styles.reactLogo}
          contentFit="contain"
        />
      }
    >
      <ThemedView style={styles.container}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Settings</ThemedText>
        </ThemedView>
        
        <View style={styles.buttonsContainer}>
          {buttons.map((button) => (
            <SettingsButton key={button.id} {...button} />
          ))}
        </View>
      </ThemedView>
    </ParallaxScrollView>
  );
}
