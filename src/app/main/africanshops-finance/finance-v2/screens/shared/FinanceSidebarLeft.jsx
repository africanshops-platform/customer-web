import { NavLink, useLocation } from 'react-router-dom';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { useFinanceTheme } from '../../FinanceThemeContext';

const F = {
  sectionHead: 'clamp(1.76rem, 2.6vw, 2.2rem)',
  body:        'clamp(1.5rem,  2.2vw, 1.9rem)',
  label:       'clamp(1.44rem, 2vw,   1.76rem)',
  small:       'clamp(1.3rem,  1.8vw, 1.56rem)',
};

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
      // flex-1 (not h-full): the parent (.FusePageSimple-sidebarContent) only sets
      // min-height, not height, so a percentage height here never resolves and the
      // panel collapses to content height — flex-grow works on real layout space
      // instead, so this correctly stretches to fill the sidebar, letting the promo
      // card below sit at the true bottom via nav's flex-1.
      className="flex flex-col flex-1 py-24 px-12"
      style={{ background: tokens.sidebarBg, borderRight: `1px solid ${tokens.sidebarBorder}` }}
    >
      {/* Logo area */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-12 px-8 mb-32"
      >
        <div
          className="w-36 h-36 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: tokens.accentGradient }}
        >
          {/* Explicit white fill, not just a Tailwind class — the real bug
              was heroicons-solid:banknotes not existing in the bundled v1
              sprite (silent blank <use>), fixed to :cash; making the color
              explicit here too so it's never ambiguous against the orange badge. */}
          <FuseSvgIcon size={20} style={{ color: '#ffffff' }}>heroicons-solid:cash</FuseSvgIcon>
        </div>
        <div>
          <Typography style={{ fontSize: F.body, fontWeight: 700, color: tokens.textPrimary, lineHeight: 1.2 }}>Africanshops</Typography>
          <Typography style={{ fontSize: F.small, color: tokens.textMuted, lineHeight: 1.2 }}>Finance</Typography>
        </div>
      </motion.div>

      {/* Navigation */}
      <nav className="flex flex-col gap-20 flex-1">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <Typography
              className="uppercase tracking-widest font-semibold px-8 mb-6"
              style={{ fontSize: F.small, color: tokens.textMuted }}
            >
              {group.label}
            </Typography>
            <div className="flex flex-col gap-2">
              {group.items.map((item, i) => {
                const active = pathname === item.path || pathname.startsWith(`${item.path  }/`);
                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                  >
                    <NavLink
                      to={item.path}
                      className="flex items-center gap-12 px-12 py-9 rounded-lg transition-colors duration-150"
                      style={{
                        background: active ? tokens.accentSoft : 'transparent',
                        color: 'inherit',
                        textDecoration: 'none',
                      }}
                    >
                      <FuseSvgIcon size={20} style={{ color: active ? tokens.accentSolid : tokens.textSecondary }}>
                        {item.icon}
                      </FuseSvgIcon>
                      <Typography
                        style={{
                          fontSize: F.body,
                          fontWeight: active ? 700 : 500,
                          color: active ? tokens.accentSolid : tokens.textSecondary,
                          textDecoration: 'none',
                        }}
                      >
                        {item.label}
                      </Typography>
                    </NavLink>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom promo card — flat dark card, mirrors the reference's black corner promo */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl p-16 mt-16"
        style={{ background: tokens.heroBg }}
      >
        <FuseSvgIcon size={18} className="mb-8" style={{ color: tokens.accentSolid }}>heroicons-outline:shield-check</FuseSvgIcon>
        <Typography style={{ fontSize: F.label, fontWeight: 700, color: tokens.heroText, marginBottom: 4 }}>Secure & Verified</Typography>
        <Typography style={{ fontSize: F.small, color: tokens.heroTextMuted, lineHeight: 1.5 }}>
          All transactions are encrypted and monitored 24/7.
        </Typography>
      </motion.div>
    </div>
  );
}
