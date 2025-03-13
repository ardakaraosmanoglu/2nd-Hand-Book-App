import { supabase } from '../config/supabase';
import { BookListing, BookService } from './BookService';
import { getUserId } from '../utils/auth';

// If true, we'll use mock data for saved items
// We'll also dynamically fall back to mock data if we detect the saved_items table doesn't exist
const USE_MOCK_DATA = false;

// Flag to track if we've detected the saved_items table is missing
let DETECTED_MISSING_TABLE = false;

// In-memory mock storage for development
let mockFavorites: Record<string, string[]> = {};
let mockWishlist: Record<string, string[]> = {};

export enum SavedItemType {
  FAVORITE = 'favorite',
  WISHLIST = 'wishlist'
}

export interface SavedItem {
  id: string;
  user_id: string;
  book_id: string;
  type: SavedItemType;
  created_at: string;
}

// Helper function to check if an error is "table does not exist"
function isTableNotExistError(error: any): boolean {
  return error && error.code === '42P01'; // PostgreSQL error code for "relation does not exist"
}

export const SavedItemsService = {
  /**
   * Add an item to favorites or wishlist
   */
  async addSavedItem(bookId: string, type: SavedItemType): Promise<void> {
    const userId = await getUserId();
    
    if (!userId) {
      throw new Error('User must be logged in to save items');
    }
    
    if (USE_MOCK_DATA || DETECTED_MISSING_TABLE) {
      return new Promise(resolve => {
        setTimeout(() => {
          if (type === SavedItemType.FAVORITE) {
            mockFavorites[userId] = mockFavorites[userId] || [];
            if (!mockFavorites[userId].includes(bookId)) {
              mockFavorites[userId].push(bookId);
            }
          } else {
            mockWishlist[userId] = mockWishlist[userId] || [];
            if (!mockWishlist[userId].includes(bookId)) {
              mockWishlist[userId].push(bookId);
            }
          }
          console.log(`Added ${type} for book ${bookId}`);
          resolve();
        }, 300);
      });
    }
    
    try {
      const { error } = await supabase
        .from('saved_items')
        .upsert({
          user_id: userId,
          book_id: bookId,
          type,
          created_at: new Date().toISOString()
        });
        
      if (error) {
        if (isTableNotExistError(error)) {
          console.warn('saved_items table does not exist, falling back to mock data');
          DETECTED_MISSING_TABLE = true;
          return this.addSavedItem(bookId, type);
        }
        throw error;
      }
    } catch (error) {
      console.error(`Error adding ${type}:`, error);
      
      // Fall back to mock data if table doesn't exist
      if (isTableNotExistError(error)) {
        console.warn('saved_items table does not exist, falling back to mock data');
        DETECTED_MISSING_TABLE = true;
        return this.addSavedItem(bookId, type);
      }
      
      throw error;
    }
  },
  
  /**
   * Remove an item from favorites or wishlist
   */
  async removeSavedItem(bookId: string, type: SavedItemType): Promise<void> {
    const userId = await getUserId();
    
    if (!userId) {
      throw new Error('User must be logged in to remove saved items');
    }
    
    if (USE_MOCK_DATA || DETECTED_MISSING_TABLE) {
      return new Promise(resolve => {
        setTimeout(() => {
          if (type === SavedItemType.FAVORITE) {
            mockFavorites[userId] = (mockFavorites[userId] || []).filter(id => id !== bookId);
          } else {
            mockWishlist[userId] = (mockWishlist[userId] || []).filter(id => id !== bookId);
          }
          console.log(`Removed ${type} for book ${bookId}`);
          resolve();
        }, 300);
      });
    }
    
    try {
      const { error } = await supabase
        .from('saved_items')
        .delete()
        .match({ user_id: userId, book_id: bookId, type });
        
      if (error) {
        if (isTableNotExistError(error)) {
          console.warn('saved_items table does not exist, falling back to mock data');
          DETECTED_MISSING_TABLE = true;
          return this.removeSavedItem(bookId, type);
        }
        throw error;
      }
    } catch (error) {
      console.error(`Error removing ${type}:`, error);
      
      // Fall back to mock data if table doesn't exist
      if (isTableNotExistError(error)) {
        console.warn('saved_items table does not exist, falling back to mock data');
        DETECTED_MISSING_TABLE = true;
        return this.removeSavedItem(bookId, type);
      }
      
      throw error;
    }
  },
  
  /**
   * Check if an item is in favorites or wishlist
   */
  async isSavedItem(bookId: string, type: SavedItemType): Promise<boolean> {
    const userId = await getUserId();
    
    if (!userId) {
      return false;
    }
    
    if (USE_MOCK_DATA || DETECTED_MISSING_TABLE) {
      return new Promise(resolve => {
        setTimeout(() => {
          if (type === SavedItemType.FAVORITE) {
            const isFavorite = (mockFavorites[userId] || []).includes(bookId);
            resolve(isFavorite);
          } else {
            const isWishlist = (mockWishlist[userId] || []).includes(bookId);
            resolve(isWishlist);
          }
        }, 200);
      });
    }
    
    try {
      const { data, error } = await supabase
        .from('saved_items')
        .select('id')
        .match({ user_id: userId, book_id: bookId, type })
        .single();
        
      if (error) {
        if (error.code !== 'PGRST116') { // PGRST116 is "row not found" - not an error in this case
          if (isTableNotExistError(error)) {
            console.warn('saved_items table does not exist, falling back to mock data');
            DETECTED_MISSING_TABLE = true;
            return this.isSavedItem(bookId, type);
          }
          throw error;
        }
      }
      
      return !!data;
    } catch (error) {
      console.error(`Error checking if item is ${type}:`, error);
      
      // Fall back to mock data if table doesn't exist
      if (isTableNotExistError(error)) {
        console.warn('saved_items table does not exist, falling back to mock data');
        DETECTED_MISSING_TABLE = true;
        return this.isSavedItem(bookId, type);
      }
      
      return false;
    }
  },
  
  /**
   * Toggle an item's saved status (add if not saved, remove if saved)
   */
  async toggleSavedItem(bookId: string, type: SavedItemType): Promise<boolean> {
    const isSaved = await this.isSavedItem(bookId, type);
    
    if (isSaved) {
      await this.removeSavedItem(bookId, type);
      return false;
    } else {
      await this.addSavedItem(bookId, type);
      return true;
    }
  },
  
  /**
   * Get all saved items by type
   */
  async getSavedItems(type: SavedItemType): Promise<BookListing[]> {
    const userId = await getUserId();
    
    if (!userId) {
      return [];
    }
    
    if (USE_MOCK_DATA || DETECTED_MISSING_TABLE) {
      return new Promise(async (resolve) => {
        setTimeout(async () => {
          // Get all books from BookService
          const allBooks = await BookService.getListings();
          
          // Filter by saved IDs
          const savedIds = type === SavedItemType.FAVORITE 
            ? (mockFavorites[userId] || [])
            : (mockWishlist[userId] || []);
          
          const savedBooks = allBooks.filter(book => savedIds.includes(book.id));
          console.log(`Found ${savedBooks.length} ${type} books for user ${userId}`);
          
          resolve(savedBooks);
        }, 500);
      });
    }
    
    try {
      const { data, error } = await supabase
        .from('saved_items')
        .select('book_id')
        .match({ user_id: userId, type });
        
      if (error) {
        if (isTableNotExistError(error)) {
          console.warn('saved_items table does not exist, falling back to mock data');
          DETECTED_MISSING_TABLE = true;
          return this.getSavedItems(type);
        }
        throw error;
      }
      
      if (!data || data.length === 0) {
        return [];
      }
      
      const bookIds = data.map(item => item.book_id);
      
      const { data: books, error: booksError } = await supabase
        .from('book_listings')
        .select('*')
        .in('id', bookIds);
        
      if (booksError) {
        throw booksError;
      }
      
      return books || [];
    } catch (error) {
      console.error(`Error fetching ${type} items:`, error);
      
      // Fall back to mock data if table doesn't exist
      if (isTableNotExistError(error)) {
        console.warn('saved_items table does not exist, falling back to mock data');
        DETECTED_MISSING_TABLE = true;
        return this.getSavedItems(type);
      }
      
      return [];
    }
  },
  
  /**
   * Get favorites
   */
  async getFavorites(): Promise<BookListing[]> {
    return this.getSavedItems(SavedItemType.FAVORITE);
  },
  
  /**
   * Get wishlist
   */
  async getWishlist(): Promise<BookListing[]> {
    return this.getSavedItems(SavedItemType.WISHLIST);
  }
}; 