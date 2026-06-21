import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import Animated, { FadeInDown, FadeInLeft, FadeInRight } from 'react-native-reanimated';
import { colors, radius, spacing } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { BarChart, DonutChart } from '../../components/charts';
import { useTransactionStore } from '../../stores/transaction-store';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { CATEGORY_COLORS, CATEGORY_NAMES } from '@expense-tracker/shared';

type TimeRange = 'week' | 'month' | 'year';

export function AnalyticsScreen(): React.ReactElement {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { transactions } = useTransactionStore();
  const [range, setRange] = useState<TimeRange>('month');

  const totalSpent = transactions
    .filter(t => t.type === 'debit' && !t.isDeleted)
    .reduce((sum, t) => sum + t.amountPaise, 0);

  const totalIncome = transactions
    .filter(t => t.type === 'credit' && !t.isDeleted)
    .reduce((sum, t) => sum + t.amountPaise, 0);

  // Group by category for donut chart
  const categoryMap = new Map<string, number>();
  transactions.forEach(t => {
    if (t.type === 'debit' && !t.isDeleted) {
      const current = categoryMap.get(t.category) || 0;
      categoryMap.set(t.category, current + t.amountPaise);
    }
  });

  const donutData = Array.from(categoryMap.entries()).map(([cat, amount]) => ({
    label: CATEGORY_NAMES[cat] || 'Other',
    value: amount,
    color: CATEGORY_COLORS[cat] || colors.primary,
    categoryId: cat,
  })).sort((a, b) => b.value - a.value);

  // Calculate dynamic bar chart data (last 4 weeks)
  const now = new Date();
  const weeks = [0, 0, 0, 0];
  
  transactions.forEach(t => {
    if (t.type === 'debit' && !t.isDeleted) {
      const tDate = new Date(t.date);
      const diffTime = Math.abs(now.getTime() - tDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 7) weeks[3] += t.amountPaise;
      else if (diffDays <= 14) weeks[2] += t.amountPaise;
      else if (diffDays <= 21) weeks[1] += t.amountPaise;
      else if (diffDays <= 28) weeks[0] += t.amountPaise;
    }
  });

  const barData = [
    { label: 'W1', value: weeks[0] },
    { label: 'W2', value: weeks[1] },
    { label: 'W3', value: weeks[2] },
    { label: 'W4', value: weeks[3] },
  ];

  const handleCategoryPress = (categoryId: string) => {
    navigation.navigate('CategoryDrilldown', { categoryId, period: range });
  };

  const hasData = transactions.length > 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInDown.duration(500)}>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>Understand where your money goes</Text>
      </Animated.View>

      {/* Range Selector */}
      <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.rangeSelector}>
        {(['week', 'month', 'year'] as TimeRange[]).map((r) => (
          <Pressable 
            key={r}
            style={[styles.rangeTab, range === r && styles.rangeTabActive]}
            onPress={() => setRange(r)}
          >
            <Text style={[styles.rangeText, range === r && styles.rangeTextActive]}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </Text>
          </Pressable>
        ))}
      </Animated.View>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <Animated.View entering={FadeInLeft.duration(500).delay(200)} style={styles.summaryCard}>
          <View style={[styles.summaryDot, { backgroundColor: colors.debit }]} />
          <Text style={styles.summaryLabel}>Expenses</Text>
          <Text style={[styles.summaryAmount, { color: colors.debit }]}>
            {'\u20B9'}{(totalSpent / 100).toLocaleString('en-IN')}
          </Text>
        </Animated.View>
        <Animated.View entering={FadeInRight.duration(500).delay(200)} style={styles.summaryCard}>
          <View style={[styles.summaryDot, { backgroundColor: colors.credit }]} />
          <Text style={styles.summaryLabel}>Income</Text>
          <Text style={[styles.summaryAmount, { color: colors.credit }]}>
            {'\u20B9'}{(totalIncome / 100).toLocaleString('en-IN')}
          </Text>
        </Animated.View>
      </View>

      {hasData ? (
        <>
          {/* Spending Trends */}
          <Animated.View entering={FadeInDown.duration(500).delay(350)} style={styles.section}>
            <Text style={styles.sectionTitle}>Spending Trends</Text>
            <Text style={styles.sectionSubtitle}>Last 4 weeks</Text>
            <View style={styles.chartContainer}>
              <BarChart data={barData} width={320} height={200} barColor={colors.primary} />
            </View>
          </Animated.View>

          {/* Category Breakdown */}
          <Animated.View entering={FadeInDown.duration(500).delay(500)} style={styles.section}>
            <Text style={styles.sectionTitle}>By Category</Text>
            <View style={styles.chartContainer}>
              <DonutChart 
                data={donutData} 
                size={240} 
                strokeWidth={30} 
                centerLabel="Total"
                centerValue={`\u20B9${Math.round(totalSpent/100).toLocaleString('en-IN')}`}
              />
            </View>

            <View style={styles.legend}>
              {donutData.map((item, index) => (
                <Animated.View key={index} entering={FadeInDown.duration(300).delay(600 + index * 60)}>
                  <Pressable 
                    style={styles.legendItem}
                    onPress={() => handleCategoryPress(item.categoryId)}
                  >
                    <View style={styles.legendLeft}>
                      <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                      <Text style={styles.legendLabel}>{item.label}</Text>
                    </View>
                    <View style={styles.legendRight}>
                      <Text style={styles.legendAmount}>
                        {'\u20B9'}{(item.value / 100).toLocaleString('en-IN')}
                      </Text>
                      <Text style={styles.legendPercentage}>
                        {totalSpent > 0 ? Math.round((item.value / totalSpent) * 100) : 0}%
                      </Text>
                    </View>
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        </>
      ) : (
        <Animated.View entering={FadeInDown.duration(500).delay(300)} style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No data yet</Text>
          <Text style={styles.emptyDescription}>
            Start adding transactions to see your spending analytics and insights here.
          </Text>
        </Animated.View>
      )}
    </ScrollView>
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
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  rangeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceHover,
    borderRadius: radius.md,
    padding: 4,
    marginBottom: spacing.xl,
  },
  rangeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  rangeTabActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  rangeText: {
    ...typography.labelMedium,
    color: colors.textSecondary,
  },
  rangeTextActive: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  summaryAmount: {
    ...typography.h2,
    fontWeight: '800',
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  legend: {
    marginTop: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLabel: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  legendRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  legendAmount: {
    ...typography.labelMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  legendPercentage: {
    ...typography.caption,
    color: colors.textMuted,
    minWidth: 36,
    textAlign: 'right',
  },
  emptyContainer: {
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
