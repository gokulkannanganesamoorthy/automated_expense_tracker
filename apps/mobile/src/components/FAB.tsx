import React from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors, shadows } from '../theme/tokens';
import { timingConfigs } from '../theme/animations';
import { typography } from '../theme/typography';

interface FABProps {
  onPress: () => void;
  icon?: string;
  label?: string;
  visible?: boolean;
}

export function FAB({ onPress, icon = '+', label, visible = true }: FABProps): React.ReactElement {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(visible ? 1 : 0);
  const translateY = useSharedValue(visible ? 0 : 100);

  React.useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, timingConfigs.default);
      translateY.value = withSpring(0, timingConfigs.spring);
    } else {
      opacity.value = withTiming(0, timingConfigs.default);
      translateY.value = withSpring(100, timingConfigs.spring);
    }
  }, [visible, opacity, translateY]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value }
    ],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, timingConfigs.spring);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, timingConfigs.spring);
  };

  const handlePress = () => {
    // Little pop animation on click
    scale.value = withSequence(
      withSpring(0.8, timingConfigs.spring),
      withSpring(1, timingConfigs.spring)
    );
    onPress();
  };

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          label ? styles.buttonWithLabel : styles.buttonIconOnly,
          pressed && styles.pressed
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={label || "Add"}
      >
        <Animated.Text style={styles.icon}>{icon}</Animated.Text>
        {label && <Animated.Text style={styles.label}>{label}</Animated.Text>}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    ...shadows.lg,
  },
  button: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  buttonIconOnly: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  buttonWithLabel: {
    height: 56,
    borderRadius: 28,
    paddingHorizontal: 24,
    gap: 8,
  },
  pressed: {
    backgroundColor: colors.primaryHover,
  },
  icon: {
    color: colors.textInverse,
    fontSize: 24,
    fontWeight: '400',
    marginTop: -2, // Optical alignment for + sign
  },
  label: {
    ...typography.labelLarge,
    color: colors.textInverse,
  },
});
