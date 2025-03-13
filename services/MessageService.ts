import { supabase } from '../config/supabase';
import { getUserId } from '../utils/auth';
import { mockUsers } from '../utils/mockData';
import { BookService } from './BookService';

// If true, we'll use mock data for messaging
// We'll also dynamically fall back to mock data if we detect missing tables
const USE_MOCK_DATA = false;

// Flag to track if we've detected that tables don't exist
let DETECTED_MISSING_TABLES = false;

// In-memory mock storage for development
let mockConversations: Conversation[] = [];
let mockMessages: Message[] = [];

// Helper function to check if an error is "table does not exist"
function isTableNotExistError(error: any): boolean {
  return error && error.code === '42P01'; // PostgreSQL error code for "relation does not exist"
}

// Initialize some mock conversations
// This is needed whether we start with mock mode or fall back to it
if (mockConversations.length === 0) {
  // We'll add some mock data when the service is first loaded
  // This simulates having some existing conversations
  mockConversations = [
    {
      id: 'conv-001',
      listing_id: 'book-001',
      buyer_id: 'user-002',
      seller_id: 'user-001',
      created_at: '2023-08-10T09:15:00Z',
      last_message_at: '2023-08-12T14:30:00Z',
      is_active: true
    },
    {
      id: 'conv-002',
      listing_id: 'book-005',
      buyer_id: 'user-001',
      seller_id: 'user-005',
      created_at: '2023-08-15T11:20:00Z',
      last_message_at: '2023-08-15T16:45:00Z',
      is_active: true
    }
  ];
  
  mockMessages = [
    {
      id: 'msg-001',
      conversation_id: 'conv-001',
      sender_id: 'user-002',
      receiver_id: 'user-001',
      content: 'Hi, is this book still available?',
      created_at: '2023-08-10T09:15:00Z',
      read: true
    },
    {
      id: 'msg-002',
      conversation_id: 'conv-001',
      sender_id: 'user-001',
      receiver_id: 'user-002',
      content: 'Yes, it is still available. Are you interested?',
      created_at: '2023-08-10T10:30:00Z',
      read: true
    },
    {
      id: 'msg-003',
      conversation_id: 'conv-001',
      sender_id: 'user-002',
      receiver_id: 'user-001',
      content: 'Great! Would you consider a lower price?',
      created_at: '2023-08-12T14:30:00Z',
      read: false
    },
    {
      id: 'msg-004',
      conversation_id: 'conv-002',
      sender_id: 'user-001',
      receiver_id: 'user-005',
      content: 'Hello, I\'m interested in your programming book. Is it still available?',
      created_at: '2023-08-15T11:20:00Z',
      read: true
    },
    {
      id: 'msg-005',
      conversation_id: 'conv-002',
      sender_id: 'user-005',
      receiver_id: 'user-001',
      content: 'Yes, it\'s still available. It\'s in great condition.',
      created_at: '2023-08-15T13:05:00Z',
      read: true
    },
    {
      id: 'msg-006',
      conversation_id: 'conv-002',
      sender_id: 'user-001',
      receiver_id: 'user-005',
      content: 'Perfect! When can we meet for the exchange?',
      created_at: '2023-08-15T16:45:00Z',
      read: false
    }
  ];
}

export interface Conversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  last_message_at: string;
  is_active: boolean;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

export interface ConversationWithDetails extends Conversation {
  unreadCount: number;
  lastMessage?: string;
  otherUser: {
    id: string;
    name: string;
    profileImage?: string;
  };
  listing: {
    id: string;
    title: string;
    image_url?: string;
    price: number;
  };
}

