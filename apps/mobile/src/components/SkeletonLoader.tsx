import React, { useEffect } from 'react';
import { View, StyleSheet, DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { colors, radius } from '../theme/tokens';
import { shouldAnimate } from '../theme/animations';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: any;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = radius.sm,
  style,
}: SkeletonProps): React.ReactElement {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    if (shouldAnimate()) {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.7, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // Infinite repeat
        true // Reverse
      );
    }
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius },
        animatedStyle,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.border,
  },
});

// Pre-composed common skeleton layouts
export const SkeletonTransaction = () => (
  <View style={layoutStyles.transaction}>
    <View style={layoutStyles.transactionLeft}>
      <Skeleton width={40} height={40} borderRadius={20} />
      <View style={layoutStyles.transactionDetails}>
        <Skeleton width="60%" height={16} />
        <Skeleton width="40%" height={12} />
      </View>
    </View>
    <Skeleton width={60} height={20} />
  </View>
);

export const SkeletonCard = () => (
  <View style={layoutStyles.card}>
    <Skeleton width="40%" height={16} style={{ marginBottom: 16 }} />
    <Skeleton width="100%" height={32} style={{ marginBottom: 8 }} />
    <Skeleton width="60%" height={14} />
  </View>
);

const layoutStyles = StyleSheet.create({
  transaction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: 8,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  transactionDetails: {
    gap: 4,
    flex: 1,
  },
  card: {
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: radius.xl,
    marginBottom: 16,
  },
});
