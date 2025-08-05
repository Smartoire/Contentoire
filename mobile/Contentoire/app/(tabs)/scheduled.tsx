import { PostList } from '@/components/PostList';
import { PostModal } from '@/components/PostModal';
import { ThemedView } from '@/components/ThemedView';
import type { Post } from '@/hooks/usePosts';
import { usePosts } from '@/hooks/usePosts';
import React, { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';

export default function ScheduledScreen() {
  const { posts, refreshPosts, updateLocalPost } = usePosts('scheduled');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handlePostPress = useCallback((post: Post) => {
    setSelectedPost(post);
    setModalVisible(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalVisible(false);
    setSelectedPost(null);
  }, []);

  const handlePostUpdate = useCallback((updates: Partial<Post>) => {
    if (selectedPost) {
      updateLocalPost(selectedPost.id, updates);
    }
  }, [selectedPost, updateLocalPost]);

  const handleRefresh = useCallback(async () => {
    await refreshPosts();
  }, [refreshPosts]);

  return (
    <ThemedView style={styles.container}>
      <PostList
        posts={posts}
        onPostPress={handlePostPress}
        onRefresh={handleRefresh}
        emptyMessage="No scheduled posts found"
        showTimeField="scheduledTime"
        showStatus={true}
      />
      
      <PostModal
        visible={modalVisible}
        post={selectedPost}
        onClose={handleModalClose}
        onSave={handlePostUpdate}
        mode="view"
        showMoveToWaitingButton={true}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
