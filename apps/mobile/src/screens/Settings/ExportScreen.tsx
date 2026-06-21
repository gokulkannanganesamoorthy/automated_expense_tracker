import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, radius, spacing } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { ExportProgress, ExportStatus } from '../../components/ExportProgress';
import { useNavigation } from '@react-navigation/native';

export function ExportScreen(): React.ReactElement {
  const navigation = useNavigation();
  const [exportType, setExportType] = useState<'csv' | 'pdf'>('csv');
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [progress, setProgress] = useState(0);

  const handleExport = () => {
    setStatus('preparing');
    setProgress(10);
    
    // Mock export generation process
    let current = 10;
    const interval = setInterval(() => {
      current += 15;
      
      if (current >= 40 && status === 'preparing') {
        setStatus('generating');
      }
      if (current >= 80) {
        setStatus('saving');
      }

      if (current >= 100) {
        clearInterval(interval);
        setProgress(100);
        setStatus('complete');
        
        // Mock share intent
        setTimeout(() => {
          alert(`${exportType.toUpperCase()} file saved to your device and ready to share.`);
          setStatus('idle');
          setProgress(0);
        }, 1000);
      } else {
        setProgress(current);
      }
    }, 500);
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>✕ Close</Text>
      </Pressable>
      
      <View style={styles.content}>
        <Text style={styles.title}>Export Data</Text>
        <Text style={styles.subtitle}>Download your transactions for your records or tax purposes.</Text>

      <View style={styles.typeSelector}>
        <Pressable 
          style={[styles.typeButton, exportType === 'csv' && styles.typeButtonActive]}
          onPress={() => setExportType('csv')}
        >
          <Text style={styles.typeIcon}>📊</Text>
          <Text style={[styles.typeText, exportType === 'csv' && styles.typeTextActive]}>Spreadsheet (CSV)</Text>
        </Pressable>

        <Pressable 
          style={[styles.typeButton, exportType === 'pdf' && styles.typeButtonActive]}
          onPress={() => setExportType('pdf')}
        >
          <Text style={styles.typeIcon}>📄</Text>
          <Text style={[styles.typeText, exportType === 'pdf' && styles.typeTextActive]}>Report (PDF)</Text>
        </Pressable>
      </View>

      {status !== 'idle' ? (
        <View style={styles.progressContainer}>
          <ExportProgress 
            status={status} 
            progress={progress} 
            title={`Generating ${exportType.toUpperCase()}...`} 
          />
        </View>
      ) : (
        <Pressable style={styles.exportButton} onPress={handleExport}>
          <Text style={styles.exportButtonText}>Export {exportType.toUpperCase()}</Text>
        </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    paddingTop: 0,
    flex: 1,
  },
  backButton: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  backButtonText: {
    ...typography.bodyLarge,
    color: colors.primary,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing['2xl'],
  },
  typeSelector: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing['3xl'],
  },
  typeButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '05',
  },
  typeIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  typeText: {
    ...typography.labelMedium,
    color: colors.textSecondary,
  },
  typeTextActive: {
    color: colors.primary,
  },
  exportButton: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportButtonText: {
    ...typography.labelLarge,
    color: colors.textInverse,
    fontSize: 18,
  },
  progressContainer: {
    marginTop: spacing.md,
  },
});
