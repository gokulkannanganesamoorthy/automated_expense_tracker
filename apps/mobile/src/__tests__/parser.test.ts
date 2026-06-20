import { transactionOrchestrator } from '../services/parser-orchestrator';

describe('SMS Parser Orchestrator', () => {
  const hdfcDebit = 'debited from A/c no. 1234 for Rs.500.00 on 20-Oct-23 to Amazon';
  const sbiCredit = 'Credited to a/c 5678 by INR 1500.00 on 21-Oct-23 from Salary';
  const unknownBank = 'Your account got charged 50 dollars';

  it('should parse an HDFC debit SMS correctly', async () => {
    const result = await transactionOrchestrator.processSMS(hdfcDebit, 'HDFC');
    expect(result).not.toBeNull();
    expect(result?.amountPaise).toBe(50000);
    expect(result?.type).toBe('debit');
    expect(result?.confidenceScore).toBeGreaterThan(80);
  });

  it('should parse an SBI credit SMS correctly', async () => {
    const result = await transactionOrchestrator.processSMS(sbiCredit, 'SBI');
    expect(result).not.toBeNull();
    expect(result?.amountPaise).toBe(150000);
    expect(result?.type).toBe('credit');
    expect(result?.confidenceScore).toBeGreaterThan(80);
  });

  it('should return null or low confidence for unknown pattern', async () => {
    const result = await transactionOrchestrator.processSMS(unknownBank, 'UNKNOWN');
    expect(result).toBeNull(); // Or handled via fallback logic
  });
});
