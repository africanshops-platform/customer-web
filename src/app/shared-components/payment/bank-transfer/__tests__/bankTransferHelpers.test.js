import { checkTransferAmount, claimView, expiryState, nairaToKobo, receiptFormError, rememberClaim, rememberedClaim, validateReceiptFile } from '../bankTransferHelpers';

const file = (over = {}) => ({ type: 'image/png', size: 1000, ...over });
const goodForm = { senderAccountName: 'Ada Obi', senderBank: 'GTBank', bankReference: 'TRX-123456', transferredAt: '2026-11-19T10:30', amountSentNaira: '50000' };

describe('bankTransferHelpers', () => {
  it('amounts: usable naira to kobo, ₦100 to ₦100,000,000, and the admin minimum', () => {
    expect(nairaToKobo('1,500.50')).toBe(150050);
    expect(nairaToKobo('abc')).toBeNull();
    expect(checkTransferAmount('50').ok).toBe(false);
    expect(checkTransferAmount('100')).toMatchObject({ ok: true, kobo: 10000 });
    expect(checkTransferAmount('100000000').ok).toBe(true);
    expect(checkTransferAmount('100000001').ok).toBe(false);
    expect(checkTransferAmount('400000', 50000000).ok).toBe(false); // below the ₦500,000 minimum the admin set
    expect(checkTransferAmount('500000', 50000000).ok).toBe(true);
  });

  it('receipt files: type, size, empty', () => {
    expect(validateReceiptFile(null)).toMatch(/Choose/);
    expect(validateReceiptFile(file({ type: 'text/html' }))).toMatch(/JPG, PNG, WebP or PDF/);
    expect(validateReceiptFile(file({ size: 6 * 1024 * 1024 }))).toMatch(/5 MB/);
    expect(validateReceiptFile(file({ size: 0 }))).toMatch(/empty/);
    expect(validateReceiptFile(file({ type: 'application/pdf' }))).toBe('');
  });

  it('the receipt form names the first missing thing', () => {
    expect(receiptFormError(goodForm, file())).toBe('');
    expect(receiptFormError({ ...goodForm, senderAccountName: 'A' }, file())).toMatch(/name/);
    expect(receiptFormError({ ...goodForm, senderBank: '' }, file())).toMatch(/bank/);
    expect(receiptFormError({ ...goodForm, bankReference: 'ab-1' }, file())).toMatch(/reference/);
    expect(receiptFormError({ ...goodForm, transferredAt: '' }, file())).toMatch(/when/);
    expect(receiptFormError({ ...goodForm, amountSentNaira: '' }, file())).toMatch(/amount/);
  });

  it('expiry: open, late (accepts a receipt for 72 hours), closed', () => {
    const exp = new Date('2026-11-19T12:00:00Z').getTime();
    const claim = { expiresAt: new Date(exp).toISOString() };
    expect(expiryState(claim, exp - 1000)).toBe('open');
    expect(expiryState(claim, exp + 3600 * 1000)).toBe('late');
    expect(expiryState(claim, exp + 73 * 3600 * 1000)).toBe('closed');
  });

  it('what the customer is told, in plain words, for every status', () => {
    const now = Date.now();
    const base = { expectedAmountKobo: '5000000', expiresAt: new Date(now + 3600 * 1000).toISOString() };
    expect(claimView({ ...base, status: 'PENDING_RECEIPT' }, now)).toMatchObject({ tone: 'action', step: 2, canUpload: true });
    expect(claimView({ ...base, status: 'UNDER_REVIEW' }, now)).toMatchObject({ tone: 'wait', step: 3 });
    expect(claimView({ ...base, status: 'UNDER_REVIEW' }, now).body).toMatch(/usually takes up to an hour/);
    // a second approver is never exposed: just a "final check"
    const second = claimView({ ...base, status: 'AWAITING_SECOND_APPROVAL' }, now);
    expect(second.title).toMatch(/Final check/);
    expect(JSON.stringify(second)).not.toMatch(/admin|approver|second/i);
    expect(claimView({ ...base, status: 'COMPLETED' }, now)).toMatchObject({ tone: 'ok', final: true });
    expect(claimView({ ...base, status: 'REJECTED', rejectionReason: 'Amount in the bank is lower' }, now)).toMatchObject({ tone: 'bad', final: true, body: 'Amount in the bank is lower' });
    const exp = { ...base, status: 'EXPIRED', expiresAt: new Date(now - 3600 * 1000).toISOString() };
    expect(claimView(exp, now)).toMatchObject({ late: true, canUpload: true });
    expect(claimView({ ...exp, expiresAt: new Date(now - 80 * 3600 * 1000).toISOString() }, now)).toMatchObject({ tone: 'bad', final: true });
    // a request past its expiry that the server has not swept yet is treated the same as an expired one
    expect(claimView({ ...base, status: 'PENDING_RECEIPT', expiresAt: new Date(now - 3600 * 1000).toISOString() }, now).late).toBe(true);
  });

  it('the open request is remembered per flow and storage being blocked never throws', () => {
    rememberClaim('fund', 'c1');
    rememberClaim('marketplace', 'c2');
    expect(rememberedClaim('fund')).toBe('c1');
    expect(rememberedClaim('marketplace')).toBe('c2');
    rememberClaim('fund', '');
    expect(rememberedClaim('fund')).toBe('');
    const orig = Object.getOwnPropertyDescriptor(window, 'localStorage');
    Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new Error('blocked'); } });
    expect(() => rememberClaim('fund', 'x')).not.toThrow();
    expect(rememberedClaim('fund')).toBe('');
    Object.defineProperty(window, 'localStorage', orig);
  });
});
