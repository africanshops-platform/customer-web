import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAllHighYieldRates } from '../../hooks/useFintechApi';
import { useFinanceTheme } from '../../FinanceThemeContext';

const container = { show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

/**
 * A "coming soon" page for a product that is not live (Cards, Markets): what it will be, an illustration of it, and,
 * honestly, what to use today. Nothing here pretends to work: there is no sign-up button until there is something to sign up to.
 */
export default function ComingSoon({ title, blurb, illustration, points }) {
  const { tokens } = useFinanceTheme();
  const { data: ratesData } = useAllHighYieldRates();
  const rates = ratesData?.rates ?? ratesData ?? {};
  const best = Math.max(0, ...Object.values(rates).map(Number).filter(Number.isFinite));
  const card = { background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, boxShadow: tokens.cardShadow, borderRadius: 20, padding: 20 };
  const link = { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 16, border: `1px solid ${tokens.borderColor}`, textDecoration: 'none', color: tokens.textPrimary, background: tokens.pageBg };

  return (
    <div className="w-full px-16 md:px-24 xl:px-32 py-24">
      <motion.div variants={container} initial="hidden" animate="show" style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr)', alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 16, minWidth: 0 }}>
          <motion.div variants={item} style={{ background: tokens.heroBg, color: '#fff', borderRadius: 24, padding: 26, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -60, top: -60, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(rgba(249,115,22,0.33),transparent 70%)', pointerEvents: 'none' }} />
            <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', borderRadius: 99, padding: '4px 12px', background: 'rgba(255,255,255,0.14)' }}>COMING SOON</span>
            <h2 style={{ margin: '12px 0 6px', fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em' }}>{title}</h2>
            <p style={{ margin: 0, maxWidth: 520, color: 'rgba(255,255,255,0.75)', fontSize: 15, lineHeight: 1.55 }}>{blurb}</p>
            <div style={{ marginTop: 22, display: 'flex', justifyContent: 'center' }}>{illustration}</div>
            <div style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 10 }}>Illustration of what is coming. Not available yet.</div>
          </motion.div>

          <motion.div variants={item} style={card}>
            <h3 style={{ margin: '0 0 10px', fontSize: 16, fontWeight: 700, color: tokens.textPrimary }}>What to expect</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 12 }}>
              {points.map(([icon, head, text]) => (
                <div key={head} style={{ border: `1px solid ${tokens.borderColor}`, borderRadius: 16, padding: 14, background: tokens.pageBg }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
                  <b style={{ display: 'block', color: tokens.textPrimary, fontSize: 14 }}>{head}</b>
                  <span style={{ fontSize: 12.5, color: tokens.textSecondary }}>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div variants={item} style={{ ...card, background: tokens.accentSoft, border: `1px solid ${tokens.accentSolid}33`, boxShadow: 'none', display: 'grid', gap: 10 }}>
          <div>
            <h3 style={{ margin: '0 0 2px', fontSize: 16, fontWeight: 700, color: tokens.textPrimary }}>While you wait</h3>
            <div style={{ fontSize: 13, color: tokens.textSecondary }}>Everything below works today.</div>
          </div>
          <Link to="/africanshops/finance-v2/savings" style={link}>
            <span style={{ fontSize: 22 }}>🌱</span>
            <span style={{ flex: 1, fontSize: 13.5 }}><b style={{ display: 'block' }}>Savings plans</b>{best ? `Fixed terms earning up to ${(best / 100).toLocaleString('en-NG', { maximumFractionDigits: 2 })}% a year.` : 'Lock money for a term and earn a fixed rate.'}</span>
            <span style={{ color: tokens.accentSolid, fontWeight: 800 }}>›</span>
          </Link>
          <Link to="/africanshops/finance-v2/wallets" style={link}>
            <span style={{ fontSize: 22 }}>💼</span>
            <span style={{ flex: 1, fontSize: 13.5 }}><b style={{ display: 'block' }}>Wallets</b>Hold and convert money in African currencies.</span>
            <span style={{ color: tokens.accentSolid, fontWeight: 800 }}>›</span>
          </Link>
          <Link to="/africanshops/finance-v2/fund-account" style={link}>
            <span style={{ fontSize: 22 }}>💳</span>
            <span style={{ flex: 1, fontSize: 13.5 }}><b style={{ display: 'block' }}>Fund your account</b>Add money by card or bank transfer.</span>
            <span style={{ color: tokens.accentSolid, fontWeight: 800 }}>›</span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
