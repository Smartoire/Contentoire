import { useState, useEffect, useCallback } from 'react';
import { User, updateProfile, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  displayName: string;
  email: string;
  photoURL?: string;
  enabledMedia: string[]; // List of enabled media platforms
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Available media platforms
  const availableMedia = ['twitter', 'instagram', 'facebook', 'linkedin', 'tiktok'];

  // Load user data when auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      try {
        setUser(currentUser);
        
        if (currentUser) {
          // Load additional user profile data from Firestore
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserProfile({
              displayName: currentUser.displayName || '',
              email: currentUser.email || '',
              photoURL: currentUser.photoURL || undefined,
              enabledMedia: userDoc.data()?.enabledMedia || [],
            });
          } else {
            // Create default profile if it doesn't exist
            const defaultProfile: UserProfile = {
              displayName: currentUser.displayName || '',
              email: currentUser.email || '',
              photoURL: currentUser.photoURL || undefined,
              enabledMedia: [],
            };
            await updateDoc(doc(db, 'users', currentUser.uid), defaultProfile);
            setUserProfile(defaultProfile);
          }
        } else {
          setUserProfile(null);
        }
      } catch (err) {
        console.error('Error loading user data:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Update user profile
  const updateUserProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user is signed in');
    
    try {
      setLoading(true);
      
      // Update auth profile (displayName, photoURL)
      const authUpdates: { displayName?: string; photoURL?: string } = {};
      if (updates.displayName !== undefined) authUpdates.displayName = updates.displayName;
      if (updates.photoURL !== undefined) authUpdates.photoURL = updates.photoURL;
      
      if (Object.keys(authUpdates).length > 0) {
        await updateProfile(user, authUpdates);
      }
      
      // Update email if changed
      if (updates.email && updates.email !== user.email) {
        await updateEmail(user, updates.email);
      }
      
      // Update Firestore user document
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      // Get current user data or create default
      const currentData = userDoc.exists() ? userDoc.data() : {
        displayName: user.displayName || '',
        email: user.email || '',
        photoURL: user.photoURL || null,
        enabledMedia: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      // Prepare update data
      const updatedData = {
        ...currentData,
        displayName: updates.displayName !== undefined ? updates.displayName : currentData.displayName,
        email: updates.email !== undefined ? updates.email : currentData.email,
        photoURL: updates.photoURL !== undefined ? updates.photoURL : currentData.photoURL,
        enabledMedia: updates.enabledMedia !== undefined ? updates.enabledMedia : currentData.enabledMedia,
        updatedAt: Timestamp.now(),
      };
      
      // Update or create the document
      if (userDoc.exists()) {
        await updateDoc(userRef, updatedData);
      } else {
        await setDoc(userRef, {
          ...updatedData,
          createdAt: Timestamp.now(),
        });
      }
      
      // Update local state
      setUserProfile({
        displayName: updatedData.displayName,
        email: updatedData.email,
        photoURL: updatedData.photoURL || undefined,
        enabledMedia: updatedData.enabledMedia || [],
      });
      
      return {
        displayName: updatedData.displayName,
        email: updatedData.email,
        photoURL: updatedData.photoURL || undefined,
        enabledMedia: updatedData.enabledMedia || [],
      };
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, userProfile]);

  // Toggle media platform
  const toggleMedia = useCallback(async (platform: string) => {
    if (!userProfile) return;
    
    const updatedEnabledMedia = userProfile.enabledMedia.includes(platform)
      ? userProfile.enabledMedia.filter(p => p !== platform)
      : [...userProfile.enabledMedia, platform];
    
    return updateUserProfile({ enabledMedia: updatedEnabledMedia });
  }, [userProfile, updateUserProfile]);

  // Change password
  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    if (!user || !user.email) throw new Error('No user is signed in');
    
    try {
      setLoading(true);
      
      // Reauthenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      
      return true;
    } catch (err) {
      console.error('Error changing password:', err);
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      await auth.signOut();
      setUser(null);
      setUserProfile(null);
    } catch (err) {
      console.error('Error signing out:', err);
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    userProfile,
    loading,
    error,
    availableMedia,
    updateUserProfile,
    toggleMedia,
    changePassword,
    signOut,
  };
};
