import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, radius, spacing, shadows } from '../theme/tokens';
import { typography } from '../theme/typography';
import type { Transaction } from '@expense-tracker/shared';
import { CategoryPill } from './CategoryPill';
import { AnimatedAmount } from './AnimatedAmount';

interface TransactionCardProps {
  transaction: Transaction;
  onPress?: (transaction: Transaction) => void;
}

export function TransactionCard({ transaction, onPress }: TransactionCardProps): React.ReactElement {
  const date = new Date(transaction.date);
  
  // Format as "Today, 10:45 AM" or "15 Jan, 10:45 AM"
  const isToday = new Date().toDateString() === date.toDateString();
  const timeString = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const dateString = isToday 
    ? `Today, ${timeString}` 
    : `${date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}, ${timeString}`;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      onPress={() => onPress?.(transaction)}
      accessibilityRole="button"
    >
      <View style={styles.leftContent}>
        <CategoryPill categoryId={transaction.category} size="md" showLabel={false} />
        <View style={styles.textContainer}>
          <Text style={styles.merchant} numberOfLines={1}>
            {transaction.merchantNormalized}
          </Text>
          <View style={styles.metaContainer}>
            <Text style={styles.metaText}>{dateString}</Text>
            {transaction.txnMode && (
              <>
                <Text style={styles.metaDot}>•</Text>
                <Text style={styles.metaText}>{transaction.txnMode}</Text>
              </>
            )}
            {transaction.needsReview && (
              <>
                <Text style={styles.metaDot}>•</Text>
                <Text style={styles.reviewBadge}>Review</Text>
              </>
            )}
          </View>
        </View>
      </View>
      
      <View style={styles.rightContent}>
        <AnimatedAmount 
          amountPaise={transaction.amountPaise} 
          type={transaction.type} 
          style={styles.amount}
          showSign={transaction.type === 'credit'}
        />
        {transaction.accountLast4 && (
          <Text style={styles.accountText}>**{transaction.accountLast4}</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.xs,
  },
  pressed: {
    backgroundColor: colors.surfaceHover,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  rightContent: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  merchant: {
    ...typography.labelLarge,
    color: colors.textPrimary,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  metaDot: {
    ...typography.caption,
    color: colors.textMuted,
    marginHorizontal: 4,
  },
  reviewBadge: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '600',
  },
  amount: {
    ...typography.labelLarge,
  },
  accountText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
});
