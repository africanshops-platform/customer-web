import ComingSoon from './shared/ComingSoon';

const illustration = (
  <div style={{ width: 320, height: 190, borderRadius: 20, background: 'linear-gradient(135deg,#f97316,#7c2d12)', color: '#fff', padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 18px 40px #7c2d1255', transform: 'rotate(-3deg)' }}>
    <b>AfricanShops</b>
    <div style={{ fontSize: 20, letterSpacing: '0.14em' }}>•••• •••• •••• ••••</div>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span>YOUR NAME</span><span>MM/YY</span></div>
  </div>
);

export default function FinanceCardsContent() {
  return (
    <ComingSoon
      title="Cards"
      blurb="Virtual and physical cards for everyday spending, tied directly to your wallet."
      illustration={illustration}
      points={[
        ['💳', 'Spend from your wallet', 'Pay online and in shops with money you already hold.'],
        ['❄', 'You stay in control', 'Freeze a card, set limits and see every payment.'],
        ['📱', 'Pay from your phone', 'Add your card to a digital wallet to tap and pay.'],
      ]}
    />
  );
}
