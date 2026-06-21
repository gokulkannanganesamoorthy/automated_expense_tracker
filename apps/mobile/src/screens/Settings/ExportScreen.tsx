import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, radius, spacing } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { ExportProgress, ExportStatus } from '../../components/ExportProgress';
import { useNavigation } from '@react-navigation/native';
import { FileSpreadsheet, FileText } from 'lucide-react-native';
import { exportService } from '../../utils/export';
import { useTransactionStore } from '../../stores/transaction-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function ExportScreen(): React.ReactElement {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { transactions } = useTransactionStore();
  const [exportType, setExportType] = useState<'csv' | 'pdf'>('csv');
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [progress, setProgress] = useState(0);

  const handleExport = () => {
    const activeTransactions = transactions.filter(t => !t.isDeleted);
    
    if (activeTransactions.length === 0) {
      alert('No transaction data available to export.');
      return;
    }

    setStatus('preparing');
    setProgress(10);
    
    let current = 10;
    const interval = setInterval(() => {
      current += 15;
      
      if (current >= 100) {
        clearInterval(interval);
        setProgress(100);
        setStatus('complete');
        
        // Trigger the real export utility
        setTimeout(async () => {
          // Immediately reset the status and progress back to idle
          // so the user is not stuck on a "100% complete" screen
          // when the native share/save dialog opens or closes.
          setStatus('idle');
          setProgress(0);

          try {
            if (exportType === 'csv') {
              await exportService.exportToCSV(activeTransactions);
            } else {
              await exportService.exportToPDF(activeTransactions, 'Expense Tracker Transactions');
            }
          } catch (error: any) {
            console.error('[Export] Share error:', error);
            alert('Failed to share export: ' + error.message);
          }
        }, 600);
      } else {
        setProgress(current);
        if (current >= 80) {
          setStatus('saving');
        } else if (current >= 40) {
          setStatus('generating');
        }
      }
    }, 150);
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, spacing.md) }]}>
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
          <FileSpreadsheet size={32} color={exportType === 'csv' ? colors.primary : colors.textSecondary} style={styles.typeIcon} />
          <Text style={[styles.typeText, exportType === 'csv' && styles.typeTextActive]}>Spreadsheet (CSV)</Text>
        </Pressable>

        <Pressable 
          style={[styles.typeButton, exportType === 'pdf' && styles.typeButtonActive]}
          onPress={() => setExportType('pdf')}
        >
          <FileText size={32} color={exportType === 'pdf' ? colors.primary : colors.textSecondary} style={styles.typeIcon} />
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
    paddingTop: spacing.md,
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
