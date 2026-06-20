import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Platform, KeyboardAvoidingView } from 'react-native';
import { colors, radius, spacing } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { useNavigation } from '@react-navigation/native';

export function CreateSplitScreen(): React.ReactElement {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [splitWith, setSplitWith] = useState(''); // Normally contact picker
  const [splitMethod, setSplitMethod] = useState<'equally' | 'exact'>('equally');

  const handleSave = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.headerTitle}>New Split Expense</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>What was it for?</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Dinner, Rent, Groceries"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
            autoFocus
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Total Amount</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              value={totalAmount}
              onChangeText={setTotalAmount}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Split With (Names)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Alice, Bob"
            placeholderTextColor={colors.textMuted}
            value={splitWith}
            onChangeText={setSplitWith}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>How to split?</Text>
          <View style={styles.methodSelector}>
            <Pressable 
              style={[styles.methodButton, splitMethod === 'equally' && styles.methodButtonActive]}
              onPress={() => setSplitMethod('equally')}
            >
              <Text style={[styles.methodText, splitMethod === 'equally' && styles.methodTextActive]}>
                Equally
              </Text>
            </Pressable>
            <Pressable 
              style={[styles.methodButton, splitMethod === 'exact' && styles.methodButtonActive]}
              onPress={() => setSplitMethod('exact')}
            >
              <Text style={[styles.methodText, splitMethod === 'exact' && styles.methodTextActive]}>
                Exact Amounts
              </Text>
            </Pressable>
          </View>
        </View>

        {splitMethod === 'equally' && totalAmount && splitWith.split(',').filter(Boolean).length > 0 && (
          <View style={styles.summaryBox}>
            <Text style={styles.summaryText}>
              Everyone pays ₹{(parseFloat(totalAmount) / (splitWith.split(',').filter(Boolean).length + 1)).toFixed(2)}
            </Text>
          </View>
        )}

      </ScrollView>

      <View style={styles.footer}>
        <Pressable 
          style={[styles.saveButton, (!title || !totalAmount || !splitWith) && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={!title || !totalAmount || !splitWith}
        >
          <Text style={styles.saveButtonText}>Create Split</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.2xl,
  },
  inputGroup: {
    marginBottom: spacing.xl,
  },
  label: {
    ...typography.labelMedium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    ...typography.bodyLarge,
    color: colors.textPrimary,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  currencySymbol: {
    ...typography.h2,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  amountInput: {
    flex: 1,
    ...typography.h2,
    color: colors.textPrimary,
    paddingVertical: spacing.md,
  },
  methodSelector: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceHover,
    borderRadius: radius.full,
    padding: 4,
  },
  methodButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.full,
  },
  methodButtonActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  methodText: {
    ...typography.labelMedium,
    color: colors.textSecondary,
  },
  methodTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  summaryBox: {
    backgroundColor: colors.primary + '15',
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  summaryText: {
    ...typography.labelMedium,
    color: colors.primary,
  },
  footer: {
    padding: spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : spacing.xl,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveButton: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    ...typography.labelLarge,
    color: colors.textInverse,
    fontSize: 18,
  },
});
