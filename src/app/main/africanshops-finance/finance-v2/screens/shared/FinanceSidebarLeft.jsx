import { NavLink, useLocation } from 'react-router-dom';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { motion } from 'framer-motion';
import { useFinanceTheme } from '../../FinanceThemeContext';

// Retail-3 (2026-07-11, revised): grouped nav mirrors the reference design's
// BANKING / MANAGE split — everyday money movement vs. growth features.
const NAV_GROUPS = [
  {
    label: 'Banking',
    items: [
      { path: '/africanshops/finance-v2/overview',      icon: 'heroicons-outline:home',              label: 'Overview' },
      { path: '/africanshops/finance-v2/transactions',  icon: 'heroicons-outline:clipboard-list',    label: 'Transactions' },
      { path: '/africanshops/finance-v2/fund-account',  icon: 'heroicons-outline:credit-card',       label: 'Fund Account' },
      { path: '/africanshops/finance-v2/receive-money', icon: 'heroicons-outline:library',           label: 'Receive Money' },
      { path: '/africanshops/finance-v2/transfer',      icon: 'heroicons-outline:switch-horizontal', label: 'Transfer' },
      { path: '/africanshops/finance-v2/transfer-external', icon: 'heroicons-outline:paper-airplane', label: 'Send to Bank' },
      { path: '/africanshops/finance-v2/withdrawal',    icon: 'heroicons-outline:upload',     label: 'Withdraw' },
    ],
  },
  {
    label: 'Grow',
    items: [
      { path: '/africanshops/finance-v2/savings',       icon: 'heroicons-outline:cash',         label: 'Savings' },
      { path: '/africanshops/finance-v2/wallets',       icon: 'heroicons-outline:briefcase',            label: 'Wallets' },
      { path: '/africanshops/finance-v2/cards',         icon: 'heroicons-outline:credit-card',       label: 'Cards' },
      { path: '/africanshops/finance-v2/markets',       icon: 'heroicons-outline:presentation-chart-line', label: 'Markets' },
    ],
  },
  {
    label: 'Account',
    items: [
      { path: '/africanshops/finance-v2/kyc',           icon: 'heroicons-outline:identification', label: 'KYC Verification' },
      { path: '/africanshops/finance-v2/settings',      icon: 'heroicons-outline:cog',       label: 'Settings' },
    ],
  },
];

export default function FinanceSidebarLeft() {
  const { pathname } = useLocation();
  const { tokens } = useFinanceTheme();

  return (
    <div
      // flex-1 (not h-full): the parent (.FusePageSimple-sidebarContent) only sets min-height, so a percentage
      // height never resolves; flex-grow stretches the panel so the promo card sits at the real bottom.
      className="flex flex-col flex-1"
      style={{ background: tokens.sidebarBg, borderRight: `1px solid ${tokens.sidebarBorder}`, padding: '18px 14px' }}
    >
      {/* Brand (matches the approved preview: orange tile, name over "Finance") */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px 16px', fontWeight: 800 }}
      >
        <div style={{ width: 34, height: 34, borderRadius: 10, background: tokens.accentGradient, display: 'grid', placeItems: 'center', color: '#fff', fontSize: 16, fontWeight: 800 }}>A</div>
        <div style={{ lineHeight: 1.25, fontSize: 15, color: tokens.textPrimary }}>
          Africanshops
          <div style={{ fontSize: 12, fontWeight: 500, color: tokens.textMuted }}>Finance</div>
        </div>
      </motion.div>

      <nav className="flex flex-col flex-1" style={{ gap: 2 }}>
        {NAV_GROUPS.map((group) => (
          <div key={group.label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: tokens.textMuted, padding: '14px 10px 6px' }}>
              {group.label}
            </div>
            {group.items.map((item, i) => {
              const active = pathname === item.path || pathname.startsWith(`${item.path}/`);
              return (
                <motion.div key={item.path} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03, duration: 0.3 }}>
                  <NavLink
                    to={item.path}
                    className="transition-colors duration-150"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: 12,
                      background: active ? tokens.accentSoft : 'transparent',
                      color: active ? tokens.accentSolid : tokens.textSecondary,
                      fontWeight: 600,
                      fontSize: 14,
                      textDecoration: 'none',
                    }}
                  >
                    <FuseSvgIcon size={20} style={{ color: active ? tokens.accentSolid : tokens.textSecondary }}>{item.icon}</FuseSvgIcon>
                    {item.label}
                  </NavLink>
                </motion.div>
              );
            })}
          </div>
        ))}
      </nav>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{ marginTop: 16, background: '#1a140e', color: '#fff', borderRadius: 16, padding: 14, fontSize: 13 }}
      >
        <b style={{ display: 'block', color: '#fdba74' }}>Secure &amp; Verified</b>
        Encrypted and monitored. Your daily limit protects your wallet.
      </motion.div>
    </div>
  );
}
