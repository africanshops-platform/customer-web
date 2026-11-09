import { useMemo, useState } from 'react';
import Drawer from '@mui/material/Drawer';
import CircularProgress from '@mui/material/CircularProgress';
import { motion } from 'framer-motion';
import { useAllHighYieldRates, useFixedDeposits, useFixedDepositActions } from '../../hooks/useFintechApi';
import { useFinanceTheme } from '../../FinanceThemeContext';
import { nairaFull, shortDate } from '../../financeFormat';
import TransactionPinField from './TransactionPinField';

// Savings plans: the fixed-term deposits the server already offers, with a slide-in panel to open one and a list of
// the ones you have. The terms are the server's own: principal is always safe; breaking a plan early forfeits the
// interest it has earned; a matured plan pays principal and interest in full. Open and withdraw are the existing calls.

const TERMS = [['FIXED_3', 3], ['FIXED_6', 6], ['FIXED_9', 9], ['FIXED_12', 12]];
const pct = (bps) => `${(bps / 100).toLocaleString('en-NG', { maximumFractionDigits: 2 })}%`;
const addMonths = (d, n) => { const x = new Date(d); x.setMonth(x.getMonth() + n); return x; };

function PanelShell({ open, title, subtitle, onClose, children }) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      transitionDuration={320}
      PaperProps={{ sx: { width: { xs: '100%', sm: 480 }, borderTopLeftRadius: 28, borderBottomLeftRadius: 28, overflow: 'hidden' } }}
      slotProps={{ backdrop: { sx: { background: 'rgba(20,16,8,0.45)', backdropFilter: 'blur(3px)' } } }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ padding: '22px 26px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.01em' }}>{title}</div>
            <div style={{ fontSize: 13, opacity: 0.7 }}>{subtitle}</div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" style={{ width: 40, height: 40, borderRadius: '50%', border: 0, background: 'rgba(0,0,0,0.07)', cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 26px 22px' }}>{children}</div>
      </div>
    </Drawer>
  );
}

function OpenPlanPanel({ open, onClose, rates, accountNumber, onDone, preset }) {
  const { tokens } = useFinanceTheme();
  const actions = useFixedDepositActions(accountNumber);
  const [key, setKey] = useState(preset ?? 'FIXED_6');
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const term = TERMS.find(([k]) => k === key)?.[1] ?? 6;
  const rateBps = rates?.[key] ?? 0;
  const naira = parseFloat(amount || 0);
  const interest = (naira * (rateBps / 10000) * term) / 12;
  const maturity = addMonths(new Date(), term);
  const valid = naira >= 100 && pin.length >= 4;

  async function submit() {
    setBusy(true);
    setErr('');
    try {
      await actions.open(key, Math.round(naira * 100), pin);
      setAmount('');
      setPin('');
      onDone();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <PanelShell open={open} onClose={onClose} title="Open a savings plan" subtitle="Lock money for a term and earn a fixed rate.">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '8px 0 16px' }}>
        {TERMS.map(([k, m]) => (
          <button
            key={k}
            type="button"
            onClick={() => setKey(k)}
            style={{ textAlign: 'left', padding: 14, borderRadius: 18, border: `2px solid ${key === k ? tokens.accentSolid : tokens.borderColor}`, background: key === k ? tokens.accentSoft : tokens.cardBg, cursor: 'pointer' }}
          >
            <b style={{ display: 'block', fontSize: 15, color: tokens.textPrimary }}>{m} months</b>
            <span style={{ fontSize: 22, fontWeight: 800, color: tokens.success }}>{rates?.[k] != null ? pct(rates[k]) : '—'}</span>
            <span style={{ display: 'block', fontSize: 12, color: tokens.textSecondary }}>a year</span>
          </button>
        ))}
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: tokens.textPrimary }}>Amount to lock</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, border: `2px solid ${tokens.borderColor}`, borderRadius: 16, padding: '10px 16px', background: tokens.cardBg }}>
        <b style={{ fontSize: 24, color: tokens.textMuted }}>₦</b>
        <input value={amount ? Number(amount.split('.')[0] || 0).toLocaleString('en-NG') : ''} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric" placeholder="0" aria-label="Amount to lock" style={{ border: 0, outline: 0, fontSize: 30, fontWeight: 800, width: '100%', background: 'none', color: tokens.textPrimary }} />
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '10px 0 16px' }}>
        {[50000, 100000, 500000, 1000000].map((q) => (
          <button key={q} type="button" onClick={() => setAmount(String(q))} style={{ border: `1px solid ${tokens.borderColor}`, borderRadius: 99, padding: '6px 14px', fontWeight: 700, fontSize: 13, background: tokens.cardBg, color: tokens.textPrimary, cursor: 'pointer' }}>₦{q.toLocaleString('en-NG')}</button>
        ))}
      </div>

      <div style={{ border: `1px dashed ${tokens.borderColor}`, borderRadius: 18, padding: '6px 16px', background: tokens.pageBg, marginBottom: 14 }}>
        {[
          ['You lock', nairaFull(naira * 100)],
          ['Rate', rateBps ? `${pct(rateBps)} a year` : '—'],
          ['Matures on', shortDate(maturity)],
          ['You earn about', nairaFull(interest * 100)],
          ['You receive at maturity', nairaFull((naira + interest) * 100)],
        ].map(([l, v], i, a) => (
          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < a.length - 1 ? `1px dashed ${tokens.borderColor}` : 0, fontSize: 14, color: tokens.textSecondary }}>
            <span>{l}</span><b style={{ color: tokens.textPrimary }}>{v}</b>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 12.5, color: tokens.textSecondary, marginBottom: 14, lineHeight: 1.5 }}>
        Your principal is always safe. If you break the plan before it matures you forfeit the interest it has earned. The figure above is an estimate.
      </div>

      <TransactionPinField value={pin} onChange={setPin} tokens={tokens} label="Enter transaction PIN" />
      {err && <div style={{ background: tokens.dangerBg, color: tokens.danger, borderRadius: 14, padding: '10px 14px', fontSize: 14, margin: '10px 0' }}>{err}</div>}
      <button type="button" disabled={!valid || busy} onClick={submit} style={{ width: '100%', padding: 15, borderRadius: 14, fontWeight: 700, fontSize: 15, border: 0, cursor: valid && !busy ? 'pointer' : 'not-allowed', background: valid ? tokens.accentGradient : tokens.borderColor, color: valid ? '#fff' : tokens.textMuted }}>
        {busy ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : `Open ${term}-month plan`}
      </button>
    </PanelShell>
  );
}

