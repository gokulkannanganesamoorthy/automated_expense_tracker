import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { AnimatedAmount } from './AnimatedAmount';

interface SmartGreetingProps {
  userName?: string;
  monthlySpendPaise: number;
  budgetPaise?: number;
}

export function SmartGreeting({
  userName = 'User',
  monthlySpendPaise,
  budgetPaise,
}: SmartGreetingProps): React.ReactElement {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getInsight = () => {
    if (!budgetPaise) {
      return "Track your daily expenses";
    }
    const percent = monthlySpendPaise / budgetPaise;
    if (percent > 0.9) return "You're nearing your budget limit.";
    if (percent > 1.0) return "You've exceeded your budget.";
    return "You're on track this month.";
  };

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>{getGreeting()}, {userName.split(' ')[0]}</Text>
      
      <View style={styles.spendContainer}>
        <Text style={styles.spendLabel}>Spent this month</Text>
        <AnimatedAmount 
          amountPaise={monthlySpendPaise} 
          type="neutral"
          style={styles.amount}
        />
      </View>
      
      <Text style={styles.insight}>{getInsight()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  greeting: {
    ...typography.h3,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  spendContainer: {
    marginBottom: spacing.xs,
  },
  spendLabel: {
    ...typography.labelMedium,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  amount: {
    ...typography.h1,
    color: colors.textPrimary,
    fontWeight: '800',
  },
  insight: {
    ...typography.bodyMedium,
    color: colors.primary,
    fontWeight: '500',
    marginTop: spacing.sm,
  },
});
