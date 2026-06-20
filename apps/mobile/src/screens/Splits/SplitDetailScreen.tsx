import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { colors, radius, spacing } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ConfirmationSheet } from '../../components/ConfirmationSheet';

export function SplitDetailScreen(): React.ReactElement {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const splitId = route.params?.id;

  // Mock data based on ID (simplified for demo)
  const isOwedToYou = splitId !== '3'; 
  const totalAmount = isOwedToYou ? 300000 : 150000;
  const title = isOwedToYou ? 'Movie Tickets' : 'Cab to Airport';
  const members = isOwedToYou 
    ? [{ name: 'You', amount: 150000, paid: true }, { name: 'Charlie', amount: 150000, paid: false }]
    : [{ name: 'Alice', amount: 150000, paid: true }, { name: 'You', amount: 150000, paid: false }];

  const [showSettleConfirm, setShowSettleConfirm] = useState(false);

  const handleSettle = () => {
    setShowSettleConfirm(false);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.date}>Created 2 days ago</Text>
          
          <View style={styles.amountBox}>
            <Text style={styles.amountLabel}>Total Expense</Text>
            <Text style={styles.amountValue}>₹{(totalAmount / 100).toLocaleString('en-IN')}</Text>
          </View>
        </View>

        <View style={styles.statusBanner}>
          <Text style={styles.statusIcon}>{isOwedToYou ? '📥' : '📤'}</Text>
          <View>
            <Text style={styles.statusTitle}>
              {isOwedToYou ? 'Charlie owes you' : 'You owe Alice'}
            </Text>
            <Text style={styles.statusAmount}>
              ₹1,500.00
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Split Details</Text>
        <View style={styles.membersList}>
          {members.map((member, i) => (
            <View key={i} style={styles.memberRow}>
              <View style={styles.memberLeft}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{member.name.charAt(0)}</Text>
                </View>
                <Text style={styles.memberName}>{member.name}</Text>
              </View>
              <View style={styles.memberRight}>
                <Text style={styles.memberAmount}>₹{(member.amount / 100).toLocaleString('en-IN')}</Text>
                {member.paid ? (
                  <Text style={styles.paidText}>Paid</Text>
                ) : (
                  <Text style={styles.pendingText}>Pending</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable 
          style={styles.settleButton} 
          onPress={() => setShowSettleConfirm(true)}
        >
          <Text style={styles.settleButtonText}>Mark as Settled</Text>
        </Pressable>
      </View>

      <ConfirmationSheet
        visible={showSettleConfirm}
        title="Settle Expense?"
        message="Are you sure you want to mark this expense as fully settled?"
        confirmText="Yes, mark as Settled"
        onConfirm={handleSettle}
        onCancel={() => setShowSettleConfirm(false)}
      />
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
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  date: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  amountBox: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: radius.xl,
    alignItems: 'center',
    width: '100%',
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
  amountLabel: {
    ...typography.labelMedium,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  amountValue: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceHover,
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing['2xl'],
    gap: spacing.md,
  },
  statusIcon: {
    fontSize: 24,
  },
  statusTitle: {
    ...typography.labelLarge,
    color: colors.textPrimary,
  },
  statusAmount: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: 2,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  membersList: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.labelMedium,
    color: colors.primary,
  },
  memberName: {
    ...typography.bodyLarge,
    color: colors.textPrimary,
  },
  memberRight: {
    alignItems: 'flex-end',
  },
  memberAmount: {
    ...typography.labelMedium,
    color: colors.textPrimary,
  },
  paidText: {
    ...typography.caption,
    color: colors.success,
  },
  pendingText: {
    ...typography.caption,
    color: colors.warning,
  },
  footer: {
    padding: spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : spacing.xl,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  settleButton: {
    backgroundColor: colors.success,
    height: 56,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settleButtonText: {
    ...typography.labelLarge,
    color: colors.textInverse,
    fontSize: 18,
  },
});
