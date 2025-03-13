-- book_listings table schema
-- This table stores all book listings in the marketplace

CREATE TABLE IF NOT EXISTS book_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
    condition VARCHAR(50) NOT NULL CHECK (condition IN ('New', 'Like New', 'Good', 'Fair', 'Acceptable')),
    description TEXT,
    image_url VARCHAR(255),
    category VARCHAR(100),
    edition VARCHAR(100),
    isbn VARCHAR(20),
    publisher VARCHAR(255),
    publication_year INT,
    is_negotiable BOOLEAN DEFAULT FALSE,
    exchange_option BOOLEAN DEFAULT FALSE,
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE book_listings ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view listings
CREATE POLICY "Anyone can view book listings" 
    ON book_listings FOR SELECT USING (true);

-- Policy: Users can insert their own listings
CREATE POLICY "Users can insert their own listings" 
    ON book_listings FOR INSERT 
    WITH CHECK (auth.uid() = seller_id);

-- Policy: Users can update their own listings
CREATE POLICY "Users can update their own listings" 
    ON book_listings FOR UPDATE 
    USING (auth.uid() = seller_id);

-- Policy: Users can delete their own listings
CREATE POLICY "Users can delete their own listings" 
    ON book_listings FOR DELETE 
    USING (auth.uid() = seller_id);

-- Create an index on seller_id for faster queries
CREATE INDEX IF NOT EXISTS book_listings_seller_id_idx ON book_listings(seller_id);

-- Create an index on category for faster filtering
CREATE INDEX IF NOT EXISTS book_listings_category_idx ON book_listings(category);

-- Create Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create Trigger for updated_at
CREATE TRIGGER update_book_listings_updated_at
BEFORE UPDATE ON book_listings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Create full text search index
ALTER TABLE book_listings ADD COLUMN IF NOT EXISTS fts tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(author, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'C') ||
  setweight(to_tsvector('english', coalesce(category, '')), 'D')
) STORED;

-- Add index for full text search
CREATE INDEX IF NOT EXISTS book_listings_fts_idx ON book_listings USING GIN (fts); 