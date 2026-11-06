import { useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { motion } from 'framer-motion';
import SlidePanel from './shared/SlidePanel';
import { useWallets, useOpenWallet, useCrossCurrencyTransfer, useCurrencies, CURRENCIES, CURRENCY_SYMBOLS } from '../hooks/useFintechApi';
import { useFinanceTheme } from '../FinanceThemeContext';
import { fieldSx } from '../financeUiTokens';

// Wallets, as in the approved preview. What each wallet card offers, the open-a-wallet list and the cross-currency
// picker all come from the currency registry (board F13), so a new country's currency appears without a release and a
// button is switched off, with its reason, when the currency does not allow it. The wallet and transfer calls are the
// old ones, unchanged.

const FALLBACK_COLORS = ['#6366f1', '#4338ca'];

/** The registry entry for a code, or a safe default when the registry has not loaded (the original ten, naira full). */
function useRegistry() {
  const { data: list, isLoading } = useCurrencies();
  return useMemo(() => {
    const entries = list && list.length ? list : CURRENCIES.map((code, i) => ({
      code, name: code, symbol: CURRENCY_SYMBOLS[code] ?? code, flag: '🌍', country: '', status: 'LIVE', colorFrom: FALLBACK_COLORS[0], colorTo: FALLBACK_COLORS[1], rules: [], fundingMethods: [], sortOrder: i,
      capabilities: { open: true, fund: code === 'NGN', send: true, convert: true, withdraw: code === 'NGN', earn: false },
    }));
    const byCode = Object.fromEntries(entries.map((c) => [c.code, c]));
    return { entries, byCode, isLoading };
  }, [list, isLoading]);
}

const ACTIONS = [
  { key: 'fund', label: '＋ Fund', to: '/africanshops/finance-v2/fund-account' },
  { key: 'send', label: '⇄ Send', to: '/africanshops/finance-v2/transfer' },
  { key: 'convert', label: '⇆ Convert' },
  { key: 'withdraw', label: '⬇ Withdraw', to: '/africanshops/finance-v2/withdrawal' },
];

// Where an action actually works today: the fund, send and withdraw screens are naira screens.
function actionState(currency, action) {
  const cap = currency?.capabilities?.[action.key];
  if (!cap) return { ok: false, why: `${currency?.name ?? 'This wallet'} does not allow this yet` };
  if (action.to && currency.code !== 'NGN') return { ok: false, why: 'This screen works with the naira wallet; use Convert to move money in' };
  return { ok: true };
}

const walletKey = (w, i) => w?.walletId ?? `${w?.currency}-${w?.accountType ?? i}`;
const typeLabel = (t) => (t ?? '').replace(/_/g, ' ').toLowerCase().replace(/^./, (c) => c.toUpperCase());
const money = (symbol, n) => `${symbol}${parseFloat(n ?? 0).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function FinanceWalletsContent() {
  const { account } = useOutletContext();
  const { tokens } = useFinanceTheme();
  const { byCode, entries } = useRegistry();
  const card = { background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, boxShadow: tokens.cardShadow };
  const dialogPaperSx = { borderRadius: '24px', background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, overflow: 'hidden' };
  const { data: wallets, isLoading, refetch } = useWallets(account?.accountNumber);
  const { mutate: openWallet, isLoading: opening } = useOpenWallet();
  const { mutate: crossTransfer, isLoading: transferring } = useCrossCurrencyTransfer();

  const [openDialog, setOpenDialog] = useState(false);
  const [transferDialog, setTransferDialog] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [openError, setOpenError] = useState('');
  const [openSuccess, setOpenSuccess] = useState('');
  const [selectedWallet, setSelectedWallet] = useState(null);

  const [xfer, setXfer] = useState({ receiverAccountNumber: '', senderCurrency: 'NGN', receiverCurrency: 'GHS', senderAmountNGN: '', description: '' });
  const [xferError, setXferError] = useState('');
  const [xferSuccess, setXferSuccess] = useState('');

  // The main naira wallet first, then the other naira wallets, then the rest as the server lists them.
  const walletList = useMemo(() => {
    const all = wallets?.wallets ?? wallets ?? [];
    const rank = (w) => {
      if (w?.currency !== 'NGN') return 2;
      return w?.accountType === 'CURRENT' ? 0 : 1;
    };
    return [...all].sort((a, b) => rank(a) - rank(b));
  }, [wallets]);
  const existingCurrencies = walletList.map((w) => w?.currency);
  const convertible = entries.filter((c) => c.capabilities?.convert);
  const openable = entries.filter((c) => !existingCurrencies.includes(c.code));
  const chosen = walletList.find((w, i) => walletKey(w, i) === selectedWallet) ?? walletList[0];
  const chosenCur = chosen ? byCode[chosen.currency] : null;
  const chosenSymbol = chosenCur?.symbol ?? CURRENCY_SYMBOLS[chosen?.currency] ?? chosen?.currency ?? '';
  const firstWhy = ACTIONS.map((x) => actionState(chosenCur, x)).find((x) => !x.ok)?.why;
  const [copied, setCopied] = useState(false);

  // Real details only: the naira wallet's bank-transfer account is the dedicated account on the profile; every other wallet shows
  // the wallet's own reference and says so, rather than inventing a bank account the platform does not have.
  const isNaira = chosen?.currency === 'NGN';
  const details = isNaira
    ? [['Account holder', account?.accountName], ['Account number', account?.dvaAccountNumber ?? account?.accountNumber], ['Bank', account?.dvaBankName ?? 'Set up under Receive Money']]
    : [['Account holder', account?.accountName], ['Wallet reference', chosen?.walletId], ['Held with', 'AfricanShops wallet']];
  const about = (chosenCur?.rules?.length ? chosenCur.rules : [
    ...(chosenCur?.country ? [`${chosenCur.country}.`] : []),
    'Use Convert to move money between your wallets. The rate and fee are shown before you confirm.',
  ]).concat(chosenCur?.fundingMethods?.length ? [`Add money by: ${chosenCur.fundingMethods.map((m) => m.replace('_', ' ').toLowerCase()).join(', ')}.`] : []);

  async function copyDetails() {
    const text = details.map(([k, v]) => `${k}: ${v ?? ''}`).join('\n');
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* clipboard blocked: nothing to do */ }
  }

  async function handleOpenWallet() {
    setOpenError('');
    try {
      await openWallet(account?.accountNumber, selectedCurrency);
      setOpenSuccess(`${selectedCurrency} wallet opened!`);
      refetch();
      setTimeout(() => { setOpenDialog(false); setOpenSuccess(''); setSelectedCurrency(''); }, 1500);
    } catch (err) {
      setOpenError(err.message);
    }
  }

  async function handleCrossTransfer() {
    setXferError('');
    try {
      await crossTransfer({
        senderAccountNumber: account?.accountNumber,
        receiverAccountNumber: xfer.receiverAccountNumber,
        senderCurrency: xfer.senderCurrency,
        receiverCurrency: xfer.receiverCurrency,
        senderAmountKobo: Math.round(parseFloat(xfer.senderAmountNGN || 0) * 100),
        idempotencyKey: `XFX-${crypto.randomUUID()}`,
        description: xfer.description,
      });
      setXferSuccess('Cross-currency transfer sent!');
      setTimeout(() => {
        setTransferDialog(false);
        setXferSuccess('');
        setXfer({ receiverAccountNumber: '', senderCurrency: 'NGN', receiverCurrency: 'GHS', senderAmountNGN: '', description: '' });
      }, 1800);
    } catch (err) {
      setXferError(err.message);
    }
  }

  function startConvert(from) {
    setXfer((f) => ({ ...f, senderCurrency: from, receiverCurrency: from === 'NGN' ? 'GHS' : 'NGN', receiverAccountNumber: account?.accountNumber ?? '' }));
    setTransferDialog(true);
  }

  const outlineBtn = { padding: '11px 20px', borderRadius: 14, fontWeight: 700, fontSize: 14, cursor: 'pointer', background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, color: tokens.textPrimary };
  const primaryBtn = { padding: '11px 20px', borderRadius: 14, fontWeight: 700, fontSize: 14, cursor: 'pointer', border: 0, background: tokens.accentGradient, color: '#fff', boxShadow: `0 6px 16px ${tokens.accentSolid}44` };

  return (
    <div className="w-full px-16 md:px-24 xl:px-32 py-24">
      <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: tokens.textPrimary, letterSpacing: '-0.02em' }}>Wallets</h1>
      <p style={{ margin: '2px 0 14px', color: tokens.textSecondary, fontSize: 14 }}>One page per currency, with its own details and rules</p>

      {isLoading && <Skeleton variant="rounded" height={260} sx={{ borderRadius: '22px' }} />}

      {!isLoading && walletList.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center py-48 rounded-3xl" style={card}>
          <FuseSvgIcon size={48} style={{ color: tokens.textMuted, margin: '0 auto 16px', display: 'block' }}>heroicons-outline:briefcase</FuseSvgIcon>
          <Typography style={{ fontSize: 20, fontWeight: 700, color: tokens.textPrimary, marginBottom: 8 }}>No wallets yet</Typography>
          <Typography style={{ fontSize: 15, color: tokens.textMuted, marginBottom: 20 }}>Open your first currency wallet to get started</Typography>
          <button type="button" style={primaryBtn} onClick={() => setOpenDialog(true)}>Open First Wallet</button>
        </motion.div>
      )}

      {!isLoading && walletList.length > 0 && chosen && (
        <>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
            {walletList.map((w, i) => {
              const on = chosen === w;
              const cur = byCode[w?.currency];
              const dup = walletList.filter((x) => x?.currency === w?.currency).length > 1;
              return (
                <button key={walletKey(w, i)} type="button" onClick={() => setSelectedWallet(walletKey(w, i))}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 99, fontWeight: 700, fontSize: 13.5, cursor: 'pointer', background: on ? tokens.accentSoft : tokens.cardBg, border: `2px solid ${on ? tokens.accentSolid : tokens.cardBorder}`, color: on ? tokens.accentSolid : tokens.textPrimary }}>
                  <span style={{ fontSize: 18 }}>{cur?.flag ?? '🌍'}</span>{w?.currency}{dup ? ` · ${typeLabel(w?.accountType)}` : ''}
                </button>
              );
            })}
            <button type="button" onClick={() => setOpenDialog(true)} style={{ padding: '9px 16px', borderRadius: 99, fontWeight: 700, fontSize: 13.5, cursor: 'pointer', background: 'transparent', border: `2px dashed ${tokens.borderColor}`, color: tokens.textSecondary }}>＋ Add new balance</button>
          </div>

          <motion.div key={walletKey(chosen, 0)} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ ...card, borderRadius: 20, padding: 20 }}>
            <div style={{ textAlign: 'center', padding: '10px 0 4px' }}>
              <div style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: tokens.textMuted }}>Available balance</div>
              <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.02em', color: tokens.textPrimary }}>{money(chosenSymbol, chosen.balance)}</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 24, color: tokens.textSecondary, fontSize: 13, margin: '4px 0 14px', flexWrap: 'wrap' }}>
                <span>Pending {money(chosenSymbol, chosen.pendingBalance)}</span>
                <span>{chosenCur?.name ?? chosen.currency} · {typeLabel(chosen.accountType) || 'Wallet'}</span>
                {chosen.isFrozen && <span>🔒 Frozen</span>}
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                {ACTIONS.map((x) => {
                  const st = actionState(chosenCur, x);
                  const label = x.key === 'fund' ? '＋ Add money' : x.label;
                  const style = x.key === 'fund' ? primaryBtn : outlineBtn;
                  if (!st.ok) return <button key={x.key} type="button" disabled title={st.why} style={{ ...style, opacity: 0.4, cursor: 'not-allowed', boxShadow: 'none' }}>{label}</button>;
                  if (x.to) return <Link key={x.key} to={x.to} style={{ ...style, textDecoration: 'none' }}>{label}</Link>;
                  return <button key={x.key} type="button" style={style} onClick={() => startConvert(chosen.currency)}>{label}</button>;
                })}
              </div>
              {firstWhy && <div style={{ fontSize: 12.5, color: tokens.textMuted, marginTop: 10 }}>ℹ {firstWhy}</div>}
            </div>
          </motion.div>

          <div style={{ ...card, borderRadius: 20, padding: 20, marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: tokens.textPrimary }}>{chosenCur?.name ?? chosen.currency} account details</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" style={{ ...outlineBtn, padding: '7px 14px', fontSize: 13 }} onClick={() => startConvert('NGN')}>⇄ Cross-currency transfer</button>
                <button type="button" onClick={copyDetails} style={{ ...primaryBtn, padding: '7px 14px', fontSize: 13, boxShadow: 'none' }}>{copied ? 'Copied ✓' : 'Copy details'}</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 10, marginBottom: 14 }}>
              {details.map(([label, value]) => (
                <div key={label} style={{ border: `1px solid ${tokens.borderColor}`, borderRadius: 14, padding: '12px 14px', background: tokens.pageBg }}>
                  <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: tokens.textMuted }}>{label}</div>
                  <b style={{ fontSize: 16, color: tokens.textPrimary, wordBreak: 'break-all' }}>{value || '—'}</b>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.08em', color: tokens.textMuted, marginBottom: 6 }}>ABOUT THIS ACCOUNT</div>
            <ul style={{ margin: 0, paddingLeft: 22, fontSize: 14, color: tokens.textSecondary, lineHeight: 1.7 }}>
              {about.map((r) => <li key={r}>{r}</li>)}
            </ul>
          </div>
        </>
      )}

      {/* Open a wallet: slides in from the right; the list comes from the currency registry */}
      <SlidePanel open={openDialog} title="Open a wallet" subtitle="Pick a currency. The list comes from the currency registry." onClose={() => { setOpenDialog(false); setOpenError(''); setOpenSuccess(''); setSelectedCurrency(''); }}>
        <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
          {openable.length === 0 && <div style={{ textAlign: 'center', padding: 14, color: tokens.textMuted, fontSize: 14 }}>You already have a wallet in every available currency.</div>}
          {openable.map((c) => {
            const canOpen = c.capabilities?.open && c.status !== 'SOON';
            const sel = selectedCurrency === c.code;
            return (
              <button key={c.code} type="button" disabled={!canOpen} onClick={() => setSelectedCurrency(c.code)}
                style={{ display: 'flex', gap: 12, alignItems: 'center', textAlign: 'left', border: `2px solid ${sel ? tokens.accentSolid : tokens.borderColor}`, borderRadius: 18, padding: '12px 14px', background: canOpen ? tokens.cardBg : tokens.pageBg, opacity: canOpen ? 1 : 0.6, cursor: canOpen ? 'pointer' : 'not-allowed' }}>
                <span style={{ fontSize: 26 }}>{c.flag}</span>
                <span style={{ flex: 1 }}>
                  <b style={{ display: 'block', color: tokens.textPrimary }}>{c.name} · {c.code}</b>
                  <span style={{ fontSize: 12.5, color: tokens.textSecondary }}>{canOpen ? 'Open now' : 'Coming soon'}{c.status === 'BETA' ? ' · Beta' : ''}</span>
                </span>
                {canOpen
                  ? <span style={{ fontSize: 12, fontWeight: 800, borderRadius: 99, padding: '5px 14px', background: sel ? tokens.accentSolid : tokens.accentSoft, color: sel ? '#fff' : tokens.accentSolid }}>{sel ? 'Chosen' : 'Open'}</span>
                  : <span style={{ fontSize: 11, fontWeight: 800, borderRadius: 99, padding: '3px 10px', background: tokens.borderColor, color: tokens.textSecondary }}>SOON</span>}
              </button>
            );
          })}
        </div>
        {openSuccess && <Alert severity="success" sx={{ mb: 2, borderRadius: '10px', background: tokens.successBg, color: tokens.success }}>{openSuccess}</Alert>}
        {openError && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px', background: tokens.dangerBg, color: tokens.danger }}>{openError}</Alert>}
        <Button variant="contained" fullWidth disabled={!selectedCurrency || opening} onClick={handleOpenWallet} sx={{ background: tokens.accentGradient, borderRadius: '12px', fontWeight: 700, py: 1.5, textTransform: 'none', fontSize: 15, '&:disabled': { background: tokens.borderColor, color: tokens.textMuted } }}>
          {opening ? <CircularProgress size={20} sx={{ color: 'white' }} /> : `Open ${selectedCurrency || 'wallet'}`}
        </Button>
      </SlidePanel>

      {/* Cross Transfer Dialog: currencies that allow conversion, from the registry */}
      <Dialog open={transferDialog} onClose={() => { setTransferDialog(false); setXferError(''); setXferSuccess(''); }} maxWidth="xs" fullWidth PaperProps={{ sx: dialogPaperSx }}>
        <DialogContent sx={{ p: 3 }}>
          <Typography style={{ fontSize: 20, fontWeight: 700, color: tokens.textPrimary, marginBottom: 4 }}>Cross-Currency Transfer</Typography>
          <Typography style={{ fontSize: 14, color: tokens.textMuted, marginBottom: 16 }}>Send money across different currencies</Typography>
          <div className="space-y-12">
            <TextField label="Receiver Account Number" value={xfer.receiverAccountNumber} onChange={(e) => setXfer((f) => ({ ...f, receiverAccountNumber: e.target.value }))} fullWidth size="small" sx={fieldSx(tokens)} />
            <div className="grid grid-cols-2 gap-10">
              {['senderCurrency', 'receiverCurrency'].map((key) => (
                <div key={key}>
                  <Typography style={{ fontSize: 13, color: tokens.textMuted, marginBottom: 6 }}>{key === 'senderCurrency' ? 'From' : 'To'}</Typography>
                  <div className="flex flex-wrap gap-4">
                    {convertible.map((c) => (
                      <button key={c.code} type="button" onClick={() => setXfer((f) => ({ ...f, [key]: c.code }))} className="rounded-lg px-8 py-4 cursor-pointer transition-all"
                        style={{ fontSize: 13, background: xfer[key] === c.code ? tokens.accentSoft : tokens.pageBg, border: `1px solid ${xfer[key] === c.code ? tokens.accentSolid : tokens.borderColor}`, color: xfer[key] === c.code ? tokens.accentSolid : tokens.textSecondary, fontWeight: xfer[key] === c.code ? 700 : 400 }}>
                        {c.flag} {c.code}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <TextField label={`Amount (${xfer.senderCurrency})`} value={xfer.senderAmountNGN} onChange={(e) => setXfer((f) => ({ ...f, senderAmountNGN: e.target.value.replace(/[^0-9.]/g, '') }))} fullWidth size="small" sx={fieldSx(tokens)} />
            <TextField label="Description" value={xfer.description} onChange={(e) => setXfer((f) => ({ ...f, description: e.target.value }))} fullWidth size="small" sx={fieldSx(tokens)} />
          </div>
          {xferSuccess && <Alert severity="success" sx={{ mt: 2, borderRadius: '10px', background: tokens.successBg, color: tokens.success }}>{xferSuccess}</Alert>}
          {xferError && <Alert severity="error" sx={{ mt: 2, borderRadius: '10px', background: tokens.dangerBg, color: tokens.danger }}>{xferError}</Alert>}
          <Button variant="contained" fullWidth disabled={!xfer.receiverAccountNumber || !xfer.senderAmountNGN || transferring} onClick={handleCrossTransfer} sx={{ mt: 2, background: `linear-gradient(135deg, ${tokens.info} 0%, #1e3a8a 100%)`, borderRadius: '12px', fontWeight: 700, py: 1.5, textTransform: 'none', fontSize: 15, '&:disabled': { background: tokens.borderColor, color: tokens.textMuted } }}>
            {transferring ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Send Transfer'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
