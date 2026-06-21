import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, ActivityIndicator, TextInput, Alert, KeyboardAvoidingView, ScrollView } from 'react-native';
import Animated, { FadeInDown, Layout, BounceIn } from 'react-native-reanimated';
import { Mail, Wallet, ArrowRight, Shield } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing, shadows } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/types';
import { authService } from '../../services/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

export function SignInScreen(): React.ReactElement {
  const navigation = useNavigation<NativeStackNavigationProp<OnboardingStackParamList>>();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState<string | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);

  const handleGoogleSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert("Development Mode", "Native Google/Apple Sign-In requires a custom build. Please use Email/Password to test auth in Expo Go.");
  };

  const handleSignIn = (provider: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert("Development Mode", "Native Google/Apple Sign-In requires a custom build. Please use Email/Password to test auth in Expo Go.");
  };

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Please enter email and password.");
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading('email');
    try {
      let user;
      try {
        user = await authService.signInWithEmail(email, password);
      } catch (err: any) {
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
          user = await authService.signUpWithEmail(email, password);
          await setDoc(doc(db, 'users', user.uid), {
            name: email.split('@')[0],
            email,
            createdAt: new Date().toISOString(),
          });
        } else {
          throw err;
        }
      }
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.navigate('Permissions', { provider: 'email' } as any);
      
    } catch (err: any) {
      console.error(err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Authentication Failed", err.message);
    } finally {
      setLoading(null);
    }
  };

  // Guest mode removed per user request

  const toggleEmailForm = () => {
    Haptics.selectionAsync();
    setShowEmailForm(!showEmailForm);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Immersive background glows */}
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent, 
          { 
            paddingTop: Math.max(insets.top + spacing.xl, spacing['4xl']),
            paddingBottom: Math.max(insets.bottom + spacing.xl, spacing['2xl'])
          }
        ]} 
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100).duration(800)} style={styles.header}>
          <Animated.View entering={BounceIn.delay(300).duration(1000)} style={styles.logoContainer}>
            <Wallet size={40} color={colors.primary} strokeWidth={2} />
          </Animated.View>
          <Text style={styles.title}>Antigravity</Text>
          <Text style={styles.subtitle}>Securely sync your finances across all your devices.</Text>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(400).springify().damping(14)}
          style={styles.glassContainer}
        >
          <View style={styles.buttonContainer}>
            {Platform.OS === 'ios' && (
              <Pressable 
                style={({ pressed }) => [styles.button, styles.appleButton, pressed && styles.buttonPressed]} 
                onPress={() => handleSignIn('apple')}
                disabled={!!loading}
              >
                {loading === 'apple' ? (
                  <ActivityIndicator color={colors.textInverse} />
                ) : (
                  <Text style={[styles.buttonText, { color: colors.textInverse }]}>Continue with Apple</Text>
                )}
              </Pressable>
            )}

            <Pressable 
              style={({ pressed }) => [styles.button, styles.googleButton, pressed && styles.buttonPressed]} 
              onPress={handleGoogleSignIn}
              disabled={!!loading}
            >
              <Text style={[styles.buttonText, { color: colors.textPrimary }]}>Continue with Google</Text>
            </Pressable>

            {!showEmailForm ? (
              <Animated.View layout={Layout.springify().damping(14)}>
                <Pressable 
                  style={({ pressed }) => [styles.button, styles.emailButton, pressed && styles.buttonPressed]} 
                  onPress={toggleEmailForm}
                  disabled={!!loading}
                >
                  <Mail size={20} color={colors.textPrimary} style={{ marginRight: 8 }} />
                  <Text style={[styles.buttonText, { color: colors.textPrimary }]}>Continue with Email</Text>
                </Pressable>
              </Animated.View>
            ) : (
              <Animated.View layout={Layout.springify().damping(14)} style={styles.emailFormContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  autoFocus
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
                <Pressable 
                  style={({ pressed }) => [styles.button, styles.emailSubmitButton, pressed && styles.buttonPressed]} 
                  onPress={handleEmailAuth}
                  disabled={!!loading}
                >
                  {loading === 'email' ? (
                    <ActivityIndicator color={colors.textInverse} />
                  ) : (
                    <>
                      <Text style={[styles.buttonText, { color: colors.textInverse }]}>Sign In / Sign Up</Text>
                      <ArrowRight size={20} color={colors.textInverse} style={{ marginLeft: 8 }} />
                    </>
                  )}
                </Pressable>
              </Animated.View>
            )}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(600).duration(800)} style={styles.footer}>
          <View style={styles.privacyContainer}>
            <Shield size={14} color={colors.textMuted} style={{ marginRight: 6 }} />
            <Text style={styles.guestDisclaimer}>
              Secured by Firebase Auth.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  glowTop: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
    transform: [{ scale: 2 }],
  },
  glowBottom: {
    position: 'absolute',
    bottom: -50,
    left: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    transform: [{ scale: 2 }],
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing['2xl'],
    paddingTop: spacing['4xl'],
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  logoContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.3)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    lineHeight: 24,
  },
  glassContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: radius['2xl'],
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  buttonContainer: {
    gap: spacing.md,
  },
  button: {
    height: 60,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  appleButton: {
    backgroundColor: '#FFFFFF',
    ...shadows.md,
  },
  googleButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  emailButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  emailSubmitButton: {
    backgroundColor: colors.primary,
    marginTop: spacing.md,
    ...shadows.glow,
  },
  emailFormContainer: {
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  input: {
    height: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    ...typography.bodyLarge,
  },
  buttonText: {
    ...typography.labelLarge,
    fontSize: 16,
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing['3xl'],
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    ...typography.caption,
    color: colors.textMuted,
    paddingHorizontal: spacing.md,
    letterSpacing: 2,
  },
  guestButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  guestButtonText: {
    ...typography.labelLarge,
    color: colors.textSecondary,
    fontSize: 15,
  },
  privacyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  guestDisclaimer: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
