import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { CATEGORY_COLORS, CATEGORY_NAMES } from '@expense-tracker/shared';
import { ShoppingCart, Utensils, Car, Film, Receipt, HeartPulse, MoreHorizontal } from 'lucide-react-native';

interface CategoryPillProps {
  categoryId: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function CategoryPill({ categoryId, size = 'md', showLabel = true }: CategoryPillProps): React.ReactElement {
  const name = CATEGORY_NAMES[categoryId] || 'Other';
  const color = CATEGORY_COLORS[categoryId] || colors.accentPrimary;

  const IconComponent = (() => {
    switch (categoryId) {
      case 'food': return Utensils;
      case 'transport': return Car;
      case 'shopping': return ShoppingCart;
      case 'entertainment': return Film;
      case 'bills': return Receipt;
      case 'health': return HeartPulse;
      default: return MoreHorizontal;
    }
  })();

  const getContainerStyle = () => {
    switch (size) {
      case 'sm': return styles.containerSm;
      case 'lg': return styles.containerLg;
      case 'md':
      default: return styles.containerMd;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 12;
      case 'lg': return 24;
      case 'md':
      default: return 16;
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
        <IconComponent size={getIconSize()} color={color} strokeWidth={2.5} />
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
  label: {
    fontWeight: '500',
  },
});
