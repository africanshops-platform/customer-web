import { useState, useCallback, useMemo, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Skeleton from '@mui/material/Skeleton';
import Pagination from '@mui/material/Pagination';
import { motion } from 'framer-motion';
import { AuthApi } from 'app/configs/data/client/RepositoryAuthClient';
import { useFinanceTheme } from '../FinanceThemeContext';
import { describeTx, isCredit, nairaFull, shortDate } from '../financeFormat';

// Transactions, as in the approved preview: totals, quick filters, rows grouped by month with plain titles and a status
// pill, and a receipt drawer. Every old filter (destination account, dates, status), the CSV export, paging and the
// loading and empty states are kept; the statement call is the old one.

const STATUS_LABEL = { COMPLETED: 'Completed', PROCESSING: 'Processing', OTP_PENDING: 'Awaiting OTP', INITIATED: 'Initiated', FAILED: 'Failed', REVERSED: 'Reversed', CANCELLED: 'Cancelled' };
const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
const EMPTY = { startDate: '', endDate: '', status: '', destinationAccountNumber: '' };

function statusTone(tokens, status) {
  if (status === 'COMPLETED') return [tokens.successBg, tokens.success];
  if (['FAILED', 'REVERSED', 'CANCELLED'].includes(status)) return [tokens.dangerBg, tokens.danger];
  return [tokens.warningBg, tokens.warning];
}

function Row({ tx, tokens, onOpen }) {
  const credit = isCredit(tx);
  const status = (tx?.status ?? 'COMPLETED').toUpperCase();
  const [bg, fg] = statusTone(tokens, status);
  const { title, sub } = describeTx(tx);
  const when = tx?.createdAt ? new Date(tx.createdAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }) : '';
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      role="button"
      tabIndex={0}
      onClick={() => onOpen(tx)}
      onKeyDown={(e) => e.key === 'Enter' && onOpen(tx)}
      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 10px', borderRadius: 14, cursor: 'pointer' }}
    >
      <div style={{ width: 42, height: 42, borderRadius: 14, display: 'grid', placeItems: 'center', flex: 'none', fontSize: 18, background: credit ? tokens.successBg : tokens.dangerBg, color: credit ? tokens.success : tokens.danger }}>
        {credit ? '↓' : '↑'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <b style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: tokens.textPrimary }}>{title}</b>
        <span style={{ color: tokens.textMuted, fontSize: 12.5 }}>{[sub, shortDate(tx?.createdAt), when].filter(Boolean).join(' · ')}</span>
      </div>
      <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', borderRadius: 99, padding: '3px 10px', background: bg, color: fg }}>{status}</span>
      <div style={{ fontWeight: 800, minWidth: 120, textAlign: 'right', color: credit ? tokens.success : tokens.danger }}>
        {credit ? '+' : '−'}{nairaFull(Math.abs(parseFloat(tx?.amount ?? 0)))}
      </div>
    </motion.div>
  );
}

