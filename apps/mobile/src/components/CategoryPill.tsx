import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { CATEGORY_ICONS, CATEGORY_COLORS, CATEGORY_NAMES } from '@expense-tracker/shared';

interface CategoryPillProps {
  categoryId: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function CategoryPill({ categoryId, size = 'md', showLabel = true }: CategoryPillProps): React.ReactElement {
  const icon = CATEGORY_ICONS[categoryId] || '🏷️';
  const name = CATEGORY_NAMES[categoryId] || 'Other';
  const color = CATEGORY_COLORS[categoryId] || colors.accentPrimary;

  const getContainerStyle = () => {
    switch (size) {
      case 'sm': return styles.containerSm;
      case 'lg': return styles.containerLg;
      case 'md':
      default: return styles.containerMd;
    }
  };

  const getIconStyle = () => {
    switch (size) {
      case 'sm': return styles.iconSm;
      case 'lg': return styles.iconLg;
      case 'md':
      default: return styles.iconMd;
    }
  };

  const getLabelStyle = () => {
    switch (size) {
      case 'sm': return typography.labelSmall;
      case 'lg': return typography.labelLarge;
      case 'md':
      default: return typography.labelMedium;
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, getContainerStyle(), { backgroundColor: `${color}20` }]}>
        <Text style={getIconStyle()}>{icon}</Text>
      </View>
      {showLabel && (
        <Text style={[styles.label, getLabelStyle(), { color }]} numberOfLines={1}>
          {name}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  containerSm: {
    width: 24,
    height: 24,
  },
  containerMd: {
    width: 32,
    height: 32,
  },
  containerLg: {
    width: 48,
    height: 48,
  },
  iconSm: {
    fontSize: 12,
  },
  iconMd: {
    fontSize: 16,
  },
  iconLg: {
    fontSize: 24,
  },
  label: {
    fontWeight: '500',
  },
});
