import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, ActivityIndicator, TextInput, Alert } from 'react-native';
import { colors, radius, spacing } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/types';
import { authService } from '../../services/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

export function SignInScreen(): React.ReactElement {
  const navigation = useNavigation<NativeStackNavigationProp<OnboardingStackParamList>>();
  const [loading, setLoading] = useState<string | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);

  const handleGoogleSignIn = () => {
    Alert.alert("Notice", "Real Google Sign-In requires Client IDs in the .env file. Please use Email/Password to test real Firebase Auth for now.");
  };

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password.");
      return;
    }
    
    setLoading('email');
    try {
      // Attempt Sign In first
      let user;
      try {
        user = await authService.signInWithEmail(email, password);
      } catch (err: any) {
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
          // Try sign up if not found
          user = await authService.signUpWithEmail(email, password);
          
          // Create initial firestore doc
          await setDoc(doc(db, 'users', user.uid), {
            name: email.split('@')[0],
            email,
            createdAt: new Date().toISOString(),
          });
        } else {
          throw err;
        }
      }
      
      // If successful, onAuthStateChanged in App.tsx will handle the rest!
      // But we still want to navigate to Permissions so they grant notifications.
      navigation.navigate('Permissions', { provider: 'email' } as any);
      
    } catch (err: any) {
      console.error(err);
      Alert.alert("Authentication Failed", err.message);
    } finally {
      setLoading(null);
    }
  };

  const handleGuest = () => {
    navigation.navigate('Permissions', { provider: 'guest' } as any);
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Back</Text>
      </Pressable>
      
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
          onPress={handleGoogleSignIn}
          disabled={!!loading}
        >
          <Text style={[styles.buttonText, { color: colors.textPrimary }]}>G Continue with Google</Text>
        </Pressable>

        {!showEmailForm ? (
          <Pressable 
            style={[styles.button, styles.emailButton]} 
            onPress={() => setShowEmailForm(true)}
            disabled={!!loading}
          >
            <Text style={[styles.buttonText, { color: colors.textPrimary }]}>✉️ Continue with Email</Text>
          </Pressable>
        ) : (
          <View style={styles.emailFormContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
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
              style={[styles.button, styles.emailSubmitButton]} 
              onPress={handleEmailAuth}
              disabled={!!loading}
            >
              {loading === 'email' ? (
                <ActivityIndicator color={colors.textInverse} />
              ) : (
                <Text style={[styles.buttonText, { color: colors.textInverse }]}>Sign In / Sign Up</Text>
              )}
            </Pressable>
          </View>
        )}
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
    paddingTop: spacing['3xl'],
    justifyContent: 'space-between',
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
  header: {
    alignItems: 'center',
    marginTop: spacing['3xl'] + 20,
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
  emailSubmitButton: {
    backgroundColor: colors.primary,
    marginTop: spacing.sm,
  },
  emailFormContainer: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  input: {
    height: 56,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    ...typography.bodyLarge,
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
