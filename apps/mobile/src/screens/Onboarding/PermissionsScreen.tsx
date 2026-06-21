import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { colors, radius, spacing } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { useAuthStore } from '../../stores/auth-store';
import * as Notifications from 'expo-notifications';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Alert } from 'react-native';

export function PermissionsScreen(): React.ReactElement {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const provider = route.params?.provider || 'guest';
  const [status, setStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');

  const handleFinalAuthStep = () => {
    if (provider === 'guest') {
      useAuthStore.getState().setGuestMode();
    } else {
      // Real user auth state is already hydrated by onAuthStateChanged in App.tsx!
      useAuthStore.getState().setOnboarded(true);
    }
  };

  const handleRequestPermissions = async () => {
    setStatus('requesting');
    
    try {
      if (Platform.OS === 'android') {
        Alert.alert("Notice", "Android SMS permissions (READ_SMS) require native configuration and cannot be fully requested in Expo Go. We will fallback to Notification permissions for this demo.");
      }
      
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        finalStatus = newStatus;
      }
      
      if (finalStatus === 'granted') {
        setStatus('granted');
        setTimeout(() => {
          handleFinalAuthStep();
        }, 1000);
      } else {
        setStatus('denied');
        Alert.alert("Permission Denied", "You can manually enable notifications in your device settings later.");
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      setStatus('denied');
      Alert.alert("Error", "Permission request failed on this simulator/device.");
    }
  };

  const handleSkip = () => {
    handleFinalAuthStep();
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Back</Text>
      </Pressable>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{Platform.OS === 'android' ? '📩' : '🔔'}</Text>
        </View>
        
        <Text style={styles.title}>
          {Platform.OS === 'android' ? 'Read SMS Messages' : 'Enable Notifications'}
        </Text>
        
        <Text style={styles.description}>
          {Platform.OS === 'android' 
            ? 'To automatically track your expenses, we need permission to read transaction SMS from your bank. We only process messages from known banks and never read personal texts.'
            : 'To automatically track your expenses on iOS, enable notifications so we can process alerts from your banking apps securely.'}
        </Text>

        <View style={styles.privacyCard}>
          <Text style={styles.privacyIcon}>🔒</Text>
          <Text style={styles.privacyText}>
            Your data is processed locally on your device. We respect your privacy.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable 
          style={[
            styles.button, 
            status === 'granted' && styles.buttonSuccess,
            status === 'denied' && styles.buttonError
          ]} 
          onPress={handleRequestPermissions}
          disabled={status === 'requesting' || status === 'granted'}
        >
          <Text style={styles.buttonText}>
            {status === 'idle' ? 'Grant Permission' : 
             status === 'requesting' ? 'Requesting...' : 
             status === 'granted' ? 'Permission Granted ✓' : 
             'Try Again'}
          </Text>
        </Pressable>

        <Pressable style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>I'll enter expenses manually</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing['2xl'],
    paddingTop: spacing['3xl'],
  },
  backButton: {
    position: 'absolute',
    top: spacing['3xl'],
    left: spacing['xl'],
    zIndex: 10,
    padding: spacing.sm,
  },
  backButtonText: {
    ...typography.bodyLarge,
    color: colors.primary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['2xl'],
  },
  icon: {
    fontSize: 48,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  description: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing['2xl'],
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceHover,
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  privacyIcon: {
    fontSize: 20,
  },
  privacyText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  footer: {
    paddingBottom: spacing.xl,
  },
  button: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  buttonSuccess: {
    backgroundColor: colors.success,
  },
  buttonError: {
    backgroundColor: colors.error,
  },
  buttonText: {
    ...typography.labelLarge,
    color: colors.textInverse,
    fontSize: 18,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  skipText: {
    ...typography.labelMedium,
    color: colors.textSecondary,
  },
});
