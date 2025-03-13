import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { FormInput } from '../components/FormInput';
import { Button } from '../components/Button';
import { theme } from '../styles/theme';
import { BookService, BookListing } from '../services/BookService';
import { ImageService } from '../services/ImageService';
import { useAuth } from '../store/AuthContext';
import * as ImagePicker from 'expo-image-picker';

type EditListingScreenProps = {
  route: RouteProp<RootStackParamList, 'EditListing'>;
  navigation: NativeStackNavigationProp<RootStackParamList, 'EditListing'>;
};

export const EditListingScreen = ({ route, navigation }: EditListingScreenProps) => {
  const { id } = route.params;
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isbn, setIsbn] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [exchangeOption, setExchangeOption] = useState(false);
  const [publisher, setPublisher] = useState('');
  const [publicationYear, setPublicationYear] = useState('');
  const [edition, setEdition] = useState('');

  const [errors, setErrors] = useState<{
    title?: string;
    author?: string;
    price?: string;
    condition?: string;
    category?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch the listing details when the component mounts
  useEffect(() => {
    fetchListingDetails();
  }, [id]);

  // Request camera roll permissions on component mount
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to make this work!'
        );
      }
    })();
  }, []);

  const fetchListingDetails = async () => {
    try {
      setIsLoading(true);
      const data = await BookService.getListingById(id);
      
      if (!data) {
        Alert.alert('Error', 'Listing not found');
        navigation.goBack();
        return;
      }

      // Check if user is the owner of this listing
      if (user?.id !== data.seller_id) {
        Alert.alert('Error', 'You do not have permission to edit this listing');
        navigation.goBack();
        return;
      }

      // Populate the form with the existing listing data
      setTitle(data.title);
      setAuthor(data.author);
      setPrice(data.price.toString());
      setCondition(data.condition);
      setDescription(data.description || '');
      setCategory(data.category || '');
      setIsbn(data.isbn || '');
      setImageUrl(data.image_url);
      setIsNegotiable(data.is_negotiable || false);
      setExchangeOption(data.exchange_option || false);
      setPublisher(data.publisher || '');
      setPublicationYear(data.publication_year ? data.publication_year.toString() : '');
      setEdition(data.edition || '');

      // Parse image path from URL if available
      if (data.image_url && data.image_url.includes('book-images')) {
        try {
          // This assumes your image_url format is consistent
          const pathRegex = /book-images\/(.+)/;
          const match = data.image_url.match(pathRegex);
          if (match && match[1]) {
            setImagePath(match[1]);
          }
        } catch (error) {
          console.error('Error parsing image path:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching listing details:', error);
      Alert.alert('Error', 'Failed to load listing details');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    // Show options dialog for camera or gallery
    Alert.alert(
      'Choose Image Source',
      'Where would you like to select an image from?',
      [
        { 
          text: 'Cancel', 
          style: 'cancel' 
        },
        { 
          text: 'Camera', 
          onPress: takePicture 
        },
        { 
          text: 'Photo Library', 
          onPress: selectFromGallery 
        },
      ]
    );
  };

  const takePicture = async () => {
    try {
      // First check and request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'We need camera permissions to take pictures'
        );
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 6],
        quality: 0.7,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture');
    }
  };

  const selectFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 6],
        quality: 0.7,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const validateForm = () => {
    const newErrors: {
      title?: string;
      author?: string;
      price?: string;
      condition?: string;
      category?: string;
    } = {};
    
    if (!title) {
      newErrors.title = 'Title is required';
    }
    
    if (!author) {
      newErrors.author = 'Author is required';
    }
    
    if (!price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(Number(price)) || Number(price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    
    if (!condition) {
      newErrors.condition = 'Condition is required';
    }

    if (!category) {
      newErrors.category = 'Category is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!user) {
      Alert.alert('Error', 'You must be logged in to update a listing');
      return;
    }
    
    setIsSaving(true);
    
    try {
      let updatedImageUrl = imageUrl; // Start with the current image URL
      
      // If user selected a new image, upload it to Supabase Storage
      if (imageUri) {
        try {
          // Generate a path based on user ID and timestamp or use existing path
          const newImagePath = imagePath || `${user.id}/book-${Date.now()}`;
          // Upload the image and get the public URL
          updatedImageUrl = await ImageService.uploadImage(imageUri, 'book-images', newImagePath);
        } catch (imageError) {
          console.error('Error uploading image:', imageError);
          // If image upload fails, we'll use the existing image but continue with the listing update
          Alert.alert(
            'Image Upload Warning',
            'Failed to upload your new image. Your listing will continue with the existing image.',
            [{ text: 'Continue' }]
          );
        }
      }
      
      const updatedListing = {
        title,
        author,
        price: Number(price),
        condition,
        description: description || undefined,
        category: category || undefined,
        isbn: isbn || undefined,
        image_url: updatedImageUrl || undefined,
        is_negotiable: isNegotiable,
        exchange_option: exchangeOption,
        publisher: publisher || undefined,
        publication_year: publicationYear ? Number(publicationYear) : undefined,
        edition: edition || undefined,
      };
      
      await BookService.updateListing(id, updatedListing);
      
      Alert.alert(
        'Success',
        'Your book listing has been updated successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error updating listing:', error);
      Alert.alert(
        'Error',
        'Failed to update your listing. Please try again later.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const conditions = ['New', 'Like New', 'Good', 'Fair', 'Acceptable'];
  
  const categories = [
    'Computer Science',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Medicine',
    'Business',
    'Economics',
    'Law',
    'Psychology',
    'Literature',
    'History',
    'Philosophy',
    'Art',
    'Music',
    'Other'
  ];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading listing details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Listing</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.imageSection}>
            <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
              {imageUri ? (
                <Image 
                  source={{ uri: imageUri }} 
                  style={styles.previewImage} 
                  resizeMode="cover"
                />
              ) : imageUrl ? (
                <Image 
                  source={{ uri: imageUrl }} 
                  style={styles.previewImage} 
                  resizeMode="cover"
                />
              ) : (
                <>
                  <Ionicons name="camera" size={40} color={theme.colors.primary} />
                  <Text style={styles.imageUploadText}>Add Photos</Text>
                </>
              )}
            </TouchableOpacity>
            {(imageUri || imageUrl) && (
              <TouchableOpacity 
                style={styles.changeImageButton} 
                onPress={pickImage}
              >
                <Text style={styles.changeImageText}>Change Image</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.form}>
            <FormInput
              label="Book Title"
              placeholder="Enter the book title"
              value={title}
              onChangeText={setTitle}
              error={errors.title}
            />
            
            <FormInput
              label="Author"
              placeholder="Enter the author's name"
              value={author}
              onChangeText={setAuthor}
              error={errors.author}
            />
            
            <FormInput
              label="Price ($)"
              placeholder="Enter the price"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              error={errors.price}
            />
            
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              <View style={styles.categoryButtons}>
                {categories.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.categoryButton,
                      category === item && styles.selectedCategory,
                    ]}
                    onPress={() => setCategory(item)}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        category === item && styles.selectedCategoryText,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            {errors.category && (
              <Text style={styles.errorText}>{errors.category}</Text>
            )}
            
            <Text style={styles.label}>Condition</Text>
            <View style={styles.conditionButtons}>
              {conditions.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.conditionButton,
                    condition === item && styles.selectedCondition,
                  ]}
                  onPress={() => setCondition(item)}
                >
                  <Text
                    style={[
                      styles.conditionText,
                      condition === item && styles.selectedConditionText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.condition && (
              <Text style={styles.errorText}>{errors.condition}</Text>
            )}
            
            <FormInput
              label="ISBN (Optional)"
              placeholder="Enter ISBN"
              value={isbn}
              onChangeText={setIsbn}
              keyboardType="numeric"
            />

            <FormInput
              label="Edition (Optional)"
              placeholder="Enter Edition (e.g., 2nd Edition)"
              value={edition}
              onChangeText={setEdition}
            />

            <FormInput
              label="Publisher (Optional)"
              placeholder="Enter Publisher"
              value={publisher}
              onChangeText={setPublisher}
            />

            <FormInput
              label="Publication Year (Optional)"
              placeholder="Enter Publication Year"
              value={publicationYear}
              onChangeText={setPublicationYear}
              keyboardType="numeric"
            />
            
            <View style={styles.optionsContainer}>
              <Text style={styles.label}>Options</Text>
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={() => setIsNegotiable(!isNegotiable)}
                >
                  <View style={[styles.checkbox, isNegotiable && styles.checkedBox]}>
                    {isNegotiable && <Ionicons name="checkmark" size={16} color="#FFF" />}
                  </View>
                  <Text style={styles.optionText}>Price is negotiable</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={() => setExchangeOption(!exchangeOption)}
                >
                  <View style={[styles.checkbox, exchangeOption && styles.checkedBox]}>
                    {exchangeOption && <Ionicons name="checkmark" size={16} color="#FFF" />}
                  </View>
                  <Text style={styles.optionText}>Open to exchanges</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <FormInput
              label="Description (Optional)"
              placeholder="Describe your book, including any damage or notes"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={styles.descriptionInput}
            />
            
            <Button
              title={isSaving ? 'Saving...' : 'Save Changes'}
              onPress={handleSubmit}
              disabled={isSaving}
            />
            {isSaving && (
              <ActivityIndicator 
                style={styles.loadingIndicator} 
                size="small" 
                color={theme.colors.primary} 
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  placeholder: {
    width: 24, // Same width as the back button
  },
  imageSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  imageUpload: {
    width: 200,
    height: 300,
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  imageUploadText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.text,
  },
  changeImageButton: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  changeImageText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  form: {
    padding: theme.spacing.md,
  },
  label: {
    ...theme.typography.body,
    fontWeight: 'bold',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
  },
  categoryScroll: {
    marginBottom: theme.spacing.sm,
  },
  categoryButtons: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.xs,
  },
  categoryButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.sm,
    backgroundColor: theme.colors.border,
  },
  selectedCategory: {
    backgroundColor: theme.colors.primary,
  },
  categoryText: {
    color: theme.colors.text,
  },
  selectedCategoryText: {
    color: '#FFF',
  },
  conditionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
  },
  conditionButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.border,
  },
  selectedCondition: {
    backgroundColor: theme.colors.primary,
  },
  conditionText: {
    color: theme.colors.text,
  },
  selectedConditionText: {
    color: '#FFF',
  },
  descriptionInput: {
    minHeight: 100,
  },
  loadingIndicator: {
    marginTop: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
  },
  optionsContainer: {
    marginBottom: theme.spacing.md,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    marginRight: theme.spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: theme.colors.primary,
  },
  optionText: {
    color: theme.colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
}); 