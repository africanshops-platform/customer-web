/** Pure helpers for the bank-transfer payment option (B1b), kept free of React so they are easy to test. */

export const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;
export const RECEIPT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
export const TRANSFER_MIN_KOBO = 10000; // ₦100
export const TRANSFER_MAX_KOBO = 10000000000; // ₦100,000,000 (card top-ups stop at ₦10,000,000)
export const LATE_WINDOW_MS = 72 * 3600 * 1000;
export const STORAGE_PREFIX = 'afs_bank_transfer_claim:';

/** Whole kobo from a typed naira amount, or null when it is not a usable amount. */
export function nairaToKobo(raw) {
  const n = Number(String(raw ?? '').replace(/,/g, ''));
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100);
}

/** { ok, kobo, message } for the amount box. `minKobo` is the admin's "offer only from" setting (0 = any amount). */
export function checkTransferAmount(raw, minKobo = 0) {
  const kobo = nairaToKobo(raw);
  if (kobo === null) return { ok: false, kobo: 0, message: 'Enter an amount (minimum ₦100).' };
  const min = Math.max(TRANSFER_MIN_KOBO, Number(minKobo) || 0);
  if (kobo < min) return { ok: false, kobo, message: `The smallest bank transfer top-up is ₦${(min / 100).toLocaleString('en-NG')}.` };
  if (kobo > TRANSFER_MAX_KOBO) return { ok: false, kobo, message: 'The largest single bank transfer top-up is ₦100,000,000.' };
  return { ok: true, kobo, message: '' };
}

/** An error sentence for a chosen receipt file, or '' when it is fine. */
export function validateReceiptFile(file) {
  if (!file) return 'Choose your transfer receipt.';
  if (!RECEIPT_TYPES.includes(file.type)) return 'Upload a JPG, PNG, WebP or PDF receipt.';
  if (file.size > MAX_RECEIPT_BYTES) return 'The receipt must be 5 MB or smaller.';
  if (file.size === 0) return 'That file is empty.';
  return '';
}

/** First problem with the receipt form, or '' when it can be sent. */
export function receiptFormError(form, file) {
  const fileError = validateReceiptFile(file);
  if (fileError) return fileError;
  if (String(form.senderAccountName ?? '').trim().length < 3) return "Enter the name on the account you sent from.";
  if (String(form.senderBank ?? '').trim().length < 2) return 'Enter the bank you sent from.';
  if (String(form.bankReference ?? '').replace(/[^A-Za-z0-9]/g, '').length < 6) return "Enter the bank's transaction reference from your receipt.";
  if (!form.transferredAt || Number.isNaN(Date.parse(form.transferredAt))) return 'Enter when you sent the money.';
  if (nairaToKobo(form.amountSentNaira) === null) return 'Enter the amount you sent.';
  return '';
}

/** `<input type="datetime-local">` value for now (local time). */
export function nowLocalInput(now = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}T${p(now.getHours())}:${p(now.getMinutes())}`;
}

/** Whether a request is past its expiry, and if so whether a receipt is still accepted (72 hours after). */
export function expiryState(claim, now = Date.now()) {
  const exp = claim?.expiresAt ? new Date(claim.expiresAt).getTime() : null;
  if (!exp || now <= exp) return 'open';
  return now <= exp + LATE_WINDOW_MS ? 'late' : 'closed';
}

/**
 * What the customer is told. Plain words only: no admin or internal detail (a second approver is just "a final check").
 * `step` is how far along the 3 steps are (1 send, 2 receipt, 3 verification).
 */
export function claimView(claim, now = Date.now()) {
  const s = claim?.status;
  const received = nairaFull(claim?.expectedAmountKobo);
  if (s === 'COMPLETED') return { tone: 'ok', step: 4, title: 'Added to your wallet', body: `${received} has been added to your wallet.`, final: true };
  if (s === 'APPROVED') return { tone: 'ok', step: 3, title: 'Approved', body: 'Your transfer is confirmed. Your wallet is being credited now.' };
  if (s === 'REJECTED') return { tone: 'bad', step: 3, title: 'We could not confirm this transfer', body: claim?.rejectionReason || 'Please check the details and try again.', final: true };
  if (s === 'UNDER_REVIEW') return { tone: 'wait', step: 3, title: 'We are checking your transfer', body: 'We confirm each transfer against our bank. This usually takes up to an hour. You can leave this page; your wallet is credited as soon as it is confirmed.' };
  if (s === 'AWAITING_SECOND_APPROVAL') return { tone: 'wait', step: 3, title: 'Final check in progress', body: 'Your transfer is nearly confirmed. A final check is under way. This can take a little longer for larger amounts.' };
  if (s === 'EXPIRED' || (s === 'PENDING_RECEIPT' && expiryState(claim, now) !== 'open')) {
    const st = expiryState(claim, now);
    if (st === 'late') return { tone: 'action', step: 2, title: 'This request has expired', body: 'If you already sent the money, you can still upload your receipt now. We will check it carefully, and it can take a little longer.', canUpload: true, late: true };
    return { tone: 'bad', step: 2, title: 'This request has closed', body: 'Start a new request. If you already sent the money, contact support with your reference.', final: true };
  }
  return { tone: 'action', step: 2, title: 'Send the money, then upload your receipt', body: 'Send exactly the amount shown, using the reference as the transfer narration.', canUpload: true };
}

function nairaFull(kobo) {
  const n = Number(kobo ?? 0) / 100;
  return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** The claim the customer was working on in one flow (`key` = the flow, e.g. 'fund'), so a reload or a later visit resumes it. Storage can be blocked, so every access is guarded. */
export function rememberClaim(key, id) {
  try { if (id) window.localStorage.setItem(STORAGE_PREFIX + key, id); else window.localStorage.removeItem(STORAGE_PREFIX + key); } catch { /* storage blocked: the page just will not resume */ }
}
export function rememberedClaim(key) {
  try { return window.localStorage.getItem(STORAGE_PREFIX + key) || ''; } catch { return ''; }
}

/** A user's File as a data URL (what the gateway expects). */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error('Could not read the file'));
    r.readAsDataURL(file);
  });
}
