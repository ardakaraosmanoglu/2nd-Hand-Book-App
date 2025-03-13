import { supabase } from '../config/supabase';
import { mockUsers, getMockSellerById } from '../utils/mockData';

// Define a constant to determine whether to use mock data or real API
const USE_MOCK_DATA = false; // Set to false to use real API

// Flag to track if we've detected that tables don't exist
let DETECTED_MISSING_TABLES = false;

// Helper function to check if an error is "table does not exist"
function isTableNotExistError(error: any): boolean {
  return error && error.code === '42P01'; // PostgreSQL error code for "relation does not exist"
}

export interface User {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
  joinDate: string;
  rating?: number;
  bio?: string;
  location?: string;
  phone?: string;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface UserRegistration extends UserCredentials {
  name: string;
}

export interface UserProfileUpdate {
  name?: string;
  profileImage?: string;
  bio?: string;
  location?: string;
  phone?: string;
}

export const UserService = {
  /**
   * Sign in with email and password
   */
  async signIn(credentials: UserCredentials): Promise<User> {
    if (USE_MOCK_DATA || DETECTED_MISSING_TABLES) {
      return new Promise((resolve, reject) => {
        // Simulate network delay
        setTimeout(() => {
          const user = mockUsers.find(user => user.email.toLowerCase() === credentials.email.toLowerCase());
          
          if (user) {
            // In a real app, we would verify the password
            // For this mock, we'll assume any password is correct
            resolve({
              id: user.id,
              email: user.email,
              name: user.name,
              profileImage: user.profileImage,
              joinDate: user.joinDate,
              rating: user.rating,
              bio: user.bio,
              location: user.location,
              phone: user.phone
            });
          } else {
            reject(new Error('Invalid email or password'));
          }
        }, 800);
      });
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        throw error;
      }

      // Fetch user profile data
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        // If the table doesn't exist, fall back to mock data
        if (isTableNotExistError(profileError)) {
          console.warn('user_profiles table does not exist, falling back to mock data');
          DETECTED_MISSING_TABLES = true;
          
          // Suggest running the SQL script to create missing tables
          console.info('To fix this issue, run the SQL script in scripts/create_user_profiles_table.sql');
          
          // Fall back to mock data for this user
          const mockUser = mockUsers.find(user => user.email.toLowerCase() === credentials.email.toLowerCase());
          if (mockUser) {
            return {
              id: data.user.id,
              email: data.user.email!,
              name: mockUser.name,
              profileImage: mockUser.profileImage,
              joinDate: mockUser.joinDate,
              rating: mockUser.rating,
              bio: mockUser.bio,
              location: mockUser.location,
              phone: mockUser.phone
            };
          } else {
            // Create basic user from auth data
            return {
              id: data.user.id,
              email: data.user.email!,
              name: data.user.email!.split('@')[0], // Use part of email as name
              joinDate: new Date().toISOString(),
              rating: 5.0 // Default rating
            };
          }
        }
        throw profileError;
      }

      return {
        id: data.user.id,
        email: data.user.email!,
        name: profileData.name,
        profileImage: profileData.profile_image,
        joinDate: profileData.join_date,
        rating: profileData.rating,
        bio: profileData.bio,
        location: profileData.location,
        phone: profileData.phone
      };
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  },

