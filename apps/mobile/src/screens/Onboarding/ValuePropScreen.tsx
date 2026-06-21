import React, { useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolateColor,
  interpolate,
  Extrapolate,
  FadeInDown,
  FadeIn,
  BounceIn,
} from 'react-native-reanimated';
import { Sparkles, BarChart2, ShieldCheck, ArrowRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/types';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Zero Effort',
    subtitle: 'Tracking',
    description: 'We automatically read your bank SMS to categorize and track expenses. No manual entry required.',
    Icon: Sparkles,
    color: colors.primary,
    bgColor: '#161129', // Deep Purple
  },
  {
    id: '2',
    title: 'Deep',
    subtitle: 'Analytics',
    description: 'Understand exactly where your money goes with beautiful, interactive and real-time charts.',
    Icon: BarChart2,
    color: colors.success,
    bgColor: '#0A1A14', // Deep Green
  },
  {
    id: '3',
    title: '100%',
    subtitle: 'Private',
    description: 'Your data never leaves your device unless you enable cloud sync. Secure by design.',
    Icon: ShieldCheck,
    color: colors.warning,
    bgColor: '#1A130A', // Deep Orange
  },
];

export function ValuePropScreen(): React.ReactElement {
  const navigation = useNavigation<NativeStackNavigationProp<OnboardingStackParamList>>();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const scrollRef = useRef<Animated.ScrollView>(null);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
    onMomentumEnd: (event) => {
      const index = Math.round(event.contentOffset.x / width);
      // We can't trigger state updates directly in worklets easily without runOnJS
    },
  });

  const handleMomentumScrollEnd = useCallback((event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    if (index !== currentIndex) {
      Haptics.selectionAsync();
      setCurrentIndex(index);
    }
  }, [currentIndex]);

  const nextSlide = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (currentIndex < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: width * (currentIndex + 1), animated: true });
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.navigate('SignIn');
    }
  };

  const skip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('SignIn');
  };

  const backgroundStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      scrollX.value,
      SLIDES.map((_, i) => i * width),
      SLIDES.map((slide) => slide.bgColor)
    );
    return { backgroundColor };
  });

  return (
    <Animated.View style={[styles.container, backgroundStyle]}>
      {/* Background glow effects */}
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <Pressable style={[styles.skipButton, { top: Math.max(insets.top + spacing.md, 60) }]} onPress={skip}>
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>

      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        bounces={false}
      >
        {SLIDES.map((item, index) => {
          const { Icon } = item;
          
          return (
            <View key={item.id} style={styles.slide}>
              <Animated.View 
                entering={BounceIn.delay(100).duration(1000)}
                style={[styles.iconContainer, { shadowColor: item.color }]}
              >
                <Icon size={48} color={item.color} strokeWidth={1.5} />
              </Animated.View>
              
              <View style={styles.textContainer}>
                <Animated.Text 
                  entering={FadeInDown.delay(300).springify().damping(12)} 
                  style={styles.title}
                >
                  {item.title}
                </Animated.Text>
                <Animated.Text 
                  entering={FadeInDown.delay(400).springify().damping(12)} 
                  style={[styles.title, { color: item.color }]}
                >
                  {item.subtitle}
                </Animated.Text>
                
                <Animated.Text 
                  entering={FadeIn.delay(600).duration(800)} 
                  style={styles.description}
                >
                  {item.description}
                </Animated.Text>
              </View>
            </View>
          );
        })}
      </Animated.ScrollView>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {SLIDES.map((_, i) => {
            const dotStyle = useAnimatedStyle(() => {
              const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
              const dotWidth = interpolate(scrollX.value, inputRange, [8, 32, 8], Extrapolate.CLAMP);
              const opacity = interpolate(scrollX.value, inputRange, [0.3, 1, 0.3], Extrapolate.CLAMP);
              const color = interpolateColor(scrollX.value, SLIDES.map((_, idx) => idx * width), SLIDES.map(s => s.color));
              
              return { width: dotWidth, opacity, backgroundColor: color };
            });

            return <Animated.View key={i} style={[styles.dot, dotStyle]} />;
          })}
        </View>

        <Pressable 
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: SLIDES[currentIndex].color },
            pressed && styles.buttonPressed
          ]} 
          onPress={nextSlide}
        >
          <Text style={styles.buttonText}>
            {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Continue'}
          </Text>
          <ArrowRight size={20} color={colors.background} strokeWidth={2.5} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // fallback
  },
  glowTop: {
    position: 'absolute',
    top: -height * 0.2,
    left: -width * 0.2,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: 'rgba(255,255,255,0.03)',
    transform: [{ scale: 2 }],
  },
  glowBottom: {
    position: 'absolute',
    bottom: -height * 0.1,
    right: -width * 0.2,
    width: width,
    height: width,
    borderRadius: width * 0.5,
    backgroundColor: 'rgba(0,0,0,0.3)',
    transform: [{ scale: 1.5 }],
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
    padding: spacing.sm,
  },
  skipText: {
    ...typography.labelLarge,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
    paddingTop: height * 0.1,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['3xl'],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 10,
  },
  textContainer: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    fontSize: 42,
    lineHeight: 48,
    textAlign: 'center',
    letterSpacing: -1,
  },
  description: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 28,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
    fontSize: 17,
  },
  footer: {
    padding: spacing['2xl'],
    paddingBottom: 56,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing['2xl'],
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  button: {
    height: 64,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
  buttonText: {
    ...typography.labelLarge,
    color: colors.background,
    fontSize: 18,
    letterSpacing: 0.5,
  },
});
