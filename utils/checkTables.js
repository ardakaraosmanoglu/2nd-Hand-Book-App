// Import polyfill properly for Node.js environment
require('react-native-url-polyfill/auto.js');
const { createClient } = require('@supabase/supabase-js');

// Get supabase configuration from environment variables or defaults
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://rbqrtnlqylbujgdyrztr.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJicXJ0bmxxeWxidWpnZHlyenRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4NzQ0NzcsImV4cCI6MjA1NzQ1MDQ3N30.ZGvESQP1vwWe9Ch7cqRX--MGA9KlD0BiQttBcUs92Yw';

// Create a supabase client for diagnostics
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Check if a table exists in the database
 * @param {string} tableName - The name of the table to check
 * @returns {Promise<boolean>} - True if the table exists, false otherwise
 */
async function checkTableExists(tableName) {
  try {
    // Try to query the table information from Postgres information_schema
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .single();
    
    if (error) {
      console.error(`Error checking if table ${tableName} exists:`, error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error(`Unexpected error checking if table ${tableName} exists:`, error);
    return false;
  }
}

/**
 * Check if all required tables exist in the database
 * @returns {Promise<Object>} - Object with table names as keys and existence status as values
 */
async function checkRequiredTables() {
  const requiredTables = [
    'book_listings',
    'user_profiles',
    'saved_items',
    'conversations',
    'messages'
  ];
  
  const results = {};
  
  for (const table of requiredTables) {
    results[table] = await checkTableExists(table);
  }
  
  return results;
}

/**
 * Run a check of all required tables and log the results
 */
async function diagnoseTableIssues() {
  console.log('Checking required database tables...');
  const results = await checkRequiredTables();
  
  console.log('Database table status:');
  console.table(results);
  
  const missingTables = Object.keys(results).filter(table => !results[table]);
  
  if (missingTables.length > 0) {
    console.warn(`Missing tables: ${missingTables.join(', ')}`);
    console.log('Please run the appropriate SQL scripts to create these tables.');
  } else {
    console.log('All required tables exist!');
  }
  
  return results;
}

// Export functions for CommonJS
module.exports = {
  checkTableExists,
  checkRequiredTables,
  diagnoseTableIssues
}; 