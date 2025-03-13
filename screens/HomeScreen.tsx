import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Platform,
  ActivityIndicator,
  RefreshControl,
  TextStyle
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';
import { useAuth } from '../store/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { BookService, BookListing, BookFilterOptions } from '../services/BookService';
import { SavedItemsService, SavedItemType } from '../services/SavedItemsService';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { FilterModal } from '../components/FilterModal';
import { BookCard } from '../components/BookCard';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

type TabType = 'all' | 'favorites' | 'wishlist';

export const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const [listings, setListings] = useState<BookListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<BookFilterOptions>({});
  const [filterCount, setFilterCount] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  
  // Calculate card width based on screen size
  const isTablet = width > 768;
  const numColumns = isTablet ? 2 : 1;

  const fetchListings = async (filters: BookFilterOptions = {}) => {
    try {
      setError(null);
      setIsLoading(true);
      
      let data: BookListing[] = [];
      
      // Fetch different data based on the active tab
      if (activeTab === 'favorites') {
        data = await SavedItemsService.getFavorites();
      } else if (activeTab === 'wishlist') {
        data = await SavedItemsService.getWishlist();
      } else {
        // Determine if we need to use the filtered endpoint
        const hasFilters = Object.keys(filters).length > 0 && 
          Object.values(filters).some(value => 
            (Array.isArray(value) && value.length > 0) || 
            (!Array.isArray(value) && value !== undefined)
          );
        
        if (hasFilters) {
          data = await BookService.getFilteredListings(filters);
        } else {
          data = await BookService.getListings();
        }
      }
      
      setListings(data);
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError('Failed to load listings. Please try again later.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchListings(activeTab === 'all' ? activeFilters : {});
  };

  const handleApplyFilters = (filters: BookFilterOptions) => {
    // Only apply filters in the "all" tab
    if (activeTab !== 'all') {
      setActiveTab('all');
    }
    
    setActiveFilters(filters);
    
    // Calculate filter count
    let count = 0;
    if (filters.categories && filters.categories.length > 0) count++;
    if (filters.conditions && filters.conditions.length > 0) count++;
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) count++;
    if (filters.isNegotiable !== undefined) count++;
    if (filters.exchangeOption !== undefined) count++;
    
    setFilterCount(count);
    fetchListings(filters);
  };
  
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    // Clear filters when switching tabs
    if (tab !== 'all') {
      setActiveFilters({});
      setFilterCount(0);
    }
    fetchListings(tab === 'all' ? activeFilters : {});
  };

  useEffect(() => {
    fetchListings(activeTab === 'all' ? activeFilters : {});
  }, [activeTab]);

  const navigateToListingDetail = (book: BookListing) => {
    navigation.navigate('ListingDetails', { id: book.id });
  };

  // Show loading indicator while fetching data
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading listings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Book Listings</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setIsFilterModalVisible(true)}
            >
              {filterCount > 0 ? (
                <View style={styles.filterBadgeContainer}>
                  <Ionicons name="options-outline" size={24} color={theme.colors.text} />
                  <View style={styles.filterBadge}>
                    <Text style={styles.filterBadgeText}>{filterCount}</Text>
                  </View>
                </View>
              ) : (
                <Ionicons name="options-outline" size={24} color={theme.colors.text} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.searchButton}>
              <Ionicons name="search-outline" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Tab selectors */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'all' && styles.activeTab]}
            onPress={() => handleTabChange('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
              All Books
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
            onPress={() => handleTabChange('favorites')}
          >
            <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>
              Favorites
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'wishlist' && styles.activeTab]}
            onPress={() => handleTabChange('wishlist')}
          >
            <Text style={[styles.tabText, activeTab === 'wishlist' && styles.activeTabText]}>
              Wishlist
            </Text>
          </TouchableOpacity>
        </View>
        
        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={40} color={theme.colors.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => fetchListings(activeTab === 'all' ? activeFilters : {})}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : listings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons 
              name={activeTab === 'favorites' ? "heart-outline" : activeTab === 'wishlist' ? "bookmark-outline" : "book-outline"} 
              size={60} 
              color={theme.colors.textSecondary} 
            />
            <Text style={styles.emptyText}>
              {activeTab === 'favorites' 
                ? 'No favorite books yet'
                : activeTab === 'wishlist'
                  ? 'Your wishlist is empty'
                  : filterCount > 0 
                    ? 'No books match your filters'
                    : 'No books listed yet'
              }
            </Text>
            {activeTab === 'all' && filterCount > 0 && (
              <TouchableOpacity 
                style={styles.clearFiltersButton}
                onPress={() => handleApplyFilters({})}
              >
                <Text style={styles.clearFiltersText}>Clear Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={listings}
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
      
      <FilterModal 
        visible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        onApply={handleApplyFilters}
        currentFilters={activeFilters}
      />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  errorText: {
    textAlign: 'center',
    marginVertical: theme.spacing.md,
    color: theme.colors.error,
  },
  retryButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
  },
  retryText: {
    color: '#fff',
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
  },
  clearFiltersButton: {
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  clearFiltersText: {
    color: '#fff',
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerTitle: {
    ...(theme.typography.h2 as TextStyle),
    color: theme.colors.text,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchButton: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
  filterButton: {
    padding: theme.spacing.xs,
  },
  filterBadgeContainer: {
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
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
  },
  activeTab: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: theme.colors.primary,
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