# Supabase Integration for 2ndHandBookApp

This document outlines how Supabase is integrated into the application for handling book listings data.

## Database Schema

The application uses a `book_listings` table to store information about books being sold on the platform. See the complete SQL schema in [schema/book_listings.sql](./schema/book_listings.sql).

### Book Listing Fields

- `id` - Unique identifier for the listing
- `title` - Book title
- `author` - Book author
- `price` - Price in dollars
- `condition` - Book condition (New, Like New, Good, Fair, Acceptable)
- `description` - Additional description of the book
- `image_url` - URL to the book cover image
- `category` - Academic category/subject of the book
- `edition` - Book edition or version
- `isbn` - International Standard Book Number
- `publisher` - Book publisher
- `publication_year` - Year of publication
- `is_negotiable` - Whether the price is negotiable
- `exchange_option` - Whether the seller accepts book exchanges
- `seller_id` - User ID of the seller (references auth.users)
- `created_at` - When the listing was created
- `updated_at` - When the listing was last updated

## Row Level Security (RLS)

The `book_listings` table uses the following RLS policies:

1. Everyone can view all book listings
2. Users can only insert listings where they are the seller
3. Users can only update their own listings
4. Users can only delete their own listings

## Supabase Storage

The application uses Supabase Storage to store book images uploaded by users. Images are stored in a public bucket named `book-images`.

### Storage Structure

Images are stored with a path structure that includes the user's ID for organization and security:
```
book-images/
  ├── [user_id1]/
  │   └── book_[timestamp].jpg
  ├── [user_id2]/
  │   └── book_[timestamp].jpg
  └── ...
```

### Storage Policies

The `book-images` bucket has the following policies:

1. Anyone can view images (public bucket)
2. Only authenticated users can upload images
3. Users can only update their own images (based on folder structure)
4. Users can only delete their own images (based on folder structure)

See the complete SQL schema in [schema/storage_buckets.sql](./schema/storage_buckets.sql).

## Search Functionality

The table includes a full-text search index on the following fields:
- Title (highest weight)
- Author (high weight)
- Description (medium weight)
- Category (low weight)

## API Integration

The application communicates with Supabase through services:

### BookService (`services/BookService.ts`)

Provides methods for:
- Fetching all listings
- Searching listings by term
- Filtering listings by category
- Getting a single listing by ID
- Creating new listings
- Updating listings
- Deleting listings
- Getting listings by seller ID

### ImageService (`services/ImageService.ts`)

Provides methods for:
- Uploading images to Supabase Storage
- Deleting images from Supabase Storage

## Configuration

Supabase is configured in `config/supabase.ts` with the following settings:

- URL and anon key loaded from environment variables with fallbacks
- Secure storage adapter using Expo's SecureStore
- Auto refresh token enabled
- Persistent sessions enabled

## Implementation

The Supabase integration is implemented in the following components:

1. **HomeScreen** - Fetches and displays all book listings
2. **AddListingScreen** - Allows users to create new book listings and upload images

## Future Enhancements

1. Add multi-image support for book listings
2. Implement wishlists for users to save books
3. Add messaging between buyers and sellers
4. Implement user ratings and reviews
5. Create an advanced search and filter screen 