function WithdrawPlanPanel({ plan, onClose, accountNumber, onDone }) {
  const { tokens } = useFinanceTheme();
  const actions = useFixedDepositActions(accountNumber);
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const matured = plan ? new Date(plan.maturityDate) <= new Date() || plan.status === 'MATURED' : false;
  const principal = Number(plan?.principalKobo ?? 0);
  const accrued = Number(plan?.accruedInterestKobo ?? 0);
  const withdrawLabel = matured ? 'Withdraw full amount' : 'Confirm early withdrawal';

  async function submit() {
    setBusy(true);
    setErr('');
    try {
      await actions.withdraw(plan.id, pin);
      setPin('');
      onDone();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <PanelShell open={!!plan} onClose={onClose} title={matured ? 'Withdraw your plan' : 'Break this plan early?'} subtitle={matured ? 'It has matured: you get everything.' : 'You keep your principal but lose the interest earned so far.'}>
      {plan && (
        <>
          <div style={{ border: `1px dashed ${tokens.borderColor}`, borderRadius: 18, padding: '6px 16px', background: tokens.pageBg, margin: '8px 0 14px' }}>
            {[
              ['Plan', `${plan.termMonths} months at ${pct(plan.rateBps)}`],
              ['Opened', shortDate(plan.openedAt)],
              ['Matures', shortDate(plan.maturityDate)],
              ['Principal', nairaFull(principal)],
              ['Interest earned so far', nairaFull(accrued)],
              [matured ? 'You receive' : 'You receive now', nairaFull(matured ? principal + accrued : principal)],
            ].map(([l, v], i, a) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < a.length - 1 ? `1px dashed ${tokens.borderColor}` : 0, fontSize: 14, color: tokens.textSecondary }}>
                <span>{l}</span><b style={{ color: tokens.textPrimary }}>{v}</b>
              </div>
            ))}
          </div>
          {!matured && <div style={{ background: tokens.warningBg, color: tokens.warning, borderRadius: 14, padding: '10px 14px', fontSize: 13.5, marginBottom: 14 }}>You will forfeit {nairaFull(accrued)} in interest.</div>}
          <TransactionPinField value={pin} onChange={setPin} tokens={tokens} label="Enter transaction PIN" />
          {err && <div style={{ background: tokens.dangerBg, color: tokens.danger, borderRadius: 14, padding: '10px 14px', fontSize: 14, margin: '10px 0' }}>{err}</div>}
          <button type="button" disabled={pin.length < 4 || busy} onClick={submit} style={{ width: '100%', padding: 15, borderRadius: 14, fontWeight: 700, fontSize: 15, border: 0, cursor: pin.length >= 4 && !busy ? 'pointer' : 'not-allowed', background: pin.length >= 4 ? tokens.accentGradient : tokens.borderColor, color: pin.length >= 4 ? '#fff' : tokens.textMuted }}>
            {busy ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : withdrawLabel}
          </button>
        </>
      )}
    </PanelShell>
  );
}

