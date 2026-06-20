import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { colors } from '../theme/tokens';
import { typography } from '../theme/typography';
import { shouldAnimate, timingConfigs } from '../theme/animations';

interface AnimatedAmountProps {
  amountPaise: number;
  type: 'debit' | 'credit' | 'neutral';
  style?: any;
  prefix?: string;
  showSign?: boolean;
}

export function AnimatedAmount({
  amountPaise,
  type,
  style,
  prefix = '₹',
  showSign = false,
}: AnimatedAmountProps): React.ReactElement {
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    if (shouldAnimate()) {
      animatedValue.value = withTiming(amountPaise, timingConfigs.counting);
    } else {
      animatedValue.value = amountPaise;
    }
  }, [amountPaise, animatedValue]);

  // We format the static text for now until we add a proper Reanimated Text component
  // In a full implementation with Skia/Reanimated Text, we would interpolate the value
  
  const rupees = amountPaise / 100;
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: rupees % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(rupees));

  const sign = showSign ? (amountPaise > 0 && type !== 'debit' ? '+' : amountPaise < 0 || type === 'debit' ? '-' : '') : '';
  const displayString = `${sign}${prefix}${formatted}`;

  const getColor = () => {
    if (type === 'credit') return colors.success;
    if (type === 'debit') return colors.textPrimary;
    return colors.textPrimary;
  };

  return (
    <Animated.Text style={[styles.text, { color: getColor() }, style]}>
      {displayString}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  text: {
    ...typography.monoMedium,
  },
});
