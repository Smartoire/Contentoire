import { useState, useEffect, useCallback, useRef } from 'react';
import { collection, query, where, getDocs, Timestamp, DocumentData, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useFocusEffect } from 'expo-router';

export interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  sourceUrl?: string;
  status: 'scheduled' | 'waiting' | 'posted';
  scheduledTime?: Timestamp;
  suggestedTime?: Timestamp;
  createdAt: Timestamp;
  platform?: string;
  likes?: number;
  shares?: number;
  isPublished?: boolean;
  tags?: string[];
  [key: string]: any;
}

export const usePosts = (status: 'scheduled' | 'waiting' | 'posted' = 'scheduled') => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const unsubscribeRef = useRef<() => void>();

  const subscribeToPosts = useCallback(() => {
    const postsRef = collection(db, 'posts');
    // Create a base query with status filter first
    let q = query(
      postsRef,
      where('status', '==', status)
    );

    // Add appropriate ordering based on status
    if (status === 'scheduled' || status === 'posted') {
      q = query(q, orderBy('scheduledTime'));
    } else if (status === 'waiting') {
      q = query(q, orderBy('suggestedTime'));
    } else {
      q = query(q, orderBy('createdAt'));
    }

    // Unsubscribe from previous listener if it exists
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    // Set up real-time listener
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const postsList: Post[] = [];
        querySnapshot.forEach((doc) => {
          postsList.push({ id: doc.id, ...doc.data() } as Post);
        });
        setPosts(postsList);
        setLoading(false);
        setRefreshing(false);
      },
      (err) => {
        console.error(`Error in ${status} posts listener:`, err);
        setError(err);
        setLoading(false);
        setRefreshing(false);
      }
    );

    unsubscribeRef.current = unsubscribe;
    return unsubscribe;
  }, [status]);

  const fetchPosts = useCallback(async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const postsRef = collection(db, 'posts');
      // Create a base query with status filter first
      let q = query(
        postsRef,
        where('status', '==', status)
      );

      // Add appropriate ordering based on status
      if (status === 'scheduled' || status === 'posted') {
        q = query(q, orderBy('scheduledTime'));
      } else if (status === 'waiting') {
        q = query(q, orderBy('suggestedTime'));
      } else {
        q = query(q, orderBy('createdAt'));
      }

      const querySnapshot = await getDocs(q);
      const postsList: Post[] = [];
      
      querySnapshot.forEach((doc) => {
        postsList.push({ id: doc.id, ...doc.data() } as Post);
      });

      setPosts(postsList);
    } catch (err) {
      console.error(`Error fetching ${status} posts:`, err);
      setError(err instanceof Error ? err : new Error('Failed to fetch posts'));
    } finally {
      if (isRefreshing) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, [status]);

  // Set up real-time subscription
  useEffect(() => {
    const unsubscribe = subscribeToPosts();
    return () => {
      if (unsubscribe) unsubscribe();
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [subscribeToPosts]);

  // Refresh when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [fetchPosts])
  );

  // Function to manually refresh posts
  const refreshPosts = useCallback(() => {
    fetchPosts(true);
  }, [fetchPosts]);

  // Function to update a single post in the local state
  const updateLocalPost = useCallback((postId: string, updates: Partial<Post>) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId ? { ...post, ...updates } : post
      )
    );
  }, []);

  // Function to remove a post from the local state
  const removeLocalPost = useCallback((postId: string) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  }, []);

  // Function to force a refresh
  const forceRefresh = useCallback(async () => {
    await fetchPosts(true);
  }, [fetchPosts]);

  return {
    posts,
    loading,
    error,
    refreshing,
    refreshPosts: forceRefresh, // Alias for consistency
    forceRefresh,              // More descriptive name
    updateLocalPost,
    removeLocalPost
  };
};
