import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import Animated, { 
  FadeInDown, 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { colors, radius, spacing } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { BudgetRing } from '../../components/BudgetRing';
import { CategoryPill } from '../../components/CategoryPill';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { useTransactionStore } from '../../stores/transaction-store';
import { useAuthStore } from '../../stores/auth-store';
import { CATEGORY_NAMES } from '@expense-tracker/shared';

// Animated progress bar component
function AnimatedProgressBar({ 
  percentage, 
  isOver, 
  isWarning, 
  delay = 0 
}: { 
  percentage: number; 
  isOver: boolean; 
  isWarning: boolean; 
  delay?: number;
}) {
  const width = useSharedValue(0);
  
  useEffect(() => {
    width.value = withDelay(
      delay,
      withTiming(Math.min(percentage, 1) * 100, { 
        duration: 800, 
        easing: Easing.out(Easing.cubic) 
      })
    );
  }, [percentage, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
    backgroundColor: isOver 
      ? colors.error 
      : isWarning 
        ? colors.warning 
        : colors.primary,
  }));

  return (
    <View style={styles.progressContainer}>
      <Animated.View style={[styles.progressBar, animatedStyle]} />
    </View>
  );
}

export function BudgetsScreen(): React.ReactElement {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { transactions } = useTransactionStore();
  const { settings } = useAuthStore();

  const overallBudget = settings?.monthlyBudgetPaise || 5000000;
  
  const overallSpent = transactions.reduce((acc, txn) => {
    return txn.type === 'debit' && !txn.isDeleted ? acc + txn.amountPaise : acc;
  }, 0);
  
  const remaining = Math.max(0, overallBudget - overallSpent);
  const overallPercentage = overallBudget > 0 ? overallSpent / overallBudget : 0;
  const categoryBudgets = settings?.categoryBudgets || {};

  // Calculate spent per category
  const categorySpentMap = new Map<string, number>();
  transactions.forEach(t => {
    if (t.type === 'debit' && !t.isDeleted) {
      const current = categorySpentMap.get(t.category) || 0;
      categorySpentMap.set(t.category, current + t.amountPaise);
    }
  });

  const handleSetupBudgets = () => {
    navigation.navigate('BudgetSetup', {});
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, spacing.md) }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <Animated.View entering={FadeInDown.duration(500)}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Budgets</Text>
              <Text style={styles.subtitle}>Track your spending limits</Text>
            </View>
            <Pressable style={styles.editPill} onPress={handleSetupBudgets}>
              <Text style={styles.editPillText}>Edit Limits</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* Overall Budget Card */}
        <Animated.View entering={FadeInDown.duration(600).delay(150)} style={styles.overallCard}>
          <View style={styles.overallGlow} />
          <BudgetRing spent={overallSpent} total={overallBudget} size={200} />
          
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Spent</Text>
              <Text style={[styles.statValue, { color: colors.debit }]}>
                {'\u20B9'}{(overallSpent / 100).toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Remaining</Text>
              <Text style={[styles.statValue, { color: colors.credit }]}>
                {'\u20B9'}{(remaining / 100).toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Budget</Text>
              <Text style={styles.statValue}>
                {'\u20B9'}{(overallBudget / 100).toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Category Budgets */}
        <Animated.View entering={FadeInDown.duration(500).delay(300)}>
          <Text style={styles.sectionTitle}>Category Limits</Text>
        </Animated.View>

        <View style={styles.categoriesList}>
          {Object.entries(categoryBudgets).map(([catId, limit], index) => {
            const spent = categorySpentMap.get(catId) || 0;
            const percentage = limit > 0 ? spent / limit : 0;
            const isOver = spent > limit;
            const isWarning = percentage > 0.85 && !isOver;
            const catName = CATEGORY_NAMES[catId] || catId;
            
            return (
              <Animated.View 
                key={catId} 
                entering={FadeInDown.duration(400).delay(400 + index * 80)}
              >
                <View style={styles.categoryCard}>
                  <View style={styles.categoryHeader}>
                    <View style={styles.categoryNameContainer}>
                      <CategoryPill categoryId={catId} size="md" showLabel={false} />
                      <Text style={styles.categoryName}>{catName}</Text>
                    </View>
                    <Text style={[
                      styles.categoryAmount, 
                      isOver && { color: colors.error },
                      isWarning && { color: colors.warning },
                    ]}>
                      {'\u20B9'}{(spent / 100).toLocaleString('en-IN')} / {'\u20B9'}{(limit / 100).toLocaleString('en-IN')}
                    </Text>
                  </View>

                  <AnimatedProgressBar 
                    percentage={percentage} 
                    isOver={isOver} 
                    isWarning={isWarning}
                    delay={500 + index * 100}
                  />
                  
                  {isOver && (
                    <View style={styles.alertContainer}>
                      <Text style={styles.alertText}>
                        Over budget by {'\u20B9'}{((spent - limit) / 100).toLocaleString('en-IN')}
                      </Text>
                    </View>
                  )}
                  {isWarning && (
                    <View style={[styles.alertContainer, { backgroundColor: colors.warningSubtle }]}>
                      <Text style={[styles.alertText, { color: colors.warning }]}>
                        {Math.round(percentage * 100)}% of limit used
                      </Text>
                    </View>
                  )}
                </View>
              </Animated.View>
            );
          })}
          {Object.keys(categoryBudgets).length === 0 && (
            <Animated.View entering={FadeInDown.duration(500).delay(400)} style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No category limits set</Text>
              <Text style={styles.emptyDescription}>
                Tap "Edit Limits" above to set spending limits for each category.
              </Text>
            </Animated.View>
          )}
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
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.textMuted,
  },
  editPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.accentSubtle,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  editPillText: {
    ...typography.labelMedium,
    color: colors.primary,
    fontWeight: '600',
  },
  overallCard: {
    backgroundColor: colors.surface,
    borderRadius: radius['2xl'],
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  overallGlow: {
    position: 'absolute',
    top: -80,
    left: '50%',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: colors.accentGlow,
    transform: [{ translateX: -120 }],
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.border,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  statValue: {
    ...typography.labelLarge,
    color: colors.textPrimary,
    fontWeight: '700',
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
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
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
    borderRadius: radius.full,
  },
  alertContainer: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.sm,
    backgroundColor: colors.dangerHighSubtle,
    alignSelf: 'flex-start',
  },
  alertText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing['2xl'],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
