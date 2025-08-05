import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { db } from '@/config/firebase';
import type { Post } from '@/hooks/usePosts';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { doc, Timestamp, updateDoc } from 'firebase/firestore';
import React, { useCallback, useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

interface PostModalProps {
  visible: boolean;
  post: Post | null;
  onClose: () => void;
  onSave: (updates: Partial<Post>) => void;
  onSchedule?: () => void;
  onMoveToWaiting?: () => void;
  mode: 'edit' | 'view';
  showScheduleButton?: boolean;
  showMoveToWaitingButton?: boolean;
}

const formatDate = (date: Date | Timestamp | null | undefined): string => {
  if (!date) return 'No date';
  
  let d: Date;
  
  if (date instanceof Timestamp) {
    d = date.toDate();
  } else if (date instanceof Date) {
    d = date;
  } else if (typeof date === 'object' && 'seconds' in date) {
    d = new Date(date.seconds * 1000);
  } else {
    return 'Invalid date';
  }
  
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const isAtLeast3HoursLater = (date: Date): boolean => {
  const threeHoursFromNow = new Date();
  threeHoursFromNow.setHours(threeHoursFromNow.getHours() + 3);
  return date >= threeHoursFromNow;
};

export const PostModal: React.FC<PostModalProps> = ({
  visible,
  post,
  onClose,
  onSave,
  onSchedule,
  onMoveToWaiting,
  mode,
  showScheduleButton = false,
  showMoveToWaitingButton = false,
}) => {
  const [editingTitle, setEditingTitle] = useState('');
  const [editingContent, setEditingContent] = useState('');
  const [editingImageUrl, setEditingImageUrl] = useState('');
  const [editingTime, setEditingTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form when post changes
  React.useEffect(() => {
    if (post) {
      setEditingTitle(post.title || '');
      setEditingContent(post.content || '');
      setEditingImageUrl(post.imageUrl || '');
      
      const timeField = post.scheduledTime || post.suggestedTime;
      if (timeField) {
        setEditingTime(timeField instanceof Timestamp ? timeField.toDate() : new Date(timeField));
      }
    }
  }, [post]);

  const handleSave = useCallback(async () => {
    if (!post) return;

    try {
      setIsSaving(true);
      const updates: Partial<Post> = {
        title: editingTitle,
        content: editingContent,
        ...(editingImageUrl && { imageUrl: editingImageUrl }),
      };

      // Update time field based on post status
      if (post.status === 'waiting') {
        updates.suggestedTime = Timestamp.fromDate(editingTime);
      } else if (post.status === 'scheduled') {
        updates.scheduledTime = Timestamp.fromDate(editingTime);
      }

      await updateDoc(doc(db, 'posts', post.id), updates);
      onSave(updates);
      onClose();
    } catch (error) {
      console.error('Error updating post:', error);
      Alert.alert('Error', 'Failed to update post');
    } finally {
      setIsSaving(false);
    }
  }, [post, editingTitle, editingContent, editingImageUrl, editingTime, onSave, onClose]);

  const handleSchedule = useCallback(async () => {
    if (!post) return;

    if (!isAtLeast3HoursLater(editingTime)) {
      Alert.alert(
        'Time Too Soon',
        'Scheduled time should be at least 3 hours from now.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsSaving(true);
      const updates: Partial<Post> = {
        title: editingTitle,
        content: editingContent,
        status: 'scheduled' as const,
        scheduledTime: Timestamp.fromDate(editingTime),
        ...(editingImageUrl && { imageUrl: editingImageUrl }),
      };

      await updateDoc(doc(db, 'posts', post.id), updates);
      onSave(updates);
      onClose();
      onSchedule?.();
    } catch (error) {
      console.error('Error scheduling post:', error);
      Alert.alert('Error', 'Failed to schedule post');
    } finally {
      setIsSaving(false);
    }
  }, [post, editingTitle, editingContent, editingImageUrl, editingTime, onSave, onClose, onSchedule]);

  const handleMoveToWaiting = useCallback(async () => {
    if (!post) return;

    try {
      setIsSaving(true);
      const updates: Partial<Post> = {
        status: 'waiting' as const,
        scheduledTime: null as any,
        suggestedTime: Timestamp.fromDate(editingTime),
      };

      await updateDoc(doc(db, 'posts', post.id), updates);
      onSave(updates);
      onClose();
      onMoveToWaiting?.();
    } catch (error) {
      console.error('Error moving post to waiting:', error);
      Alert.alert('Error', 'Failed to move post to waiting list');
    } finally {
      setIsSaving(false);
    }
  }, [post, editingTime, onSave, onClose, onMoveToWaiting]);

  const handleTimeChange = useCallback((event: { type: string }, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    
    if (event.type === 'dismissed') return;
    
    const currentDate = selectedDate || editingTime;
    setEditingTime(currentDate);
  }, [editingTime]);

  if (!post) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => !isSaving && onClose()}
    >
      <TouchableWithoutFeedback onPress={() => !isSaving && onClose()}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <ThemedView style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>
                  {mode === 'edit' ? 'Edit Post' : 'View Post'}
                </ThemedText>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => !isSaving && onClose()}
                  disabled={isSaving}
                >
                  <Ionicons name="close" size={24} color="#007AFF" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {post.imageUrl && (
                  <Image
                    source={{ uri: post.imageUrl }}
                    style={styles.postImage}
                    resizeMode="cover"
                  />
                )}

                <View style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel}>Title</ThemedText>
                  <TextInput
                    style={styles.input}
                    value={editingTitle}
                    onChangeText={setEditingTitle}
                    placeholder="Post title"
                    placeholderTextColor="#999"
                    editable={mode === 'edit' && !isSaving}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel}>Content</ThemedText>
                  <TextInput
                    style={[styles.input, styles.multilineInput]}
                    value={editingContent}
                    onChangeText={setEditingContent}
                    placeholder="Post content"
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    editable={mode === 'edit' && !isSaving}
                  />
                </View>

                {mode === 'edit' && (
                  <View style={styles.inputGroup}>
                    <ThemedText style={styles.inputLabel}>Image URL (optional)</ThemedText>
                    <TextInput
                      style={styles.input}
                      value={editingImageUrl}
                      onChangeText={setEditingImageUrl}
                      placeholder="https://example.com/image.jpg"
                      placeholderTextColor="#999"
                      keyboardType="url"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isSaving}
                    />
                  </View>
                )}

                <View style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel}>
                    {post.status === 'waiting' ? 'Suggested Time' : 'Scheduled Time'}
                  </ThemedText>
                  <TouchableOpacity 
                    style={styles.datePickerButton}
                    onPress={() => setShowDatePicker(true)}
                    disabled={isSaving}
                  >
                    <ThemedText style={styles.datePickerText}>
                      {formatDate(editingTime)}
                    </ThemedText>
                    {mode === 'edit' && (
                      <Ionicons name="time-outline" size={20} color="#007AFF" />
                    )}
                  </TouchableOpacity>
                  
                  {showDatePicker && (
                    <DateTimePicker
                      value={editingTime}
                      mode="datetime"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={handleTimeChange}
                      minimumDate={new Date()}
                    />
                  )}
                </View>
              </ScrollView>

              {mode === 'edit' && (
                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton, isSaving && styles.disabledButton]}
                    onPress={() => !isSaving && onClose()}
                    disabled={isSaving}
                  >
                    <ThemedText style={styles.buttonText}>Cancel</ThemedText>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.button, styles.saveButton, isSaving && styles.disabledButton]}
                    onPress={handleSave}
                    disabled={isSaving}
                  >
                    <ThemedText style={styles.buttonText}>
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              )}

              {showScheduleButton && (
                <TouchableOpacity
                  style={[styles.scheduleButton, isSaving && styles.disabledButton]}
                  onPress={handleSchedule}
                  disabled={isSaving}
                >
                  <ThemedText style={styles.scheduleButtonText}>
                    {isSaving ? 'Scheduling...' : 'Schedule Post'}
                  </ThemedText>
                </TouchableOpacity>
              )}

              {showMoveToWaitingButton && (
                <TouchableOpacity
                  style={[styles.moveButton, isSaving && styles.disabledButton]}
                  onPress={handleMoveToWaiting}
                  disabled={isSaving}
                >
                  <ThemedText style={styles.moveButtonText}>
                    {isSaving ? 'Moving...' : 'Move to Waiting List'}
                  </ThemedText>
                </TouchableOpacity>
              )}
            </ThemedView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
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
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  datePickerText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
  scheduleButton: {
    width: '100%',
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
  },
  moveButton: {
    width: '100%',
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#FF9500',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  scheduleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  moveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  disabledButton: {
    opacity: 0.6,
  },
}); 