import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
  RefreshControl,
  TextStyle
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { BookListing } from '../services/BookService';
import { SavedItemsService, SavedItemType } from '../services/SavedItemsService';
import { theme } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { BookCard } from '../components/BookCard';
import { useFocusEffect } from '@react-navigation/native';

type SavedItemsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SavedItems'>;
};

type TabType = 'favorites' | 'wishlist';

export const SavedItemsScreen = ({ navigation }: SavedItemsScreenProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('favorites');
  const [items, setItems] = useState<BookListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { width } = useWindowDimensions();
  
  // Calculate card width based on screen size
  const isTablet = width > 768;
  const numColumns = isTablet ? 2 : 1;
  
  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const data = activeTab === 'favorites'
        ? await SavedItemsService.getFavorites()
        : await SavedItemsService.getWishlist();
      
      setItems(data);
    } catch (error) {
      console.error('Error fetching saved items:', error);
      Alert.alert('Error', 'Failed to load your saved items');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activeTab]);
  
  // Fetch data when tab changes
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);
  
  // Also fetch when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [fetchItems])
  );
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchItems();
  };
  
  const navigateToListingDetail = (book: BookListing) => {
    navigation.navigate('ListingDetails', { id: book.id });
  };
  
  if (isLoading && !isRefreshing) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading your saved items...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Saved Items</Text>
        </View>
        
        {/* Tab selectors */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
            onPress={() => setActiveTab('favorites')}
          >
            <Ionicons 
              name={activeTab === 'favorites' ? "heart" : "heart-outline"} 
              size={22} 
              color={activeTab === 'favorites' ? theme.colors.primary : theme.colors.textSecondary} 
            />
            <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>
              Favorites
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'wishlist' && styles.activeTab]}
            onPress={() => setActiveTab('wishlist')}
          >
            <Ionicons 
              name={activeTab === 'wishlist' ? "bookmark" : "bookmark-outline"} 
              size={22} 
              color={activeTab === 'wishlist' ? theme.colors.primary : theme.colors.textSecondary} 
            />
            <Text style={[styles.tabText, activeTab === 'wishlist' && styles.activeTabText]}>
              Wishlist
            </Text>
          </TouchableOpacity>
        </View>
        
        {items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons 
              name={activeTab === 'favorites' ? "heart-outline" : "bookmark-outline"} 
              size={60} 
              color={theme.colors.textSecondary} 
            />
            <Text style={styles.emptyText}>
              {activeTab === 'favorites' 
                ? 'No favorite books yet'
                : 'Your wishlist is empty'
              }
            </Text>
            <TouchableOpacity 
              style={styles.browseButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.browseButtonText}>Browse Books</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={items}
            renderItem={({ item }) => (
              <BookCard 
                book={item} 
                onPress={navigateToListingDetail}
                isTablet={isTablet}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            key={numColumns}
            numColumns={numColumns}
            columnWrapperStyle={isTablet ? styles.columnWrapper : undefined}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={[theme.colors.primary]}
                tintColor={theme.colors.primary}
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    ...(theme.typography.h2 as TextStyle),
    color: theme.colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.textSecondary,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginLeft: theme.spacing.xs,
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  emptyText: {
    marginTop: theme.spacing.md,
    color: theme.colors.textSecondary,
    fontSize: 16,
    marginBottom: theme.spacing.md,
  },
  browseButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  browseButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  listContainer: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl * 2, // Extra padding at bottom for tab bar
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
}); 