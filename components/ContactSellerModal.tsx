import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TextStyle
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../styles/theme';
import { MessageService } from '../services/MessageService';

interface ContactSellerModalProps {
  visible: boolean;
  onClose: () => void;
  sellerId: string;
  sellerName: string;
  listingId: string;
  listingTitle: string;
}

export const ContactSellerModal = ({
  visible,
  onClose,
  sellerId,
  sellerName,
  listingId,
  listingTitle
}: ContactSellerModalProps) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleSendMessage = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    try {
      setIsLoading(true);
      const conversation = await MessageService.startConversation(
        listingId,
        sellerId,
        message.trim()
      );
      
      // Reset and close
      setMessage('');
      onClose();
      
      // Navigate to the chat screen
      navigation.navigate('Chat', {
        conversationId: conversation.id,
        otherUserName: sellerName,
        listingTitle
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      
      // Check if it's a self-message error
      if (error instanceof Error && error.message.includes('yourself')) {
        Alert.alert('Error', 'You cannot message yourself');
      } else {
        Alert.alert('Error', 'Failed to send message. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.centeredView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalView}>
            <View style={styles.header}>
              <Text style={styles.title}>Contact {sellerName}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.subtitle}>
              About: {listingTitle}
            </Text>
            
            <Text style={styles.label}>Your Message</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Hi! Is this book still available?"
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={500}
              textAlignVertical="top"
            />
            
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!message.trim() || isLoading) && styles.disabledButton
              ]}
              onPress={handleSendMessage}
              disabled={!message.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.sendButtonText}>Send Message</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    minHeight: '50%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    ...(theme.typography.h2 as TextStyle),
    color: theme.colors.text,
  },
  subtitle: {
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
    fontStyle: 'italic',
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as TextStyle['fontWeight'],
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    minHeight: 150,
    marginBottom: theme.spacing.lg,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  disabledButton: {
    backgroundColor: theme.colors.textSecondary,
    opacity: 0.7,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
}); 