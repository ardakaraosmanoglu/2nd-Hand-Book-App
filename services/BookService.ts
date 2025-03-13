import { supabase } from '../config/supabase';
import { mockListings, getMockListingById, getMockListingsBySeller } from '../utils/mockData';

// Define a constant to determine whether to use mock data or real API
const USE_MOCK_DATA = false; // Set to false to use real API

// Define the BookListing type based on our database schema
export interface BookListing {
  id: string;
  title: string;
  author: string;
  price: number;
  condition: string;
  description?: string;
  image_url?: string;
  category?: string;
  edition?: string;
  isbn?: string;
  publisher?: string;
  publication_year?: number;
  is_negotiable?: boolean;
  exchange_option?: boolean;
  seller_id: string;
  created_at: string;
}

// Define the CreateBookListing type for adding new listings
export interface CreateBookListing {
  title: string;
  author: string;
  price: number;
  condition: string;
  description?: string;
  image_url?: string;
  category?: string;
  edition?: string;
  isbn?: string;
  publisher?: string;
  publication_year?: number;
  is_negotiable?: boolean;
  exchange_option?: boolean;
  seller_id: string;
}

export interface BookFilterOptions {
  categories?: string[];
  conditions?: string[];
  minPrice?: number;
  maxPrice?: number;
  isNegotiable?: boolean;
  exchangeOption?: boolean;
}