export default function SavingsPlans({ accountNumber, onChanged }) {
  const { tokens } = useFinanceTheme();
  const { data: ratesData } = useAllHighYieldRates();
  const { data: depositsData, refetch } = useFixedDeposits(accountNumber);
  const [openPanel, setOpenPanel] = useState(null); // { preset }
  const [withdrawing, setWithdrawing] = useState(null);
  const rates = ratesData?.rates ?? ratesData;
  const deposits = useMemo(() => depositsData?.deposits ?? [], [depositsData]);
  const card = { background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, boxShadow: tokens.cardShadow, borderRadius: 20, padding: 20 };
  const active = deposits.filter((d) => d.status === 'ACTIVE');
  const finished = deposits.filter((d) => d.status !== 'ACTIVE');
  const done = () => { setOpenPanel(null); setWithdrawing(null); refetch(); onChanged?.(); };

  const planRow = (d) => {
    const total = new Date(d.maturityDate) - new Date(d.openedAt);
    const spent = Math.min(total, Math.max(0, Date.now() - new Date(d.openedAt)));
    const pctDone = total > 0 ? (spent / total) * 100 : 100;
    const matured = d.status === 'MATURED' || new Date(d.maturityDate) <= new Date();
    const label = d.status === 'WITHDRAWN_EARLY' ? 'BROKEN EARLY' : d.status;
    return (
      <div key={d.id} style={{ padding: '14px 0', borderBottom: `1px dashed ${tokens.borderColor}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <b style={{ color: tokens.textPrimary }}>{nairaFull(Number(d.principalKobo))}</b>
            <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 800, borderRadius: 99, padding: '2px 8px', background: d.status === 'ACTIVE' ? tokens.successBg : tokens.borderColor, color: d.status === 'ACTIVE' ? tokens.success : tokens.textSecondary }}>{label}</span>
            <div style={{ fontSize: 12.5, color: tokens.textSecondary }}>{d.termMonths} months at {pct(d.rateBps)} · matures {shortDate(d.maturityDate)}</div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 13, color: tokens.textSecondary }}>
            <div>Earned so far</div>
            <b style={{ color: tokens.success }}>{nairaFull(Number(d.accruedInterestKobo))}</b>
          </div>
          {d.status === 'ACTIVE' && (
            <button type="button" onClick={() => setWithdrawing(d)} style={{ border: `1px solid ${tokens.cardBorder}`, borderRadius: 10, padding: '7px 14px', fontWeight: 700, fontSize: 12, background: matured ? tokens.accentGradient : tokens.cardBg, color: matured ? '#fff' : tokens.textPrimary, cursor: 'pointer' }}>
              {matured ? 'Withdraw' : 'Break early'}
            </button>
          )}
        </div>
        {d.status === 'ACTIVE' && (
          <div style={{ height: 6, borderRadius: 99, background: tokens.borderColor, overflow: 'hidden', marginTop: 8 }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${pctDone}%` }} transition={{ duration: 0.6 }} style={{ height: '100%', borderRadius: 99, background: tokens.accentGradient }} />
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: tokens.textPrimary }}>Savings plans</h3>
            <div style={{ fontSize: 13, color: tokens.textSecondary }}>Lock money for a term and earn a fixed rate. Your flexible vault is above.</div>
          </div>
          <button type="button" onClick={() => setOpenPanel({})} style={{ padding: '10px 18px', borderRadius: 14, fontWeight: 700, fontSize: 14, border: 0, background: tokens.accentGradient, color: '#fff', cursor: 'pointer', boxShadow: `0 6px 16px ${tokens.accentSolid}44` }}>＋ New plan</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 10 }}>
          {TERMS.map(([k, m]) => (
            <button key={k} type="button" onClick={() => setOpenPanel({ preset: k })} style={{ textAlign: 'left', padding: 14, borderRadius: 18, border: `1px solid ${tokens.borderColor}`, background: tokens.pageBg, cursor: 'pointer' }}>
              <b style={{ display: 'block', fontSize: 14, color: tokens.textPrimary }}>{m} months</b>
              <span style={{ fontSize: 22, fontWeight: 800, color: tokens.success }}>{rates?.[k] != null ? pct(rates[k]) : '—'}</span>
              <span style={{ display: 'block', fontSize: 12, color: tokens.textSecondary }}>a year, fixed</span>
            </button>
          ))}
        </div>
      </div>

      <div style={card}>
        <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: tokens.textPrimary }}>My plans</h3>
        {active.length === 0 && finished.length === 0 && <div style={{ padding: '20px 0', textAlign: 'center', color: tokens.textMuted, fontSize: 14 }}>No plans yet. Pick a term above to open your first.</div>}
        {active.map((d) => planRow(d))}
        {finished.length > 0 && <div style={{ fontSize: 12, letterSpacing: '0.12em', color: tokens.textMuted, fontWeight: 800, padding: '14px 0 0' }}>PAST PLANS</div>}
        {finished.map((d) => planRow(d))}
      </div>

      <OpenPlanPanel key={openPanel?.preset ?? 'none'} open={!!openPanel} preset={openPanel?.preset} onClose={() => setOpenPanel(null)} rates={rates} accountNumber={accountNumber} onDone={done} />
      <WithdrawPlanPanel plan={withdrawing} onClose={() => setWithdrawing(null)} accountNumber={accountNumber} onDone={done} />
    </>
  );
}
