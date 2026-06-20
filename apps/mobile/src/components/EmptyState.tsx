import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon = '📭',
  title,
  description,
  action,
}: EmptyStateProps): React.ReactElement {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {action && <View style={styles.actionContainer}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    minHeight: 200,
  },
  icon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  actionContainer: {
    marginTop: spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
});