export const BookService = {
  /**
   * Fetch all book listings
   */
  async getListings(): Promise<BookListing[]> {
    if (USE_MOCK_DATA) {
      return new Promise(resolve => {
        // Simulate network delay
        setTimeout(() => {
          resolve(mockListings);
        }, 800);
      });
    }

    try {
      const { data, error } = await supabase
        .from('book_listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching book listings:', error);
      throw error;
    }
  },

  /**
   * Fetch book listings by search term
   */
  async searchListings(searchTerm: string): Promise<BookListing[]> {
    if (USE_MOCK_DATA) {
      return new Promise(resolve => {
        // Simulate network delay
        setTimeout(() => {
          const filteredListings = mockListings.filter(listing => {
            const searchTermLower = searchTerm.toLowerCase();
            return (
              listing.title.toLowerCase().includes(searchTermLower) ||
              listing.author.toLowerCase().includes(searchTermLower) ||
              (listing.description && listing.description.toLowerCase().includes(searchTermLower))
            );
          });
          resolve(filteredListings);
        }, 800);
      });
    }

    try {
      const { data, error } = await supabase
        .from('book_listings')
        .select('*')
        .or(`title.ilike.%${searchTerm}%,author.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error searching book listings:', error);
      throw error;
    }
  },

  /**
   * Fetch book listings by category
   */
  async getListingsByCategory(category: string): Promise<BookListing[]> {
    if (USE_MOCK_DATA) {
      return new Promise(resolve => {
        // Simulate network delay
        setTimeout(() => {
          const filteredListings = mockListings.filter(listing => 
            listing.category === category
          );
          resolve(filteredListings);
        }, 800);
      });
    }

    try {
      const { data, error } = await supabase
        .from('book_listings')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching book listings by category:', error);
      throw error;
    }
  },

  /**
   * Fetch a single book listing by ID
   */
  async getListingById(id: string): Promise<BookListing | null> {
    if (USE_MOCK_DATA) {
      return new Promise(resolve => {
        // Simulate network delay
        setTimeout(() => {
          const listing = getMockListingById(id);
          resolve(listing || null);
        }, 800);
      });
    }

    try {
      const { data, error } = await supabase
        .from('book_listings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching book listing by ID:', error);
      throw error;
    }
  },

  /**
   * Create a new book listing
   */
  async createListing(listing: CreateBookListing): Promise<BookListing> {
    if (USE_MOCK_DATA) {
      return new Promise(resolve => {
        // Simulate network delay
        setTimeout(() => {
          const newListing: BookListing = {
            id: `mock-${Math.random().toString(36).substring(2, 15)}`,
            ...listing,
            created_at: new Date().toISOString()
          };
          // In a real app we would add this to the mockListings array
          // Here we just return it
          resolve(newListing);
        }, 800);
      });
    }

    try {
      const { data, error } = await supabase
        .from('book_listings')
        .insert(listing)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating book listing:', error);
      throw error;
    }
  },

  /**
   * Update an existing book listing
   */
  async updateListing(id: string, updates: Partial<CreateBookListing>): Promise<BookListing> {
    if (USE_MOCK_DATA) {
      return new Promise((resolve, reject) => {
        // Simulate network delay
        setTimeout(() => {
          const listingIndex = mockListings.findIndex(listing => listing.id === id);
          if (listingIndex === -1) {
            reject(new Error('Listing not found'));
            return;
          }
          
          // Create updated listing (in a real app this would modify the mockListings array)
          const updatedListing = {
            ...mockListings[listingIndex],
            ...updates
          };
          
          resolve(updatedListing);
        }, 800);
      });
    }

    try {
      const { data, error } = await supabase
        .from('book_listings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error updating book listing:', error);
      throw error;
    }
  },

  /**
   * Delete a book listing
   */
  async deleteListing(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      return new Promise(resolve => {
        // Simulate network delay
        setTimeout(() => {
          // In a real app, we would filter out the listing from the mockListings array
          // Here we just resolve with no action
          resolve();
        }, 800);
      });
    }

    try {
      const { error } = await supabase
        .from('book_listings')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting book listing:', error);
      throw error;
    }
  },

  /**
   * Get listings by seller ID
   */
  async getListingsBySeller(sellerId: string): Promise<BookListing[]> {
    if (USE_MOCK_DATA) {
      return new Promise(resolve => {
        // Simulate network delay
        setTimeout(() => {
          const sellerListings = getMockListingsBySeller(sellerId);
          resolve(sellerListings);
        }, 800);
      });
    }

    try {
      const { data, error } = await supabase
        .from('book_listings')
        .select('*')
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching seller listings:', error);
      throw error;
    }
  },

  /**
   * Fetch book listings with filters
   */
  async getFilteredListings(filters: BookFilterOptions): Promise<BookListing[]> {
    if (USE_MOCK_DATA) {
      return new Promise(resolve => {
        // Simulate network delay
        setTimeout(() => {
          let filteredListings = [...mockListings];
          
          // Apply category filter
          if (filters.categories && filters.categories.length > 0) {
            filteredListings = filteredListings.filter(listing => 
              listing.category && filters.categories?.includes(listing.category)
            );
          }
          
          // Apply condition filter
          if (filters.conditions && filters.conditions.length > 0) {
            filteredListings = filteredListings.filter(listing => 
              filters.conditions?.includes(listing.condition)
            );
          }
          
          // Apply price range filters
          if (filters.minPrice !== undefined) {
            filteredListings = filteredListings.filter(listing => 
              listing.price >= filters.minPrice!
            );
          }
          
          if (filters.maxPrice !== undefined) {
            filteredListings = filteredListings.filter(listing => 
              listing.price <= filters.maxPrice!
            );
          }
          
          // Apply negotiable filter
          if (filters.isNegotiable !== undefined) {
            filteredListings = filteredListings.filter(listing => 
              listing.is_negotiable === filters.isNegotiable
            );
          }
          
          // Apply exchange option filter
          if (filters.exchangeOption !== undefined) {
            filteredListings = filteredListings.filter(listing => 
              listing.exchange_option === filters.exchangeOption
            );
          }
          
          resolve(filteredListings);
        }, 800);
      });
    }

    try {
      let query = supabase
        .from('book_listings')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Apply category filter
      if (filters.categories && filters.categories.length > 0) {
        query = query.in('category', filters.categories);
      }
      
      // Apply condition filter
      if (filters.conditions && filters.conditions.length > 0) {
        query = query.in('condition', filters.conditions);
      }
      
      // Apply price range filters
      if (filters.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }
      
      if (filters.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }
      
      // Apply negotiable filter
      if (filters.isNegotiable !== undefined) {
        query = query.eq('is_negotiable', filters.isNegotiable);
      }
      
      // Apply exchange option filter
      if (filters.exchangeOption !== undefined) {
        query = query.eq('exchange_option', filters.exchangeOption);
      }
      
      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching filtered book listings:', error);
      throw error;
    }
  }
}; 