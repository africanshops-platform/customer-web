import { useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProvisionMyDva, useTransactionHistory } from '../hooks/useFintechApi';
import { useFinanceTheme } from '../FinanceThemeContext';
import { describeTx, isCredit, nairaFull, shortDate } from '../financeFormat';

// Receive Money, as in the approved preview: your receive-money account with a copy button on every line, a way to
// share it, and a right column with recent bank deposits and what to expect. The account setup is the old one, unchanged.
// Funding by card used to be repeated on this page; it lives on Fund Account now and is linked from here.

const container = { show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

function CopyRow({ label, value, mono = true }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: '12px 14px', marginTop: 10 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <small style={{ display: 'block', color: 'rgba(255,255,255,0.55)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{label}</small>
        <b style={{ fontSize: 18, letterSpacing: mono ? '0.06em' : 0, fontFamily: mono ? 'monospace' : 'inherit', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{value ?? '—'}</b>
      </div>
      <button type="button" onClick={copy} disabled={!value} style={{ fontSize: 12, background: 'rgba(255,255,255,0.14)', borderRadius: 8, padding: '6px 12px', border: 0, color: '#fff', cursor: 'pointer', flex: 'none' }}>
        {copied ? 'Copied ✓' : 'Copy'}
      </button>
    </div>
  );
}

export default function FinanceReceiveMoneyContent() {
  const { account, refetchFinanceData } = useOutletContext();
  const { tokens } = useFinanceTheme();
  const { mutate: provisionDva, isLoading: provisioning, error: provisionError } = useProvisionMyDva();
  const { data: txData } = useTransactionHistory({ accountNumber: account?.accountNumber, limit: 60 });

  const [dvaJustProvisioned, setDvaJustProvisioned] = useState(null);
  const [shared, setShared] = useState('');

  const card = { background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, boxShadow: tokens.cardShadow, borderRadius: 20, padding: 20 };
  const dvaProvisioned = dvaJustProvisioned ?? (account?.dvaProvisioned && account?.dvaAccountNumber);
  const dvaNumber = dvaJustProvisioned?.dvaAccountNumber ?? account?.dvaAccountNumber;
  const dvaBank = dvaJustProvisioned?.dvaBankName ?? account?.dvaBankName;

  const deposits = useMemo(() => {
    const all = txData?.transactions ?? txData ?? [];
    return all.filter((t) => isCredit(t) && describeTx(t).title === 'Bank deposit');
  }, [txData]);

  async function handleProvisionDva() {
    try {
      const result = await provisionDva(account?.accountNumber);
      setDvaJustProvisioned({ dvaAccountNumber: result.dvaAccountNumber, dvaBankName: result.dvaBankName });
      refetchFinanceData?.();
    } catch {
      // provisionError is shown by the hook state
    }
  }

  async function share() {
    const text = `Pay me by bank transfer\nAccount name: ${account?.accountName}\nBank: ${dvaBank}\nAccount number: ${dvaNumber}`;
    try {
      if (navigator.share) await navigator.share({ title: 'My account details', text });
      else {
        await navigator.clipboard.writeText(text);
        setShared('Details copied. Paste them in a message.');
        setTimeout(() => setShared(''), 2500);
      }
    } catch {
      // the person closed the share sheet
    }
  }

  return (
    <div className="w-full px-16 md:px-24 xl:px-32 py-24">
      <motion.div variants={container} initial="hidden" animate="show" style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr)', alignItems: 'start' }}>
        <motion.div variants={item} style={{ background: tokens.heroBg, color: '#fff', borderRadius: 24, padding: 24, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -60, top: -60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(rgba(249,115,22,0.33),transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>Your account for bank transfers</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>Any Nigerian bank can send money here, straight into your wallet.</div>
            {!dvaProvisioned ? (
              <div style={{ marginTop: 18 }}>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', margin: '0 0 14px' }}>You don't have a receive-money account yet. Set one up to get a number of your own.</p>
                {provisionError && <p style={{ fontSize: 13, color: '#fca5a5', margin: '0 0 12px' }}>{provisionError}</p>}
                <button type="button" onClick={handleProvisionDva} disabled={provisioning} style={{ padding: '12px 22px', borderRadius: 14, fontWeight: 700, border: 0, background: tokens.accentGradient, color: '#fff', cursor: provisioning ? 'default' : 'pointer', boxShadow: `0 6px 16px ${tokens.accentSolid}55` }}>
                  {provisioning ? 'Setting up…' : 'Set Up My Receive-Money Account'}
                </button>
              </div>
            ) : (
              <>
                <CopyRow label="Account number" value={dvaNumber} />
                <CopyRow label="Bank" value={dvaBank} mono={false} />
                <CopyRow label="Account name" value={account?.accountName} mono={false} />
                <div style={{ display: 'flex', gap: 10, marginTop: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                  <button type="button" onClick={share} style={{ padding: '12px 22px', borderRadius: 14, fontWeight: 700, border: 0, background: tokens.accentGradient, color: '#fff', cursor: 'pointer', boxShadow: `0 6px 16px ${tokens.accentSolid}55` }}>Share details</button>
                  {shared && <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>{shared}</span>}
                </div>
              </>
            )}
          </div>
        </motion.div>

        <motion.div variants={item} style={{ ...card, gridColumn: '1 / 2', marginTop: -2 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700, color: tokens.textPrimary }}>How it works</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 12 }}>
            {[
              ['1', 'Share your details', 'Send the account number and bank to whoever is paying you.'],
              ['2', 'They pay from their bank', 'A normal bank transfer, from any Nigerian bank.'],
              ['3', 'It lands in your wallet', 'You see it here as a bank deposit once the bank confirms.'],
            ].map(([n, title, text]) => (
              <div key={n} style={{ border: `1px solid ${tokens.borderColor}`, borderRadius: 16, padding: 14, background: tokens.pageBg }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', display: 'grid', placeItems: 'center', background: tokens.accentGradient, color: '#fff', fontWeight: 800, marginBottom: 8 }}>{n}</div>
                <b style={{ display: 'block', color: tokens.textPrimary, fontSize: 14 }}>{title}</b>
                <span style={{ fontSize: 12.5, color: tokens.textSecondary }}>{text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={item} style={{ display: 'grid', gap: 16, minWidth: 0, gridColumn: '2 / 3', gridRow: '1 / span 2' }}>
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: tokens.textPrimary }}>Recent bank deposits</h3>
              <Link to="/africanshops/finance-v2/transactions" style={{ color: tokens.accentSolid, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>View all</Link>
            </div>
            {deposits.length === 0 && <div style={{ padding: '18px 0', textAlign: 'center', color: tokens.textMuted, fontSize: 13 }}>No bank deposits yet. Share your details to receive your first.</div>}
            {deposits.slice(0, 5).map((t, i) => (
              <div key={t?.id ?? i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < Math.min(deposits.length, 5) - 1 ? `1px dashed ${tokens.borderColor}` : 0 }}>
                <div style={{ width: 36, height: 36, borderRadius: 12, display: 'grid', placeItems: 'center', background: tokens.successBg, color: tokens.success }}>↓</div>
                <div style={{ flex: 1, minWidth: 0, fontSize: 13 }}>
                  <b style={{ display: 'block', color: tokens.textPrimary }}>Bank deposit</b>
                  <span style={{ color: tokens.textMuted, fontSize: 12 }}>{shortDate(t?.createdAt)}</span>
                </div>
                <b style={{ color: tokens.success }}>+{nairaFull(Math.abs(parseFloat(t?.amount ?? t?.amountKobo ?? 0)))}</b>
              </div>
            ))}
          </div>

          <div style={{ ...card, background: tokens.accentSoft, border: `1px solid ${tokens.accentSolid}33`, boxShadow: 'none' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: tokens.textPrimary }}>Good to know</h3>
            {[
              ['🏦', 'Any Nigerian bank', 'Use these details in any banking app or at a branch.'],
              ['⏱', 'Lands in your wallet', 'The money appears in your default wallet once the bank confirms it.'],
              ['👤', 'Your name on it', 'Senders see the account name above, so they know it is you.'],
              ['💳', 'Prefer a card?', 'You can add money by card in a minute on Fund Account.'],
            ].map(([icon, title, text]) => (
              <div key={title} style={{ display: 'flex', gap: 12, padding: '8px 0' }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: tokens.cardBg, display: 'grid', placeItems: 'center', fontSize: 14, flex: 'none' }}>{icon}</div>
                <div style={{ fontSize: 13, color: tokens.textSecondary }}><b style={{ display: 'block', color: tokens.textPrimary }}>{title}</b>{text}</div>
              </div>
            ))}
            <Link to="/africanshops/finance-v2/fund-account" style={{ display: 'block', textAlign: 'center', marginTop: 8, borderRadius: 12, padding: '10px 12px', fontWeight: 700, fontSize: 13, background: tokens.cardBg, color: tokens.accentSolid, textDecoration: 'none', border: `1px solid ${tokens.accentSolid}55` }}>Fund with card</Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
