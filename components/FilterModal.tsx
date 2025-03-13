import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { BookFilterOptions } from '../services/BookService';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: BookFilterOptions) => void;
  currentFilters: BookFilterOptions;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  currentFilters,
}) => {
  // Local state for the filters
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    currentFilters.categories || []
  );
  const [selectedConditions, setSelectedConditions] = useState<string[]>(
    currentFilters.conditions || []
  );
  const [minPrice, setMinPrice] = useState<string>(
    currentFilters.minPrice?.toString() || ''
  );
  const [maxPrice, setMaxPrice] = useState<string>(
    currentFilters.maxPrice?.toString() || ''
  );
  const [isNegotiable, setIsNegotiable] = useState<boolean | undefined>(
    currentFilters.isNegotiable
  );
  const [exchangeOption, setExchangeOption] = useState<boolean | undefined>(
    currentFilters.exchangeOption
  );

  // Categories and conditions
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

  const conditions = ['New', 'Like New', 'Good', 'Fair', 'Acceptable'];

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const toggleCondition = (condition: string) => {
    setSelectedConditions((prev) =>
      prev.includes(condition)
        ? prev.filter((c) => c !== condition)
        : [...prev, condition]
    );
  };

  const toggleNegotiable = () => {
    setIsNegotiable((prev) => {
      if (prev === undefined) return true;
      if (prev === true) return false;
      return undefined;
    });
  };

  const toggleExchange = () => {
    setExchangeOption((prev) => {
      if (prev === undefined) return true;
      if (prev === true) return false;
      return undefined;
    });
  };

  const handleApply = () => {
    const filters: BookFilterOptions = {
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      conditions: selectedConditions.length > 0 ? selectedConditions : undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      isNegotiable,
      exchangeOption,
    };
    onApply(filters);
    onClose();
  };

  const handleClear = () => {
    setSelectedCategories([]);
    setSelectedConditions([]);
    setMinPrice('');
    setMaxPrice('');
    setIsNegotiable(undefined);
    setExchangeOption(undefined);
  };

  const getFilterCount = (): number => {
    let count = 0;
    if (selectedCategories.length > 0) count++;
    if (selectedConditions.length > 0) count++;
    if (minPrice || maxPrice) count++;
    if (isNegotiable !== undefined) count++;
    if (exchangeOption !== undefined) count++;
    return count;
  };

  const getOptionStateStyles = (isSelected: boolean) => {
    return {
      button: isSelected ? styles.selectedOption : styles.option,
      text: isSelected ? styles.selectedOptionText : styles.optionText,
    };
  };

  const getTriStateStyles = (state: boolean | undefined) => {
    if (state === undefined) {
      return {
        container: styles.triStateOption,
        text: styles.optionText,
        icon: null,
      };
    } else if (state === true) {
      return {
        container: styles.triStateOptionSelected,
        text: styles.selectedOptionText,
        icon: <Ionicons name="checkmark" size={16} color="#FFF" />,
      };
    } else {
      return {
        container: styles.triStateOptionDisabled,
        text: styles.disabledOptionText,
        icon: <Ionicons name="close" size={16} color="#FFF" />,
      };
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close-outline" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Filter Books</Text>
            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent}>
            {/* Categories Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <View style={styles.optionsContainer}>
                {categories.map((category) => {
                  const isSelected = selectedCategories.includes(category);
                  const styles = getOptionStateStyles(isSelected);
                  return (
                    <TouchableOpacity
                      key={category}
                      style={styles.button}
                      onPress={() => toggleCategory(category)}
                    >
                      <Text style={styles.text}>{category}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Condition Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Condition</Text>
              <View style={styles.optionsContainer}>
                {conditions.map((condition) => {
                  const isSelected = selectedConditions.includes(condition);
                  const styles = getOptionStateStyles(isSelected);
                  return (
                    <TouchableOpacity
                      key={condition}
                      style={styles.button}
                      onPress={() => toggleCondition(condition)}
                    >
                      <Text style={styles.text}>{condition}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Price Range Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Price Range</Text>
              <View style={styles.priceRangeContainer}>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.priceLabel}>Min ($)</Text>
                  <TextInput
                    style={styles.priceInput}
                    value={minPrice}
                    onChangeText={setMinPrice}
                    placeholder="0"
                    keyboardType="numeric"
                  />
                </View>
                <Text style={styles.priceSeparator}>-</Text>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.priceLabel}>Max ($)</Text>
                  <TextInput
                    style={styles.priceInput}
                    value={maxPrice}
                    onChangeText={setMaxPrice}
                    placeholder="Any"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            {/* Options Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Options</Text>
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={toggleNegotiable}
                >
                  <View style={getTriStateStyles(isNegotiable).container}>
                    {getTriStateStyles(isNegotiable).icon}
                  </View>
                  <Text style={getTriStateStyles(isNegotiable).text}>
                    Price is negotiable
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={toggleExchange}
                >
                  <View style={getTriStateStyles(exchangeOption).container}>
                    {getTriStateStyles(exchangeOption).icon}
                  </View>
                  <Text style={getTriStateStyles(exchangeOption).text}>
                    Open to exchanges
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>
                Apply {getFilterCount() > 0 && `(${getFilterCount()})`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20, // Extra padding for iOS
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  modalTitle: {
    ...theme.typography.h2,
    fontSize: 18,
    color: theme.colors.text,
  },
  clearButton: {
    padding: theme.spacing.xs,
  },
  clearText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  scrollContent: {
    flex: 1,
  },
  section: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionTitle: {
    ...theme.typography.body,
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  option: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.border,
  },
  selectedOption: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
  },
  optionText: {
    color: theme.colors.text,
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  disabledOptionText: {
    color: '#FFFFFF',
  },
  priceRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceInputContainer: {
    flex: 1,
  },
  priceLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    backgroundColor: '#FFFFFF',
  },
  priceSeparator: {
    marginHorizontal: theme.spacing.md,
    color: theme.colors.textSecondary,
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
    paddingVertical: theme.spacing.xs,
  },
  triStateOption: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    marginRight: theme.spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  triStateOptionSelected: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
    marginRight: theme.spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  triStateOptionDisabled: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.error,
    backgroundColor: theme.colors.error,
    marginRight: theme.spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  applyButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 