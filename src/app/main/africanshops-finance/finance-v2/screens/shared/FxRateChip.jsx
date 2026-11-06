import Skeleton from '@mui/material/Skeleton';
import { motion } from 'framer-motion';
import { useFxRates } from '../../hooks/useFintechApi';
import { useFinanceTheme } from '../../FinanceThemeContext';

// FxRate.rate is stored as toAmount/fromAmount × 1_000_000 (see ledger schema).
// For a seeded NGN→USD row that means "USD per NGN" — invert to show the
// conventional "1 USD = ₦X" quote traders and users actually expect.
function invertRateToNgnPerUsd(rateRaw) {
  const rate = parseFloat(rateRaw ?? 0);
  if (!rate) return null;
  return 1_000_000 / rate;
}

export default function FxRateChip({ tokens: tokensProp }) {
  const { tokens: themeTokens } = useFinanceTheme();
  const tokens = tokensProp ?? themeTokens;
  const { data: rates, isLoading } = useFxRates();

  const pair = (rates ?? []).find(
    (r) => r?.fromCurrency === 'NGN' && r?.toCurrency === 'USD'
  );

  const ngnPerUsd = pair ? invertRateToNgnPerUsd(pair.rate) : null;
  const buyNgnPerUsd = pair?.buyRate ? invertRateToNgnPerUsd(pair.buyRate) : null;
  const sellNgnPerUsd = pair?.sellRate ? invertRateToNgnPerUsd(pair.sellRate) : null;

  const lbl = { margin: '0 0 8px', fontSize: 11, letterSpacing: '0.14em', color: tokens.textMuted, textTransform: 'uppercase', fontWeight: 700 };
  const fmt = (n) => `₦${n.toLocaleString('en-NG', { maximumFractionDigits: 2 })}`;
  let body;
  if (isLoading) {
    body = <Skeleton variant="text" width="70%" sx={{ height: 32 }} />;
  } else if (!ngnPerUsd) {
    body = <div style={{ fontSize: 13, color: tokens.textMuted }}>Rate not configured yet</div>;
  } else {
    body = (
      <>
        <b style={{ fontSize: 15, color: tokens.textPrimary }}>1 USD = {fmt(ngnPerUsd)}</b>
        {(buyNgnPerUsd || sellNgnPerUsd) && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: tokens.textSecondary, marginTop: 4 }}>
            {buyNgnPerUsd && <span>Buy {fmt(buyNgnPerUsd)}</span>}
            {sellNgnPerUsd && <span>Sell {fmt(sellNgnPerUsd)}</span>}
          </div>
        )}
      </>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.4 }}
      style={{ border: `1px solid ${tokens.cardBorder}`, borderRadius: 18, padding: '12px 14px', background: tokens.cardBg }}
    >
      <div style={lbl}>Exchange rate</div>
      {body}
    </motion.div>
  );
}
