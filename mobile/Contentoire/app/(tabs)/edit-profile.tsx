import { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Switch, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function EditProfileScreen() {
  const router = useRouter();
  const { 
    user, 
    userProfile, 
    loading, 
    updateUserProfile, 
    toggleMedia, 
    changePassword,
    availableMedia,
    signOut
  } = useAuth();
  
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Set initial values from user profile
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setEmail(userProfile.email || '');
    }
  }, [userProfile]);

  const handleSaveProfile = useCallback(async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Display name cannot be empty');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Email cannot be empty');
      return;
    }

    try {
      setIsSaving(true);
      const result = await updateUserProfile({ displayName, email });
      if (result) {
        Alert.alert('Success', 'Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [displayName, email, updateUserProfile]);

  const handleChangePassword = useCallback(async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    try {
      setIsSaving(true);
      await changePassword(currentPassword, newPassword);
      
      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsEditingPassword(false);
      
      Alert.alert('Success', 'Password changed successfully');
    } catch (error: any) {
      console.error('Error changing password:', error);
      Alert.alert('Error', error.message || 'Failed to change password. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [currentPassword, newPassword, confirmPassword, changePassword]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      router.replace('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  }, [signOut, router]);

  const renderInput = (label: string, value: string, onChangeText: (text: string) => void, options: { secureTextEntry?: boolean; placeholder?: string } = {}) => {
    const inputBackground = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    
    return (
      <View style={styles.inputContainer}>
        <ThemedText style={styles.label}>{label}</ThemedText>
        <View style={[styles.inputWrapper, { backgroundColor: inputBackground }]}>
          <input
            type={options.secureTextEntry ? 'password' : 'text'}
            value={value}
            onChange={(e) => onChangeText(e.target.value)}
            placeholder={options.placeholder || ''}
            style={{
              width: '100%',
              fontSize: 16,
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              color: textColor,
              fontFamily: 'inherit',
              padding: 0,
              margin: 0,
            }}
            disabled={isSaving || loading}
          />
        </View>
      </View>
    );
  };

  if (loading && !userProfile) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <Ionicons name="person-circle" size={60} color={useThemeColor({}, 'text')} />
        <ThemedText style={styles.loadingText}>Loading profile...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={useThemeColor({}, 'tint')} />
        </TouchableOpacity>
        <ThemedText type="title">Edit Profile</ThemedText>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: useThemeColor({}, 'tint') }]}>
            <Ionicons name="person" size={60} color="white" />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Account Information</ThemedText>
          {renderInput('Display Name', displayName, setDisplayName, { placeholder: 'Enter your name' })}
          {renderInput('Email', email, setEmail, { placeholder: 'Enter your email' })}
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: useThemeColor({}, 'tint') }]}
            onPress={handleSaveProfile}
            disabled={isSaving}
          >
            <ThemedText style={styles.buttonText}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Change Password</ThemedText>
            <TouchableOpacity onPress={() => setIsEditingPassword(!isEditingPassword)}>
              <ThemedText style={{ color: useThemeColor({}, 'tint') }}>
                {isEditingPassword ? 'Cancel' : 'Change'}
              </ThemedText>
            </TouchableOpacity>
          </View>

          {isEditingPassword && (
            <>
              {renderInput('Current Password', currentPassword, setCurrentPassword, { secureTextEntry: true })}
              {renderInput('New Password', newPassword, setNewPassword, { secureTextEntry: true })}
              {renderInput('Confirm New Password', confirmPassword, setConfirmPassword, { secureTextEntry: true })}
              
              <TouchableOpacity 
                style={[styles.button, { backgroundColor: useThemeColor({}, 'tint') }]}
                onPress={handleChangePassword}
                disabled={isSaving}
              >
                <ThemedText style={styles.buttonText}>
                  {isSaving ? 'Updating...' : 'Update Password'}
                </ThemedText>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Connected Accounts</ThemedText>
          {availableMedia.map((platform) => (
            <View key={platform} style={styles.mediaItem}>
              <ThemedText style={styles.mediaName}>
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </ThemedText>
              <Switch
                value={userProfile?.enabledMedia?.includes(platform) || false}
                onValueChange={() => toggleMedia(platform)}
                trackColor={{ false: '#767577', true: useThemeColor({}, 'tint') }}
                thumbColor={userProfile?.enabledMedia?.includes(platform) ? '#f4f3f4' : '#f4f3f4'}
                disabled={isSaving}
              />
            </View>
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.signOutButton, { borderColor: useThemeColor({}, 'tint') }]}
          onPress={handleSignOut}
          disabled={isSaving}
        >
          <ThemedText style={[styles.signOutText, { color: useThemeColor({}, 'tint') }]}>
            Sign Out
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerRight: {
    width: 40, // Same as back button for balance
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    opacity: 0.8,
  },
  inputWrapper: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    fontSize: 16,
    width: '100%',
  },

  button: {
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  mediaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  mediaName: {
    fontSize: 16,
  },
  signOutButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
