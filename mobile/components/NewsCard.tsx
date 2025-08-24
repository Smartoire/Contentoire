import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons, FontAwesome6 } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { NewsItem } from '@/types/news';

interface NewsItemWithStatus extends NewsItem {
  status: 'draft' | 'posted' | 'deleted';
  suggestedPublishTime?: string;
  media: {
    name: string;
    logo: string; // FontAwesome6 icon name
  };
}

interface NewsCardProps {
  news: NewsItemWithStatus;
  onDelete?: (id: string) => void;
  onSubmit?: (id: string) => void;
}

const SWIPE_THRESHOLD = 100;
const SWIPE_VELOCITY_THRESHOLD = 500;

export function NewsCard({ news, onDelete, onSubmit }: NewsCardProps) {
  const translateX = useSharedValue(0);
  const isSwiping = useSharedValue(false);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handlePress = () => {
    if (!isSwiping.value) {
      router.push({
        pathname: '/post-detail',
        params: { id: news.id },
      });
    }
  };

  const handleSwipeLeft = () => {
    translateX.value = withSpring(-SWIPE_THRESHOLD * 2, {
      velocity: 0.5,
      damping: 10,
    }, () => {
      runOnJS(handleSubmit)();
      translateX.value = withSpring(0);
    });
  };

  const handleSwipeRight = () => {
    translateX.value = withSpring(SWIPE_THRESHOLD * 2, {
      velocity: 0.5,
      damping: 10,
    }, () => {
      runOnJS(handleDelete)();
      translateX.value = withSpring(0);
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete?.(news.id)
        },
      ]
    );
  };

  const handleSubmit = () => {
    Alert.alert(
      'Submit Post',
      'Are you ready to submit this post?',
      [
        { text: 'Not Now', style: 'cancel' },
        {
          text: 'Submit',
          onPress: () => onSubmit?.(news.id)
        },
      ]
    );
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      isSwiping.value = true;
    })
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.velocityX > SWIPE_VELOCITY_THRESHOLD ||
        (e.translationX > SWIPE_THRESHOLD && Math.abs(e.velocityX) > 200)) {
        handleSwipeRight();
      } else if (e.velocityX < -SWIPE_VELOCITY_THRESHOLD ||
        (e.translationX < -SWIPE_THRESHOLD && Math.abs(e.velocityX) > 200)) {
        handleSwipeLeft();
      } else {
        translateX.value = withSpring(0, { damping: 10 });
      }
      isSwiping.value = false;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    backgroundColor: isSwiping.value ? '#F8F8F8' : '#FFFFFF',
  }));

  // Don't render if status is not draft
  if (news.status !== 'draft') {
    return null;
  }

  return (
    <View style={styles.swipeContainer}>
      {/* Delete action background */}
      <View style={[styles.actionButton, styles.deleteButton]}>
        <FontAwesome6 name="trash" size={20} color="white" />
      </View>

      {/* Submit action background */}
      <View style={[styles.actionButton, styles.submitButton]}>
        <FontAwesome6 name="paper-plane" size={20} color="white" />
      </View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, animatedStyle]}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title} numberOfLines={1}>
                {news.title}
              </Text>
              <FontAwesome6
                name={news.media.logo}
                size={20}
                color="#8E8E93"
                style={styles.mediaIcon}
              />
            </View>

            <Text style={styles.summary} numberOfLines={2}>
              {news.summary}
            </Text>

            <View style={styles.footer}>
              <Text style={styles.time}>
                {news.suggestedPublishTime ?
                  `Suggested: ${formatTime(news.suggestedPublishTime)}` :
                  'No suggested time'}
              </Text>
              <View style={styles.timeContainer}>
                <MaterialCommunityIcons name="clock-outline" size={14} color="#666" />
                <Text style={styles.time}>{formatTime(news.publishedAt)}</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  swipeContainer: {
    position: 'relative',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButton: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    right: 0,
    backgroundColor: '#FF3B30',
  },
  submitButton: {
    left: 0,
    backgroundColor: '#34C759',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginRight: 12,
  },
  mediaIcon: {
    width: 24,
    height: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  summary: {
    fontSize: 14,
    color: '#636366',
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  time: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
});