import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import type { Post } from '@/hooks/usePosts';
import { Ionicons } from '@expo/vector-icons';
import { Timestamp } from 'firebase/firestore';
import React, { useCallback, useMemo } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

interface CalendarProps {
  posts: Post[];
  onDayPress: (date: Date) => void;
  onPostPress: (post: Post) => void;
  selectedDate?: Date;
}

const { width } = Dimensions.get('window');
const DAY_WIDTH = (width - 32) / 7;

const getDaysInMonth = (year: number, month: number): Date[] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];
  
  // Add days from previous month to fill first week
  const firstDayOfWeek = firstDay.getDay();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i));
  }
  
  // Add days of current month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    days.push(new Date(year, month, day));
  }
  
  // Add days from next month to fill last week
  const lastDayOfWeek = lastDay.getDay();
  for (let day = 1; day <= 6 - lastDayOfWeek; day++) {
    days.push(new Date(year, month + 1, day));
  }
  
  return days;
};

const getPostsForDate = (posts: Post[], date: Date): Post[] => {
  return posts.filter(post => {
    const postDate = post.scheduledTime || post.suggestedTime;
    if (!postDate) return false;
    
    const postDateTime = postDate instanceof Timestamp ? postDate.toDate() : new Date(postDate);
    return (
      postDateTime.getFullYear() === date.getFullYear() &&
      postDateTime.getMonth() === date.getMonth() &&
      postDateTime.getDate() === date.getDate()
    );
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

export const Calendar: React.FC<CalendarProps> = ({
  posts,
  onDayPress,
  onPostPress,
  selectedDate = new Date(),
}) => {
  const currentDate = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const days = useMemo(() => {
    return getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  }, [currentMonth]);

  const monthName = useMemo(() => {
    return currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [currentMonth]);

  const postsByDate = useMemo(() => {
    const postsMap: { [key: string]: Post[] } = {};
    days.forEach(day => {
      const key = day.toISOString().split('T')[0];
      postsMap[key] = getPostsForDate(posts, day);
    });
    return postsMap;
  }, [posts, days]);

  const handlePreviousMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const handleDayPress = useCallback((date: Date) => {
    onDayPress(date);
  }, [onDayPress]);

  const renderDay = useCallback((date: Date, index: number) => {
    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
    const isToday = date.toDateString() === currentDate.toDateString();
    const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
    
    const dateKey = date.toISOString().split('T')[0];
    const dayPosts = postsByDate[dateKey] || [];
    
    const hasWaitingPosts = dayPosts.some(post => post.status === 'waiting');
    const hasScheduledPosts = dayPosts.some(post => post.status === 'scheduled');
    const hasPostedPosts = dayPosts.some(post => post.status === 'posted');

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.day,
          !isCurrentMonth && styles.otherMonthDay,
          isToday && styles.today,
          isSelected && styles.selectedDay,
        ]}
        onPress={() => handleDayPress(date)}
      >
        <ThemedText style={[
          styles.dayText,
          !isCurrentMonth && styles.otherMonthText,
          isToday && styles.todayText,
          isSelected && styles.selectedDayText,
        ]}>
          {date.getDate()}
        </ThemedText>
        
        {dayPosts.length > 0 && (
          <View style={styles.postIndicators}>
            {hasWaitingPosts && (
              <View style={[styles.indicator, { backgroundColor: '#FF9500' }]} />
            )}
            {hasScheduledPosts && (
              <View style={[styles.indicator, { backgroundColor: '#007AFF' }]} />
            )}
            {hasPostedPosts && (
              <View style={[styles.indicator, { backgroundColor: '#34C759' }]} />
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  }, [currentMonth, currentDate, selectedDate, postsByDate, handleDayPress]);

  const renderSelectedDatePosts = useCallback(() => {
    if (!selectedDate) return null;
    
    const dateKey = selectedDate.toISOString().split('T')[0];
    const dayPosts = postsByDate[dateKey] || [];
    
    if (dayPosts.length === 0) return null;

    return (
      <View style={styles.selectedDateContainer}>
        <ThemedText style={styles.selectedDateTitle}>
          {selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </ThemedText>
        <ScrollView style={styles.postsList} showsVerticalScrollIndicator={false}>
          {dayPosts.map(post => (
            <TouchableOpacity
              key={post.id}
              style={styles.postItem}
              onPress={() => onPostPress(post)}
            >
              <View style={styles.postHeader}>
                <ThemedText style={styles.postTitle} numberOfLines={1}>
                  {post.title}
                </ThemedText>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(post.status) }]}>
                  <ThemedText style={styles.statusText}>
                    {post.status}
                  </ThemedText>
                </View>
              </View>
              {post.content && (
                <ThemedText style={styles.postContent} numberOfLines={2}>
                  {post.content}
                </ThemedText>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }, [selectedDate, postsByDate, onPostPress]);

  return (
    <ThemedView style={styles.container}>
      {/* Calendar Header */}
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={handlePreviousMonth} style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        
        <ThemedText style={styles.monthTitle}>{monthName}</ThemedText>
        
        <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Weekday Headers */}
      <View style={styles.weekdayHeader}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <View key={day} style={styles.weekday}>
            <ThemedText style={styles.weekdayText}>{day}</ThemedText>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {days.map((day, index) => renderDay(day, index))}
      </View>

      {/* Selected Date Posts */}
      {renderSelectedDatePosts()}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  navButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  weekdayHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  weekday: {
    width: DAY_WIDTH,
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  day: {
    width: DAY_WIDTH,
    height: DAY_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: DAY_WIDTH / 2,
    marginVertical: 2,
  },
  otherMonthDay: {
    opacity: 0.3,
  },
  today: {
    backgroundColor: '#007AFF',
  },
  selectedDay: {
    backgroundColor: '#34C759',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  otherMonthText: {
    color: '#999',
  },
  todayText: {
    color: '#fff',
    fontWeight: '600',
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: '600',
  },
  postIndicators: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 4,
    gap: 2,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  selectedDateContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  selectedDateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  postsList: {
    maxHeight: 200,
  },
  postItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  postTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
  },
  postContent: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
}); 