import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Text, Pressable, Alert } from 'react-native';
import Animated, { FadeInDown, FadeInRight, Layout } from 'react-native-reanimated';
import { FlashList } from '@shopify/flash-list';
import { colors, radius, spacing } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { TransactionCard } from '../../components/TransactionCard';
import { EmptyState } from '../../components/EmptyState';
import { useTransactionStore } from '../../stores/transaction-store';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { ClipboardPaste } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { parsePastedText } from '../../sms/parser';

type FilterType = 'all' | 'debit' | 'credit';

export function TransactionsScreen(): React.ReactElement {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { transactions, isLoading, addTransaction, setReviewQueueCount, reviewQueueCount } = useTransactionStore();
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredTransactions = useMemo(() => {
    const filtered = filter === 'all' 
      ? transactions.filter(t => !t.isDeleted) 
      : transactions.filter(t => t.type === filter && !t.isDeleted);
    return filtered;
  }, [transactions, filter]);

  // Summary stats
  const totalSpent = useMemo(() => 
    transactions.filter(t => t.type === 'debit' && !t.isDeleted)
      .reduce((s, t) => s + t.amountPaise, 0), 
    [transactions]
  );
  const totalReceived = useMemo(() => 
    transactions.filter(t => t.type === 'credit' && !t.isDeleted)
      .reduce((s, t) => s + t.amountPaise, 0), 
    [transactions]
  );

  const handleTransactionPress = (transaction: any) => {
    navigation.navigate('TransactionDetail', { transactionId: transaction.id });
  };

  const handlePasteSms = async () => {
    try {
      const hasString = await Clipboard.hasStringAsync();
      if (!hasString) {
        Alert.alert('Empty Clipboard', 'No text found in clipboard.');
        return;
      }
      
      const text = await Clipboard.getStringAsync();
      const result = await parsePastedText(text);

      if (result.status === 'success' && result.transaction) {
        if (result.transaction.needsReview) {
          addTransaction(result.transaction as any);
          setReviewQueueCount(reviewQueueCount + 1);
          Alert.alert('Needs Review', 'Transaction added to review queue successfully!');
        } else {
          addTransaction(result.transaction as any);
          Alert.alert('Success', 'Transaction parsed and added successfully!');
        }
      } else if (result.status === 'duplicate') {
        Alert.alert('Duplicate', 'This transaction has already been added.');
      } else {
        Alert.alert('Unrecognized SMS', result.reason || 'Could not parse a transaction from the pasted text. Ensure you copy the full bank SMS.');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to read clipboard or parse SMS: ' + error.message);
    }
  };

  const renderHeader = () => (
    <Animated.View entering={FadeInDown.duration(500)}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.title}>Transactions</Text>
          <Pressable style={styles.pasteButton} onPress={handlePasteSms}>
            <ClipboardPaste size={18} color={colors.primary} />
            <Text style={styles.pasteButtonText}>Paste SMS</Text>
          </Pressable>
        </View>
        <Text style={styles.subtitle}>
          {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Spent</Text>
          <Text style={[styles.summaryValue, { color: colors.debit }]}>
            {'\u20B9'}{(totalSpent / 100).toLocaleString('en-IN')}
          </Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Received</Text>
          <Text style={[styles.summaryValue, { color: colors.credit }]}>
            {'\u20B9'}{(totalReceived / 100).toLocaleString('en-IN')}
          </Text>
        </Animated.View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        {(['all', 'debit', 'credit'] as FilterType[]).map((f, i) => (
          <Animated.View key={f} entering={FadeInRight.duration(400).delay(100 + i * 80)}>
            <FilterChip 
              label={f === 'all' ? 'All' : f === 'debit' ? 'Spent' : 'Received'} 
              active={filter === f} 
              onPress={() => setFilter(f)} 
              color={f === 'debit' ? colors.debit : f === 'credit' ? colors.credit : undefined}
            />
          </Animated.View>
        ))}
      </View>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, spacing.md) }]}>
      <FlashList<any>
        data={filteredTransactions}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item, index }: { item: any, index: number }) => (
          <Animated.View entering={FadeInDown.duration(350).delay(Math.min(index * 50, 500))}>
            <TransactionCard 
              transaction={item} 
              onPress={handleTransactionPress} 
            />
          </Animated.View>
        )}
        estimatedItemSize={76}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState 
              title="No transactions found" 
              description={filter === 'all' ? "You don't have any transactions yet. Tap the + button on the Home tab to add one." : `No ${filter === 'debit' ? 'expenses' : 'income'} found.`} 
            />
          ) : null
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const FilterChip = ({ label, active, onPress, color }: { label: string, active: boolean, onPress: () => void, color?: string }) => (
  <Pressable 
    style={[
      styles.chip, 
      active && styles.chipActive,
      active && color ? { backgroundColor: color + '20', borderColor: color } : null,
    ]} 
    onPress={onPress}
  >
    <Text style={[
      styles.chipText, 
      active && styles.chipTextActive,
      active && color ? { color } : null,
    ]}>
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
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  pasteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    gap: spacing.xs,
  },
  pasteButtonText: {
    ...typography.labelMedium,
    color: colors.primary,
    fontWeight: '600',
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
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  summaryValue: {
    ...typography.h3,
    fontWeight: '700',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
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
    backgroundColor: colors.accentSubtle,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.labelMedium,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});
