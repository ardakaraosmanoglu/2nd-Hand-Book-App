import { supabase } from '../config/supabase';
import { mockUsers } from './mockData';

const USE_MOCK_DATA = false;

/**
 * Get the current user ID or throw an error if not logged in
 * This is helpful for API calls that require authentication
 */
export async function getUserId(): Promise<string> {
  if (USE_MOCK_DATA) {
    // For development, we'll just return the first mock user's ID
    return Promise.resolve(mockUsers[0].id);
  }

  const { data, error } = await supabase.auth.getSession();
  
  if (error) {
    throw new Error('Authentication error: ' + error.message);
  }
  
  if (!data.session?.user?.id) {
    throw new Error('Not authenticated');
  }
  
  return data.session.user.id;
}

/**
 * Check if the user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  if (USE_MOCK_DATA) {
    // Always return true in mock mode
    return Promise.resolve(true);
  }
  
  try {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  } catch (error) {
    return false;
  }
} 