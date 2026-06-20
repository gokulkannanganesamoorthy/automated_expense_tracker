import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { colors, radius, spacing } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { AnimatedAmount } from '../../components/AnimatedAmount';
import { CategoryPill } from '../../components/CategoryPill';
import { ConfirmationSheet } from '../../components/ConfirmationSheet';
import { useTransactionStore } from '../../stores/transaction-store';
import { useNavigation, useRoute } from '@react-navigation/native';

// In a real app, route params would be typed via RootStackParamList
export function TransactionDetailScreen(): React.ReactElement {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const txnId = route.params?.id;

  const { transactions, updateTransaction, softDeleteTransaction } = useTransactionStore();
  const transaction = transactions.find(t => t.id === txnId);

  const [notes, setNotes] = useState(transaction?.notes || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!transaction) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Transaction not found</Text>
      </View>
    );
  }

  const handleSaveNotes = () => {
    if (notes !== transaction.notes) {
      updateTransaction(transaction.id, { notes });
    }
  };

  const handleDelete = () => {
    softDeleteTransaction(transaction.id);
    setShowDeleteConfirm(false);
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <CategoryPill categoryId={transaction.category} size="lg" showLabel={false} />
        <Text style={styles.merchant}>{transaction.merchantNormalized}</Text>
        <AnimatedAmount 
          amountPaise={transaction.amountPaise} 
          type={transaction.type}
          style={styles.amount}
          showSign={transaction.type === 'credit'}
        />
        <Text style={styles.date}>
          {new Date(transaction.date).toLocaleString('en-US', { 
            weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' 
          })}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        
        <DetailRow label="Status" value={transaction.isDeleted ? 'Deleted' : 'Completed'} />
        {transaction.txnMode && <DetailRow label="Mode" value={transaction.txnMode} />}
        {transaction.accountLast4 && <DetailRow label="Account" value={`**${transaction.accountLast4}`} />}
        {transaction.upiRef && <DetailRow label="UPI Ref" value={transaction.upiRef} />}
        {transaction.balanceAfterPaise !== null && (
          <DetailRow 
            label="Balance After" 
            value={`₹${(transaction.balanceAfterPaise / 100).toLocaleString('en-IN')}`} 
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notes</Text>
        <TextInput
          style={styles.notesInput}
          multiline
          placeholder="Add a note..."
          placeholderTextColor={colors.textMuted}
          value={notes}
          onChangeText={setNotes}
          onBlur={handleSaveNotes}
        />
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.deleteButton} onPress={() => setShowDeleteConfirm(true)}>
          <Text style={styles.deleteButtonText}>Delete Transaction</Text>
        </Pressable>
      </View>

      <ConfirmationSheet
        visible={showDeleteConfirm}
        title="Delete Transaction?"
        message="This transaction will be moved to the trash and will no longer affect your budget or analytics."
        confirmText="Delete"
        isDestructive
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </ScrollView>
  );
}

const DetailRow = ({ label, value }: { label: string, value: string }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    ...typography.bodyLarge,
    color: colors.error,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    paddingTop: spacing.xl,
  },
  merchant: {
    ...typography.h2,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  amount: {
    ...typography.h1,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  date: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.labelLarge,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  detailValue: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  notesInput: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  actions: {
    marginTop: spacing.xl,
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  deleteButtonText: {
    ...typography.labelLarge,
    color: colors.error,
  },
});
