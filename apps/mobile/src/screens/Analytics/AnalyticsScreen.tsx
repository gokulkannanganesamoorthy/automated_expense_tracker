import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { colors, radius, spacing } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { BarChart, DonutChart, HeatmapChart } from '../../components/charts';
import { useTransactionStore } from '../../stores/transaction-store';
import { useNavigation } from '@react-navigation/native';
import { CATEGORY_COLORS, CATEGORY_NAMES } from '@expense-tracker/shared';

type TimeRange = 'week' | 'month' | 'year';

export function AnalyticsScreen(): React.ReactElement {
  const navigation = useNavigation();
  const { transactions } = useTransactionStore();
  const [range, setRange] = useState<TimeRange>('month');

  // Compute stats based on selected range (mock logic for demo)
  const totalSpent = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amountPaise, 0);

  // Group by category for donut chart
  const categoryMap = new Map<string, number>();
  transactions.forEach(t => {
    if (t.type === 'debit') {
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

  // Mock bar chart data
  const barData = [
    { label: 'W1', value: 12000 },
    { label: 'W2', value: 25000 },
    { label: 'W3', value: 8000 },
    { label: 'W4', value: 15000 },
  ];

  const handleCategoryPress = (categoryId: string) => {
    // navigation.navigate('CategoryDrilldown', { categoryId, range });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Analytics</Text>

      <View style={styles.rangeSelector}>
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
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Spent</Text>
        <Text style={styles.summaryAmount}>
          ₹{(totalSpent / 100).toLocaleString('en-IN')}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Spending Trends</Text>
        <View style={styles.chartContainer}>
          <BarChart data={barData} width={320} height={200} barColor={colors.primary} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>By Category</Text>
        <View style={styles.chartContainer}>
          <DonutChart 
            data={donutData} 
            size={240} 
            strokeWidth={30} 
            centerLabel="Total"
            centerValue={`₹${Math.round(totalSpent/100).toLocaleString('en-IN')}`}
          />
        </View>

        <View style={styles.legend}>
          {donutData.map((item, index) => (
            <Pressable 
              key={index} 
              style={styles.legendItem}
              onPress={() => handleCategoryPress(item.categoryId)}
            >
              <View style={styles.legendLeft}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text style={styles.legendLabel}>{item.label}</Text>
              </View>
              <View style={styles.legendRight}>
                <Text style={styles.legendAmount}>
                  ₹{(item.value / 100).toLocaleString('en-IN')}
                </Text>
                <Text style={styles.legendArrow}>›</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
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
    paddingBottom: spacing.3xl,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
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
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  rangeTabActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rangeText: {
    ...typography.labelMedium,
    color: colors.textSecondary,
  },
  rangeTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: radius.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  summaryLabel: {
    ...typography.labelMedium,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  summaryAmount: {
    ...typography.h1,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
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
    gap: spacing.sm,
  },
  legendAmount: {
    ...typography.labelMedium,
    color: colors.textPrimary,
  },
  legendArrow: {
    fontSize: 20,
    color: colors.textMuted,
  },
});
