import { db } from '@/config/firebase';
import { useFocusEffect } from 'expo-router';
import { collection, getDocs, onSnapshot, orderBy, query, Timestamp, where } from 'firebase/firestore';
import { useCallback, useEffect, useRef, useState } from 'react';

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

// Mock posts for development when Firebase is not configured
const createMockPosts = (status: 'scheduled' | 'waiting' | 'posted'): Post[] => {
  const now = new Date();
  const mockPosts: Post[] = [
    {
      id: 'mock-1',
      title: 'Sample Post 1',
      content: 'This is a sample post content for testing the app interface.',
      status,
      suggestedTime: Timestamp.fromDate(new Date(now.getTime() + 24 * 60 * 60 * 1000)),
      scheduledTime: status === 'scheduled' ? Timestamp.fromDate(new Date(now.getTime() + 48 * 60 * 60 * 1000)) : undefined,
      createdAt: Timestamp.fromDate(now),
      imageUrl: 'https://picsum.photos/400/200?random=1',
    },
    {
      id: 'mock-2',
      title: 'Sample Post 2',
      content: 'Another sample post to demonstrate the app functionality.',
      status,
      suggestedTime: Timestamp.fromDate(new Date(now.getTime() + 48 * 60 * 60 * 1000)),
      scheduledTime: status === 'scheduled' ? Timestamp.fromDate(new Date(now.getTime() + 72 * 60 * 60 * 1000)) : undefined,
      createdAt: Timestamp.fromDate(now),
    },
    {
      id: 'mock-3',
      title: 'Sample Post 3',
      content: 'A third sample post with different content and timing.',
      status,
      suggestedTime: Timestamp.fromDate(new Date(now.getTime() + 72 * 60 * 60 * 1000)),
      scheduledTime: status === 'scheduled' ? Timestamp.fromDate(new Date(now.getTime() + 96 * 60 * 60 * 1000)) : undefined,
      createdAt: Timestamp.fromDate(now),
      imageUrl: 'https://picsum.photos/400/200?random=2',
    },
  ];

  return mockPosts;
};

export const usePosts = (status: 'scheduled' | 'waiting' | 'posted' = 'scheduled') => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const unsubscribeRef = useRef<() => void>(() => {});

  const subscribeToPosts = useCallback(() => {
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
    } catch (firebaseError) {
      console.warn('Firebase not available, using mock posts');
      // Use mock posts for development
      const mockPosts = createMockPosts(status);
      setPosts(mockPosts);
      setLoading(false);
      setRefreshing(false);
      return () => {};
    }
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
      
      // If Firebase fails, use mock data
      console.warn('Using mock posts due to Firebase error');
      const mockPosts = createMockPosts(status);
      setPosts(mockPosts);
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
