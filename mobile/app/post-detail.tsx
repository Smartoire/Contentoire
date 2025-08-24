import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function PostDetailScreen() {
  const params = useLocalSearchParams();
  const [isScheduling, setIsScheduling] = useState(false);

  // Mock data - in real app, this would come from props or API
  const post = {
    id: params.id || '1',
    title: 'Revolutionary AI Technology Transforms Digital Marketing Landscape',
    summary: 'Recent breakthroughs in artificial intelligence are reshaping how businesses approach digital marketing, with new tools offering unprecedented personalization and efficiency gains.',
    content: 'In a groundbreaking development for the digital marketing industry, researchers have unveiled a new AI-powered platform that promises to revolutionize how businesses connect with their customers. The technology leverages advanced machine learning algorithms to analyze consumer behavior patterns and deliver highly personalized content experiences.\n\nThe platform has already shown remarkable results in beta testing, with participating companies reporting up to 40% increases in engagement rates and 25% improvements in conversion metrics. Industry experts predict this could mark the beginning of a new era in digital marketing.',
    source: 'TechCrunch',
    publishedAt: '2025-01-20T10:30:00Z',
    url: 'https://example.com/article',
  };

  const handleSchedulePost = () => {
    setIsScheduling(true);
    setTimeout(() => {
      setIsScheduling(false);
      router.push({
        pathname: '/(tabs)/schedule',
        params: {
          title: post.title,
          content: post.summary,
        },
      });
    }, 500);
  };

  const handleShare = () => {
    Alert.alert('Share', 'Share functionality coming soon!');
  };

  const handleOpenSource = () => {
    Alert.alert('Open Link', 'External link functionality coming soon!');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Article Details</Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <MaterialCommunityIcons name="share-variant" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.article}>
          <Text style={styles.title}>{post.title}</Text>
          
          <View style={styles.meta}>
            <Text style={styles.source}>{post.source}</Text>
            <Text style={styles.date}>{formatDate(post.publishedAt)}</Text>
          </View>

          <Text style={styles.summary}>{post.summary}</Text>
          
          <Text style={styles.content}>{post.content}</Text>

          <TouchableOpacity style={styles.sourceLink} onPress={handleOpenSource}>
            <MaterialCommunityIcons name="open-in-new" size={20} color="#007AFF" />
            <Text style={styles.sourceLinkText}>Read Full Article</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.scheduleButton}
          onPress={handleSchedulePost}
          disabled={isScheduling}
        >
          <MaterialCommunityIcons name="calendar" size={20} color="#FFFFFF" />
          <Text style={styles.scheduleButtonText}>
            {isScheduling ? 'Loading...' : 'Schedule Post'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  shareButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  article: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 30,
    marginBottom: 16,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  source: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  date: {
    fontSize: 14,
    color: '#8E8E93',
  },
  summary: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 20,
    fontWeight: '500',
  },
  content: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 20,
  },
  sourceLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sourceLinkText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  bottomActions: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  scheduleButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    minHeight: 44,
  },
  scheduleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});