import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { colors, radius, spacing } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { TransactionCard } from '../../components/TransactionCard';
import { EmptyState } from '../../components/EmptyState';
import { useTransactionStore } from '../../stores/transaction-store';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

export function TransactionsScreen(): React.ReactElement {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { transactions, fetchTransactions, isLoading } = useTransactionStore();
  const [filter, setFilter] = useState<'all' | 'debit' | 'credit'>('all');

  const filteredTransactions = useMemo(() => {
    if (filter === 'all') return transactions;
    return transactions.filter(t => t.type === filter);
  }, [transactions, filter]);

  const handleTransactionPress = (transaction: any) => {
    // navigation.navigate('TransactionDetail', { id: transaction.id });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Transactions</Text>
      <View style={styles.filterContainer}>
        <FilterChip 
          label="All" 
          active={filter === 'all'} 
          onPress={() => setFilter('all')} 
        />
        <FilterChip 
          label="Spent" 
          active={filter === 'debit'} 
          onPress={() => setFilter('debit')} 
        />
        <FilterChip 
          label="Received" 
          active={filter === 'credit'} 
          onPress={() => setFilter('credit')} 
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlashList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TransactionCard 
            transaction={item} 
            onPress={handleTransactionPress} 
          />
        )}
        estimatedItemSize={76}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState 
              title="No transactions found" 
              description={filter === 'all' ? "You don't have any transactions yet." : `No ${filter}s found.`} 
            />
          ) : null
        }
        contentContainerStyle={styles.listContent}
        onRefresh={() => fetchTransactions()}
        refreshing={isLoading}
      />
    </View>
  );
}

const FilterChip = ({ label, active, onPress }: { label: string, active: boolean, onPress: () => void }) => (
  <Pressable 
    style={[styles.chip, active && styles.chipActive]} 
    onPress={onPress}
  >
    <Text style={[styles.chipText, active && styles.chipTextActive]}>
      {label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing['3xl'],
  },
  header: {
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceHover,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.labelMedium,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.textInverse,
  },
});
