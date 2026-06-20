import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, radius, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

interface ReviewQueueBannerProps {
  count: number;
}

export function ReviewQueueBanner({ count }: ReviewQueueBannerProps): React.ReactElement | null {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  if (count <= 0) {
    return null;
  }

  const handlePress = () => {
    // Navigate to Review Queue Screen
    // navigation.navigate('ReviewQueue');
    console.log('Navigate to review queue');
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      onPress={handlePress}
    >
      <View style={styles.left}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>⚠️</Text>
        </View>
        <View>
          <Text style={styles.title}>Transactions to Review</Text>
          <Text style={styles.subtitle}>
            {count} {count === 1 ? 'transaction needs' : 'transactions need'} your attention
          </Text>
        </View>
      </View>
      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.warning + '10', // 10% opacity warning
    borderRadius: radius.md,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.warning + '30',
  },
  pressed: {
    backgroundColor: colors.warning + '20',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconContainer: {
    backgroundColor: colors.warning + '20',
    borderRadius: radius.full,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 16,
  },
  title: {
    ...typography.labelMedium,
    color: colors.warning,
    fontWeight: '600',
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  arrow: {
    fontSize: 24,
    color: colors.warning,
    fontWeight: '300',
  },
});
