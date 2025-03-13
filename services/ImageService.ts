import { supabase } from '../config/supabase';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { decode } from 'base64-arraybuffer';

export const ImageService = {
  /**
   * Upload an image to Supabase Storage
   * @param uri Local URI of the image
   * @param bucket Supabase Storage bucket name
   * @param path Path within the bucket
   * @returns Public URL of the uploaded image
   */
  async uploadImage(uri: string, bucket: string = 'book-images', path: string): Promise<string> {
    try {
      // Generate a unique file name
      const fileName = `${path}_${new Date().getTime()}.jpg`;
      
      let base64;
      
      if (Platform.OS === 'web') {
        // Handle web platform
        const response = await fetch(uri);
        const blob = await response.blob();
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
          reader.onload = async () => {
            try {
              const result = reader.result as string;
              base64 = result.split(',')[1];
              const { data, error } = await supabase.storage
                .from(bucket)
                .upload(fileName, decode(base64), {
                  contentType: 'image/jpeg',
                  upsert: true,
                });
              
              if (error) throw error;
              
              // Get the public URL
              const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(fileName);
              
              resolve(publicUrl);
            } catch (error) {
              reject(error);
            }
          };
          reader.onerror = () => {
            reject(new Error('Failed to read file'));
          };
          reader.readAsDataURL(blob);
        });
      } else {
        // Handle native platforms
        const fileInfo = await FileSystem.getInfoAsync(uri);
        
        if (!fileInfo.exists) {
          throw new Error('File does not exist');
        }
        
        // Read the file as base64
        base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
        
        // Upload to Supabase
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(fileName, decode(base64), {
            contentType: 'image/jpeg',
            upsert: true,
          });
        
        if (error) throw error;
        
        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);
        
        return publicUrl;
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },
  
  /**
   * Delete an image from Supabase Storage
   * @param path Full path to the image in the bucket
   * @param bucket Supabase Storage bucket name
   */
  async deleteImage(path: string, bucket: string = 'book-images'): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }
}; 