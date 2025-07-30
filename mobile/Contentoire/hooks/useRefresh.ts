import { useCallback } from 'react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Post } from './usePosts';

interface RefreshCallbacks {
  onPostsRefreshed?: (posts: Post[]) => void;
  onError?: (error: Error) => void;
}

export const useRefresh = () => {
  const refreshPosts = useCallback(async (status: 'scheduled' | 'waiting' | 'posted') => {
    try {
      const postsRef = collection(db, 'posts');
      const q = query(
        postsRef,
        where('status', '==', status)
      );
      
      const querySnapshot = await getDocs(q);
      const postsList: Post[] = [];
      
      querySnapshot.forEach((doc) => {
        postsList.push({ id: doc.id, ...doc.data() } as Post);
      });
      
      return postsList;
    } catch (error) {
      console.error(`Error refreshing ${status} posts:`, error);
      throw error;
    }
  }, []);

  const refreshAll = useCallback(async () => {
    try {
      console.log('Refreshing all data...');
      const [scheduled, waiting, posted] = await Promise.all([
        refreshPosts('scheduled'),
        refreshPosts('waiting'),
        refreshPosts('posted')
      ]);
      
      return {
        scheduled,
        waiting,
        posted
      };
    } catch (error) {
      console.error('Error during refresh:', error);
      throw error;
    }
  }, [refreshPosts]);

  return {
    refreshPosts,
    refreshAll
  };
};
