import { useState, useEffect } from 'react';
import { Image, StyleSheet, Modal, ScrollView, Linking, Platform, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs, updateDoc, doc, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  sourceUrl: string;
  scheduledTime: Timestamp;
  suggestedTime: Timestamp;
  status: 'scheduled' | 'posted';
}

export default function TabTwoScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editingTime, setEditingTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    fetchQueuedPosts();
  }, []);

  const fetchQueuedPosts = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'posts'),
        where('status', '==', 'scheduled'),
        orderBy('suggestedTime', 'asc')
      );
      const querySnapshot = await getDocs(q);
      const postsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
      setPosts(postsData);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostPress = (post: Post) => {
    setSelectedPost(post);
    // Use scheduledTime for queued posts (non-editable)
    setEditingTime(post.scheduledTime?.toDate() || new Date());
    setModalVisible(true);
  };

  const handleSaveTime = async () => {
    if (!selectedPost) return;

    try {
      const postRef = doc(db, 'posts', selectedPost.id);
      await updateDoc(postRef, {
        suggestedTime: Timestamp.fromDate(editingTime)
      });

      // Update local state
      setPosts(posts.map(post =>
        post.id === selectedPost.id
          ? { ...post, suggestedTime: Timestamp.fromDate(editingTime) }
          : post
      ));

      setModalVisible(false);
    } catch (error) {
      console.error('Error updating post time:', error);
    }
  };

  const formatDate = (date: Date | Timestamp) => {
    if (!date) return '';
    const dateObj = date instanceof Timestamp ? date.toDate() : new Date(date);
    return dateObj.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <ThemedView style={styles.container}>
        {loading ? (
          <ThemedView style={styles.emptyState}>
            <ThemedText>Loading posts...</ThemedText>
          </ThemedView>
        ) : posts.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <ThemedText>No scheduled posts found</ThemedText>
          </ThemedView>
        ) : (
          <ThemedView style={styles.postsContainer}>
            {posts.map((post) => (
              <TouchableOpacity
                key={post.id}
                style={styles.postCard}
                onPress={() => handlePostPress(post)}
              >
                {post.imageUrl && (
                  <Image
                    source={{ uri: post.imageUrl }}
                    style={styles.postImage}
                    resizeMode="cover"
                  />
                )}
                <ThemedView style={styles.postContent}>
                  <ThemedText type="subtitle" style={styles.postTitle} numberOfLines={2}>
                    {post.title}
                  </ThemedText>
                  <ThemedText style={styles.postSnippet} numberOfLines={3}>
                    {post.content}
                  </ThemedText>
                  <ThemedText style={styles.postMeta}>
                    Scheduled: {formatDate(post.suggestedTime)}
                  </ThemedText>
                </ThemedView>
              </TouchableOpacity>
            ))}
          </ThemedView>
        )}
      </ThemedView>

      {/* Post Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <ThemedView style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Ionicons name="close" size={24} color="#007AFF" />
          </TouchableOpacity>

          <ScrollView style={styles.modalContent}>
            {selectedPost?.imageUrl && (
              <Image
                source={{ uri: selectedPost.imageUrl }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            )}
            <ThemedText type="title" style={styles.modalTitle}>
              {selectedPost?.title}
            </ThemedText>

            {/* Display scheduled time (non-editable) */}
            <ThemedView style={styles.timeSelectionContainer}>
              <ThemedText style={styles.timeLabel}>Scheduled Time:</ThemedText>
              <ThemedView style={[styles.timeButton, { backgroundColor: '#f5f5f5' }]}>
                <ThemedText>{formatDate(editingTime)}</ThemedText>
              </ThemedView>

              {/* No date picker for queued posts */}
            </ThemedView>

            <ThemedText style={styles.modalText}>
              {selectedPost?.content}
            </ThemedText>

            <TouchableOpacity
              style={styles.sourceButton}
              onPress={() => selectedPost?.sourceUrl && Linking.openURL(selectedPost.sourceUrl)}
            >
              <ThemedText style={styles.sourceButtonText}>
                View Original Source
              </ThemedText>
              <Ionicons name="open-outline" size={16} color="#007AFF" />
            </TouchableOpacity>

            {/* No save button for queued posts */}
          </ScrollView>
        </ThemedView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 200,
  },
  postsContainer: {
    gap: 16,
    paddingBottom: 20,
  },
  postCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  postImage: {
    width: 100,
    height: '100%',
    minHeight: 100,
  },
  postContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  postTitle: {
    fontWeight: '600',
    marginBottom: 4,
    fontSize: 16,
  },
  postSnippet: {
    color: '#666',
    fontSize: 14,
    marginBottom: 4,
  },
  postMeta: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 20,
  },
  modalContent: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },
  modalImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  timeSelectionContainer: {
    marginBottom: 20,
  },
  timeLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  timeButton: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  iosButtonContainer: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderColor: '#ccc',
    marginTop: 10,
  },
  iosButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  sourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 8,
    marginTop: 'auto',
    marginBottom: 20,
  },
  sourceButtonText: {
    color: '#007AFF',
    marginRight: 8,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  reactLogo: {
    height: 75,
    width: 300,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
