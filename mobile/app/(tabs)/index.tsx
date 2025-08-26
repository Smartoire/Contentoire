import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StatusBar,
  ActivityIndicator,
  Platform,
  Animated,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NewsHeader } from "@/components/NewsHeader";
import { NewsCard } from "@/components/NewsCard";
import { newsService } from "@/services/newsService";
import { NewsItem } from "@/types/news";
import { theme, isDarkMode, colors } from "@/constants/theme";
import { scale, verticalScale } from "@/utils/styling";

const { width } = Dimensions.get("window");

type NewsItemWithStatus = NewsItem & {
  id: string;
  status: "draft" | "posted" | "deleted";
  suggestedPublishTime?: string;
  media: {
    name: string;
    logo: string;
  };
};

type MediaType = "all" | "twitter" | "facebook" | "instagram" | "linkedin";

const AnimatedFlatList = Animated.createAnimatedComponent(
  FlatList
) as React.ComponentType<
  React.ComponentProps<typeof FlatList<NewsItemWithStatus>>
>;

export default function HomeScreen() {
  // Theme and state
  const colors = theme.colors;
  const [news, setNews] = useState<NewsItemWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("All");
  const [currentMedia, setCurrentMedia] = useState<
    "all" | "twitter" | "facebook" | "instagram" | "linkedin"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -50],
    extrapolate: "clamp" as const,
  });

  const fetchNews = useCallback(
    async (keyword?: string, query?: string) => {
      try {
        setLoading(true);
        const searchTerm = query || keyword || searchKeyword;
        const articles = await newsService.fetchNewsByKeyword(searchTerm);

        // Transform articles to include required fields for NewsCard
        let transformedArticles: NewsItemWithStatus[] = articles.map(
          (article) => ({
            ...article,
            status: "draft" as const,
            suggestedPublishTime: new Date(
              Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000
            ).toISOString(),
            media: {
              name: "Twitter",
              logo: "twitter",
            },
          })
        );

        // Filter by media type if not 'all'
        if (currentMedia !== "all") {
          transformedArticles = transformedArticles.filter(
            (article) => article.media.name.toLowerCase() === currentMedia
          );
        }

        setNews(transformedArticles);
      } catch (error) {
        console.error("Error fetching news:", error);
        Alert.alert("Error", "Failed to fetch news articles");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currentMedia, searchKeyword, searchQuery]
  ); // Added searchQuery to dependencies

  // Initial data fetch and refetch when filters change
  useEffect(() => {
    const loadData = async () => {
      await fetchNews();
    };

    loadData();
  }, [fetchNews]);

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
    setSearchQuery("");
    fetchNews(keyword, "");
  };

  const handleMediaChange = (
    media: "all" | "twitter" | "facebook" | "instagram" | "linkedin"
  ) => {
    setCurrentMedia(media);
    fetchNews(searchKeyword, searchQuery);
  };

  // News item container style with animation
  const newsItemContainerStyle = {
    opacity: scrollY.interpolate({
      inputRange: [0, 100, 200],
      outputRange: [1, 0.9, 0.8],
      extrapolate: "clamp" as const,
    }),
    transform: [
      {
        scale: scrollY.interpolate({
          inputRange: [-1, 0, 100, 200],
          outputRange: [1, 1, 0.98, 0.97],
          extrapolate: "clamp" as const,
        }),
      },
    ],
  };

  // Memoize the empty component
  const emptyComponent = useMemo(() => {
    if (loading) return null;

    return (
      <View
        style={[styles.emptyContainer, { backgroundColor: colors.background }]}
      >
        <MaterialCommunityIcons
          name={
            searchQuery || searchKeyword !== "All" || currentMedia !== "all"
              ? "magnify"
              : "newspaper"
          }
          size={scale(60)}
          color={colors.textSecondary}
          style={{ opacity: 0.7 }}
        />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          {searchQuery || searchKeyword !== "All" || currentMedia !== "all"
            ? "No matching articles found.\nTry different keywords or filters."
            : "No articles found.\nPull down to refresh."}
        </Text>
        {!searchQuery && searchKeyword === "All" && currentMedia === "all" && (
          <TouchableOpacity
            style={[styles.refreshButton, { backgroundColor: colors.primary }]}
            onPress={onRefresh}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="refresh"
              size={scale(16)}
              color="white"
            />
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [
    loading,
    searchQuery,
    searchKeyword,
    currentMedia,
    colors.background,
    colors.primary,
    colors.textSecondary,
    onRefresh,
  ]);

  return (
    <SafeAreaView style={[styles.container]}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
        translucent={false}
      />

      <Animated.View
        style={[
          styles.headerContainer,
          {
            backgroundColor: colors.background,
            transform: [{ translateY: headerTranslateY }],
            borderBottomColor: colors.border,
          },
        ]}
      >
        <NewsHeader
          onSearch={handleSearch}
          onRefresh={onRefresh}
          onKeywordChange={handleKeywordChange}
          onMediaChange={handleMediaChange}
          currentKeyword={searchKeyword}
          currentMedia={currentMedia}
          loading={loading}
        />
      </Animated.View>

      {loading && news.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading articles...
          </Text>
        </View>
      ) : (
        <AnimatedFlatList
          data={news}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.newsItemContainer}>
              <NewsCard
                news={item}
                onDelete={(id: string) => {
                  setNews((prev) => prev.filter((item) => item.id !== id));
                }}
                onSubmit={(id: string) => {
                  setNews((prev) =>
                    prev.map((item) =>
                      item.id === id
                        ? { ...item, status: "posted" as const }
                        : item
                    )
                  );
                }}
              />
            </View>
          )}
          ListEmptyComponent={emptyComponent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
              progressBackgroundColor={colors.background}
              title="Refreshing..."
              titleColor={colors.text}
            />
          }
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListFooterComponent={
            news.length > 0 ? (
              <View style={styles.footer}>
                <Text
                  style={[styles.footerText, { color: colors.textSecondary }]}
                >
                  {`${news.length} ${news.length === 1 ? "article" : "articles"} found`}
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: Platform.OS === "ios" ? 0 : verticalScale(10),
    paddingBottom: verticalScale(10),
    borderBottomWidth: StyleSheet.hairlineWidth,
    zIndex: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(24),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: verticalScale(12),
    fontSize: scale(14),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: scale(20),
    marginTop: verticalScale(40),
  },
  emptyText: {
    fontSize: scale(16),
    textAlign: "center",
    marginTop: verticalScale(16),
    lineHeight: scale(24),
    opacity: 0.8,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: scale(10),
    paddingHorizontal: scale(20),
    borderRadius: scale(20),
    marginTop: verticalScale(20),
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  refreshButtonText: {
    fontSize: scale(14),
    color: colors.primary,
    marginLeft: scale(8),
  },
  emptyTitle: {
    fontSize: scale(20),
    fontWeight: "600",
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  newsItemContainer: {
    marginBottom: 16,
    opacity: 1,
    transform: [{ scale: 1 }],
  },
  separator: {
    height: 16,
    backgroundColor: "transparent",
  },
  footer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  footerText: {
    fontSize: scale(14),
    color: colors.textSecondary,
    opacity: 0.7,
  },
  emptySubtitle: {
    fontSize: scale(14),
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 32,
    lineHeight: 20,
  },
});
