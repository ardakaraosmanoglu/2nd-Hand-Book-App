# 2nd Hand Book App - Database Setup

This document explains how to set up the necessary database tables for the 2nd Hand Book App.

## Required Tables

The app requires the following tables in the Supabase database:

1. **book_listings** - Stores information about books for sale
2. **user_profiles** - Stores user profile information
3. **saved_items** - Stores favorites and wishlist items
4. **conversations** - Stores message conversations between users
5. **messages** - Stores individual messages in conversations

## Checking Database Setup

If you experience issues with features like user profiles, favorites, wishlist, or messaging, it might be because some required database tables are missing.

To see instructions for fixing database issues, run:

```
npm run db-check
```

This will show information about missing tables and provide guidance on how to create them.

## Setting Up Missing Tables

### User Profiles

To create the `user_profiles` table:

1. Open the [Supabase dashboard](https://app.supabase.com)
2. Select your project and go to "SQL Editor"
3. Copy the contents of `scripts/create_user_profiles_table.sql` 
4. Paste it into a new SQL query
5. Run the query

### Saved Items (Favorites & Wishlist)

To create the `saved_items` table:

1. Open the [Supabase dashboard](https://app.supabase.com)
2. Select your project and go to "SQL Editor"
3. Copy the contents of `scripts/create_saved_items_table.sql` 
4. Paste it into a new SQL query
5. Run the query

### Conversations & Messages

To create the `conversations` and `messages` tables:

1. Open the [Supabase dashboard](https://app.supabase.com)
2. Select your project and go to "SQL Editor"
3. Copy the contents of `scripts/create_conversation_tables.sql` 
4. Paste it into a new SQL query
5. Run the query

## Fallback to Mock Data

Until all required tables are created, the app will automatically fall back to using mock data for the affected functionality. This ensures that you can still use and test the app even if some database tables are missing.

Once you create the necessary tables, the app will automatically start using the real database instead of mock data.

## Relationships Between Tables

Here's a simplified overview of how the tables relate to each other:

- `book_listings` - Contains all books for sale
- `user_profiles` - Contains user information (linked to Supabase auth.users)
- `saved_items` - Links users to books they've saved as favorites or wishlist items
- `conversations` - Links buyers and sellers discussing a specific book listing
- `messages` - Contains the actual messages within a conversation

## Additional Notes

- All tables include Row Level Security (RLS) policies to ensure users can only access their own data
- Appropriate indexes are created for performance optimization
- Cascade delete is used where appropriate (e.g., deleting a conversation deletes its messages) 