-- Create conversations table for messaging functionality
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES public.book_listings(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    
    -- Create unique constraint to prevent duplicate conversations for the same listing and users
    UNIQUE (listing_id, buyer_id, seller_id)
);

-- Create messages table for conversation messages
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    read BOOLEAN DEFAULT false NOT NULL
);

-- Add indexes for improved query performance
CREATE INDEX IF NOT EXISTS idx_conversations_listing_id ON public.conversations(listing_id);
CREATE INDEX IF NOT EXISTS idx_conversations_buyer_id ON public.conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_seller_id ON public.conversations(seller_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations(last_message_at);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_read ON public.messages(read);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Conversation policies
-- Users can only view conversations where they are the buyer or seller
CREATE POLICY conversations_select_policy ON public.conversations
    FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
    
-- Users can only insert conversations where they are the buyer or seller
CREATE POLICY conversations_insert_policy ON public.conversations
    FOR INSERT WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);
    
-- Users can only update conversations where they are the buyer or seller
CREATE POLICY conversations_update_policy ON public.conversations
    FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Message policies
-- Users can only view messages from conversations they are part of
CREATE POLICY messages_select_policy ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = conversation_id
            AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
        )
    );
    
-- Users can only insert messages where they are the sender
CREATE POLICY messages_insert_policy ON public.messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = conversation_id
            AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
        )
    );
    
-- Users can only update messages they received (for marking as read)
CREATE POLICY messages_update_policy ON public.messages
    FOR UPDATE USING (
        receiver_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = conversation_id
            AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
        )
    );

-- Table and column comments
COMMENT ON TABLE public.conversations IS 'Stores user conversations about book listings';
COMMENT ON COLUMN public.conversations.id IS 'Unique identifier for the conversation';
COMMENT ON COLUMN public.conversations.listing_id IS 'Book listing the conversation is about';
COMMENT ON COLUMN public.conversations.buyer_id IS 'User who is interested in buying the book';
COMMENT ON COLUMN public.conversations.seller_id IS 'User who is selling the book';
COMMENT ON COLUMN public.conversations.created_at IS 'When the conversation was created';
COMMENT ON COLUMN public.conversations.last_message_at IS 'When the most recent message was sent';
COMMENT ON COLUMN public.conversations.is_active IS 'Whether the conversation is active';

COMMENT ON TABLE public.messages IS 'Stores messages between users in conversations';
COMMENT ON COLUMN public.messages.id IS 'Unique identifier for the message';
COMMENT ON COLUMN public.messages.conversation_id IS 'Conversation the message belongs to';
COMMENT ON COLUMN public.messages.sender_id IS 'User who sent the message';
COMMENT ON COLUMN public.messages.receiver_id IS 'User who received the message';
COMMENT ON COLUMN public.messages.content IS 'Content of the message';
COMMENT ON COLUMN public.messages.created_at IS 'When the message was sent';
COMMENT ON COLUMN public.messages.read IS 'Whether the message has been read by the receiver'; 