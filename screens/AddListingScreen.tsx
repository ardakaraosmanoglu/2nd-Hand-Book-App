import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { FormInput } from '../components/FormInput';
import { Button } from '../components/Button';
import { theme } from '../styles/theme';
import { BookService, CreateBookListing } from '../services/BookService';
import { ImageService } from '../services/ImageService';
import { useAuth } from '../store/AuthContext';
import * as ImagePicker from 'expo-image-picker';

export const AddListingScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isbn, setIsbn] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    title?: string;
    author?: string;
    price?: string;
    condition?: string;
    category?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Request camera roll permissions on component mount
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
      Alert.alert('Error', 'You must be logged in to add a listing');
      return;
    }
    
    setIsLoading(true);
    
    try {
      let image_url = 'https://source.unsplash.com/random/200x300/?book'; // Default fallback
      
      // If user selected an image, upload it to Supabase Storage
      if (imageUri) {
        try {
          // Generate a path based on user ID and timestamp
          const imagePath = `${user.id}/book`;
          // Upload the image and get the public URL
          image_url = await ImageService.uploadImage(imageUri, 'book-images', imagePath);
        } catch (imageError) {
          console.error('Error uploading image:', imageError);
          // If image upload fails, we'll use the default image but continue with the listing
          Alert.alert(
            'Image Upload Warning',
            'Failed to upload your image. Your listing will continue with a default image.',
            [{ text: 'Continue' }]
          );
        }
      }
      
      const newListing: CreateBookListing = {
        title,
        author,
        price: Number(price),
        condition,
        description: description || undefined,
        category: category || undefined,
        isbn: isbn || undefined,
        image_url,
        seller_id: user.id,
      };
      
      await BookService.createListing(newListing);
      
      Alert.alert(
        'Success',
        'Your book has been listed successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error adding listing:', error);
      Alert.alert(
        'Error',
        'Failed to add your listing. Please try again later.'
      );
    } finally {
      setIsLoading(false);
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

  return (
    <SafeAreaView style={styles.container}>
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
            <Text style={styles.headerTitle}>Sell a Book</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.imageSection}>
            <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
              {imageUri ? (
                <Image 
                  source={{ uri: imageUri }} 
                  style={styles.previewImage as any} 
                  resizeMode="cover"
                />
              ) : (
                <>
                  <Ionicons name="camera" size={40} color={theme.colors.primary} />
                  <Text style={styles.imageUploadText}>Add Photos</Text>
                </>
              )}
            </TouchableOpacity>
            {imageUri && (
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
              title={isLoading ? 'Listing...' : 'List Book for Sale'}
              onPress={handleSubmit}
              disabled={isLoading}
            />
            {isLoading && (
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
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight as "bold" | "normal" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900",
    color: theme.colors.text,
  },
  placeholder: {
    width: 24,
  },
  imageSection: {
    marginBottom: theme.spacing.lg,
  },
  imageUpload: {
    height: 200,
    backgroundColor: '#f5f5f5',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
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
    color: theme.colors.primary,
  },
  changeImageButton: {
    marginTop: theme.spacing.sm,
    alignSelf: 'center',
  },
  changeImageText: {
    color: theme.colors.primary,
    fontSize: 14,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: theme.typography.body.fontSize,
    marginBottom: theme.spacing.xs,
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
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.sm,
  },
  selectedCategory: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryText: {
    color: theme.colors.text,
  },
  selectedCategoryText: {
    color: '#fff',
  },
  conditionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.sm,
  },
  conditionButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  selectedCondition: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  conditionText: {
    color: theme.colors.text,
  },
  selectedConditionText: {
    color: '#fff',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    marginTop: -theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: theme.spacing.sm,
  },
  loadingIndicator: {
    marginTop: theme.spacing.md,
    alignSelf: 'center',
  },
}); 