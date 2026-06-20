import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, radius, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import * as LocalAuthentication from 'expo-local-authentication';

interface BiometricPromptProps {
  onSuccess: () => void;
  onFallback: () => void;
  title?: string;
  subtitle?: string;
  isSupported: boolean;
}

export function BiometricPrompt({
  onSuccess,
  onFallback,
  title = 'Unlock Expense Tracker',
  subtitle = 'Verify your identity to access your data securely.',
  isSupported,
}: BiometricPromptProps): React.ReactElement {
  const handleAuthenticate = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: title,
        fallbackLabel: 'Use PIN',
        disableDeviceFallback: false,
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        onSuccess();
      } else if (result.error === 'user_fallback' || result.error === 'passcode_fallback') {
        onFallback();
      }
    } catch (error) {
      console.error('[Biometrics] Auth failed:', error);
      onFallback();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>🔐</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {isSupported ? (
        <Pressable style={styles.button} onPress={handleAuthenticate}>
          <Text style={styles.buttonText}>Authenticate</Text>
        </Pressable>
      ) : (
        <View style={styles.unsupportedContainer}>
          <Text style={styles.unsupportedText}>
            Biometrics not available on this device.
          </Text>
        </View>
      )}

      <Pressable style={styles.fallbackButton} onPress={onFallback}>
        <Text style={styles.fallbackText}>Use PIN instead</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  icon: {
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
    marginBottom: spacing.2xl,
    paddingHorizontal: spacing.xl,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.2xl,
    borderRadius: radius.full,
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  buttonText: {
    ...typography.labelLarge,
    color: colors.textInverse,
  },
  fallbackButton: {
    paddingVertical: spacing.sm,
  },
  fallbackText: {
    ...typography.labelMedium,
    color: colors.primary,
  },
  unsupportedContainer: {
    padding: spacing.md,
    backgroundColor: colors.surfaceHover,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    width: '100%',
  },
  unsupportedText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
