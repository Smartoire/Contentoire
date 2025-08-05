import { useEffect } from 'react';
import { router } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/config/firebase';

export function useAuthCheck(requireAuth = true) {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (requireAuth && !user) {
        // If authentication is required but no user is logged in, redirect to login
        router.replace('/login');
      } else if (!requireAuth && user) {
        // If authentication is not required but user is logged in, redirect to waitingList tab
        router.replace('/(tabs)/waiting');
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [requireAuth]);

  return null;
}
