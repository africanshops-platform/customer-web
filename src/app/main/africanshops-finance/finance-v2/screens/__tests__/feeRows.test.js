import { feeRows } from '../FinanceTransactionsContent';

describe('feeRows (F18m)', () => {
  it('shows one Transaction fee and stamp duty, nothing else', () => {
    const rows = feeRows({ metadata: { feeLines: [
      { code: 'AMOUNT', label: 'Amount', kind: 'AMOUNT', amountKobo: 15000000 },
      { code: 'TRANSFER_FEE', label: 'Platform fee', kind: 'CHARGE', amountKobo: 6000 },
      { code: 'STAMP_DUTY', label: 'Stamp duty', kind: 'LEVY', amountKobo: 5000 },
    ] } });
    expect(rows.map((r) => r[0])).toEqual(['Transaction fee', 'Stamp duty']);
    expect(JSON.stringify(rows)).not.toMatch(/platform|africanshops|bank transfer/i);
  });
  it('is empty without fee lines', () => {
    expect(feeRows({})).toEqual([]);
  });
});
