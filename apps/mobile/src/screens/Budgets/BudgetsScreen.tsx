import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { colors, radius, spacing } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { BudgetRing } from '../../components/BudgetRing';
import { CategoryPill } from '../../components/CategoryPill';
import { useNavigation } from '@react-navigation/native';

export function BudgetsScreen(): React.ReactElement {
  const navigation = useNavigation();

  // Mocked state for UI demo
  const [overallBudget, setOverallBudget] = useState(5000000); // 50k
  const [overallSpent, setOverallSpent] = useState(3200000); // 32k
  
  const categoryBudgets = [
    { id: 'food', name: 'Food & Dining', spent: 1200000, limit: 1500000 },
    { id: 'transport', name: 'Transport', spent: 800000, limit: 800000 }, // exactly at limit
    { id: 'shopping', name: 'Shopping', spent: 500000, limit: 1000000 },
    { id: 'entertainment', name: 'Entertainment', spent: 700000, limit: 500000 }, // over budget
  ];

  const handleSetupBudgets = () => {
    // navigation.navigate('BudgetSetup');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.header}>
          <Text style={styles.title}>Monthly Budget</Text>
          <Pressable onPress={handleSetupBudgets}>
            <Text style={styles.editButton}>Edit</Text>
          </Pressable>
        </View>

        <View style={styles.overallCard}>
          <BudgetRing spent={overallSpent} total={overallBudget} size={200} />
          
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Total Budget</Text>
              <Text style={styles.statValue}>₹{(overallBudget / 100).toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Total Spent</Text>
              <Text style={styles.statValue}>₹{(overallSpent / 100).toLocaleString('en-IN')}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Category Budgets</Text>

        <View style={styles.categoriesList}>
          {categoryBudgets.map((item) => {
            const percentage = Math.min(item.spent / item.limit, 1);
            const isOver = item.spent > item.limit;
            const isWarning = percentage > 0.85 && !isOver;
            
            return (
              <Pressable key={item.id} style={styles.categoryCard}>
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryNameContainer}>
                    <CategoryPill categoryId={item.id} size="md" showLabel={false} />
                    <Text style={styles.categoryName}>{item.name}</Text>
                  </View>
                  <Text style={styles.categoryAmount}>
                    ₹{(item.spent / 100).toLocaleString('en-IN')} / ₹{(item.limit / 100).toLocaleString('en-IN')}
                  </Text>
                </View>

                <View style={styles.progressContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { width: `${percentage * 100}%` },
                      isOver ? styles.progressError : isWarning ? styles.progressWarning : null
                    ]} 
                  />
                </View>
                
                {isOver && (
                  <Text style={styles.alertText}>You've exceeded this budget by ₹{((item.spent - item.limit) / 100).toLocaleString('en-IN')}</Text>
                )}
                {isWarning && (
                  <Text style={styles.warningText}>You're nearing your limit for this category.</Text>
                )}
              </Pressable>
            );
          })}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  editButton: {
    ...typography.labelLarge,
    color: colors.primary,
  },
  overallCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    marginTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    ...typography.labelMedium,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  categoriesList: {
    gap: spacing.md,
  },
  categoryCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.lg,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  categoryNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryName: {
    ...typography.labelLarge,
    color: colors.textPrimary,
  },
  categoryAmount: {
    ...typography.labelMedium,
    color: colors.textSecondary,
  },
  progressContainer: {
    height: 8,
    backgroundColor: colors.surfaceHover,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  progressWarning: {
    backgroundColor: colors.warning,
  },
  progressError: {
    backgroundColor: colors.error,
  },
  alertText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.sm,
  },
  warningText: {
    ...typography.caption,
    color: colors.warning,
    marginTop: spacing.sm,
  },
});
