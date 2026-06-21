import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { colors, radius, spacing } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { TransactionCard } from '../../components/TransactionCard';
import { CategoryPill } from '../../components/CategoryPill';
import { AnimatedAmount } from '../../components/AnimatedAmount';
import { useTransactionStore } from '../../stores/transaction-store';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { CATEGORY_NAMES } from '@expense-tracker/shared';

export function CategoryDrilldownScreen(): React.ReactElement {
  const route = useRoute<any>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const categoryId = route.params?.categoryId || 'other';
  const range = route.params?.range || 'month';

  const { transactions } = useTransactionStore();

  const categoryTransactions = useMemo(() => {
    return transactions
      .filter(t => t.category === categoryId && t.type === 'debit')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, categoryId]);

  const totalSpent = useMemo(() => {
    return categoryTransactions.reduce((sum, t) => sum + t.amountPaise, 0);
  }, [categoryTransactions]);

  const handleTransactionPress = (transaction: any) => {
    navigation.navigate('TransactionDetail', { transactionId: transaction.id });
  };

  const categoryName = CATEGORY_NAMES[categoryId] || 'Other';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <CategoryPill categoryId={categoryId} size="lg" showLabel={false} />
        <Text style={styles.title}>{categoryName}</Text>
        <Text style={styles.subtitle}>This {range}</Text>
        
        <AnimatedAmount 
          amountPaise={totalSpent} 
          type="debit"
          style={styles.amount} 
        />
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Transactions</Text>
        <FlashList
          data={categoryTransactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TransactionCard transaction={item} onPress={handleTransactionPress} />}
          estimatedItemSize={76}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  amount: {
    ...typography.h1,
    fontWeight: '800',
  },
  listContainer: {
    flex: 1,
    paddingTop: spacing.lg,
  },
  listTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing['3xl'],
  },
});
