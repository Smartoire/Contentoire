import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import type { Post } from '@/hooks/usePosts';
import { Ionicons } from '@expo/vector-icons';
import { Timestamp } from 'firebase/firestore';
import React, { useCallback, useMemo } from 'react';
import {
    Image,
    ListRenderItem,
    RefreshControl,
    SectionList,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

interface SectionData {
  title: string;
  data: Post[];
}

interface PostListProps {
  posts: Post[];
  onPostPress: (post: Post) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  emptyMessage?: string;
  showTimeField?: 'suggestedTime' | 'scheduledTime';
  showStatus?: boolean;
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

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'waiting':
      return '#FF9500';
    case 'scheduled':
      return '#007AFF';
    case 'posted':
      return '#34C759';
    default:
      return '#8E8E93';
  }
};

const getStatusIcon = (status: string): string => {
  switch (status) {
    case 'waiting':
      return 'time-outline';
    case 'scheduled':
      return 'calendar-outline';
    case 'posted':
      return 'checkmark-circle-outline';
    default:
      return 'ellipse-outline';
  }
};

export const PostList: React.FC<PostListProps> = ({
  posts,
  onPostPress,
  onRefresh,
  refreshing = false,
  emptyMessage = 'No posts found',
  showTimeField = 'suggestedTime',
  showStatus = false,
}) => {
  // Group posts by day
  const sections = useMemo<SectionData[]>(() => {
    const postsByDay: { [key: string]: Post[] } = {};
    
    posts.forEach(post => {
      const timeField = post[showTimeField];
      if (!timeField) return;
      
      const date = timeField instanceof Timestamp ? timeField.toDate() : new Date(timeField);
      const dateString = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      if (!postsByDay[dateString]) {
        postsByDay[dateString] = [];
      }
      postsByDay[dateString].push(post);
    });

    return Object.entries(postsByDay)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([title, data]) => ({
        title,
        data,
      }));
  }, [posts, showTimeField]);

  const renderPostItem = useCallback<ListRenderItem<Post>>(({ item }) => (
    <TouchableOpacity
      style={styles.postContainer}
      onPress={() => onPostPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.postHeader}>
        <View style={styles.postInfo}>
          <ThemedText style={styles.postTitle} numberOfLines={1}>
            {item.title}
          </ThemedText>
          {item[showTimeField] && (
            <ThemedText style={styles.postTime}>
              {formatDate(item[showTimeField])}
            </ThemedText>
          )}
        </View>
        {showStatus && (
          <View style={styles.statusContainer}>
            <Ionicons 
              name={getStatusIcon(item.status) as any} 
              size={16} 
              color={getStatusColor(item.status)} 
            />
          </View>
        )}
      </View>
      
      {item.content && (
        <ThemedText style={styles.postContent} numberOfLines={2}>
          {item.content}
        </ThemedText>
      )}
      
      {item.imageUrl && (
        <Image 
          source={{ uri: item.imageUrl }} 
          style={styles.postImage}
          resizeMode="cover"
        />
      )}
    </TouchableOpacity>
  ), [onPostPress, showTimeField, showStatus]);

  const renderSectionHeader = useCallback(({ section }: { section: SectionData }) => (
    <ThemedView style={styles.sectionHeader}>
      <ThemedText style={styles.sectionHeaderText}>
        {section.title}
      </ThemedText>
    </ThemedView>
  ), []);

  const renderEmpty = useCallback(() => (
    <ThemedView style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={48} color="#8E8E93" />
      <ThemedText style={styles.emptyText}>{emptyMessage}</ThemedText>
    </ThemedView>
  ), [emptyMessage]);

  const keyExtractor = useCallback((item: Post) => item.id, []);

  return (
    <SectionList
      sections={sections}
      keyExtractor={keyExtractor}
      renderItem={renderPostItem}
      renderSectionHeader={renderSectionHeader}
      ListEmptyComponent={renderEmpty}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        ) : undefined
      }
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      stickySectionHeadersEnabled={false}
    />
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  sectionHeader: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  postContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  postInfo: {
    flex: 1,
    marginRight: 8,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  postTime: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  statusContainer: {
    padding: 4,
  },
  postContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 12,
  },
}); 