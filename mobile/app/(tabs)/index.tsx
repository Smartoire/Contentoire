import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RefreshCw } from 'lucide-react-native';
import { NewsHeader } from '@/components/NewsHeader';
import { NewsCard } from '@/components/NewsCard';
import { SearchInput } from '@/components/SearchInput';
import { newsService } from '@/services/newsService';
import { NewsItem, ScheduledPost } from '@/types/news';

type NewsItemWithStatus = NewsItem & {
  status: 'draft' | 'posted' | 'deleted';
  suggestedPublishTime?: string;
  media: {
    name: string;
    logo: string;
  };
};

export default function HomeScreen() {
  const [news, setNews] = useState<NewsItemWithStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('All');
  const [currentMedia, setCurrentMedia] = useState<'all' | 'twitter' | 'facebook' | 'instagram' | 'linkedin'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNews = async (keyword?: string, query?: string) => {
    try {
      setLoading(true);
      const searchTerm = query || keyword || searchKeyword;
      const articles = await newsService.fetchNewsByKeyword(searchTerm);
      
      // Transform articles to include required fields for NewsCard
      let transformedArticles: NewsItemWithStatus[] = articles.map(article => ({
        ...article,
        status: 'draft' as const,
        suggestedPublishTime: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        media: {
          name: 'Twitter',
          logo: 'twitter',
        },
      }));

      // Filter by media type if not 'all'
      if (currentMedia !== 'all') {
        transformedArticles = transformedArticles.filter(
          article => article.media.name.toLowerCase() === currentMedia
        );
      }
      
      setNews(transformedArticles);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch news articles');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNews().finally(() => setRefreshing(false));
  }, [searchKeyword, currentMedia, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    fetchNews(undefined, query);
  };

  const handleKeywordChange = (keyword: string) => {
    setSearchKeyword(keyword);
    setSearchQuery('');
    fetchNews(keyword, '');
  };

  const handleMediaChange = (media: 'all' | 'twitter' | 'facebook' | 'instagram' | 'linkedin') => {
    setCurrentMedia(media);
    fetchNews(searchKeyword, searchQuery);
  };

  return (
    <SafeAreaView style={styles.container}>
      <NewsHeader
        onSearch={handleSearch}
        onRefresh={onRefresh}
        onKeywordChange={handleKeywordChange}
        onMediaChange={handleMediaChange}
        currentKeyword={searchKeyword}
        currentMedia={currentMedia}
        loading={loading}
      />
      
      <FlatList
        data={news}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NewsCard 
            news={item} 
            onDelete={(id) => {
              // Filter out the deleted item
              setNews(prev => prev.filter(item => item.id !== id));
              // In a real app, you would also update the backend here
            }}
            onSubmit={(id) => {
              // Update the status to 'posted' in the local state
              setNews(prev => prev.map(item => 
                item.id === id ? { ...item, status: 'posted' } : item
              ));
              // In a real app, you would also update the backend here
            }}
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery || searchKeyword !== 'All' || currentMedia !== 'all'
                  ? 'No matching articles found. Try different filters.'
                  : 'No articles found. Pull to refresh.'}
              </Text>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
});