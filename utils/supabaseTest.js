import { supabase } from '../config/supabase';

async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Try to retrieve some data from a table that should exist
    const { data, error } = await supabase
      .from('book_listings')
      .select('id, title')
      .limit(3);
    
    if (error) {
      console.error('Error connecting to Supabase:', error.message);
      return false;
    }
    
    console.log('Successfully connected to Supabase!');
    console.log('Sample data:', data);
    return true;
  } catch (error) {
    console.error('Unexpected error:', error);
    return false;
  }
}

export { testSupabaseConnection }; 