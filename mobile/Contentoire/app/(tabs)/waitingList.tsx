import { useState, useCallback } from 'react';
import { 
  Image, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  TouchableWithoutFeedback,
  View as DefaultView,
  Platform,
  Alert
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { updateDoc, doc, Timestamp, DocumentData } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { usePosts } from '@/hooks/usePosts';

// Import the Post type from usePosts and use it directly to ensure consistency
import { Post as UsePostsPost } from '@/hooks/usePosts';

// Extend the Post type from usePosts and make suggestedTime required
interface Post extends Omit<UsePostsPost, 'suggestedTime'> {
  suggestedTime: Timestamp;
  scheduledTime?: never; // Ensure scheduledTime is not present in this type
}

export default function WaitingListScreen() {
  const { posts, updateLocalPost } = usePosts('waiting');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [editingTime, setEditingTime] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingContent, setEditingContent] = useState('');
  const [editingImageUrl, setEditingImageUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const insets = useSafeAreaInsets();

  const handleSaveTime = async () => {
    if (!selectedPost) return;
    
    try {
      await updateDoc(doc(db, 'posts', selectedPost.id), {
        suggestedTime: Timestamp.fromDate(editingTime)
      });
      setShowDatePicker(false);
    } catch (error) {
      console.error('Error updating post time:', error);
    }
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || editingTime;
    setShowDatePicker(Platform.OS === 'ios');
    
    // If user cancels the time picker, don't update the time
    if (event.type === 'dismissed') {
      return;
    }
    
    // If the selected time is less than 3 hours from now, show a warning but still allow selection
    const threeHoursFromNow = new Date();
    threeHoursFromNow.setHours(threeHoursFromNow.getHours() + 3);
    
    if (currentDate < threeHoursFromNow) {
      Alert.alert(
        'Time Too Soon',
        'Scheduled time should be at least 3 hours from now. You can set it now, but you\'ll need to choose a later time before saving.',
        [{ text: 'OK' }]
      );
    }
    
    setEditingTime(currentDate);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEditingTime(selectedDate);
    }
  };

  const handleDateTimeChange = handleTimeChange;

  const formatDate = (timestamp: Timestamp | Date | string | { seconds: number; nanoseconds: number } | undefined | null): string => {
    if (!timestamp) return 'No date';
    
    try {
      let date: Date;
      
      if (timestamp instanceof Date) {
        date = timestamp;
      } else if (timestamp instanceof Timestamp) {
        date = timestamp.toDate();
      } else if (typeof timestamp === 'object' && 'seconds' in timestamp) {
        // Handle Firestore Timestamp objects
        date = new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate();
      } else if (typeof timestamp === 'string') {
        date = new Date(timestamp);
      } else {
        return 'Invalid date';
      }
      
      return date.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Helper function to check if a time is at least 3 hours from now
  const isAtLeast3HoursLater = (date: Date): boolean => {
    const threeHoursFromNow = new Date();
    threeHoursFromNow.setHours(threeHoursFromNow.getHours() + 3);
    return date >= threeHoursFromNow;
  };

  const handleSaveChanges = useCallback(async (shouldPost = false) => {
    if (!selectedPost) return;
    
    // Validate scheduled time is at least 3 hours from now
    if (!isAtLeast3HoursLater(editingTime)) {
      Alert.alert(
        'Invalid Time',
        'Scheduled time must be at least 3 hours from now.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setIsSaving(true);
    try {
      // Create the updates object with proper typing
      const updates: Partial<UsePostsPost> = {
        title: editingTitle,
        content: editingContent,
        suggestedTime: Timestamp.fromDate(editingTime),
        updatedAt: Timestamp.now(),
        ...(shouldPost ? { status: 'scheduled' as const } : {})
      };

      // Handle imageUrl - only set if it has a value
      if (editingImageUrl) {
        updates.imageUrl = editingImageUrl;
      } else {
        // Explicitly set to undefined to remove the image
        updates.imageUrl = undefined;
      }

      // Update Firestore
      await updateDoc(doc(db, 'posts', selectedPost.id), updates);
      
      // Update local state using updateLocalPost from usePosts
      updateLocalPost(selectedPost.id, updates);
      
      setModalVisible(false);
    } catch (error) {
      console.error('Error updating post:', error);
      Alert.alert('Error', 'Failed to update post. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [selectedPost, editingTitle, editingContent, editingImageUrl, editingTime, updateLocalPost]);

  const handleModalOpen = useCallback((post: UsePostsPost) => {
    // Ensure we have valid timestamps
    const now = Timestamp.now();
    
    // Helper function to ensure we have a valid Timestamp
    const ensureTimestamp = (time: unknown): Timestamp => {
      if (!time) return now;
      if (time instanceof Timestamp) return time;
      if (time instanceof Date) return Timestamp.fromDate(time);
      if (typeof time === 'string') {
        try {
          return Timestamp.fromDate(new Date(time));
        } catch (e) {
          return now;
        }
      }
      // If it's an object with seconds and nanoseconds, it's likely a Firestore Timestamp
      if (typeof time === 'object' && time !== null) {
        const timeObj = time as { seconds?: number; nanoseconds?: number };
        if (timeObj.seconds !== undefined && timeObj.nanoseconds !== undefined) {
          return new Timestamp(timeObj.seconds, timeObj.nanoseconds);
        }
      }
      return now;
    };
    
    try {
      // Ensure we have a valid suggestedTime (required by Post type)
      const suggestedTime = ensureTimestamp(post.suggestedTime);
      const createdAt = ensureTimestamp(post.createdAt);
      
      // Convert suggestedTime to Date for the date picker
      const postTime = suggestedTime.toDate();
      
      // Create a new post object with all required fields
      const postWithGuaranteedTime: Post = {
        id: post.id,
        title: post.title,
        content: post.content,
        status: post.status,
        suggestedTime, // This is now guaranteed to be a Timestamp
        imageUrl: post.imageUrl || null,
        sourceUrl: post.sourceUrl,
        createdAt,
        updatedAt: ensureTimestamp(post.updatedAt),
        platform: post.platform,
        likes: post.likes,
        shares: post.shares,
        isPublished: post.isPublished,
        tags: post.tags
      };
      
      setSelectedPost(postWithGuaranteedTime);
      setEditingTitle(post.title);
      setEditingContent(post.content);
      setEditingImageUrl(post.imageUrl || '');
      setEditingTime(postTime);
      setModalVisible(true);
    } catch (error) {
      console.error('Error opening post modal:', error);
      Alert.alert('Error', 'Failed to open post for editing');
    }
  }, []);

  return (
    <>
      <ThemedView style={styles.container}>
        {posts.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <ThemedText>No posts in waiting list</ThemedText>
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
                  onPress={() => handleModalOpen(post)}
                >
                  {post.imageUrl && (
                    <Image 
                      source={{ uri: post.imageUrl }} 
                      style={styles.postImage} 
                      resizeMode="cover" 
                    />
                  )}
                  <ThemedView style={styles.postContent}>
                    <ThemedText 
                      type="subtitle" 
                      style={styles.postTitle} 
                      numberOfLines={1} 
                      ellipsizeMode="tail"
                    >
                      {post.title}
                    </ThemedText>
                    <ThemedText 
                      style={styles.postSnippet} 
                      numberOfLines={2} 
                      ellipsizeMode="tail"
                    >
                      {post.content}
                    </ThemedText>
                    <ThemedView style={styles.postFooter}>
                      <ThemedText style={styles.postDate}>
                        {formatDate(post.suggestedTime)}
                      </ThemedText>
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          handleModalOpen(post);
                        }}
                      >
                        <MaterialIcons name="edit" size={20} color="#007AFF" />
                      </TouchableOpacity>
                    </ThemedView>
                  </ThemedView>
                </TouchableOpacity>
              ))}
            </ThemedView>
          </ScrollView>
        )}

        {/* Edit Post Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <ThemedView style={[styles.modalOverlay, { paddingTop: insets.top }]} />
          </TouchableWithoutFeedback>
          
          <ThemedView style={[styles.modalContainer, { marginTop: insets.top + 20 }]}>
            <ThemedView style={styles.modalHeader}>
              <ThemedText type="title" style={styles.modalTitle}>
                Edit Post
              </ThemedText>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#007AFF" />
              </TouchableOpacity>
            </ThemedView>
            
            <ScrollView style={styles.modalContent}>
              <ThemedView style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Title</ThemedText>
                <TextInput
                  style={styles.input}
                  value={editingTitle}
                  onChangeText={setEditingTitle}
                  placeholder="Post title"
                  placeholderTextColor="#999"
                />
              </ThemedView>
              
              <ThemedView style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Content</ThemedText>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={editingContent}
                  onChangeText={setEditingContent}
                  placeholder="Post content"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={4}
                />
              </ThemedView>
              
              <ThemedView style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Image URL (optional)</ThemedText>
                <TextInput
                  style={styles.input}
                  value={editingImageUrl}
                  onChangeText={setEditingImageUrl}
                  placeholder="https://example.com/image.jpg"
                  placeholderTextColor="#999"
                  keyboardType="url"
                  autoCapitalize="none"
                />
                {editingImageUrl ? (
                  <Image 
                    source={{ uri: editingImageUrl }} 
                    style={styles.imagePreview} 
                    resizeMode="cover"
                  />
                ) : null}
              </ThemedView>
              
              <ThemedView style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Schedule Time</ThemedText>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <ThemedText>{formatDate(Timestamp.fromDate(editingTime))}</ThemedText>
                </TouchableOpacity>
                
                {showDatePicker && (
                  <ThemedView style={styles.dateTimePickerContainer}>
                    <DateTimePicker
                      value={editingTime}
                      mode="datetime"
                      display="default"
                      onChange={handleDateTimeChange}
                      minimumDate={new Date()}
                    />
                    {Platform.OS === 'ios' && (
                      <ThemedView style={styles.dateTimeButtons}>
                        <TouchableOpacity
                          style={[styles.button, styles.cancelButton]}
                          onPress={() => setShowDatePicker(false)}
                        >
                          <ThemedText style={styles.buttonText}>Cancel</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.button, styles.saveButton]}
                          onPress={handleSaveTime}
                        >
                          <ThemedText style={[styles.buttonText, styles.saveButtonText]}>
                            Save
                          </ThemedText>
                        </TouchableOpacity>
                      </ThemedView>
                    )}
                  </ThemedView>
                )}
              </ThemedView>
            </ScrollView>
            
            <ThemedView style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
                disabled={isSaving}
              >
                <ThemedText style={styles.buttonText}>Cancel</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={() => handleSaveChanges(false)}
                disabled={isSaving}
              >
                <ThemedText style={[styles.buttonText, styles.saveButtonText]}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.postButton]}
                onPress={() => handleSaveChanges(true)}
                disabled={isSaving}
              >
                <ThemedText style={[styles.buttonText, styles.postButtonText]}>
                  {isSaving ? 'Posting...' : 'Save & Post'}
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </Modal>
      </ThemedView>
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
    paddingTop: 8,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  postImage: {
    width: '100%',
    height: 200,
  },
  postContent: {
    padding: 16,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  postSnippet: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  postDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postsContainer: {
    paddingBottom: 24,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    marginTop: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    marginTop: 12,
    borderRadius: 8,
  },
  timeButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  dateTimePickerContainer: {
    marginTop: 12,
  },
  dateTimeButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#f0f7ff',
  },
  postButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  saveButtonText: {
    color: '#007AFF',
  },
  // Remove duplicate styles
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  timeSelectionContainer: { marginBottom: 20 },
  timeLabel: { fontSize: 16, marginBottom: 8, fontWeight: '500' },
  timeButton: { padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8 },
  saveButton: { backgroundColor: '#007AFF', padding: 16, borderRadius: 8, alignItems: 'center' },
  saveButtonText: { color: 'white', fontWeight: '600' },
  reactLogo: {
    height: 75,
    width: 300,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
