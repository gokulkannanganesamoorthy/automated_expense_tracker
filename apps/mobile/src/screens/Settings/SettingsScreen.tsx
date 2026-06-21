import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { colors, radius, spacing } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConfirmationSheet } from '../../components/ConfirmationSheet';
import * as LocalAuthentication from 'expo-local-authentication';
import { User, Cloud, Download, Lock, Moon, Building } from 'lucide-react-native';
import { useAuthStore } from '../../stores/auth-store';
import { authService } from '../../services/auth';
import { GmailSyncButton } from '../../components/GmailSyncButton';

export function SettingsScreen(): React.ReactElement {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, logout } = useAuthStore();
  
  const biometricsEnabled = settings?.biometricEnabled || false;
  const syncEnabled = settings?.analyticsOptIn || false; // Using analyticsOptIn to mock sync toggle
  const darkMode = settings?.theme === 'dark';
  
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const toggleBiometrics = async (value: boolean) => {
    if (value) {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (hasHardware && isEnrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Enable Biometric Unlock',
        });
        if (result.success) {
          updateSettings({ biometricEnabled: true });
        }
      } else {
        alert("Biometrics not available or enrolled on this device.");
      }
    } else {
      updateSettings({ biometricEnabled: false });
    }
  };

  const handleSignOut = async () => {
    setShowSignOutConfirm(false);
    try {
      await authService.signOutUser();
    } catch (e) {
      console.error('Firebase sign out failed:', e);
    }
    logout();
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, spacing.md) }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account & Data</Text>
          <SettingsRow 
            icon={<User size={20} color={colors.textSecondary} />} 
            label="Account Details" 
            onPress={() => navigation.navigate('Profile')} 
          />
          <SettingsRow 
            icon={<Cloud size={20} color={colors.textSecondary} />} 
            label="Cloud Sync" 
            rightContent={
              <Switch 
                value={syncEnabled} 
                onValueChange={(val) => updateSettings({ analyticsOptIn: val })} 
                trackColor={{ true: colors.primary }}
              />
            } 
          />
          <SettingsRow 
            icon={<Download size={20} color={colors.textSecondary} />} 
            label="Export Data (CSV/PDF)" 
            onPress={() => navigation.navigate('ExportOptions')} 
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bank Connections</Text>
          <View style={{ padding: spacing.lg, backgroundColor: colors.surface, marginHorizontal: spacing.md, borderRadius: radius.xl }}>
            <Text style={{ ...typography.bodyMedium, color: colors.textSecondary, marginBottom: spacing.md }}>
              Securely scan your Gmail inbox for bank transaction alerts. 100% Free and Private.
            </Text>
            <GmailSyncButton />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Preferences</Text>
          <SettingsRow 
            icon={<Lock size={20} color={colors.textSecondary} />} 
            label="App Lock (Biometrics)" 
            rightContent={
              <Switch 
                value={biometricsEnabled} 
                onValueChange={toggleBiometrics} 
                trackColor={{ true: colors.primary }}
              />
            } 
          />
          <SettingsRow 
            icon={<Moon size={20} color={colors.textSecondary} />} 
            label="Dark Mode" 
            rightContent={
              <Switch 
                value={darkMode} 
                onValueChange={(val) => updateSettings({ theme: val ? 'dark' : 'light' })} 
                trackColor={{ true: colors.primary }}
              />
            } 
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advanced</Text>
          <SettingsRow 
            icon={<Building size={20} color={colors.textSecondary} />} 
            label="Bank SMS Patterns" 
            onPress={() => navigation.navigate('BankPatterns')} 
          />
        </View>

        <Pressable style={styles.signOutButton} onPress={() => setShowSignOutConfirm(true)}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>

        <Text style={styles.versionText}>Version 1.0.0 (Build 1)</Text>

      </ScrollView>

      <ConfirmationSheet
        visible={showSignOutConfirm}
        title="Sign Out?"
        message="If cloud sync is disabled, any unsynced local data may be lost if you sign out."
        confirmText="Sign Out"
        isDestructive
        onConfirm={handleSignOut}
        onCancel={() => setShowSignOutConfirm(false)}
      />
    </View>
  );
}

const SettingsRow = ({ 
  icon, 
  label, 
  onPress, 
  rightContent 
}: { 
  icon: React.ReactNode; 
  label: string; 
  onPress?: () => void;
  rightContent?: React.ReactNode;
}) => {
  const Container = onPress ? Pressable : View;
  
  return (
    <Container style={styles.row} onPress={onPress}>
      <View style={styles.rowLeft}>
        <View style={styles.rowIconContainer}>{icon}</View>
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <View style={styles.rowRight}>
        {rightContent || <Text style={styles.rowArrow}>›</Text>}
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    ...typography.labelMedium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    marginBottom: 2, // Tiny gap for border-like effect
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowIconContainer: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    ...typography.bodyLarge,
    color: colors.textPrimary,
  },
  rowRight: {
    alignItems: 'flex-end',
  },
  rowArrow: {
    fontSize: 24,
    color: colors.textMuted,
  },
  signOutButton: {
    marginTop: spacing.xl,
    alignItems: 'center',
    padding: spacing.md,
  },
  signOutText: {
    ...typography.labelLarge,
    color: colors.error,
  },
  versionText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
