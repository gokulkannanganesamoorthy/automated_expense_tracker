import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { colors, radius, spacing } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { useNavigation } from '@react-navigation/native';
import { CATEGORY_NAMES } from '@expense-tracker/shared';
import { useAuthStore } from '../../stores/auth-store';

export function BudgetSetupScreen(): React.ReactElement {
  const navigation = useNavigation();
  const { settings, updateSettings } = useAuthStore();

  const [overallBudget, setOverallBudget] = useState(
    settings?.monthlyBudgetPaise ? (settings.monthlyBudgetPaise / 100).toString() : ''
  );
  
  // Convert settings categoryBudgets from paise to INR strings for editing
  const initialCategoryBudgets = Object.fromEntries(
    Object.entries(settings?.categoryBudgets || {}).map(([k, v]) => [k, (v / 100).toString()])
  );
  
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, string>>(initialCategoryBudgets);

  const handleUpdateCategory = (cat: string, value: string) => {
    setCategoryBudgets(prev => ({ ...prev, [cat]: value }));
  };

  const handleSave = () => {
    const monthlyBudgetPaise = overallBudget ? Math.round(parseFloat(overallBudget) * 100) : null;
    
    const newCategoryBudgets: Record<string, number> = {};
    for (const [cat, val] of Object.entries(categoryBudgets)) {
      if (val && !isNaN(parseFloat(val))) {
        newCategoryBudgets[cat] = Math.round(parseFloat(val) * 100);
      }
    }

    updateSettings({
      monthlyBudgetPaise,
      categoryBudgets: newCategoryBudgets,
    });
    
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        
        <Text style={styles.title}>Set Your Budgets</Text>
        <Text style={styles.subtitle}>Define your monthly spending limits to stay on track.</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overall Monthly Budget</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.mainInput}
              keyboardType="number-pad"
              value={overallBudget}
              onChangeText={setOverallBudget}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category Limits</Text>
          <Text style={styles.helpText}>Leave blank for no limit.</Text>

          {Object.entries(CATEGORY_NAMES).slice(0, 8).map(([catId, catName]) => (
            <View key={catId} style={styles.categoryRow}>
              <Text style={styles.categoryName}>{catName}</Text>
              <View style={styles.categoryInputContainer}>
                <Text style={styles.smallCurrency}>₹</Text>
                <TextInput
                  style={styles.categoryInput}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                  value={categoryBudgets[catId] || ''}
                  onChangeText={(val) => handleUpdateCategory(catId, val)}
                />
              </View>
            </View>
          ))}
        </View>
        
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Budgets</Text>
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
    paddingBottom: spacing['3xl'],
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing['2xl'],
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  helpText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  currencySymbol: {
    ...typography.h2,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  mainInput: {
    flex: 1,
    ...typography.h2,
    color: colors.textPrimary,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  categoryName: {
    ...typography.bodyLarge,
    color: colors.textPrimary,
    flex: 1,
  },
  categoryInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceHover,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    width: 120,
  },
  smallCurrency: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginRight: 4,
  },
  categoryInput: {
    flex: 1,
    ...typography.bodyMedium,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
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
  saveButtonText: {
    ...typography.labelLarge,
    color: colors.textInverse,
    fontSize: 18,
  },
});