export default function FinanceTransactionsContent() {
  useOutletContext();
  const { tokens } = useFinanceTheme();
  const card = { background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, boxShadow: tokens.cardShadow, borderRadius: 20 };

  const [filters, setFilters] = useState(EMPTY);
  const [direction, setDirection] = useState('all'); // all | in | out: a view over the page that is loaded
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 20;

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [csvLoading, setCsvLoading] = useState(false);
  const [open, setOpen] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchTx = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = Object.fromEntries(Object.entries({ ...filters, page, limit }).filter(([, v]) => v));
      const q = new URLSearchParams(params).toString();
      const res = await AuthApi().get(`/fintech-accounts/user/statement?${q}`);
      setData(res.data?.payload ?? res.data?.data ?? res.data);
    } catch {
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetchTx(); }, [fetchTx]);

  const transactions = useMemo(() => data?.transactions ?? [], [data]);
  const total = data?.pagination?.total ?? 0;
  const pageCount = data?.pagination?.pages ?? 0;

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions.filter((tx) => {
      if (direction === 'in' && !isCredit(tx)) return false;
      if (direction === 'out' && isCredit(tx)) return false;
      if (!q) return true;
      const { title, sub } = describeTx(tx);
      return `${title} ${sub} ${tx?.sourceReference ?? ''} ${tx?.description ?? ''} ${Math.abs(parseFloat(tx?.amount ?? 0)) / 100}`.toLowerCase().includes(q);
    });
  }, [transactions, direction, search]);

  const totals = useMemo(
    () => transactions.reduce((acc, tx) => {
      const amt = Math.abs(parseFloat(tx?.amount ?? 0));
      return isCredit(tx) ? { ...acc, inKobo: acc.inKobo + amt } : { ...acc, outKobo: acc.outKobo + amt };
    }, { inKobo: 0, outKobo: 0 }),
    [transactions],
  );

  const groups = useMemo(() => {
    const out = [];
    visible.forEach((tx) => {
      const d = tx?.createdAt ? new Date(tx.createdAt) : null;
      const label = d ? `${MONTHS[d.getMonth()]} ${d.getFullYear()}` : 'EARLIER';
      const last = out[out.length - 1];
      if (last && last.label === label) last.items.push(tx);
      else out.push({ label, items: [tx] });
    });
    return out;
  }, [visible]);

  async function downloadCsv() {
    setCsvLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const q = new URLSearchParams({ ...params, format: 'csv' }).toString();
      const res = await AuthApi().get(`/fintech-accounts/user/statement?${q}`);
      const csv = res.data?.csv ?? res.data;
      if (csv) {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setCsvLoading(false);
    }
  }

  function updateFilter(key, value) { setFilters((f) => ({ ...f, [key]: value })); setPage(1); }
  function clearFilters() { setFilters(EMPTY); setPage(1); }
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const input = { border: `1px solid ${tokens.borderColor}`, borderRadius: 14, padding: '10px 14px', fontSize: 14, background: tokens.cardBg, color: tokens.textPrimary, outline: 'none' };
  const chip = (on) => ({ border: `1px solid ${on ? tokens.accentSolid : tokens.cardBorder}`, borderRadius: 10, padding: '6px 12px', fontWeight: 700, fontSize: 12, background: on ? tokens.accentGradient : tokens.cardBg, color: on ? '#fff' : tokens.textPrimary, cursor: 'pointer' });
  const stat = { ...card, padding: 20, display: 'flex', flexDirection: 'column', gap: 2 };
  const tx = open;

  function copyRef(text) {
    navigator.clipboard?.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  }

  return (
    <div className="w-full px-16 md:px-24 xl:px-32 py-24">
      <p style={{ margin: '0 0 14px', color: tokens.textSecondary, fontSize: 14 }}>{total > 0 ? `${total} transactions found` : 'No transactions'}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 16, marginBottom: 14 }}>
        <div style={stat}><span style={{ color: tokens.textSecondary, fontSize: 13 }}>Money in, on this page</span><b style={{ fontSize: 24, color: tokens.success }}>{nairaFull(totals.inKobo)}</b></div>
        <div style={stat}><span style={{ color: tokens.textSecondary, fontSize: 13 }}>Money out, on this page</span><b style={{ fontSize: 24, color: tokens.textPrimary }}>{nairaFull(totals.outKobo)}</b></div>
        <div style={stat}><span style={{ color: tokens.textSecondary, fontSize: 13 }}>Net, on this page</span><b style={{ fontSize: 24, color: tokens.textPrimary }}>{totals.inKobo - totals.outKobo < 0 ? '−' : ''}{nairaFull(Math.abs(totals.inKobo - totals.outKobo))}</b></div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search a name, reference or amount" aria-label="Search transactions" style={{ ...input, flex: 1, minWidth: 220 }} />
        {[['all', 'All'], ['in', 'Money in'], ['out', 'Money out']].map(([k, l]) => (
          <button key={k} type="button" style={chip(direction === k)} onClick={() => setDirection(k)}>{l}</button>
        ))}
        <button type="button" style={chip(showFilters || activeFilterCount > 0)} onClick={() => setShowFilters((v) => !v)}>Filters{activeFilterCount ? ` (${activeFilterCount})` : ''}</button>
        <button type="button" onClick={downloadCsv} disabled={csvLoading} style={{ ...chip(false), padding: '9px 16px', fontSize: 14 }}>{csvLoading ? 'Exporting…' : '⬇ Export CSV'}</button>
      </div>

      {(showFilters || activeFilterCount > 0) && (
        <div style={{ ...card, padding: 16, marginBottom: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 12 }}>
            <div style={{ fontSize: 12, color: tokens.textSecondary, display: 'grid', gap: 4 }}>
              Destination account
              <input aria-label="Destination account" value={filters.destinationAccountNumber} onChange={(e) => updateFilter('destinationAccountNumber', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit account number" style={input} />
              <span style={{ fontSize: 11 }}>Only your own transactions to or from this account</span>
            </div>
            <div style={{ fontSize: 12, color: tokens.textSecondary, display: 'grid', gap: 4 }}>
              Start date
              <input aria-label="Start date" type="date" value={filters.startDate} onChange={(e) => updateFilter('startDate', e.target.value)} style={input} />
            </div>
            <div style={{ fontSize: 12, color: tokens.textSecondary, display: 'grid', gap: 4 }}>
              End date
              <input aria-label="End date" type="date" value={filters.endDate} onChange={(e) => updateFilter('endDate', e.target.value)} style={input} />
            </div>
            <div style={{ fontSize: 12, color: tokens.textSecondary, display: 'grid', gap: 4 }}>
              Status
              <select aria-label="Status" value={filters.status} onChange={(e) => updateFilter('status', e.target.value)} style={input}>
                <option value="">All</option>
                {Object.entries(STATUS_LABEL).filter(([k]) => k !== 'INITIATED').map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </div>
          </div>
          {activeFilterCount > 0 && <button type="button" onClick={clearFilters} style={{ ...chip(false), marginTop: 12 }}>Clear {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}</button>}
        </div>
      )}

      <div style={{ ...card, padding: '6px 14px' }}>
        {isLoading && Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 10px' }}>
            <Skeleton variant="rounded" width={42} height={42} />
            <div style={{ flex: 1 }}><Skeleton variant="text" width="50%" /><Skeleton variant="text" width="30%" /></div>
            <Skeleton variant="text" width={110} />
          </div>
        ))}
        {!isLoading && groups.length === 0 && (
          <div style={{ padding: '48px 0', textAlign: 'center', color: tokens.textMuted }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🧾</div>
            No transactions found
          </div>
        )}
        {!isLoading && groups.map((g) => (
          <div key={g.label}>
            <div style={{ fontSize: 12, letterSpacing: '0.12em', color: tokens.textMuted, fontWeight: 800, padding: '14px 4px 4px' }}>{g.label}</div>
            {g.items.map((t, i) => <Row key={t?.id ?? i} tx={t} tokens={tokens} onOpen={setOpen} />)}
          </div>
        ))}
        {pageCount > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0', borderTop: `1px solid ${tokens.borderColor}` }}>
            <Pagination
              count={pageCount}
              page={page}
              onChange={(_, v) => setPage(v)}
              sx={{ '& .MuiPaginationItem-root': { color: tokens.textSecondary }, '& .MuiPaginationItem-root.Mui-selected': { background: tokens.accentSolid, color: 'white' } }}
            />
          </div>
        )}
      </div>

      {tx && (
        <div role="presentation" onClick={() => setOpen(null)} onKeyDown={(e) => e.key === 'Escape' && setOpen(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 1300 }}>
          <aside aria-label="Transaction receipt" role="presentation" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 380, maxWidth: '100%', background: tokens.cardBg, borderLeft: `1px solid ${tokens.cardBorder}`, boxShadow: '-20px 0 40px rgba(20,16,8,.12)', padding: 22, overflow: 'auto' }}>
            <button type="button" onClick={() => setOpen(null)} style={{ color: tokens.textMuted, fontWeight: 700, background: 'none', border: 0, cursor: 'pointer', marginBottom: 10 }}>✕ Close</button>
            <div style={{ textAlign: 'center', padding: '10px 0 4px' }}>
              <div style={{ width: 76, height: 76, borderRadius: '50%', margin: '0 auto 10px', display: 'grid', placeItems: 'center', fontSize: 30, background: isCredit(tx) ? tokens.successBg : tokens.dangerBg, color: isCredit(tx) ? tokens.success : tokens.danger }}>{isCredit(tx) ? '↓' : '↑'}</div>
              <h1 style={{ fontSize: 24, margin: '0 0 2px', color: tokens.textPrimary }}>{isCredit(tx) ? '+' : '−'}{nairaFull(Math.abs(parseFloat(tx?.amount ?? 0)))}</h1>
              <p style={{ margin: 0, color: tokens.textSecondary }}>{describeTx(tx).title}</p>
            </div>
            <div style={{ border: `1px dashed ${tokens.borderColor}`, borderRadius: 18, padding: '6px 16px', margin: '16px 0', background: tokens.pageBg }}>
              {[
                ['Status', STATUS_LABEL[(tx?.status ?? 'COMPLETED').toUpperCase()] ?? tx?.status],
                ['Date', tx?.createdAt ? new Date(tx.createdAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }) : '—'],
                ['Details', tx?.description ?? '—'],
                ['Reference', tx?.sourceReference ?? tx?.id ?? '—'],
              ].map(([l, v], i, arr) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderBottom: i < arr.length - 1 ? `1px dashed ${tokens.borderColor}` : 0, fontSize: 14, color: tokens.textSecondary }}>
                  <span>{l}</span>
                  <b style={{ color: tokens.textPrimary, textAlign: 'right', wordBreak: 'break-all', fontSize: l === 'Reference' ? 12 : 14 }}>{v}</b>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => copyRef(tx?.sourceReference ?? tx?.id ?? '')} style={{ ...chip(false), width: '100%', padding: 12, fontSize: 14 }}>{copied ? 'Reference copied ✓' : 'Copy reference'}</button>
          </aside>
        </div>
      )}
    </div>
  );
}
