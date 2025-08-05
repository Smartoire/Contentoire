import { auth, db } from "@/config/firebase";
import {
    EmailAuthProvider,
    User,
    reauthenticateWithCredential,
    updateEmail,
    updatePassword,
    updateProfile,
} from "firebase/auth";
import { Timestamp, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";

export interface UserProfile {
  displayName: string;
  email: string;
  photoURL?: string; // Only allow string or undefined, not null
  enabledMedia: string[]; // List of enabled media platforms
}

// Mock user for development when Firebase is not configured
const createMockUser = (): User => ({
  uid: 'mock-user-id',
  email: 'demo@contentoire.com',
  displayName: 'Demo User',
  photoURL: null,
  emailVerified: true,
  isAnonymous: false,
  metadata: {} as any,
  providerData: [],
  refreshToken: '',
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => 'mock-token',
  getIdTokenResult: async () => ({ authTime: '', issuedAtTime: '', expirationTime: '', signInProvider: null, claims: {}, token: 'mock-token' }),
  reload: async () => {},
  toJSON: () => ({}),
  phoneNumber: null,
  providerId: 'password',
});

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  console.log('useAuth - Hook initialized');

  // Available media platforms
  const availableMedia = [
    "twitter",
    "instagram",
    "facebook",
    "linkedin",
    "tiktok",
  ];

  // Load user data when auth state changes
  useEffect(() => {
    console.log('useAuth - useEffect triggered');
    const initializeAuth = async () => {
      try {
        // Check if Firebase is properly configured by trying to access auth
        let currentUser: User | null = null;
        
        try {
          console.log('useAuth - Trying Firebase auth...');
          // Try to get the real auth state
          const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
            console.log('useAuth - Firebase auth state changed:', !!firebaseUser);
            currentUser = firebaseUser;
            
            if (firebaseUser) {
              // Load additional user profile data from Firestore
              try {
                const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
                if (userDoc.exists()) {
                  const userData = userDoc.data();
                  const photoURL = userData.photoURL !== undefined 
                    ? (userData.photoURL || undefined)
                    : (firebaseUser.photoURL || undefined);
                    
                  setUserProfile({
                    displayName: firebaseUser.displayName || "",
                    email: firebaseUser.email || "",
                    photoURL: photoURL,
                    enabledMedia: userData.enabledMedia || [],
                  });
                } else {
                  // Create default profile if it doesn't exist
                  const defaultProfile: UserProfile = {
                    displayName: firebaseUser.displayName || "",
                    email: firebaseUser.email || "",
                    photoURL: firebaseUser.photoURL || undefined,
                    enabledMedia: [],
                  };
                  
                  const firestoreProfile: Record<string, any> = {
                    displayName: defaultProfile.displayName,
                    email: defaultProfile.email,
                    enabledMedia: defaultProfile.enabledMedia,
                  };
                  
                  if (defaultProfile.photoURL) {
                    firestoreProfile.photoURL = defaultProfile.photoURL;
                  }
                  
                  await setDoc(doc(db, "users", firebaseUser.uid), firestoreProfile);
                  setUserProfile(defaultProfile);
                }
              } catch (firestoreError) {
                console.warn('Firestore not available, using mock profile');
                setUserProfile({
                  displayName: firebaseUser.displayName || "Demo User",
                  email: firebaseUser.email || "demo@contentoire.com",
                  photoURL: firebaseUser.photoURL || undefined,
                  enabledMedia: ["twitter", "instagram"],
                });
              }
            } else {
              setUserProfile(null);
            }
            
            setUser(firebaseUser);
            setLoading(false);
          });
          
          return () => unsubscribe();
        } catch (firebaseError) {
          console.warn('Firebase not properly configured, using mock authentication');
          
          // Use mock authentication for development
          const mockUser = createMockUser();
          setUser(mockUser);
          setUserProfile({
            displayName: "Demo User",
            email: "demo@contentoire.com",
            photoURL: undefined,
            enabledMedia: ["twitter", "instagram"],
          });
          setLoading(false);
        }
      } catch (err) {
        console.error("Error loading user data:", err);
        setError(err as Error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  console.log('useAuth - Current state:', { user: !!user, loading, error: !!error });

  // Update user profile
  const updateUserProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!user) throw new Error("No user is signed in");

      try {
        setLoading(true);

        // For mock user, just update local state
        if (user.uid === 'mock-user-id') {
          setUserProfile(prev => prev ? { ...prev, ...updates } : null);
          return updates;
        }

        // Update auth profile (displayName, photoURL)
        const authUpdates: { displayName?: string; photoURL?: string } = {};
        if (updates.displayName !== undefined)
          authUpdates.displayName = updates.displayName;
        if (updates.photoURL !== undefined)
          authUpdates.photoURL = updates.photoURL;

        if (Object.keys(authUpdates).length > 0) {
          await updateProfile(user, authUpdates);
        }

        // Update email if changed
        if (updates.email && updates.email !== user.email) {
          await updateEmail(user, updates.email);
        }

        // Update Firestore user document
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        // Get current user data or create default
        const currentData = userDoc.exists()
          ? userDoc.data()
          : {
              displayName: user.displayName || "",
              email: user.email || "",
              photoURL: user.photoURL || null,
              enabledMedia: [],
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now(),
            };

        // Prepare update data - ensure photoURL is never undefined for Firestore
        const updatedData = {
          ...currentData,
          displayName:
            updates.displayName !== undefined
              ? updates.displayName
              : currentData.displayName,
          email:
            updates.email !== undefined ? updates.email : currentData.email,
          photoURL:
            updates.photoURL !== undefined
              ? updates.photoURL || null
              : currentData.photoURL || null,
          enabledMedia:
            updates.enabledMedia !== undefined
              ? updates.enabledMedia
              : currentData.enabledMedia,
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
        console.error("Error updating profile:", err);
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, userProfile]
  );

  // Toggle media platform
  const toggleMedia = useCallback(
    async (platform: string) => {
      if (!userProfile) return;

      const updatedEnabledMedia = userProfile.enabledMedia.includes(platform)
        ? userProfile.enabledMedia.filter((p) => p !== platform)
        : [...userProfile.enabledMedia, platform];

      return updateUserProfile({ enabledMedia: updatedEnabledMedia });
    },
    [userProfile, updateUserProfile]
  );

  // Change password
  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      if (!user || !user.email) throw new Error("No user is signed in");

      // For mock user, just return success
      if (user.uid === 'mock-user-id') {
        return true;
      }

      try {
        setLoading(true);

        // Reauthenticate user
        const credential = EmailAuthProvider.credential(
          user.email,
          currentPassword
        );
        await reauthenticateWithCredential(user, credential);

        // Update password
        await updatePassword(user, newPassword);

        return true;
      } catch (err) {
        console.error("Error changing password:", err);
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // Sign out
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      
      if (user?.uid === 'mock-user-id') {
        setUser(null);
        setUserProfile(null);
        return;
      }
      
      await auth.signOut();
      setUser(null);
      setUserProfile(null);
    } catch (err) {
      console.error("Error signing out:", err);
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

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
