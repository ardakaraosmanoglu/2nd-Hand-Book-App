import 'react-native-url-polyfill/auto';
import { testSupabaseConnection } from '../utils/supabaseTest';

async function runTest() {
  try {
    const result = await testSupabaseConnection();
    console.log(`Database connection test ${result ? 'PASSED' : 'FAILED'}`);
  } catch (error) {
    console.error('Test error:', error);
  }
  
  // Exit the process after the test
  process.exit(0);
}

runTest(); 