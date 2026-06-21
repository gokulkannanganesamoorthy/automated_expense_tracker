import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, radius, spacing } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { ConfirmationSheet } from '../../components/ConfirmationSheet';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../stores/auth-store';

export function AccountScreen(): React.ReactElement {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuthStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(false);
    // Real implementation would clear sqlite and delete firebase auth
    logout();
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>✕ Close</Text>
      </Pressable>
      <View style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'G'}</Text>
          </View>
          <Text style={styles.name}>{user?.name || 'Guest'}</Text>
          <Text style={styles.email}>{user?.email || 'Not connected'}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{user?.plan === 'pro' ? 'Pro Member' : 'Free Plan'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <Text style={styles.description}>
            Your data is currently syncing to the cloud. Deleting your account will remove all data from this device and our servers permanently.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable 
          style={styles.deleteButton} 
          onPress={() => setShowDeleteConfirm(true)}
        >
          <Text style={styles.deleteButtonText}>Delete Account & Data</Text>
        </Pressable>
      </View>

      <ConfirmationSheet
        visible={showDeleteConfirm}
        title="Delete Account?"
        message="This action is permanent and cannot be undone. All your synced data, budgets, and transactions will be deleted immediately."
        confirmText="Yes, Delete Everything"
        cancelText="Keep My Account"
        isDestructive
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteConfirm(false)}
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
    paddingTop: 0,
    flex: 1,
  },
  backButton: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  backButtonText: {
    ...typography.bodyLarge,
    color: colors.primary,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
    marginTop: spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    ...typography.h2,
    color: colors.textInverse,
  },
  name: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  email: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  badge: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  badgeText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  section: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: radius.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  footer: {
    padding: spacing.xl,
    paddingBottom: 40,
  },
  deleteButton: {
    backgroundColor: colors.error + '10',
    borderWidth: 1,
    borderColor: colors.error + '30',
    height: 56,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    ...typography.labelLarge,
    color: colors.error,
    fontSize: 16,
  },
});
