// Import polyfill properly for Node.js environment
require('react-native-url-polyfill/auto.js');

// Use CommonJS require for compatibility
const { checkTableExists } = require('../utils/checkTables');

async function runDiagnostic() {
  try {
    console.log('Running database diagnostic...');
    
    // Manually check each required table
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
    
    console.log('Database table status:');
    console.table(results);
    
    // Check for missing tables and provide specific instructions
    const missingTables = Object.keys(results).filter(table => !results[table]);
    
    if (missingTables.length > 0) {
      console.log('\n❌ Missing tables detected: ' + missingTables.join(', '));
      console.log('\nFix instructions:');
      
      const tableGroups = {
        user_profiles: {
          script: 'scripts/create_user_profiles_table.sql',
          description: 'Create the user_profiles table for user information'
        },
        saved_items: {
          script: 'scripts/create_saved_items_table.sql',
          description: 'Create the saved_items table for favorites and wishlist functionality'
        },
        conversations: {
          script: 'scripts/create_conversation_tables.sql',
          description: 'Create the conversations and messages tables for messaging functionality'
        },
        messages: {
          script: 'scripts/create_conversation_tables.sql',
          description: 'Create the conversations and messages tables for messaging functionality'
        }
      };
      
      // Track which scripts have been suggested to avoid duplicates
      const suggestedScripts = new Set();
      
      missingTables.forEach(table => {
        if (tableGroups[table] && !suggestedScripts.has(tableGroups[table].script)) {
          console.log(`\n- To fix ${table}:`);
          console.log(`  1. Open the Supabase dashboard at https://app.supabase.com`);
          console.log(`  2. Select your project and go to "SQL Editor"`);
          console.log(`  3. Run the SQL script from ${tableGroups[table].script}`);
          console.log(`  4. The script will ${tableGroups[table].description}`);
          
          suggestedScripts.add(tableGroups[table].script);
        }
      });
      
      console.log('\nUntil the tables are created, the app will fall back to using mock data for affected functionality.');
    } else {
      console.log('\n✅ All required tables exist!');
    }
    
    // Exit successfully
    process.exit(0);
  } catch (error) {
    console.error('Error running database diagnostic:', error);
    process.exit(1);
  }
}

runDiagnostic(); 