import { useState, useEffect } from 'react';
import { Image, StyleSheet, Modal, ScrollView, Linking, Platform, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs, updateDoc, doc, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import DateTimePicker from '@react-native-community/datetimepicker';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  sourceUrl: string;
  suggestedTime: Timestamp;
  status: 'waiting' | 'scheduled' | 'posted';
}

export default function WaitingListScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editingTime, setEditingTime] = useState(new Date());
  const insets = useSafeAreaInsets();

  useEffect(() => { fetchWaitingPosts(); }, []);

  const fetchWaitingPosts = async () => {
    const q = query(collection(db, 'posts'), where('status', '==', 'waiting'), orderBy('suggestedTime', 'asc'));
    const querySnapshot = await getDocs(q);
    setPosts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Post));
  };

  const handleSaveTime = async () => {
    if (!selectedPost) return;
    try {
      // Update only the date part, keeping the original time
      const newDate = new Date(editingTime);
      const currentTime = selectedPost.suggestedTime.toDate();
      newDate.setHours(currentTime.getHours(), currentTime.getMinutes());
      
      await updateDoc(doc(db, 'posts', selectedPost.id), {
        suggestedTime: Timestamp.fromDate(newDate)
      });
      setPosts(posts.map(p => p.id === selectedPost.id ? { ...p, suggestedTime: Timestamp.fromDate(newDate) } : p));
      setModalVisible(false);
    } catch (error) {
      console.error('Error updating post time:', error);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || editingTime;
    setShowDatePicker(Platform.OS === 'ios');
    if (event.type === 'set') {
      setEditingTime(currentDate);
    }
  };

  const formatDate = (date: Date | Timestamp) => {
    const d = date instanceof Timestamp ? date.toDate() : new Date(date);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <ThemedView style={styles.container}>
        {posts.length === 0 ? (
          <ThemedView style={styles.emptyState}><ThemedText>No posts in waiting list</ThemedText></ThemedView>
        ) : (
          <ThemedView style={styles.postsContainer}>
            {posts.map((post) => (
              <ThemedView key={post.id} style={styles.postCard}>
                {post.imageUrl && <Image source={{ uri: post.imageUrl }} style={styles.postImage} />}
                <ThemedView style={styles.postContent}>
                  <ThemedText type="subtitle" style={styles.postTitle} numberOfLines={1} ellipsizeMode="tail">
                    {post.title}
                  </ThemedText>
                  <ThemedText style={styles.postSnippet} numberOfLines={2} ellipsizeMode="tail">
                    {post.content}
                  </ThemedText>
                  <TouchableOpacity 
                    style={[styles.editButton, { marginTop: 8 }]} 
                    onPress={() => {
                      setSelectedPost(post);
                      setEditingTime(post.suggestedTime.toDate());
                      setModalVisible(true);
                    }}
                  >
                    <ThemedText style={styles.editButtonText}>
                      {formatDate(post.suggestedTime)}
                    </ThemedText>
                  </TouchableOpacity>
                </ThemedView>
              </ThemedView>
            ))}
          </ThemedView>
        )}
      </ThemedView>

      <Modal visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <ThemedView style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <ScrollView style={styles.modalContent}>
            <ThemedText type="title" style={styles.modalTitle}>{selectedPost?.title}</ThemedText>
            <ThemedView style={styles.timeSelectionContainer}>
              <ThemedText style={styles.timeLabel}>Suggested Post Time:</ThemedText>
              <TouchableOpacity style={styles.timeButton} onPress={() => setShowDatePicker(true)}>
                <ThemedText>{formatDate(editingTime)}</ThemedText>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={editingTime}
                  mode="datetime"
                  onChange={handleDateChange}
                />
              )}
            </ThemedView>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveTime}>
              <ThemedText style={styles.saveButtonText}>Save Changes</ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </ThemedView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    flexShrink: 1,
  },
  emptyState: { justifyContent: 'center', alignItems: 'center', padding: 20, minHeight: 200 },
  postsContainer: { gap: 16, paddingBottom: 20 },
  postCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', elevation: 2 },
  postImage: { width: 100, height: 100 },
  postContent: { flex: 1, padding: 12, justifyContent: 'space-between' },
  postSnippet: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    flexShrink: 1,
  },
  editButton: { 
    padding: 8, 
    backgroundColor: '#f0f0f0', 
    borderRadius: 6, 
    alignItems: 'center',
    alignSelf: 'flex-start',
    minWidth: 150,
  },
  editButtonText: { 
    color: '#007AFF', 
    fontSize: 14,
    textAlign: 'center',
  },
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalContent: { flex: 1, padding: 20 },
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
