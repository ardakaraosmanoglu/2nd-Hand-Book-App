import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  TextStyle
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format, isToday, isYesterday } from 'date-fns';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../styles/theme';
import { MessageService, ConversationWithDetails } from '../services/MessageService';

type ConversationsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Conversations'>;
};

export const ConversationsScreen = ({ navigation }: ConversationsScreenProps) => {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalUnread, setTotalUnread] = useState(0);
  const isFocused = useIsFocused();

  const fetchConversations = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const data = await MessageService.getConversations();
      setConversations(data);
      
      // Calculate total unread messages
      const unreadCount = data.reduce((total, conv) => total + conv.unreadCount, 0);
      setTotalUnread(unreadCount);
      
      // Update tab badge
      updateBadge(unreadCount);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations. Please try again later.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);
  
  const updateBadge = useCallback((count: number) => {
    // Update the badge on the tab icon
    if (navigation.setOptions) {
      navigation.setOptions({
        tabBarBadge: count > 0 ? count : undefined
      });
    }
  }, [navigation]);

  // Fetch conversations when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchConversations();
      
      // Set up a refresh interval when the screen is focused
      const intervalId = setInterval(() => {
        fetchConversations();
      }, 30000); // Check for new messages every 30 seconds
      
      return () => clearInterval(intervalId);
    }, [fetchConversations])
  );
  
  // Also fetch total unread count periodically when not on this screen
  useEffect(() => {
    if (!isFocused) {
      const fetchUnreadCount = async () => {
        try {
          const count = await MessageService.getUnreadCount();
          updateBadge(count);
        } catch (error) {
          console.error('Error fetching unread count:', error);
        }
      };
      
      const intervalId = setInterval(() => {
        fetchUnreadCount();
      }, 60000); // Check once per minute when not on screen
      
      return () => clearInterval(intervalId);
    }
  }, [isFocused, updateBadge]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchConversations();
  };

  const navigateToChat = (conversation: ConversationWithDetails) => {
    navigation.navigate('Chat', {
      conversationId: conversation.id,
      otherUserName: conversation.otherUser.name,
      listingTitle: conversation.listing.title
    });
  };

  // Format date for display
  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  // Show loading indicator
  if (isLoading && !isRefreshing) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Messages</Text>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={40} color={theme.colors.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchConversations}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : conversations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubble-outline" size={60} color={theme.colors.textSecondary} />
            <Text style={styles.emptyText}>No conversations yet</Text>
            <Text style={styles.emptySubtext}>
              Start a conversation by messaging a seller from a book listing
            </Text>
          </View>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.conversationItem}
                onPress={() => navigateToChat(item)}
                activeOpacity={0.7}
              >
                {/* User Image */}
                <Image
                  source={{
                    uri: item.otherUser.profileImage || 'https://source.unsplash.com/random/200x200/?portrait'
                  }}
                  style={styles.userImage}
                />
                
                {/* Unread Count Badge */}
                {item.unreadCount > 0 && (
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>
                      {item.unreadCount > 99 ? '99+' : item.unreadCount}
                    </Text>
                  </View>
                )}
                
                {/* Conversation Details */}
                <View style={styles.conversationDetails}>
                  <View style={styles.topRow}>
                    <Text style={styles.userName} numberOfLines={1}>
                      {item.otherUser.name}
                    </Text>
                    <Text style={styles.timeText}>
                      {formatMessageDate(item.last_message_at)}
                    </Text>
                  </View>
                  
                  <Text 
                    style={[
                      styles.messagePreview, 
                      item.unreadCount > 0 && styles.unreadMessagePreview
                    ]} 
                    numberOfLines={1}
                  >
                    {item.lastMessage || 'No messages yet'}
                  </Text>
                  
                  <Text style={styles.bookTitle} numberOfLines={1}>
                    Re: {item.listing.title}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={[theme.colors.primary]}
                tintColor={theme.colors.primary}
              />
            }
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    ...(theme.typography.h2 as TextStyle),
    color: theme.colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  errorText: {
    textAlign: 'center',
    marginVertical: theme.spacing.md,
    color: theme.colors.error,
  },
  retryButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  emptyText: {
    marginTop: theme.spacing.md,
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  emptySubtext: {
    marginTop: theme.spacing.sm,
    textAlign: 'center',
    color: theme.colors.textSecondary,
    paddingHorizontal: theme.spacing.xl,
  },
  listContainer: {
    flexGrow: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: '#fff',
    position: 'relative',
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: theme.spacing.md,
  },
  badgeContainer: {
    position: 'absolute',
    top: theme.spacing.md,
    left: 40,
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  conversationDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontWeight: '700',
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  timeText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  messagePreview: {
    color: theme.colors.text,
    marginBottom: 4,
  },
  unreadMessagePreview: {
    fontWeight: '700',
  },
  bookTitle: {
    fontSize: 12,
    color: theme.colors.primary,
    fontStyle: 'italic',
  },
}); 