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

function WalletCard({ wallet, currency, index, selected, onSelect, onConvert, tokens }) {
  const symbol = currency?.symbol ?? CURRENCY_SYMBOLS[wallet?.currency] ?? wallet?.currency;
  const balance = parseFloat(wallet?.balance ?? 0);
  const [a, b] = [currency?.colorFrom ?? FALLBACK_COLORS[0], currency?.colorTo ?? FALLBACK_COLORS[1]];
  const firstWhy = ACTIONS.map((x) => actionState(currency, x)).find((x) => !x.ok)?.why;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      style={{ background: `linear-gradient(135deg, ${a}, ${b})`, borderRadius: 22, padding: 18, color: '#fff', minHeight: 150, position: 'relative', overflow: 'hidden', cursor: 'pointer', outline: selected ? `3px solid ${tokens.accentSolid}` : 'none', outlineOffset: 3 }}
    >
      <div style={{ position: 'absolute', right: -30, bottom: -30, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.12)' }} />
      <span style={{ position: 'absolute', right: 16, top: 14, fontSize: 24 }}>{currency?.flag ?? '🌍'}</span>
      <small style={{ opacity: 0.8, letterSpacing: '0.1em', fontSize: 11, textTransform: 'uppercase' }}>{wallet?.currency} · {wallet?.accountType ?? 'Multi-currency'}</small>
      <b style={{ display: 'block', fontSize: 26, margin: '10px 0 4px' }}>{symbol}{balance.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b>
      <small style={{ opacity: 0.85 }}>{currency?.name ?? wallet?.currency}</small>
      {wallet?.isFrozen && <div style={{ marginTop: 8, display: 'inline-flex', gap: 6, alignItems: 'center', background: 'rgba(0,0,0,0.25)', borderRadius: 10, padding: '3px 10px', fontSize: 12 }}>🔒 Frozen</div>}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12, position: 'relative', zIndex: 1 }} role="presentation" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
        {ACTIONS.map((x) => {
          const st = actionState(currency, x);
          const style = { fontSize: 12, fontWeight: 700, borderRadius: 99, padding: '6px 12px', background: 'rgba(255,255,255,0.18)', color: '#fff', border: 0, opacity: st.ok ? 1 : 0.45, cursor: st.ok ? 'pointer' : 'not-allowed', textDecoration: 'none' };
          if (!st.ok) return <button key={x.key} type="button" disabled title={st.why} style={style}>{x.label}</button>;
          if (x.to) return <Link key={x.key} to={x.to} style={style}>{x.label}</Link>;
          return <button key={x.key} type="button" style={style} onClick={() => onConvert(wallet?.currency)}>{x.label}</button>;
        })}
      </div>
      {firstWhy && <div style={{ fontSize: 11.5, opacity: 0.85, marginTop: 8, position: 'relative', zIndex: 1 }}>ℹ {firstWhy}</div>}
    </motion.div>
  );
}

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

  const walletList = wallets?.wallets ?? wallets ?? [];
  const existingCurrencies = walletList.map((w) => w?.currency);
  const convertible = entries.filter((c) => c.capabilities?.convert);
  const openable = entries.filter((c) => !existingCurrencies.includes(c.code));
  const chosen = walletList.find((w) => (w?.walletId ?? w?.currency) === selectedWallet) ?? walletList[0];
  const chosenCur = chosen ? byCode[chosen.currency] : null;

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
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ margin: 0, color: tokens.textSecondary, fontSize: 14 }}>Hold, convert and send money in African currencies. What each wallet can do comes from that currency's own rules.</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" style={outlineBtn} onClick={() => startConvert('NGN')}>⇄ Cross-currency transfer</button>
          <button type="button" style={primaryBtn} onClick={() => setOpenDialog(true)}>＋ Open a wallet</button>
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16">
          {[1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={170} sx={{ borderRadius: '22px' }} />)}
        </div>
      )}

      {!isLoading && walletList.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center py-48 rounded-3xl" style={card}>
          <FuseSvgIcon size={48} style={{ color: tokens.textMuted, margin: '0 auto 16px', display: 'block' }}>heroicons-outline:briefcase</FuseSvgIcon>
          <Typography style={{ fontSize: 20, fontWeight: 700, color: tokens.textPrimary, marginBottom: 8 }}>No wallets yet</Typography>
          <Typography style={{ fontSize: 15, color: tokens.textMuted, marginBottom: 20 }}>Open your first currency wallet to get started</Typography>
          <button type="button" style={primaryBtn} onClick={() => setOpenDialog(true)}>Open First Wallet</button>
        </motion.div>
      )}

      {!isLoading && walletList.length > 0 && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 16 }}>
            {walletList.map((w, i) => (
              <WalletCard key={w?.walletId ?? i} wallet={w} currency={byCode[w?.currency]} index={i} selected={chosen === w} onSelect={() => setSelectedWallet(w?.walletId ?? w?.currency)} onConvert={startConvert} tokens={tokens} />
            ))}
          </div>

          {chosen && (
            <div style={{ ...card, borderRadius: 20, padding: 20, marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: tokens.textPrimary }}>{chosenCur?.name ?? chosen.currency} wallet</h3>
                <span style={{ fontSize: 12, color: tokens.textMuted, fontFamily: 'monospace' }}>{chosen.walletId ?? ''}</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', color: tokens.textMuted, marginBottom: 6 }}>ABOUT THIS WALLET</div>
              {(chosenCur?.rules ?? []).length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: 22, fontSize: 14, color: tokens.textSecondary, lineHeight: 1.7 }}>
                  {chosenCur.rules.map((r) => <li key={r}>{r}</li>)}
                </ul>
              ) : (
                <div style={{ fontSize: 14, color: tokens.textSecondary }}>
                  {chosenCur?.country ? `${chosenCur.country}. ` : ''}Use Convert to move money between your wallets. The rate and fee are shown before you confirm.
                </div>
              )}
              {chosenCur?.fundingMethods?.length > 0 && <div style={{ fontSize: 13, color: tokens.textSecondary, marginTop: 8 }}>Add money by: {chosenCur.fundingMethods.map((m) => m.replace('_', ' ').toLowerCase()).join(', ')}.</div>}
            </div>
          )}
        </>
      )}

      {/* Open Wallet Dialog: the list comes from the currency registry */}
      <Dialog open={openDialog} onClose={() => { setOpenDialog(false); setOpenError(''); setOpenSuccess(''); setSelectedCurrency(''); }} maxWidth="xs" fullWidth PaperProps={{ sx: dialogPaperSx }}>
        <DialogContent sx={{ p: 3 }}>
          <Typography style={{ fontSize: 20, fontWeight: 700, color: tokens.textPrimary, marginBottom: 4 }}>Open a wallet</Typography>
          <Typography style={{ fontSize: 14, color: tokens.textMuted, marginBottom: 16 }}>Pick a currency. New currencies appear here as soon as they are switched on.</Typography>
          <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
            {openable.length === 0 && <div style={{ textAlign: 'center', padding: 14, color: tokens.textMuted, fontSize: 14 }}>You already have a wallet in every available currency.</div>}
            {openable.map((c) => {
              const canOpen = c.capabilities?.open && c.status !== 'SOON';
              const sel = selectedCurrency === c.code;
              return (
                <button
                  key={c.code}
                  type="button"
                  disabled={!canOpen}
                  onClick={() => setSelectedCurrency(c.code)}
                  style={{ display: 'flex', gap: 12, alignItems: 'center', textAlign: 'left', border: `2px solid ${sel ? tokens.accentSolid : tokens.borderColor}`, borderRadius: 18, padding: '12px 14px', background: canOpen ? tokens.cardBg : tokens.pageBg, opacity: canOpen ? 1 : 0.6, cursor: canOpen ? 'pointer' : 'not-allowed' }}
                >
                  <span style={{ fontSize: 26 }}>{c.flag}</span>
                  <span style={{ flex: 1 }}>
                    <b style={{ display: 'block', color: tokens.textPrimary }}>{c.name} · {c.code}</b>
                    <span style={{ fontSize: 12.5, color: tokens.textSecondary }}>{canOpen ? c.country || 'Open now' : 'Coming soon'}</span>
                  </span>
                  {!canOpen && <span style={{ fontSize: 11, fontWeight: 800, borderRadius: 99, padding: '3px 10px', background: tokens.borderColor, color: tokens.textSecondary }}>SOON</span>}
                </button>
              );
            })}
          </div>
          {openSuccess && <Alert severity="success" sx={{ mb: 2, borderRadius: '10px', background: tokens.successBg, color: tokens.success }}>{openSuccess}</Alert>}
          {openError && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px', background: tokens.dangerBg, color: tokens.danger }}>{openError}</Alert>}
          <Button variant="contained" fullWidth disabled={!selectedCurrency || opening} onClick={handleOpenWallet} sx={{ background: tokens.accentGradient, borderRadius: '12px', fontWeight: 700, py: 1.5, textTransform: 'none', fontSize: 15, '&:disabled': { background: tokens.borderColor, color: tokens.textMuted } }}>
            {opening ? <CircularProgress size={20} sx={{ color: 'white' }} /> : `Open ${selectedCurrency || 'wallet'}`}
          </Button>
        </DialogContent>
      </Dialog>

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
