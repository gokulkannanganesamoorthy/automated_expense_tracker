import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { colors, radius, spacing } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { TransactionCard } from '../../components/TransactionCard';
import { EmptyState } from '../../components/EmptyState';
import { useTransactionStore } from '../../stores/transaction-store';
import { useNavigation } from '@react-navigation/native';

export function ReviewQueueScreen(): React.ReactElement {
  const navigation = useNavigation<any>();
  const { transactions, updateTransaction } = useTransactionStore();

  const reviewItems = useMemo(() => {
    return transactions.filter(t => t.needsReview && !t.isDeleted);
  }, [transactions]);

  const handleApprove = (id: string) => {
    updateTransaction(id, { needsReview: false, confidenceScore: 100 });
  };

  const handleEdit = (id: string) => {
    navigation.navigate('TransactionDetail', { id });
  };

  return (
    <View style={styles.container}>
      <FlashList
        data={reviewItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.reviewItem}>
            <TransactionCard transaction={item} onPress={() => handleEdit(item.id)} />
            
            <View style={styles.actionRow}>
              <View style={styles.warningContainer}>
                <Text style={styles.warningIcon}>⚠️</Text>
                <Text style={styles.warningText}>
                  {item.confidenceScore}% confidence
                </Text>
              </View>
              
              <View style={styles.buttons}>
                <Pressable 
                  style={[styles.button, styles.editButton]} 
                  onPress={() => handleEdit(item.id)}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </Pressable>
                <Pressable 
                  style={[styles.button, styles.approveButton]} 
                  onPress={() => handleApprove(item.id)}
                >
                  <Text style={styles.approveButtonText}>Approve</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
        estimatedItemSize={140}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Needs Review</Text>
            <Text style={styles.subtitle}>
              We weren't completely sure about these transactions. Please verify them to keep your budgets accurate.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState 
            icon="🎉"
            title="All caught up!"
            description="You don't have any transactions waiting for review."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.3xl,
  },
  header: {
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  reviewItem: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.warning + '30',
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceHover,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  warningIcon: {
    fontSize: 14,
  },
  warningText: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '500',
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  editButtonText: {
    ...typography.labelMedium,
    color: colors.textPrimary,
  },
  approveButton: {
    backgroundColor: colors.primary,
  },
  approveButtonText: {
    ...typography.labelMedium,
    color: colors.textInverse,
  },
});