export const MessageService = {
  /**
   * Get all conversations for the current user
   */
  async getConversations(): Promise<ConversationWithDetails[]> {
    const userId = await getUserId();
    
    if (USE_MOCK_DATA || DETECTED_MISSING_TABLES) {
      return new Promise(resolve => {
        setTimeout(() => {
          // Filter conversations where current user is either buyer or seller
          const userConversations = mockConversations.filter(
            conv => conv.buyer_id === userId || conv.seller_id === userId
          );
          
          // Enhance conversations with additional details
          const enhancedConversations = userConversations.map(conv => {
            // Determine the other user in the conversation
            const otherUserId = conv.buyer_id === userId ? conv.seller_id : conv.buyer_id;
            const otherUser = mockUsers.find(user => user.id === otherUserId);
            
            // Count unread messages
            const unreadCount = mockMessages.filter(
              msg => msg.conversation_id === conv.id && 
                    msg.receiver_id === userId && 
                    !msg.read
            ).length;
            
            // Get the last message
            const conversationMessages = mockMessages
              .filter(msg => msg.conversation_id === conv.id)
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            
            const lastMessage = conversationMessages.length > 0 ? conversationMessages[0].content : undefined;
            
            // Get listing details (this would come from BookService in a real app)
            // For mock, we'll just create some fake data
            const listing = {
              id: conv.listing_id,
              title: `Book #${conv.listing_id.split('-')[1]}`,
              image_url: 'https://source.unsplash.com/random/200x300/?book',
              price: 19.99
            };
            
            // Construct the enhanced conversation
            return {
              ...conv,
              unreadCount,
              lastMessage,
              otherUser: {
                id: otherUser?.id || '',
                name: otherUser?.name || 'Unknown User',
                profileImage: otherUser?.profileImage
              },
              listing
            };
          });
          
          // Sort by last message time descending
          enhancedConversations.sort((a, b) => 
            new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
          );
          
          resolve(enhancedConversations);
        }, 800);
      });
    }
    
    try {
      // Get conversations where user is either buyer or seller
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .eq('is_active', true)
        .order('last_message_at', { ascending: false });
      
      if (error) {
        // If the table doesn't exist, fall back to mock data
        if (isTableNotExistError(error)) {
          console.warn('conversations table does not exist, falling back to mock data');
          DETECTED_MISSING_TABLES = true;
          
          // Suggest running the SQL script to create missing tables
          console.info('To fix this issue, run the SQL script in scripts/create_conversation_tables.sql');
          
          return this.getConversations();
        }
        throw error;
      }
      
      if (!conversations || conversations.length === 0) {
        return [];
      }
      
      // Get unread counts
      const unreadCountsPromises = conversations.map(async conv => {
        try {
          const { count, error: countError } = await supabase
            .from('messages')
            .select('*', { count: 'exact' })
            .eq('conversation_id', conv.id)
            .eq('receiver_id', userId)
            .eq('read', false);
            
          if (countError) {
            // If the table doesn't exist, fall back to mock data
            if (isTableNotExistError(countError)) {
              console.warn('messages table does not exist, falling back to mock data');
              DETECTED_MISSING_TABLES = true;
              throw countError;
            }
            console.error('Error fetching unread count:', countError);
            return { conversationId: conv.id, count: 0 };
          }
          
          return { conversationId: conv.id, count: count || 0 };
        } catch (error) {
          // Fall back to mock data
          if (isTableNotExistError(error)) {
            DETECTED_MISSING_TABLES = true;
            return { conversationId: conv.id, count: 0 };
          }
          console.error('Error in unread counts:', error);
          return { conversationId: conv.id, count: 0 };
        }
      });
      
      // If we've detected missing tables, fall back to mock data
      if (DETECTED_MISSING_TABLES) {
        // Suggest running the SQL script to create missing tables
        console.info('To fix this issue, run the SQL script in scripts/create_conversation_tables.sql');
        return this.getConversations();
      }
      
      const unreadCounts = await Promise.all(unreadCountsPromises);
      
      // Get last messages
      const lastMessagesPromises = conversations.map(async conv => {
        try {
          const { data: messages, error: messagesError } = await supabase
            .from('messages')
            .select('content')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1);
            
          if (messagesError) {
            // If the table doesn't exist, fall back to mock data
            if (isTableNotExistError(messagesError)) {
              console.warn('messages table does not exist, falling back to mock data');
              DETECTED_MISSING_TABLES = true;
              throw messagesError;
            }
            return { conversationId: conv.id, message: undefined };
          }
          
          if (!messages || messages.length === 0) {
            return { conversationId: conv.id, message: undefined };
          }
          
          return { conversationId: conv.id, message: messages[0].content };
        } catch (error) {
          // Fall back to mock data
          if (isTableNotExistError(error)) {
            DETECTED_MISSING_TABLES = true;
            return { conversationId: conv.id, message: undefined };
          }
          console.error('Error in last messages:', error);
          return { conversationId: conv.id, message: undefined };
        }
      });
      
      // If we've detected missing tables by now, fall back to mock data
      if (DETECTED_MISSING_TABLES) {
        // Suggest running the SQL script to create missing tables
        console.info('To fix this issue, run the SQL script in scripts/create_conversation_tables.sql');
        return this.getConversations();
      }
      
      const lastMessages = await Promise.all(lastMessagesPromises);
      
      // Get user details
      const userIds = conversations.map(conv => 
        conv.buyer_id === userId ? conv.seller_id : conv.buyer_id
      );
      
      let users = [];
      try {
        const { data: usersData, error: usersError } = await supabase
          .from('user_profiles')
          .select('id, name, profile_image')
          .in('id', userIds);
          
        if (usersError) {
          console.error('Error fetching user details:', usersError);
        } else {
          users = usersData || [];
        }
      } catch (error) {
        console.error('Error in user details:', error);
      }
      
      // Get listing details
      const listingIds = conversations.map(conv => conv.listing_id);
      
      let listings = [];
      try {
        const { data: listingsData, error: listingsError } = await supabase
          .from('book_listings')
          .select('id, title, image_url, price')
          .in('id', listingIds);
          
        if (listingsError) {
          console.error('Error fetching listing details:', listingsError);
        } else {
          listings = listingsData || [];
        }
      } catch (error) {
        console.error('Error in listing details:', error);
      }
      
      // Combine all data
      const enhancedConversations = conversations.map(conv => {
        const otherUserId = conv.buyer_id === userId ? conv.seller_id : conv.buyer_id;
        const otherUser = users.find(user => user.id === otherUserId) || { id: otherUserId, name: 'Unknown User' };
        const unreadCount = unreadCounts.find(uc => uc.conversationId === conv.id)?.count || 0;
        const lastMessage = lastMessages.find(lm => lm.conversationId === conv.id)?.message;
        const listing = listings.find(l => l.id === conv.listing_id) || { id: conv.listing_id, title: 'Unknown Book', price: 0 };
        
        return {
          ...conv,
          unreadCount,
          lastMessage,
          otherUser: {
            id: otherUser.id,
            name: otherUser.name,
            profileImage: otherUser.profile_image
          },
          listing: {
            id: listing.id,
            title: listing.title,
            image_url: listing.image_url,
            price: listing.price
          }
        };
      });
      
      return enhancedConversations;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      
      // Fall back to mock data if table doesn't exist
      if (isTableNotExistError(error)) {
        console.warn('conversations or messages table does not exist, falling back to mock data');
        DETECTED_MISSING_TABLES = true;
        console.info('To fix this issue, run the SQL script in scripts/create_conversation_tables.sql');
        return this.getConversations();
      }
      
      throw error;
    }
  },
  
  /**
   * Get all messages for a conversation
   */
  async getMessages(conversationId: string): Promise<Message[]> {
    if (USE_MOCK_DATA || DETECTED_MISSING_TABLES) {
      return new Promise(resolve => {
        setTimeout(() => {
          // Filter messages for the specified conversation
          const conversationMessages = mockMessages
            .filter(msg => msg.conversation_id === conversationId)
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          
          resolve(conversationMessages);
        }, 500);
      });
    }
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
        
      if (error) {
        if (isTableNotExistError(error)) {
          console.warn('messages table does not exist, falling back to mock data');
          DETECTED_MISSING_TABLES = true;
          console.info('To fix this issue, run the SQL script in scripts/create_conversation_tables.sql');
          return this.getMessages(conversationId);
        }
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      
      if (isTableNotExistError(error)) {
        console.warn('messages table does not exist, falling back to mock data');
        DETECTED_MISSING_TABLES = true;
        console.info('To fix this issue, run the SQL script in scripts/create_conversation_tables.sql');
        return this.getMessages(conversationId);
      }
      
      throw error;
    }
  },
  
  /**
   * Send a new message
   */
  async sendMessage(conversationId: string, content: string): Promise<Message> {
    const userId = await getUserId();
    
    if (!userId) {
      throw new Error('User must be logged in to send messages');
    }
    
    if (USE_MOCK_DATA) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // Find the conversation
          const conversation = mockConversations.find(conv => conv.id === conversationId);
          
          if (!conversation) {
            reject(new Error('Conversation not found'));
            return;
          }
          
          // Determine receiver
          const receiverId = conversation.buyer_id === userId 
            ? conversation.seller_id 
            : conversation.buyer_id;
          
          // Create a new message
          const newMessage: Message = {
            id: `msg-${mockMessages.length + 1}`.padStart(7, '0'),
            conversation_id: conversationId,
            sender_id: userId,
            receiver_id: receiverId,
            content,
            created_at: new Date().toISOString(),
            read: false
          };
          
          // Add to mock data
          mockMessages.push(newMessage);
          
          // Update conversation's last message time
          const convIndex = mockConversations.findIndex(conv => conv.id === conversationId);
          if (convIndex !== -1) {
            mockConversations[convIndex].last_message_at = newMessage.created_at;
          }
          
          resolve(newMessage);
        }, 300);
      });
    }
    
    try {
      // First get the conversation to determine the receiver
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();
        
      if (convError) {
        throw convError;
      }
      
      const receiverId = conversation.buyer_id === userId 
        ? conversation.seller_id 
        : conversation.buyer_id;
      
      // Create the message
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: userId,
          receiver_id: receiverId,
          content,
          created_at: new Date().toISOString(),
          read: false
        })
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      // Update the conversation's last message time
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);
      
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },
  
  /**
   * Mark messages as read
   */
  async markMessagesAsRead(conversationId: string): Promise<void> {
    const userId = await getUserId();
    
    if (!userId) {
      throw new Error('User must be logged in to mark messages as read');
    }
    
    if (USE_MOCK_DATA) {
      return new Promise(resolve => {
        setTimeout(() => {
          // Update mock messages
          mockMessages = mockMessages.map(msg => {
            if (msg.conversation_id === conversationId && msg.receiver_id === userId) {
              return { ...msg, read: true };
            }
            return msg;
          });
          
          resolve();
        }, 200);
      });
    }
    
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .eq('receiver_id', userId)
        .eq('read', false);
        
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  },
  
  /**
   * Start a new conversation about a listing
   */
  async startConversation(listingId: string, sellerId: string, initialMessage: string): Promise<Conversation> {
    const userId = await getUserId();
    
    if (!userId) {
      throw new Error('User must be logged in to start a conversation');
    }
    
    if (userId === sellerId) {
      throw new Error('Cannot start a conversation with yourself');
    }
    
    if (USE_MOCK_DATA) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // Check if a conversation already exists
          const existingConversation = mockConversations.find(
            conv => conv.listing_id === listingId && 
                   conv.buyer_id === userId && 
                   conv.seller_id === sellerId
          );
          
          if (existingConversation) {
            // Add the new message to the existing conversation
            const newMessage: Message = {
              id: `msg-${mockMessages.length + 1}`.padStart(7, '0'),
              conversation_id: existingConversation.id,
              sender_id: userId,
              receiver_id: sellerId,
              content: initialMessage,
              created_at: new Date().toISOString(),
              read: false
            };
            
            mockMessages.push(newMessage);
            
            // Update last message time
            const convIndex = mockConversations.findIndex(conv => conv.id === existingConversation.id);
            if (convIndex !== -1) {
              mockConversations[convIndex].last_message_at = newMessage.created_at;
            }
            
            resolve(existingConversation);
            return;
          }
          
          // Create a new conversation
          const newConversation: Conversation = {
            id: `conv-${mockConversations.length + 1}`.padStart(7, '0'),
            listing_id: listingId,
            buyer_id: userId,
            seller_id: sellerId,
            created_at: new Date().toISOString(),
            last_message_at: new Date().toISOString(),
            is_active: true
          };
          
          // Add to mock data
          mockConversations.push(newConversation);
          
          // Create the initial message
          const newMessage: Message = {
            id: `msg-${mockMessages.length + 1}`.padStart(7, '0'),
            conversation_id: newConversation.id,
            sender_id: userId,
            receiver_id: sellerId,
            content: initialMessage,
            created_at: new Date().toISOString(),
            read: false
          };
          
          mockMessages.push(newMessage);
          
          resolve(newConversation);
        }, 500);
      });
    }
    
    try {
      // Check for existing conversation
      const { data: existingConversations, error: checkError } = await supabase
        .from('conversations')
        .select('*')
        .eq('listing_id', listingId)
        .eq('buyer_id', userId)
        .eq('seller_id', sellerId)
        .eq('is_active', true);
        
      if (checkError) {
        throw checkError;
      }
      
      let conversationId: string;
      
      if (existingConversations && existingConversations.length > 0) {
        // Use existing conversation
        conversationId = existingConversations[0].id;
        
        // Update last message time
        await supabase
          .from('conversations')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', conversationId);
      } else {
        // Create a new conversation
        const { data: newConversation, error: createError } = await supabase
          .from('conversations')
          .insert({
            listing_id: listingId,
            buyer_id: userId,
            seller_id: sellerId,
            created_at: new Date().toISOString(),
            last_message_at: new Date().toISOString(),
            is_active: true
          })
          .select()
          .single();
          
        if (createError || !newConversation) {
          throw createError || new Error('Failed to create conversation');
        }
        
        conversationId = newConversation.id;
      }
      
      // Create the initial message
      await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: userId,
          receiver_id: sellerId,
          content: initialMessage,
          created_at: new Date().toISOString(),
          read: false
        });
      
      // Return the conversation
      const { data: conversation, error: getError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();
        
      if (getError || !conversation) {
        throw getError || new Error('Failed to get conversation');
      }
      
      return conversation;
    } catch (error) {
      console.error('Error starting conversation:', error);
      throw error;
    }
  },
  
  /**
   * Get the total number of unread messages for the current user
   */
  async getUnreadCount(): Promise<number> {
    const userId = await getUserId();
    
    if (!userId) {
      return 0;
    }
    
    if (USE_MOCK_DATA || DETECTED_MISSING_TABLES) {
      return new Promise(resolve => {
        setTimeout(() => {
          const unreadCount = mockMessages.filter(
            msg => msg.receiver_id === userId && !msg.read
          ).length;
          
          resolve(unreadCount);
        }, 200);
      });
    }
    
    try {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact' })
        .eq('receiver_id', userId)
        .eq('read', false);
        
      if (error) {
        if (isTableNotExistError(error)) {
          console.warn('messages table does not exist, falling back to mock data');
          DETECTED_MISSING_TABLES = true;
          console.info('To fix this issue, run the SQL script in scripts/create_conversation_tables.sql');
          return this.getUnreadCount();
        }
        throw error;
      }
      
      return count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      
      if (isTableNotExistError(error)) {
        console.warn('messages table does not exist, falling back to mock data');
        DETECTED_MISSING_TABLES = true;
        console.info('To fix this issue, run the SQL script in scripts/create_conversation_tables.sql');
        return this.getUnreadCount();
      }
      
      return 0;
    }
  }
}; 