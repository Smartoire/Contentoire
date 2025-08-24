import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Text } from 'react-native';
import { Search, RefreshCw, X } from 'lucide-react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PlatformSelector } from './PlatformSelector';

export type MediaType = 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'all';

interface NewsHeaderProps {
  onSearch: (query: string) => void;
  onRefresh: () => void;
  onKeywordChange: (keyword: string) => void;
  onMediaChange: (media: MediaType) => void;
  currentKeyword: string;
  currentMedia: MediaType;
  loading: boolean;
}

const KEYWORDS = ['All', 'Technology', 'Business', 'Entertainment', 'Sports', 'Health'];
const MEDIA_TYPES: { [key in MediaType]: { name: string; icon: keyof typeof MaterialCommunityIcons.glyphMap } } = {
  all: { name: 'All', icon: 'dots-grid' },
  twitter: { name: 'Twitter', icon: 'twitter' },
  facebook: { name: 'Facebook', icon: 'facebook' },
  instagram: { name: 'Instagram', icon: 'instagram' },
  linkedin: { name: 'LinkedIn', icon: 'linkedin' },
};

export const NewsHeader = ({
  onSearch,
  onRefresh,
  onKeywordChange,
  onMediaChange,
  currentKeyword,
  currentMedia,
  loading,
}: NewsHeaderProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showKeywordSelector, setShowKeywordSelector] = useState(false);
  const [showMediaSelector, setShowMediaSelector] = useState(false);

  const handleSearch = () => {
    onSearch(searchQuery);
    setShowSearch(false);
  };

  return (
    <View style={styles.container}>
      {showSearch ? (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search news..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            autoFocus
          />
          <TouchableOpacity onPress={() => setShowSearch(false)} style={styles.iconButton}>
            <X size={20} color="#666" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.headerRow}>
          <TouchableOpacity 
            style={styles.keywordButton}
            onPress={() => setShowKeywordSelector(!showKeywordSelector)}
          >
            <Text style={styles.keywordText}>{currentKeyword || 'Select Topic'}</Text>
          </TouchableOpacity>
          <View style={styles.iconsContainer}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => setShowMediaSelector(!showMediaSelector)}
            >
              <MaterialCommunityIcons 
                name={MEDIA_TYPES[currentMedia]?.icon || 'dots-grid'} 
                size={24} 
                color="#007AFF" 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => setShowSearch(true)}
            >
              <Search size={24} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.iconButton, loading && styles.refreshing]}
              onPress={onRefresh}
              disabled={loading}
            >
              <RefreshCw size={20} color={loading ? '#999' : '#007AFF'} />
            </TouchableOpacity>
          </View>
        </View>
      )}
      {showKeywordSelector && (
        <View style={styles.dropdown}>
          {KEYWORDS.map((keyword) => (
            <TouchableOpacity
              key={keyword}
              style={[
                styles.dropdownItem,
                currentKeyword === keyword && styles.dropdownItemSelected,
              ]}
              onPress={() => {
                onKeywordChange(keyword);
                setShowKeywordSelector(false);
              }}
            >
              <Text style={styles.dropdownItemText}>{keyword}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {showMediaSelector && (
        <View style={[styles.dropdown, styles.mediaDropdown]}>
          {Object.entries(MEDIA_TYPES).map(([key, { name, icon }]) => (
            <TouchableOpacity
              key={key}
              style={styles.mediaDropdownItem}
              onPress={() => {
                onMediaChange(key as MediaType);
                setShowMediaSelector(false);
              }}
            >
              <MaterialCommunityIcons 
                name={icon} 
                size={20} 
                color={currentMedia === key ? '#007AFF' : '#333'} 
              />
              <Text style={[
                styles.mediaDropdownText,
                currentMedia === key && styles.mediaDropdownTextSelected
              ]}>
                {name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  keywordButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 12,
  },
  keywordText: {
    fontWeight: '600',
    color: '#007AFF',
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  refreshing: {
    opacity: 0.6,
  },
  dropdown: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 1000,
    maxHeight: 300,
  },
  mediaDropdown: {
    left: 'auto',
    right: 16,
    width: 180,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemSelected: {
    backgroundColor: '#f8f8f8',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  mediaDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  mediaDropdownText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#666',
  },
  mediaDropdownTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    height: 40,
    padding: 0,
    marginRight: 8,
  },
});
