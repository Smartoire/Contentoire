import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

interface PlatformSelectorProps {
  selectedPlatform: string;
  onSelect: (platform: string) => void;
}

const platforms = [
  { id: 'twitter', name: 'Twitter', color: '#1DA1F2' },
  { id: 'facebook', name: 'Facebook', color: '#1877F2' },
  { id: 'linkedin', name: 'LinkedIn', color: '#0A66C2' },
  { id: 'instagram', name: 'Instagram', color: '#E4405F' },
];

export function PlatformSelector({ selectedPlatform, onSelect }: PlatformSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Platform</Text>
      <View style={styles.platformGrid}>
        {platforms.map((platform) => (
          <TouchableOpacity
            key={platform.id}
            style={[
              styles.platformButton,
              selectedPlatform === platform.id && styles.selectedPlatform,
              { borderColor: platform.color },
            ]}
            onPress={() => onSelect(platform.id)}
          >
            <View
              style={[
                styles.platformIndicator,
                { backgroundColor: platform.color },
                selectedPlatform === platform.id && styles.selectedIndicator,
              ]}
            />
            <Text
              style={[
                styles.platformName,
                selectedPlatform === platform.id && styles.selectedText,
              ]}
            >
              {platform.name}
            </Text>
          </TouchableOpacity>
        ))}
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
  platformGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  platformButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: '45%',
    gap: 8,
  },
  selectedPlatform: {
    backgroundColor: '#F0F8FF',
  },
  platformIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  selectedIndicator: {
    transform: [{ scale: 1.2 }],
  },
  platformName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  selectedText: {
    fontWeight: '600',
  },
});