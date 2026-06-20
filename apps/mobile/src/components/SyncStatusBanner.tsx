import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { colors, radius, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { timingConfigs } from '../theme/animations';

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

interface SyncStatusBannerProps {
  status: SyncStatus;
  lastSyncedAt?: Date;
  errorMessage?: string;
}

export function SyncStatusBanner({
  status,
  lastSyncedAt,
  errorMessage,
}: SyncStatusBannerProps): React.ReactElement | null {
  const [visible, setVisible] = useState(status !== 'synced');
  const height = useSharedValue(status === 'synced' ? 0 : 36);
  const opacity = useSharedValue(status === 'synced' ? 0 : 1);
  const spinValue = useSharedValue(0);

  useEffect(() => {
    if (status === 'syncing') {
      spinValue.value = withRepeat(
        withTiming(360, { duration: 1000 }),
        -1, // Infinite
        false
      );
    } else {
      spinValue.value = 0; // Reset
    }
  }, [status, spinValue]);

  useEffect(() => {
    if (status === 'synced') {
      // Hide banner after 2 seconds
      const timeout = setTimeout(() => {
        height.value = withTiming(0, timingConfigs.default);
        opacity.value = withTiming(0, timingConfigs.default, (finished) => {
          if (finished) {
            // Can't set React state inside Reanimated worklet cleanly without runOnJS, 
            // but we can just rely on the height/opacity being 0
          }
        });
      }, 2000);
      return () => clearTimeout(timeout);
    } else {
      setVisible(true);
      height.value = withTiming(36, timingConfigs.default);
      opacity.value = withTiming(1, timingConfigs.default);
    }
  }, [status, height, opacity]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: opacity.value,
  }));

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinValue.value}deg` }],
  }));

  const getStatusConfig = () => {
    switch (status) {
      case 'syncing':
        return { bg: colors.info + '15', text: colors.info, icon: '🔄', msg: 'Syncing changes...' };
      case 'offline':
        return { bg: colors.warning + '15', text: colors.warning, icon: '📡', msg: 'Offline mode. Changes will sync later.' };
      case 'error':
        return { bg: colors.error + '15', text: colors.error, icon: '⚠️', msg: errorMessage || 'Sync failed. Retrying...' };
      case 'synced':
      default:
        return { bg: colors.success + '15', text: colors.success, icon: '✓', msg: 'All changes synced' };
    }
  };

  const config = getStatusConfig();

  // Don't render at all if it's synced and animation finished (simplification)
  // Reanimated will handle the hiding gracefully.

  return (
    <Animated.View style={[styles.container, { backgroundColor: config.bg }, animatedContainerStyle]}>
      <Animated.Text style={[styles.icon, status === 'syncing' && animatedIconStyle]}>
        {config.icon}
      </Animated.Text>
      <Text style={[styles.message, { color: config.text }]}>
        {config.msg}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: spacing.md,
    width: '100%',
  },
  icon: {
    fontSize: 14,
    marginRight: 6,
  },
  message: {
    ...typography.caption,
    fontWeight: '500',
  },
});
