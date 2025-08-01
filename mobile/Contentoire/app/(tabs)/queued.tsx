import { useState, useCallback } from 'react';
import { Image, StyleSheet, Modal, ScrollView, Linking, Platform, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { usePosts } from '@/hooks/usePosts';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import DateTimePicker from '@react-native-community/datetimepicker';
import ParallaxScrollView from '@/components/ParallaxScrollView';

interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  sourceUrl: string;
  scheduledTime: Timestamp | null;
  suggestedTime: Timestamp;
  status: 'scheduled' | 'posted' | 'waiting';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export default function TabTwoScreen() {
  const {
    posts: unsortedPosts,
    loading,
    refreshing,
    refreshPosts,
    updateLocalPost
  } = usePosts('scheduled');

  // Sort posts by scheduled time (earliest first)
  const posts = [...unsortedPosts].sort((a, b) => {
    const timeA = a.scheduledTime?.toDate().getTime() || 0;
    const timeB = b.scheduledTime?.toDate().getTime() || 0;
    return timeA - timeB;
  });

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [editingTime, setEditingTime] = useState<Date>(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const insets = useSafeAreaInsets();

  const handlePostPress = (post: Post) => {
    setSelectedPost(post);
    // Use scheduledTime for queued posts (non-editable)
    setEditingTime(post.scheduledTime?.toDate() || new Date());
    setModalVisible(true);
  };

  // Helper function to check if a time is at least 3 hours from now
  const isAtLeast3HoursLater = (date: Date): boolean => {
    const threeHoursFromNow = new Date();
    threeHoursFromNow.setHours(threeHoursFromNow.getHours() + 3);
    return date >= threeHoursFromNow;
  };

  const handleReschedule = useCallback(async () => {
    if (!selectedPost) return;
    
    // Validate the new time is at least 3 hours from now
    if (!isAtLeast3HoursLater(editingTime)) {
      Alert.alert(
        'Invalid Time',
        'New scheduled time must be at least 3 hours from now.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const postRef = doc(db, 'posts', selectedPost.id);
      const updatedFields = {
        suggestedTime: Timestamp.fromDate(editingTime),
        scheduledTime: Timestamp.fromDate(editingTime),
        updatedAt: Timestamp.now()
      };

      await updateDoc(postRef, updatedFields);
      updateLocalPost(selectedPost.id, updatedFields);
      setModalVisible(false);
      Alert.alert('Success', 'Post has been rescheduled.');
    } catch (error) {
      console.error('Error rescheduling post:', error);
      Alert.alert('Error', 'Failed to reschedule post. Please try again.');
    }
  }, [selectedPost, editingTime, updateLocalPost]);

  const handleMoveToWaitingList = useCallback(async () => {
    if (!selectedPost) return;
    
    try {
      const postRef = doc(db, 'posts', selectedPost.id);
      const updatedFields = {
        status: 'waiting' as const,
        scheduledTime: null as any, // Using any to bypass type checking for Firestore
        updatedAt: Timestamp.now()
      };

      await updateDoc(postRef, updatedFields);
      updateLocalPost(selectedPost.id, updatedFields);
      setModalVisible(false);
      Alert.alert('Success', 'Post has been moved back to the waiting list.');
    } catch (error) {
      console.error('Error moving post to waiting list:', error);
      Alert.alert('Error', 'Failed to move post to waiting list. Please try again.');
    }
  }, [selectedPost, updateLocalPost]);

  const formatDate = (date: Date | Timestamp | null | undefined) => {
    if (!date) return 'Not scheduled';
    const d = date instanceof Timestamp ? date.toDate() : new Date(date);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
          >
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
                    <ThemedText type="subtitle" style={styles.postTitle} numberOfLines={1} ellipsizeMode="tail">
                      {post.title}
                    </ThemedText>
                    <ThemedText style={styles.postSnippet} numberOfLines={2} ellipsizeMode="tail">
                      {post.content}
                    </ThemedText>
                    <ThemedText style={styles.postMeta}>
                      {formatDate(post.scheduledTime)}
                    </ThemedText>
                  </ThemedView>
                </TouchableOpacity>
              ))}
            </ThemedView>
          </ScrollView>
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

              </ThemedView>

              {/* Date picker for rescheduling */}
              <ThemedView style={styles.timeSelectionContainer}>
                <ThemedText style={styles.timeLabel}>New Scheduled Time:</ThemedText>
                {showDatePicker && (
                  <DateTimePicker
                    value={editingTime}
                    mode="datetime"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(Platform.OS === 'ios');
                      if (selectedDate) {
                        setEditingTime(selectedDate);
                      }
                    }}
                    minimumDate={new Date()}
                  />
                )}
                <TouchableOpacity 
                  style={[styles.timeButton, { backgroundColor: '#f5f5f5' }]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <ThemedText>{formatDate(editingTime)}</ThemedText>
                  <MaterialIcons name="edit" size={20} color="#007AFF" />
                </TouchableOpacity>
              </ThemedView>

            <ThemedText style={styles.modalText}>
              {selectedPost?.content}
            </ThemedText>
            
            <ThemedView style={styles.actionButtonsContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.rescheduleButton]}
                onPress={handleReschedule}
              >
                <ThemedText style={styles.actionButtonText}>Reschedule</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.moveToWaitingButton]}
                onPress={handleMoveToWaitingList}
              >
                <ThemedText style={styles.actionButtonText}>Move to Waiting List</ThemedText>
              </TouchableOpacity>
            </ThemedView>

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
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingTop: 30,
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
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rescheduleButton: {
    backgroundColor: '#007AFF',
  },
  moveToWaitingButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
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