  /**
   * Sign up with email, password, and name
   */
  async signUp(registration: UserRegistration): Promise<User> {
    if (USE_MOCK_DATA || DETECTED_MISSING_TABLES) {
      return new Promise((resolve, reject) => {
        // Simulate network delay
        setTimeout(() => {
          const existingUser = mockUsers.find(user => user.email.toLowerCase() === registration.email.toLowerCase());
          
          if (existingUser) {
            reject(new Error('Email already in use'));
            return;
          }
          
          // Create a new mock user (in a real app this would add to the mockUsers array)
          const newUser: User = {
            id: `user-${Math.random().toString(36).substring(2, 7)}`,
            email: registration.email,
            name: registration.name,
            joinDate: new Date().toISOString(),
            rating: 5.0 // Default rating for new users
          };
          
          resolve(newUser);
        }, 800);
      });
    }

    try {
      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email: registration.email,
        password: registration.password,
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error('User creation failed');
      }

      // Create profile record
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: data.user.id,
          name: registration.name,
          join_date: new Date().toISOString(),
          rating: 5.0 // Default rating for new users
        })
        .select()
        .single();

      if (profileError) {
        // If the table doesn't exist, fall back to mock data
        if (isTableNotExistError(profileError)) {
          console.warn('user_profiles table does not exist, falling back to mock data');
          DETECTED_MISSING_TABLES = true;
          
          // Suggest running the SQL script to create missing tables
          console.info('To fix this issue, run the SQL script in scripts/create_user_profiles_table.sql');
          
          // Return basic user from auth data
          return {
            id: data.user.id,
            email: data.user.email!,
            name: registration.name,
            joinDate: new Date().toISOString(),
            rating: 5.0 // Default rating
          };
        }
        throw profileError;
      }

      return {
        id: data.user.id,
        email: data.user.email!,
        name: profileData.name,
        joinDate: profileData.join_date,
        rating: profileData.rating
      };
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  },

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    if (USE_MOCK_DATA) {
      return new Promise(resolve => {
        // Simulate network delay
        setTimeout(() => {
          resolve();
        }, 500);
      });
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },

  /**
   * Get the current user
   */
  async getCurrentUser(): Promise<User | null> {
    if (USE_MOCK_DATA || DETECTED_MISSING_TABLES) {
      return new Promise(resolve => {
        // For testing, we'll return the first mock user as the "current" user
        // In a real app, you would store the current user in secure storage
        // and retrieve it here
        setTimeout(() => {
          const currentUser = mockUsers[0]; // Using the first user as "current"
          
          if (currentUser) {
            resolve({
              id: currentUser.id,
              email: currentUser.email,
              name: currentUser.name,
              profileImage: currentUser.profileImage,
              joinDate: currentUser.joinDate,
              rating: currentUser.rating,
              bio: currentUser.bio,
              location: currentUser.location,
              phone: currentUser.phone
            });
          } else {
            resolve(null);
          }
        }, 500);
      });
    }

    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session) {
        return null;
      }
      
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.session.user.id)
        .single();
      
      if (profileError) {
        // If the table doesn't exist, fall back to mock data
        if (isTableNotExistError(profileError)) {
          console.warn('user_profiles table does not exist, falling back to mock data');
          DETECTED_MISSING_TABLES = true;
          
          // Suggest running the SQL script to create missing tables
          console.info('To fix this issue, run the SQL script in scripts/create_user_profiles_table.sql');
          
          // Return the first mock user as current
          const mockUser = mockUsers[0];
          return {
            id: data.session.user.id,
            email: data.session.user.email!,
            name: mockUser.name,
            profileImage: mockUser.profileImage,
            joinDate: mockUser.joinDate,
            rating: mockUser.rating,
            bio: mockUser.bio,
            location: mockUser.location,
            phone: mockUser.phone
          };
        }
        throw profileError;
      }
      
      return {
        id: data.session.user.id,
        email: data.session.user.email!,
        name: profileData.name,
        profileImage: profileData.profile_image,
        joinDate: profileData.join_date,
        rating: profileData.rating,
        bio: profileData.bio,
        location: profileData.location,
        phone: profileData.phone
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  /**
   * Get a user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    if (USE_MOCK_DATA || DETECTED_MISSING_TABLES) {
      return new Promise(resolve => {
        // Simulate network delay
        setTimeout(() => {
          const user = getMockSellerById(userId);
          
          if (user) {
            resolve({
              id: user.id,
              email: user.email,
              name: user.name,
              profileImage: user.profileImage,
              joinDate: user.joinDate,
              rating: user.rating,
              bio: user.bio,
              location: user.location,
              phone: user.phone
            });
          } else {
            resolve(null);
          }
        }, 600);
      });
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        // If the table doesn't exist, fall back to mock data
        if (isTableNotExistError(error)) {
          console.warn('user_profiles table does not exist, falling back to mock data');
          DETECTED_MISSING_TABLES = true;
          
          // Suggest running the SQL script to create missing tables
          console.info('To fix this issue, run the SQL script in scripts/create_user_profiles_table.sql');
          
          // Return mock user
          const mockUser = getMockSellerById(userId);
          if (mockUser) {
            return {
              id: mockUser.id,
              email: mockUser.email,
              name: mockUser.name,
              profileImage: mockUser.profileImage,
              joinDate: mockUser.joinDate,
              rating: mockUser.rating,
              bio: mockUser.bio,
              location: mockUser.location,
              phone: mockUser.phone
            };
          }
          return null;
        }
        throw error;
      }
      
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        profileImage: data.profile_image,
        joinDate: data.join_date,
        rating: data.rating,
        bio: data.bio,
        location: data.location,
        phone: data.phone
      };
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: string, profileUpdate: UserProfileUpdate): Promise<User> {
    if (USE_MOCK_DATA || DETECTED_MISSING_TABLES) {
      return new Promise((resolve, reject) => {
        // Simulate network delay
        setTimeout(() => {
          const userIndex = mockUsers.findIndex(user => user.id === userId);
          
          if (userIndex === -1) {
            reject(new Error('User not found'));
            return;
          }
          
          // In a real app, this would modify the mockUsers array
          const updatedUser = {
            ...mockUsers[userIndex],
            ...profileUpdate
          };
          
          resolve({
            id: updatedUser.id,
            email: updatedUser.email,
            name: updatedUser.name,
            profileImage: updatedUser.profileImage,
            joinDate: updatedUser.joinDate,
            rating: updatedUser.rating,
            bio: updatedUser.bio,
            location: updatedUser.location,
            phone: updatedUser.phone
          });
        }, 800);
      });
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          name: profileUpdate.name,
          profile_image: profileUpdate.profileImage,
          bio: profileUpdate.bio,
          location: profileUpdate.location,
          phone: profileUpdate.phone
        })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) {
        // If the table doesn't exist, fall back to mock data
        if (isTableNotExistError(error)) {
          console.warn('user_profiles table does not exist, falling back to mock data');
          DETECTED_MISSING_TABLES = true;
          
          // Suggest running the SQL script to create missing tables
          console.info('To fix this issue, run the SQL script in scripts/create_user_profiles_table.sql');
          
          // Fall back to mock update logic
          return this.updateProfile(userId, profileUpdate);
        }
        throw error;
      }
      
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        profileImage: data.profile_image,
        joinDate: data.join_date,
        rating: data.rating,
        bio: data.bio,
        location: data.location,
        phone: data.phone
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
}; 