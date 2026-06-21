import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { useTransactionStore } from '../../stores/transaction-store';
import { useNavigation } from '@react-navigation/native';
import { generateDedupHashSync } from '../../sms/parser/dedup';
import { CategoryPill } from '../../components/CategoryPill';

const CATEGORIES = ['food', 'transport', 'shopping', 'entertainment', 'bills', 'health', 'other'];

export function ManualEntryScreen(): React.ReactElement {
  const navigation = useNavigation();
  const { addTransaction } = useTransactionStore();

  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [type, setType] = useState<'debit' | 'credit'>('debit');
  const [category, setCategory] = useState('other');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!amount || !merchant || isSaving) return;
    
    setIsSaving(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const amountPaise = Math.round(parseFloat(amount) * 100);
    const now = new Date().toISOString();
    
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
      confidenceScore: 100,
      isPartial: false,
      rawText: 'Manual Entry',
      hash: generateDedupHashSync(amountPaise, null, now),
      isDeleted: false,
      needsReview: false,
      notes: null,
    };

    await addTransaction(newTxn as any);
    
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Type Selector */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.typeSelector}>
          <Pressable 
            style={[styles.typeButton, type === 'debit' && styles.typeButtonActive]} 
            onPress={() => {
              setType('debit');
              Haptics.selectionAsync();
            }}
          >
            <Text style={[styles.typeText, type === 'debit' && styles.typeTextActive]}>Expense</Text>
          </Pressable>
          <Pressable 
            style={[styles.typeButton, type === 'credit' && styles.typeButtonActive]} 
            onPress={() => {
              setType('credit');
              Haptics.selectionAsync();
            }}
          >
            <Text style={[styles.typeText, type === 'credit' && styles.typeTextActive]}>Income</Text>
          </Pressable>
        </Animated.View>

        {/* Amount Input */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.amountContainer}>
          <Text style={[styles.currencySymbol, { color: type === 'debit' ? colors.debit : colors.credit }]}>₹</Text>
          <TextInput
            style={[styles.amountInput, { color: type === 'debit' ? colors.debit : colors.credit }]}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            value={amount}
            onChangeText={setAmount}
            autoFocus
          />
        </Animated.View>

        {/* Merchant Input */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)} style={styles.inputGroup}>
          <Text style={styles.label}>Merchant / Title</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Swiggy, Amazon"
            placeholderTextColor={colors.textMuted}
            value={merchant}
            onChangeText={setMerchant}
          />
        </Animated.View>

        {/* Category Selector */}
        <Animated.View entering={FadeInDown.duration(400).delay(300)} style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {CATEGORIES.map((cat, index) => (
              <Animated.View key={cat} entering={ZoomIn.duration(300).delay(400 + index * 50)}>
                <Pressable 
                  onPress={() => {
                    setCategory(cat);
                    Haptics.selectionAsync();
                  }}
                  style={[styles.categoryPillContainer, category === cat && styles.categoryPillActive]}
                >
                  <CategoryPill categoryId={cat} size="md" showLabel={true} />
                </Pressable>
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>
      </ScrollView>

      <Animated.View entering={FadeInDown.duration(400).delay(500)} style={styles.footer}>
        <Pressable 
          style={[styles.saveButton, (!amount || !merchant || isSaving) && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={!amount || !merchant || isSaving}
        >
          <Text style={styles.saveButtonText}>{isSaving ? 'Saving...' : 'Save Transaction'}</Text>
        </Pressable>
      </Animated.View>
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
    borderWidth: 1,
    borderColor: colors.border,
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
    fontWeight: '700',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['2xl'],
    backgroundColor: colors.surface,
    paddingVertical: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currencySymbol: {
    ...typography.h1,
    marginRight: 8,
  },
  amountInput: {
    ...typography.h1,
    minWidth: 120,
  },
  inputGroup: {
    marginBottom: spacing.xl,
  },
  label: {
    ...typography.labelMedium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
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
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  saveButtonText: {
    ...typography.labelLarge,
    color: colors.textInverse,
    fontSize: 18,
    fontWeight: '700',
  },
  categoryScroll: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  categoryPillContainer: {
    opacity: 0.5,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: radius.full,
    transform: [{ scale: 0.95 }],
  },
  categoryPillActive: {
    opacity: 1,
    borderColor: colors.primary,
    transform: [{ scale: 1 }],
  },
});
