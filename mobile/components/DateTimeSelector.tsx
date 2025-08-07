import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Calendar, Clock } from 'lucide-react-native';

interface DateTimeSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function DateTimeSelector({ selectedDate, onDateChange }: DateTimeSelectorProps) {
  const handleDatePress = () => {
    Alert.alert('Date Picker', 'Date picker functionality coming soon!');
  };

  const handleTimePress = () => {
    Alert.alert('Time Picker', 'Time picker functionality coming soon!');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Schedule Date & Time</Text>
      
      <View style={styles.selectorRow}>
        <TouchableOpacity style={styles.selectorButton} onPress={handleDatePress}>
          <Calendar size={20} color="#007AFF" strokeWidth={2} />
          <View style={styles.selectorContent}>
            <Text style={styles.selectorLabel}>Date</Text>
            <Text style={styles.selectorValue}>{formatDate(selectedDate)}</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.selectorButton} onPress={handleTimePress}>
          <Clock size={20} color="#007AFF" strokeWidth={2} />
          <View style={styles.selectorContent}>
            <Text style={styles.selectorLabel}>Time</Text>
            <Text style={styles.selectorValue}>{formatTime(selectedDate)}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  selectorRow: {
    gap: 12,
  },
  selectorButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    minHeight: 44,
  },
  selectorContent: {
    flex: 1,
  },
  selectorLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 2,
  },
  selectorValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
});