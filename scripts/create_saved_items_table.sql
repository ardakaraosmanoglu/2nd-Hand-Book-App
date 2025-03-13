-- Create saved_items table for favorites and wishlist functionality
CREATE TABLE IF NOT EXISTS public.saved_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES public.book_listings(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('favorite', 'wishlist')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    
    -- Create a unique constraint to prevent duplicate saved items
    UNIQUE (user_id, book_id, type)
);

-- Add indexes for improved query performance
CREATE INDEX IF NOT EXISTS idx_saved_items_user_id ON public.saved_items(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_items_book_id ON public.saved_items(book_id);
CREATE INDEX IF NOT EXISTS idx_saved_items_type ON public.saved_items(type);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own saved items
CREATE POLICY saved_items_select_policy ON public.saved_items
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can only insert their own saved items
CREATE POLICY saved_items_insert_policy ON public.saved_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own saved items
CREATE POLICY saved_items_update_policy ON public.saved_items
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can only delete their own saved items
CREATE POLICY saved_items_delete_policy ON public.saved_items
    FOR DELETE USING (auth.uid() = user_id);

-- Comment on table and columns for documentation
COMMENT ON TABLE public.saved_items IS 'Stores user saved items (favorites and wishlist)';
COMMENT ON COLUMN public.saved_items.id IS 'Unique identifier for the saved item';
COMMENT ON COLUMN public.saved_items.user_id IS 'User who saved the item';
COMMENT ON COLUMN public.saved_items.book_id IS 'Book that was saved';
COMMENT ON COLUMN public.saved_items.type IS 'Type of saved item (favorite or wishlist)';
COMMENT ON COLUMN public.saved_items.created_at IS 'When the item was saved'; 