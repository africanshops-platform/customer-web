// Shared, presentation-only helpers for the finance screens: plain titles for transactions, one date format,
// compact naira. Nothing here touches money logic or amounts: it only changes how a stored value is written on screen.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** 13 Oct 2026 */
export function shortDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function isCredit(tx) {
  return tx?.direction === 'CREDIT' || tx?.type === 'CREDIT';
}

/** A transaction's reference as the server wrote it, e.g. AFSHFUND733008860717…8953 shortened for display. */
export function shortRef(text) {
  const m = /([A-Z]{3,}[A-Z0-9]{8,})/.exec(text ?? '');
  if (!m) return '';
  const ref = m[1];
  return ref.length > 14 ? `${ref.slice(0, 8)}…${ref.slice(-4)}` : ref;
}

/**
 * Plain title and small grey line for a transaction row. The server's narration stays the source: this only
 * recognises the common system-written ones (card top-ups, reversals) and writes them the way a person would.
 */
export function describeTx(tx) {
  const raw = (tx?.narration ?? tx?.description ?? '').trim();
  const low = raw.toLowerCase();
  const credit = isCredit(tx);
  const ref = shortRef(raw);
  if (!raw) return { title: credit ? 'Money received' : 'Money sent', sub: '' };
  if (low.includes('wallet funding') || low.includes('card payment') || low.includes('payment deposit')) {
    return { title: 'Wallet top-up', sub: ref ? `Card · ref ${ref}` : 'Card' };
  }
  if (low.startsWith('correction')) return { title: 'Correction', sub: raw.replace(/^correction:?\s*/i, '').slice(0, 60) };
  if (low.includes('civic wallet funding')) return { title: 'Civic wallet funding', sub: '' };
  if (low === 'cash') return { title: 'Cash withdrawal', sub: '' };
  const title = raw.charAt(0).toUpperCase() + raw.slice(1);
  return { title: title.length > 42 ? `${title.slice(0, 40)}…` : title, sub: ref ? `ref ${ref}` : '' };
}

/** 10,000 (no decimals when whole), used in tight lists. */
export function nairaCompact(kobo) {
  const n = parseFloat(kobo ?? 0) / 100;
  return n.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export function nairaFull(kobo) {
  const n = parseFloat(kobo ?? 0) / 100;
  return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
