import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextStyle,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { BookListing } from '../services/BookService';
import { SavedItemsService, SavedItemType } from '../services/SavedItemsService';
import { isAuthenticated } from '../utils/auth';

interface BookCardProps {
  book: BookListing;
  onPress: (book: BookListing) => void;
  isTablet?: boolean;
}

export const BookCard = ({ book, onPress, isTablet = false }: BookCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWishlist, setIsWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState({ favorite: false, wishlist: false });
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      setIsUserLoggedIn(authenticated);
    };
    
    checkAuth();
  }, []);

  // Fetch initial state
  useEffect(() => {
    if (!isUserLoggedIn) return;
    
    const fetchSavedStatus = async () => {
      try {
        const [favoriteStatus, wishlistStatus] = await Promise.all([
          SavedItemsService.isSavedItem(book.id, SavedItemType.FAVORITE),
          SavedItemsService.isSavedItem(book.id, SavedItemType.WISHLIST)
        ]);
        
        setIsFavorite(favoriteStatus);
        setIsWishlist(wishlistStatus);
      } catch (error) {
        console.error('Error fetching saved status:', error);
        // Don't show an alert for this error since it's just loading state
      }
    };
    
    fetchSavedStatus();
  }, [book.id, isUserLoggedIn]);

  const handleToggleFavorite = async () => {
    if (!isUserLoggedIn) {
      Alert.alert(
        'Login Required',
        'Please log in to save items to your favorites.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    try {
      setIsLoading(prev => ({ ...prev, favorite: true }));
      const newStatus = await SavedItemsService.toggleSavedItem(book.id, SavedItemType.FAVORITE);
      setIsFavorite(newStatus);
    } catch (error) {
      // Only show an alert if this isn't a "table doesn't exist" error that's being handled
      if (!(error instanceof Error && error.message.includes('saved_items'))) {
        Alert.alert('Error', 'Failed to update favorites');
      }
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, favorite: false }));
    }
  };

  const handleToggleWishlist = async () => {
    if (!isUserLoggedIn) {
      Alert.alert(
        'Login Required',
        'Please log in to add items to your wishlist.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    try {
      setIsLoading(prev => ({ ...prev, wishlist: true }));
      const newStatus = await SavedItemsService.toggleSavedItem(book.id, SavedItemType.WISHLIST);
      setIsWishlist(newStatus);
    } catch (error) {
      // Only show an alert if this isn't a "table doesn't exist" error that's being handled
      if (!(error instanceof Error && error.message.includes('saved_items'))) {
        Alert.alert('Error', 'Failed to update wishlist');
      }
      console.error('Error toggling wishlist:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, wishlist: false }));
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.bookCard,
        isTablet && styles.tabletBookCard
      ]}
      activeOpacity={0.7}
      onPress={() => onPress(book)}
    >
      {/* Book image */}
      <Image 
        source={{ uri: book.image_url || 'https://source.unsplash.com/random/200x300/?book' }} 
        style={styles.bookImage} 
        resizeMode="cover"
      />
      
      {/* Wishlist and Favorite buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, isWishlist && styles.activeActionButton]}
          onPress={handleToggleWishlist}
          disabled={isLoading.wishlist}
        >
          <Ionicons 
            name={isWishlist ? "bookmark" : "bookmark-outline"} 
            size={20} 
            color={isWishlist ? theme.colors.white : theme.colors.text} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, isFavorite && styles.activeActionButton]}
          onPress={handleToggleFavorite}
          disabled={isLoading.favorite}
        >
          <Ionicons 
            name={isFavorite ? "heart" : "heart-outline"} 
            size={20} 
            color={isFavorite ? theme.colors.white : theme.colors.text} 
          />
        </TouchableOpacity>
      </View>
      
      {/* Book details */}
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={1}>
          {book.title}
        </Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>
          {book.author}
        </Text>
        <View style={styles.bookDetails}>
          <Text style={styles.bookPrice}>${book.price.toFixed(2)}</Text>
          <Text style={styles.bookCondition}>{book.condition}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  bookCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
    flex: 1,
    position: 'relative',
  },
  tabletBookCard: {
    marginHorizontal: theme.spacing.sm,
    maxWidth: '48%',
  },
  bookImage: {
    width: 100,
    height: 150,
  },
  actionButtons: {
    position: 'absolute',
    top: theme.spacing.xs,
    right: theme.spacing.xs,
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 10,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  activeActionButton: {
    backgroundColor: theme.colors.primary,
  },
  bookInfo: {
    flex: 1,
    padding: theme.spacing.md,
    justifyContent: 'space-between',
  },
  bookTitle: {
    ...(theme.typography.h2 as TextStyle),
    fontSize: 18,
    marginBottom: theme.spacing.xs,
  },
  bookAuthor: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  bookDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  bookPrice: {
    ...(theme.typography.body as TextStyle),
    fontWeight: '700',
    color: theme.colors.primary,
  },
  bookCondition: {
    ...(theme.typography.caption as TextStyle),
    backgroundColor: theme.colors.secondary,
    color: '#fff',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.sm,
  },
}); 