import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
  Share,
  Platform,
  TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { BookService, BookListing } from '../services/BookService';
import { theme } from '../styles/theme';
import { useAuth } from '../store/AuthContext';
import { ContactSellerModal } from '../components/ContactSellerModal';

type ListingDetailsScreenProps = {
  route: RouteProp<RootStackParamList, 'ListingDetails'>;
  navigation: NativeStackNavigationProp<RootStackParamList, 'ListingDetails'>;
};

export const ListingDetailsScreen = ({ route, navigation }: ListingDetailsScreenProps) => {
  const { id } = route.params;
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const [listing, setListing] = useState<BookListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sellerInfo, setSellerInfo] = useState<any>(null);
  const [isContactModalVisible, setIsContactModalVisible] = useState(false);

  const isSeller = user?.id === listing?.seller_id;
  const isTablet = width > 768;

  useEffect(() => {
    const fetchListingDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await BookService.getListingById(id);
        if (data) {
          setListing(data);
          
          // In a real app, you would fetch seller info here
          // For now, we'll use a placeholder
          setSellerInfo({
            id: data.seller_id,
            name: 'Book Seller',
            rating: 4.8,
            joined: 'Jan 2023',
          });
        }
      } catch (err) {
        console.error('Error fetching listing details:', err);
        setError('Failed to load listing details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchListingDetails();
  }, [id]);

  const handleContact = () => {
    setIsContactModalVisible(true);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this book: ${listing?.title} by ${listing?.author} for $${listing?.price}`,
        url: `https://yourbookapp.com/listings/${id}`, // Replace with your actual app deep link
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditListing', { id });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Listing',
      'Are you sure you want to delete this listing? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await BookService.deleteListing(id);
              navigation.goBack();
            } catch (err) {
              console.error('Error deleting listing:', err);
              Alert.alert('Error', 'Failed to delete listing. Please try again later.');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading listing details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !listing) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={40} color={theme.colors.error} />
          <Text style={styles.errorText}>{error || 'Listing not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.retryText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header with back button and options */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Book image */}
        <Image
          source={{ uri: listing.image_url || 'https://source.unsplash.com/random/400x600/?book' }}
          style={[
            styles.bookImage,
            isTablet && { height: 400 }
          ]}
          resizeMode="cover"
        />

        {/* Book info section */}
        <View style={styles.infoSection}>
          <Text style={styles.bookTitle}>{listing.title}</Text>
          <Text style={styles.bookAuthor}>by {listing.author}</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.price}>${listing.price.toFixed(2)}</Text>
            {listing.is_negotiable && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>Negotiable</Text>
              </View>
            )}
            {listing.exchange_option && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>Exchange</Text>
              </View>
            )}
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="pricetag-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.detailText}>Condition: {listing.condition}</Text>
            </View>
            {listing.category && (
              <View style={styles.detailItem}>
                <Ionicons name="folder-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.detailText}>Category: {listing.category}</Text>
              </View>
            )}
          </View>

          {(listing.isbn || listing.edition || listing.publisher || listing.publication_year) && (
            <View style={styles.additionalDetails}>
              <Text style={styles.sectionTitle}>Additional Details</Text>
              <View style={styles.detailsGrid}>
                {listing.isbn && (
                  <View style={styles.gridItem}>
                    <Text style={styles.gridItemLabel}>ISBN</Text>
                    <Text style={styles.gridItemValue}>{listing.isbn}</Text>
                  </View>
                )}
                {listing.edition && (
                  <View style={styles.gridItem}>
                    <Text style={styles.gridItemLabel}>Edition</Text>
                    <Text style={styles.gridItemValue}>{listing.edition}</Text>
                  </View>
                )}
                {listing.publisher && (
                  <View style={styles.gridItem}>
                    <Text style={styles.gridItemLabel}>Publisher</Text>
                    <Text style={styles.gridItemValue}>{listing.publisher}</Text>
                  </View>
                )}
                {listing.publication_year && (
                  <View style={styles.gridItem}>
                    <Text style={styles.gridItemLabel}>Year</Text>
                    <Text style={styles.gridItemValue}>{listing.publication_year}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Book description */}
          {listing.description && (
            <View style={styles.description}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{listing.description}</Text>
            </View>
          )}

          {/* Seller info */}
          <View style={styles.sellerSection}>
            <Text style={styles.sectionTitle}>About the Seller</Text>
            <View style={styles.sellerInfo}>
              <View style={styles.sellerAvatar}>
                <Ionicons name="person" size={24} color={theme.colors.background} />
              </View>
              <View style={styles.sellerDetails}>
                <Text style={styles.sellerName}>{sellerInfo.name}</Text>
                <View style={styles.sellerStats}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text style={styles.sellerStatsText}>{sellerInfo.rating} • Member since {sellerInfo.joined}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action buttons */}
      <View style={styles.actionContainer}>
        {isSeller ? (
          <View style={styles.sellerActions}>
            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <Ionicons name="create-outline" size={20} color={theme.colors.background} />
              <Text style={styles.editButtonText}>Edit Listing</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={20} color={theme.colors.background} />
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
            <Ionicons name="chatbubble-outline" size={20} color="#fff" style={styles.contactButtonIcon} />
            <Text style={styles.contactButtonText}>Message Seller</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Contact Seller Modal */}
      {listing && sellerInfo && (
        <ContactSellerModal
          visible={isContactModalVisible}
          onClose={() => setIsContactModalVisible(false)}
          sellerId={sellerInfo.id}
          sellerName={sellerInfo.name}
          listingId={listing.id}
          listingTitle={listing.title}
        />
      )}
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
    paddingVertical: theme.spacing.sm,
  },
  backButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  shareButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  bookImage: {
    width: '100%',
    height: 300,
    backgroundColor: theme.colors.border,
  },
  infoSection: {
    padding: theme.spacing.md,
  },
  bookTitle: {
    ...theme.typography.h1 as TextStyle,
    marginBottom: theme.spacing.xs,
  },
  bookAuthor: {
    ...theme.typography.body as TextStyle,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  price: {
    ...theme.typography.h2 as TextStyle,
    color: theme.colors.primary,
    marginRight: theme.spacing.md,
  },
  tag: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.sm,
  },
  tagText: {
    color: theme.colors.background,
    fontSize: 12,
    fontWeight: '600' as TextStyle['fontWeight'],
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  detailText: {
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as TextStyle['fontWeight'],
    marginBottom: theme.spacing.sm,
  },
  additionalDetails: {
    marginBottom: theme.spacing.md,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '50%',
    paddingRight: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  gridItemLabel: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginBottom: 2,
  },
  gridItemValue: {
    fontSize: 16,
  },
  description: {
    marginBottom: theme.spacing.md,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.text,
  },
  sellerSection: {
    marginBottom: theme.spacing.xl,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontSize: 18,
    fontWeight: '600' as TextStyle['fontWeight'],
    marginBottom: 4,
  },
  sellerStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerStatsText: {
    color: theme.colors.textSecondary,
    marginLeft: 4,
    fontSize: 14,
  },
  actionContainer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  sellerActions: {
    flexDirection: 'row',
  },
  editButton: {
    flex: 3,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.md,
  },
  editButtonText: {
    color: theme.colors.background,
    fontWeight: '700' as TextStyle['fontWeight'],
    marginLeft: theme.spacing.xs,
  },
  deleteButton: {
    flex: 2,
    backgroundColor: theme.colors.error,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  deleteButtonText: {
    color: theme.colors.background,
    fontWeight: '700' as TextStyle['fontWeight'],
    marginLeft: theme.spacing.xs,
  },
  contactButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  contactButtonIcon: {
    marginRight: theme.spacing.xs,
  },
  contactButtonText: {
    color: '#fff',
    fontWeight: '700' as TextStyle['fontWeight'],
    fontSize: 16,
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
    fontWeight: '700' as TextStyle['fontWeight'],
  },
}); 