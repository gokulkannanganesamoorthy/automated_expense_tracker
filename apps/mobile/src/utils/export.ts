import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import type { Transaction } from '@expense-tracker/shared';

/**
 * Utility functions for exporting transaction data
 */
export const exportService = {
  /**
   * Generates a CSV file from a list of transactions and prompts user to share/save it
   */
  async exportToCSV(transactions: Transaction[], filename: string = 'transactions_export.csv'): Promise<boolean> {
    try {
      if (transactions.length === 0) return false;

      // Create CSV header
      let csvContent = 'ID,Date,Merchant,Amount (INR),Type,Category,Notes,Mode\n';

      // Add rows
      transactions.forEach(txn => {
        const date = new Date(txn.date).toISOString().split('T')[0];
        const amount = (txn.amountPaise / 100).toFixed(2);
        // Escape commas in merchant or notes
        const merchant = `"${(txn.merchant || '').replace(/"/g, '""')}"`;
        const notes = `"${(txn.notes || '').replace(/"/g, '""')}"`;
        
        csvContent += `${txn.id},${date},${merchant},${amount},${txn.type},${txn.category},${notes},${txn.txnMode || ''}\n`;
      });

      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: FileSystem.EncodingType.UTF8 });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: 'Export Transactions' });
      }

      return true;
    } catch (error) {
      console.error('[ExportService] Failed to export CSV:', error);
      return false;
    }
  },

  /**
   * Generates a PDF report using HTML template and expo-print
   */
  async exportToPDF(transactions: Transaction[], title: string = 'Expense Report'): Promise<boolean> {
    try {
      if (transactions.length === 0) return false;

      const totalSpent = transactions
        .filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + t.amountPaise, 0);

      let rowsHtml = '';
      transactions.forEach(txn => {
        const date = new Date(txn.date).toLocaleDateString();
        const amount = (txn.amountPaise / 100).toFixed(2);
        const color = txn.type === 'debit' ? '#ef4444' : '#10b981'; // Red or Green

        rowsHtml += `
          <tr>
            <td>${date}</td>
            <td>${txn.merchant}</td>
            <td>${txn.category}</td>
            <td style="color: ${color}; text-align: right;">${txn.type === 'debit' ? '-' : '+'}₹${amount}</td>
          </tr>
        `;
      });

      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica', sans-serif; padding: 20px; color: #333; }
              h1 { color: #111; text-align: center; }
              h3 { color: #666; text-align: center; margin-bottom: 30px; }
              .summary { font-size: 18px; margin-bottom: 20px; font-weight: bold; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
              th { background-color: #f8f9fa; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>${title}</h1>
            <h3>Generated on ${new Date().toLocaleDateString()}</h3>
            
            <div class="summary">
              Total Spent: ₹${(totalSpent / 100).toLocaleString('en-IN')}
            </div>

            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Merchant</th>
                  <th>Category</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Export PDF Report' });
      }

      return true;
    } catch (error) {
      console.error('[ExportService] Failed to export PDF:', error);
      return false;
    }
  }
};
