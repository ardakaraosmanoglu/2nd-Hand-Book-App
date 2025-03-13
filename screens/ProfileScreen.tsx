import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { useAuth } from '../store/AuthContext';
import { Button } from '../components/Button';

export const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  const { width } = useWindowDimensions();
  const isTablet = width > 768;

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        Alert.alert('Error', 'Failed to sign out. Please try again.');
      }
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  // Mock user data
  const userData = {
    name: 'John Doe',
    email: user?.email || 'user@example.com',
    location: 'New York, NY',
    joinDate: 'January 2023',
    booksListed: 12,
    booksSold: 8,
    profileImage: 'https://source.unsplash.com/random/200x200/?portrait',
  };

  const ProfileSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const ProfileItem = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.profileItem}>
      <Text style={styles.profileLabel}>{label}</Text>
      <Text style={styles.profileValue}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={[
            styles.scrollContent,
            isTablet && styles.tabletScrollContent
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.profileHeader}>
            <Image 
              source={{ uri: userData.profileImage }} 
              style={styles.profileImage} 
            />
            <Text style={styles.profileName}>{userData.name}</Text>
            <Text style={styles.profileEmail}>{userData.email}</Text>
          </View>

          <View style={isTablet ? styles.tabletSectionsContainer : null}>
            <ProfileSection title="Account Information">
              <ProfileItem label="Location" value={userData.location} />
              <ProfileItem label="Member Since" value={userData.joinDate} />
            </ProfileSection>

            <ProfileSection title="Activity">
              <ProfileItem label="Books Listed" value={userData.booksListed.toString()} />
              <ProfileItem label="Books Sold" value={userData.booksSold.toString()} />
            </ProfileSection>
          </View>

          <View style={[
            styles.actions,
            isTablet && styles.tabletActions
          ]}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="list-outline" size={24} color={theme.colors.text} />
              <Text style={styles.actionText}>My Listings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="help-circle-outline" size={24} color={theme.colors.text} />
              <Text style={styles.actionText}>Help</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="heart-outline" size={24} color={theme.colors.text} />
              <Text style={styles.actionText}>Favorites</Text>
            </TouchableOpacity>
          </View>

          <View style={isTablet ? styles.tabletButtonContainer : styles.buttonContainer}>
            <Button 
              title="Sign Out" 
              onPress={handleSignOut} 
              variant="secondary" 
            />
          </View>
        </ScrollView>
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
    backgroundColor: theme.colors.background,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  settingsButton: {
    padding: theme.spacing.xs,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl * 2, // Extra padding for tab bar
  },
  tabletScrollContent: {
    paddingHorizontal: theme.spacing.xl,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: theme.spacing.md,
  },
  profileName: {
    ...theme.typography.h2,
    marginBottom: theme.spacing.xs,
  },
  profileEmail: {
    color: theme.colors.textSecondary,
  },
  tabletSectionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  section: {
    marginBottom: theme.spacing.lg,
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flex: 1,
    maxWidth: '100%',
  },
  sectionTitle: {
    ...theme.typography.body,
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
    color: theme.colors.primary,
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  profileLabel: {
    color: theme.colors.textSecondary,
  },
  profileValue: {
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.lg,
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabletActions: {
    maxWidth: '100%',
  },
  actionButton: {
    alignItems: 'center',
    padding: theme.spacing.sm,
  },
  actionText: {
    marginTop: theme.spacing.xs,
    color: theme.colors.text,
  },
  buttonContainer: {
    marginTop: theme.spacing.md,
  },
  tabletButtonContainer: {
    marginTop: theme.spacing.lg,
    width: '50%',
    alignSelf: 'center',
  },
}); 