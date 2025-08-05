import { Calendar } from '@/components/Calendar';
import { PostModal } from '@/components/PostModal';
import { ThemedView } from '@/components/ThemedView';
import type { Post } from '@/hooks/usePosts';
import { usePosts } from '@/hooks/usePosts';
import React, { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';

export default function CalendarScreen() {
  const { posts: waitingPosts } = usePosts('waiting');
  const { posts: scheduledPosts } = usePosts('scheduled');
  const { posts: postedPosts } = usePosts('posted');
  
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Combine all posts for calendar view
  const allPosts = [...waitingPosts, ...scheduledPosts, ...postedPosts];

  const handleDayPress = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const handlePostPress = useCallback((post: Post) => {
    setSelectedPost(post);
    setModalVisible(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalVisible(false);
    setSelectedPost(null);
  }, []);

  return (
    <ThemedView style={styles.container}>
      <Calendar
        posts={allPosts}
        onDayPress={handleDayPress}
        onPostPress={handlePostPress}
        selectedDate={selectedDate}
      />
      
      <PostModal
        visible={modalVisible}
        post={selectedPost}
        onClose={handleModalClose}
        onSave={() => {}}
        mode="view"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
