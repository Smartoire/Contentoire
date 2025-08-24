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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TextInput } from '@/components/TextInput';
import { PlatformSelector } from '@/components/PlatformSelector';
import { DateTimeSelector } from '@/components/DateTimeSelector';

export default function ScheduleScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isScheduling, setIsScheduling] = useState(false);

  const isFormValid = title.trim() && content.trim() && selectedPlatform;

  const handleSchedulePost = async () => {
    if (!isFormValid) return;

    setIsScheduling(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        'Success!',
        `Post scheduled for ${selectedPlatform} on ${selectedDate.toLocaleDateString()}`,
        [{ text: 'OK', onPress: () => resetForm() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to schedule post. Please try again.');
    } finally {
      setIsScheduling(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setSelectedPlatform('');
    setSelectedDate(new Date());
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Schedule Post</Text>
          <Text style={styles.subtitle}>
            Create and schedule your social media post
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Post Title"
            value={title}
            onChangeText={setTitle}
            placeholder="Enter your post title..."
            maxLength={100}
          />

          <TextInput
            label="Post Content"
            value={content}
            onChangeText={setContent}
            placeholder="Write your post content..."
            multiline
            numberOfLines={6}
            maxLength={280}
          />

          <PlatformSelector
            selectedPlatform={selectedPlatform}
            onSelect={setSelectedPlatform}
          />

          <DateTimeSelector
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.scheduleButton,
            !isFormValid && styles.scheduleButtonDisabled,
          ]}
          onPress={handleSchedulePost}
          disabled={!isFormValid || isScheduling}
        >
          <MaterialCommunityIcons name="calendar" size={20} color="#8E8E93" />
          <Text style={styles.scheduleButtonText}>
            {isScheduling ? 'Scheduling...' : 'Schedule Post'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 22,
  },
  form: {
    gap: 24,
  },
  scheduleButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 32,
    gap: 8,
    minHeight: 44,
  },
  scheduleButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  scheduleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});