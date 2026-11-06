import ComingSoon from './shared/ComingSoon';

const tile = (label, sub) => (
  <div style={{ width: 200, borderRadius: 18, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.16)', padding: 16, color: '#fff' }}>
    <b style={{ display: 'block', fontSize: 15 }}>{label}</b>
    <span style={{ fontSize: 12, opacity: 0.7 }}>{sub}</span>
  </div>
);

const illustration = (
  <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
    {tile('Treasury bills', 'Fixed return, 91 to 364 days')}
    {tile('Stocks', 'Nigerian Exchange, fractional or full')}
  </div>
);

export default function FinanceMarketsContent() {
  return (
    <ComingSoon
      title="Markets"
      blurb="Grow your money beyond savings: treasury bills and stocks, coming to your wallet. We are building it alongside our regulatory partners."
      illustration={illustration}
      points={[
        ['🏛', 'Treasury bills', 'Lend to the government for a fixed term and earn a fixed return.'],
        ['📈', 'Stocks', 'Buy shares in companies on the Nigerian Exchange, a little at a time.'],
        ['🛡', 'Your balances are safe', 'Savings and wallets are unaffected while this is built.'],
      ]}
    />
  );
}
