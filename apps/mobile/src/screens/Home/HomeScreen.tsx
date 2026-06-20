import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { colors, spacing } from '../../theme/tokens';
import { SmartGreeting } from '../../components/SmartGreeting';
import { BudgetRing } from '../../components/BudgetRing';
import { TransactionCard } from '../../components/TransactionCard';
import { FAB } from '../../components/FAB';
import { SyncStatusBanner } from '../../components/SyncStatusBanner';
import { ReviewQueueBanner } from '../../components/ReviewQueueBanner';
import { useTransactionStore } from '../../stores/transaction-store';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

export function HomeScreen(): React.ReactElement {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  // Connect to Zustand store
  const { 
    transactions, 
    reviewQueueCount, 
    isLoading, 
    fetchTransactions 
  } = useTransactionStore();

  // Load initial data
  useEffect(() => {
    fetchTransactions({ limit: 5 });
  }, [fetchTransactions]);

  // Handle pull-to-refresh
  const onRefresh = () => {
    fetchTransactions({ limit: 5 });
  };

  // Derived state (mocked budgets/spending for now, ideally from a BudgetStore)
  const monthlySpendPaise = transactions.reduce(
    (acc, txn) => acc + (txn.type === 'debit' ? txn.amountPaise : 0), 0
  );
  const budgetPaise = 5000000; // 50,000 INR

  const handleTransactionPress = (transaction: any) => {
    // Navigate to detail
    console.log('Navigate to detail:', transaction.id);
  };

  const handleAddPress = () => {
    // Navigate to manual entry
    console.log('Navigate to manual entry');
  };

  return (
    <View style={styles.container}>
      <SyncStatusBanner status="synced" />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <SmartGreeting 
          userName="Gokul" 
          monthlySpendPaise={monthlySpendPaise} 
          budgetPaise={budgetPaise} 
        />

        <ReviewQueueBanner count={reviewQueueCount} />

        <View style={styles.budgetSection}>
          <BudgetRing spent={monthlySpendPaise} total={budgetPaise} size={160} />
        </View>

        <View style={styles.transactionsSection}>
          {transactions.map((txn) => (
            <TransactionCard 
              key={txn.id} 
              transaction={txn} 
              onPress={handleTransactionPress} 
            />
          ))}
        </View>
      </ScrollView>

      <FAB onPress={handleAddPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.3xl,
  },
  budgetSection: {
    alignItems: 'center',
    paddingVertical: spacing.2xl,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  transactionsSection: {
    paddingHorizontal: spacing.md,
  },
});
