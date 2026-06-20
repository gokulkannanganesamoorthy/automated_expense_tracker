import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, ActivityIndicator } from 'react-native';
import { colors, radius, spacing } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

export function SignInScreen(): React.ReactElement {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSignIn = async (provider: string) => {
    setLoading(provider);
    
    // Simulate auth delay
    setTimeout(() => {
      setLoading(null);
      // Navigate to next onboarding step
      navigation.navigate('Permissions');
    }, 1000);
  };

  const handleGuest = () => {
    navigation.navigate('Permissions');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoText}>💰</Text>
        </View>
        <Text style={styles.title}>Welcome to Antigravity</Text>
        <Text style={styles.subtitle}>Sign in to sync your data across devices securely.</Text>
      </View>

      <View style={styles.buttonContainer}>
        {Platform.OS === 'ios' && (
          <Pressable 
            style={[styles.button, styles.appleButton]} 
            onPress={() => handleSignIn('apple')}
            disabled={!!loading}
          >
            {loading === 'apple' ? (
              <ActivityIndicator color={colors.textInverse} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.textInverse }]}> Continue with Apple</Text>
            )}
          </Pressable>
        )}

        <Pressable 
          style={[styles.button, styles.googleButton]} 
          onPress={() => handleSignIn('google')}
          disabled={!!loading}
        >
          {loading === 'google' ? (
            <ActivityIndicator color={colors.textPrimary} />
          ) : (
            <Text style={[styles.buttonText, { color: colors.textPrimary }]}>G Continue with Google</Text>
          )}
        </Pressable>

        <Pressable 
          style={[styles.button, styles.emailButton]} 
          onPress={() => handleSignIn('email')}
          disabled={!!loading}
        >
          {loading === 'email' ? (
            <ActivityIndicator color={colors.textPrimary} />
          ) : (
            <Text style={[styles.buttonText, { color: colors.textPrimary }]}>✉️ Continue with Email</Text>
          )}
        </Pressable>
      </View>

      <View style={styles.footer}>
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <Pressable style={styles.guestButton} onPress={handleGuest}>
          <Text style={styles.guestButtonText}>Continue as Guest</Text>
        </Pressable>
        <Text style={styles.guestDisclaimer}>
          Guest data is stored locally and will be lost if you uninstall the app.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing['2xl'],
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: spacing['3xl'],
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: colors.surfaceHover,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  logoText: {
    fontSize: 40,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  buttonContainer: {
    gap: spacing.md,
  },
  button: {
    height: 56,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  googleButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emailButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonText: {
    ...typography.labelLarge,
    fontSize: 16,
  },
  footer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
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
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.caption,
    color: colors.textSecondary,
    paddingHorizontal: spacing.md,
  },
  guestButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  guestButtonText: {
    ...typography.labelLarge,
    color: colors.primary,
  },
  guestDisclaimer: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
});
