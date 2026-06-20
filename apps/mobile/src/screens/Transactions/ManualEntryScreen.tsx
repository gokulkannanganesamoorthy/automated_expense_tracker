import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { colors, radius, spacing } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { useTransactionStore } from '../../stores/transaction-store';
import { useNavigation } from '@react-navigation/native';
import { generateDedupHashSync } from '../../sms/parser/dedup';

export function ManualEntryScreen(): React.ReactElement {
  const navigation = useNavigation();
  const { addTransaction } = useTransactionStore();

  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [type, setType] = useState<'debit' | 'credit'>('debit');
  const [category, setCategory] = useState('other'); // In real app, open category picker

  const handleSave = async () => {
    if (!amount || !merchant) return;

    const amountPaise = Math.round(parseFloat(amount) * 100);
    const now = new Date().toISOString();
    
    // Create new transaction
    const newTxn = {
      id: `manual_${Date.now()}`,
      amountPaise,
      type,
      merchant,
      merchantNormalized: merchant.toLowerCase().trim(),
      category,
      subCategory: null,
      date: now,
      accountLast4: null,
      balanceAfterPaise: null,
      upiRef: null,
      txnMode: 'Manual',
      bankName: 'Manual Entry',
      source: 'manual',
      originalCurrency: null,
      originalAmountPaise: null,
      confidenceScore: 100, // Manual is always 100% confident
      isPartial: false,
      rawText: 'Manual Entry',
      hash: generateDedupHashSync(amountPaise, null, now),
      isDeleted: false,
      needsReview: false,
      notes: null,
    };

    // Save to store (and DB via store listeners)
    await addTransaction(newTxn as any);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Type Selector */}
        <View style={styles.typeSelector}>
          <Pressable 
            style={[styles.typeButton, type === 'debit' && styles.typeButtonActive]} 
            onPress={() => setType('debit')}
          >
            <Text style={[styles.typeText, type === 'debit' && styles.typeTextActive]}>Expense</Text>
          </Pressable>
          <Pressable 
            style={[styles.typeButton, type === 'credit' && styles.typeButtonActive]} 
            onPress={() => setType('credit')}
          >
            <Text style={[styles.typeText, type === 'credit' && styles.typeTextActive]}>Income</Text>
          </Pressable>
        </View>

        {/* Amount Input */}
        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>₹</Text>
          <TextInput
            style={styles.amountInput}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            value={amount}
            onChangeText={setAmount}
            autoFocus
          />
        </View>

        {/* Merchant Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Merchant / Title</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Swiggy, Amazon"
            placeholderTextColor={colors.textMuted}
            value={merchant}
            onChangeText={setMerchant}
          />
        </View>

        {/* Category Selector (Simplified) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <Pressable style={styles.textInput}>
            <Text style={styles.inputText}>Other (Tap to change)</Text>
          </Pressable>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable 
          style={[styles.saveButton, (!amount || !merchant) && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={!amount || !merchant}
        >
          <Text style={styles.saveButtonText}>Save Transaction</Text>
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
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceHover,
    borderRadius: radius.full,
    padding: 4,
    marginBottom: spacing['2xl'],
  },
  typeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.full,
  },
  typeButtonActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typeText: {
    ...typography.labelMedium,
    color: colors.textSecondary,
  },
  typeTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['2xl'],
  },
  currencySymbol: {
    ...typography.h1,
    color: colors.textSecondary,
    marginRight: 8,
  },
  amountInput: {
    ...typography.h1,
    color: colors.textPrimary,
    minWidth: 120,
  },
  inputGroup: {
    marginBottom: spacing.xl,
  },
  label: {
    ...typography.labelMedium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    ...typography.bodyLarge,
    color: colors.textPrimary,
  },
  inputText: {
    ...typography.bodyLarge,
    color: colors.textPrimary,
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
