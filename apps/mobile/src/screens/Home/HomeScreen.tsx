import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import Animated, { FadeInDown, FadeInUp, SlideInRight } from 'react-native-reanimated';
import { colors, spacing, radius, gradients } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { SmartGreeting } from '../../components/SmartGreeting';
import { BudgetRing } from '../../components/BudgetRing';
import { TransactionCard } from '../../components/TransactionCard';
import { FAB } from '../../components/FAB';
import { SyncStatusBanner } from '../../components/SyncStatusBanner';
import { ReviewQueueBanner } from '../../components/ReviewQueueBanner';
import { EmptyState } from '../../components/EmptyState';
import { useTransactionStore } from '../../stores/transaction-store';
import { useAuthStore } from '../../stores/auth-store';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

const { width } = Dimensions.get('window');

export function HomeScreen(): React.ReactElement {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  const { 
    transactions, 
    recentTransactions,
    reviewQueueCount 
  } = useTransactionStore();
  const { user, settings } = useAuthStore();

  const userName = user?.name || user?.email?.split('@')[0] || 'there';

  const monthlySpendPaise = transactions.reduce(
    (acc, txn) => acc + (txn.type === 'debit' && !txn.isDeleted ? txn.amountPaise : 0), 0
  );
  const budgetPaise = settings?.monthlyBudgetPaise || 5000000;
  const remaining = Math.max(0, budgetPaise - monthlySpendPaise);

  const displayTransactions = recentTransactions.length > 0 
    ? recentTransactions 
    : transactions.slice(0, 5);

  const handleTransactionPress = (transaction: any) => {
    navigation.navigate('TransactionDetail', { transactionId: transaction.id });
  };

  const handleAddPress = () => {
    navigation.navigate('ManualEntry', {});
  };

  return (
    <View style={styles.container}>
      <SyncStatusBanner status="synced" />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={() => {}} tintColor={colors.primary} />
        }
      >
        {/* Greeting Section */}
        <Animated.View entering={FadeInDown.duration(600).delay(100)}>
          <SmartGreeting 
            userName={userName}
            monthlySpendPaise={monthlySpendPaise} 
            budgetPaise={budgetPaise} 
          />
        </Animated.View>

        <ReviewQueueBanner count={reviewQueueCount} />

        {/* Budget Card with glassmorphism */}
        <Animated.View 
          entering={FadeInDown.duration(600).delay(250)} 
          style={styles.budgetCard}
        >
          <View style={styles.budgetGlow} />
          <Text style={styles.budgetCardTitle}>Monthly Overview</Text>
          
          <View style={styles.budgetRingContainer}>
            <BudgetRing spent={monthlySpendPaise} total={budgetPaise} size={180} />
          </View>

          <View style={styles.budgetStatsRow}>
            <View style={styles.budgetStat}>
              <Text style={styles.budgetStatLabel}>Spent</Text>
              <Text style={[styles.budgetStatValue, { color: colors.debit }]}>
                {'\u20B9'}{(monthlySpendPaise / 100).toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.budgetStatDivider} />
            <View style={styles.budgetStat}>
              <Text style={styles.budgetStatLabel}>Remaining</Text>
              <Text style={[styles.budgetStatValue, { color: colors.credit }]}>
                {'\u20B9'}{(remaining / 100).toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.budgetStatDivider} />
            <View style={styles.budgetStat}>
              <Text style={styles.budgetStatLabel}>Budget</Text>
              <Text style={styles.budgetStatValue}>
                {'\u20B9'}{(budgetPaise / 100).toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Recent Transactions */}
        <Animated.View 
          entering={FadeInDown.duration(600).delay(400)} 
          style={styles.transactionsSection}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            {displayTransactions.length > 0 && (
              <Text 
                style={styles.seeAllText}
                onPress={() => navigation.navigate('MainTabs', { screen: 'Transactions' } as any)}
              >
                See All
              </Text>
            )}
          </View>

          {displayTransactions.length > 0 ? (
            displayTransactions.map((txn, index) => (
              <Animated.View 
                key={txn.id} 
                entering={SlideInRight.duration(400).delay(500 + index * 80)}
              >
                <TransactionCard 
                  transaction={txn} 
                  onPress={handleTransactionPress} 
                />
              </Animated.View>
            ))
          ) : (
            <EmptyState 
              title="No transactions yet"
              description="Tap the + button below to add your first expense or income."
            />
          )}
        </Animated.View>
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
    paddingBottom: spacing['3xl'] + 40,
  },
  budgetCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: radius['2xl'],
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  budgetGlow: {
    position: 'absolute',
    top: -60,
    left: '50%',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.accentGlow,
    transform: [{ translateX: -100 }],
  },
  budgetCardTitle: {
    ...typography.labelLarge,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.lg,
  },
  budgetRingContainer: {
    marginBottom: spacing.xl,
  },
  budgetStatsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  budgetStat: {
    flex: 1,
    alignItems: 'center',
  },
  budgetStatDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.border,
  },
  budgetStatLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  budgetStatValue: {
    ...typography.labelLarge,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  transactionsSection: {
    paddingHorizontal: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  seeAllText: {
    ...typography.labelMedium,
    color: colors.primary,
  },
});
