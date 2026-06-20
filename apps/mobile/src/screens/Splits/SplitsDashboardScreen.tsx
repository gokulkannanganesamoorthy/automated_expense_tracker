import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { colors, radius, spacing } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { useNavigation } from '@react-navigation/native';
import { EmptyState } from '../../components/EmptyState';

export function SplitsDashboardScreen(): React.ReactElement {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'you_owe' | 'owed_to_you'>('owed_to_you');

  // Mock data
  const youOweTotal = 150000; // 1,500
  const owedToYouTotal = 450000; // 4,500

  const mockSplits = [
    { id: '1', title: 'Dinner at Rajdhani', amount: 150000, date: 'Yesterday', type: 'owed_to_you', users: ['Alice', 'Bob'] },
    { id: '2', title: 'Movie Tickets', amount: 300000, date: '2 days ago', type: 'owed_to_you', users: ['Charlie'] },
    { id: '3', title: 'Cab to Airport', amount: 150000, date: 'Last week', type: 'you_owe', users: ['Alice'] },
  ];

  const filteredSplits = mockSplits.filter(s => s.type === activeTab);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Split Expenses</Text>
        <Pressable 
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateSplit')}
        >
          <Text style={styles.addButtonText}>+ New Split</Text>
        </Pressable>
      </View>

      <View style={styles.balanceCard}>
        <View style={styles.balanceItem}>
          <Text style={styles.balanceLabel}>You Owe</Text>
          <Text style={[styles.balanceAmount, { color: colors.error }]}>
            ₹{(youOweTotal / 100).toLocaleString('en-IN')}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.balanceItem}>
          <Text style={styles.balanceLabel}>Owed to You</Text>
          <Text style={[styles.balanceAmount, { color: colors.success }]}>
            ₹{(owedToYouTotal / 100).toLocaleString('en-IN')}
          </Text>
        </View>
      </View>

      <View style={styles.tabs}>
        <Pressable 
          style={[styles.tab, activeTab === 'owed_to_you' && styles.tabActive]}
          onPress={() => setActiveTab('owed_to_you')}
        >
          <Text style={[styles.tabText, activeTab === 'owed_to_you' && styles.tabTextActive]}>
            Owed to You
          </Text>
        </Pressable>
        <Pressable 
          style={[styles.tab, activeTab === 'you_owe' && styles.tabActive]}
          onPress={() => setActiveTab('you_owe')}
        >
          <Text style={[styles.tabText, activeTab === 'you_owe' && styles.tabTextActive]}>
            You Owe
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {filteredSplits.length > 0 ? (
          filteredSplits.map(split => (
            <Pressable 
              key={split.id} 
              style={styles.splitCard}
              onPress={() => navigation.navigate('SplitDetail', { id: split.id })}
            >
              <View style={styles.splitIcon}>
                <Text>🤝</Text>
              </View>
              <View style={styles.splitDetails}>
                <Text style={styles.splitTitle}>{split.title}</Text>
                <Text style={styles.splitMeta}>{split.date} • {split.users.join(', ')}</Text>
              </View>
              <Text style={[
                styles.splitAmount, 
                { color: activeTab === 'owed_to_you' ? colors.success : colors.error }
              ]}>
                ₹{(split.amount / 100).toLocaleString('en-IN')}
              </Text>
            </Pressable>
          ))
        ) : (
          <EmptyState 
            title="All settled up!"
            description={activeTab === 'owed_to_you' ? "Nobody owes you any money." : "You don't owe anyone money."}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  addButton: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  addButtonText: {
    ...typography.labelMedium,
    color: colors.primary,
  },
  balanceCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  balanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  balanceLabel: {
    ...typography.labelMedium,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  balanceAmount: {
    ...typography.h2,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: spacing.xl,
    backgroundColor: colors.surfaceHover,
    borderRadius: radius.md,
    padding: 4,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  tabActive: {
    backgroundColor: colors.surface,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: { elevation: 1 },
    }),
  },
  tabText: {
    ...typography.labelMedium,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.3xl,
  },
  splitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  splitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  splitDetails: {
    flex: 1,
  },
  splitTitle: {
    ...typography.labelLarge,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  splitMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  splitAmount: {
    ...typography.labelLarge,
  },
});
