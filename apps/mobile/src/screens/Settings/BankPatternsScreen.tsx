import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { colors, radius, spacing } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { useNavigation } from '@react-navigation/native';
// Mock import for demo
const mockPatterns = [
  { bank: 'HDFC', type: 'debit', pattern: 'debited from A/c no. (?<account>\\S+) for (?<currency>Rs\\.?|INR)\\s*(?<amount>[\\d,]+(?:\\.\\d{1,2})?)' },
  { bank: 'SBI', type: 'credit', pattern: 'Credited to a/c (?<account>\\S+) by (?<currency>Rs\\.|INR)\\s*(?<amount>[\\d,]+(?:\\.\\d{1,2})?)' },
];

export function BankPatternsScreen(): React.ReactElement {
  const navigation = useNavigation();
  const [lastUpdated, setLastUpdated] = useState('Today at 10:45 AM');

  const handleForceUpdate = () => {
    // Call Firebase Remote Config fetchAndActivate
    setLastUpdated('Just now');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Bank Patterns</Text>
            <Text style={styles.subtitle}>Parser rules synced from cloud.</Text>
          </View>
          <Pressable style={styles.updateButton} onPress={handleForceUpdate}>
            <Text style={styles.updateButtonText}>Sync Now</Text>
          </Pressable>
        </View>

        <View style={styles.statusBox}>
          <Text style={styles.statusLabel}>Last Synced</Text>
          <Text style={styles.statusValue}>{lastUpdated}</Text>
          <Text style={styles.statusHelp}>
            These regex patterns are used to read SMS alerts. They update automatically without needing an app update.
          </Text>
        </View>

        {mockPatterns.map((item, index) => (
          <View key={index} style={styles.patternCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.bankName}>{item.bank}</Text>
              <View style={[
                styles.badge, 
                { backgroundColor: item.type === 'debit' ? colors.error + '15' : colors.success + '15' }
              ]}>
                <Text style={[
                  styles.badgeText, 
                  { color: item.type === 'debit' ? colors.error : colors.success }
                ]}>
                  {item.type.toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.codeBlock}>
              <Text style={styles.codeText}>{item.pattern}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.3xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  updateButton: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  updateButtonText: {
    ...typography.labelMedium,
    color: colors.primary,
  },
  statusBox: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.2xl,
  },
  statusLabel: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statusValue: {
    ...typography.bodyLarge,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  statusHelp: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  patternCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  bankName: {
    ...typography.labelLarge,
    color: colors.textPrimary,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  badgeText: {
    ...typography.caption,
    fontWeight: '600',
  },
  codeBlock: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  codeText: {
    ...typography.monoMedium,
    color: colors.textSecondary,
    fontSize: 12,
  },
});
