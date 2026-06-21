import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, Pressable, ActivityIndicator, Alert, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { Mail, CheckCircle2 } from 'lucide-react-native';
import { colors, radius, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { syncBankEmails } from '../services/gmail';

// Required for web browser flow
WebBrowser.maybeCompleteAuthSession();

export function GmailSyncButton() {
  const [loading, setLoading] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<string | null>(null);

  // Read Client ID from env, or prompt user if missing
  const envWebId = process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID_WEB || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
  const envIosId = process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID_IOS;
  const envAndroidId = process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID_ANDROID;

  const webClientId = envWebId || 'missing-web-client-id';
  const iosClientId = envIosId || envWebId || 'missing-ios-client-id';
  const androidClientId = envAndroidId || envWebId || 'missing-android-client-id';

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: webClientId,
    iosClientId: iosClientId,
    androidClientId: androidClientId,
    scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        handleSync(authentication.accessToken);
      }
    } else if (response?.type === 'error') {
      Alert.alert('Authentication Error', response.error?.message || 'Failed to authenticate with Google.');
      setLoading(false);
    } else if (response?.type === 'cancel' || response?.type === 'dismiss') {
      setLoading(false);
    }
  }, [response]);

  const initiateSync = async () => {
    if (!envWebId && !envIosId) {
      Alert.alert('Configuration Missing', 'Please add your Google OAuth Client IDs to the .env file to enable Gmail Sync.');
      return;
    }

    setLoading(true);
    setLastSyncResult(null);
    try {
      await promptAsync();
    } catch (e: any) {
      Alert.alert('Error', e.message);
      setLoading(false);
    }
  };

  const handleSync = async (accessToken: string) => {
    try {
      const result = await syncBankEmails(accessToken);
      if (result.success) {
        const msg = `Added ${result.transactionsAdded} transactions.\n${result.reviewNeeded} need review.`;
        setLastSyncResult(msg);
        Alert.alert('Sync Complete', msg);
      } else {
        Alert.alert('Sync Failed', result.message);
      }
    } catch (e: any) {
      Alert.alert('Sync Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable 
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          loading && styles.buttonDisabled
        ]}
        onPress={initiateSync}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.surface} size="small" />
        ) : (
          <>
            <Mail size={20} color={colors.surface} />
            <Text style={styles.buttonText}>Sync Bank Emails (Gmail)</Text>
          </>
        )}
      </Pressable>

      {lastSyncResult && (
        <View style={styles.successContainer}>
          <CheckCircle2 size={16} color={colors.credit} />
          <Text style={styles.successText}>{lastSyncResult}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  button: {
    backgroundColor: '#DB4437', // Google Red
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    gap: spacing.sm,
    width: '100%',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...typography.labelLarge,
    color: colors.surface,
    fontWeight: '600',
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  successText: {
    ...typography.caption,
    color: colors.credit,
    fontWeight: '500',
  },
});
