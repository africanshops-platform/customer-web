import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from 'src/app/auth/user/store/userSlice';
import { useFinanceTheme } from '../../FinanceThemeContext';

const F = {
  title:    'clamp(1.64rem, 2.8vw, 2.2rem)',
  subtitle: 'clamp(1.3rem,  2vw,   1.64rem)',
  body:     'clamp(1.5rem,  2.2vw, 1.9rem)',
  small:    'clamp(1.3rem,  1.8vw, 1.56rem)',
};

const PAGE_META = {
  '/africanshops/finance-v2/overview':     { title: 'Overview',      subtitle: 'Your financial snapshot' },
  '/africanshops/finance-v2/transactions': { title: 'Transactions',  subtitle: 'History & statements' },
  '/africanshops/finance-v2/transfer':     { title: 'Transfer',      subtitle: 'Send money instantly' },
  '/africanshops/finance-v2/transfer-external': { title: 'Send to Bank', subtitle: 'Pay any Nigerian bank account' },
  '/africanshops/finance-v2/fund-account': { title: 'Fund Account',  subtitle: 'Add money to your wallet' },
  '/africanshops/finance-v2/receive-money': { title: 'Receive Money', subtitle: 'Get paid by bank transfer' },
  '/africanshops/finance-v2/withdrawal':   { title: 'Withdraw',      subtitle: 'Move money to your own bank account' },
  '/africanshops/finance-v2/savings':      { title: 'Savings',       subtitle: 'Earn on money you set aside' },
  '/africanshops/finance-v2/wallets':      { title: 'Wallets',       subtitle: 'Multi-currency accounts' },
  '/africanshops/finance-v2/kyc':          { title: 'KYC Verification', subtitle: 'Verify your identity to unlock more' },
  '/africanshops/finance-v2/settings':     { title: 'Settings',      subtitle: 'Security and limits' },
  '/africanshops/finance-v2/cards':        { title: 'Cards',         subtitle: 'Virtual card details' },
  '/africanshops/finance-v2/beneficiaries': { title: 'Beneficiaries', subtitle: 'People and accounts you send to' },
};

export default function FinanceHeader({ leftToggle, rightToggle, kycStatus }) {
  const { pathname } = useLocation();
  const meta = PAGE_META[pathname] ?? { title: 'Finance', subtitle: '' };
  const user = useSelector(selectUser);
  const isKycPending = kycStatus === 'PENDING_REVIEW';
  // Retail-9 (2026-07-12) bugfix: order was reversed relative to the main
  // site header (UserMenu.jsx: `user.name ? user.name : user.data.displayName`)
  // — preferring .data.displayName first showed a stale/default value here
  // while the correctly-ordered main header showed the real name.
  const displayName = user?.name || user?.data?.displayName || 'User';
  const email = user?.email || user?.data?.email || '';
  const initial = displayName[0]?.toUpperCase() ?? 'U';
  const { mode, toggleMode, tokens } = useFinanceTheme();

  return (
    <div
      className="flex items-center w-full px-16 md:px-24 py-12 gap-12"
      style={{
        background: tokens.headerBg,
        borderBottom: `1px solid ${tokens.headerBorder}`,
        minHeight: 68,
      }}
    >
      {/* Left toggle */}
      <Tooltip title="Toggle navigation">
        <IconButton onClick={leftToggle} size="small" sx={{ color: tokens.textSecondary, '&:hover': { background: tokens.accentSoft } }}>
          <FuseSvgIcon size={22}>heroicons-outline:menu</FuseSvgIcon>
        </IconButton>
      </Tooltip>

      {/* Page title */}
      <motion.div
        key={pathname}
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25 }}
        className="flex-1 min-w-0"
      >
        <Typography style={{ fontSize: F.title, fontWeight: 700, color: tokens.textPrimary, lineHeight: 1.2 }}>
          {meta.title}
        </Typography>
        {meta.subtitle && (
          <Typography style={{ fontSize: F.subtitle, color: tokens.textMuted, lineHeight: 1.3 }}>
            {meta.subtitle}
          </Typography>
        )}
      </motion.div>

      {/* KYC pending badge */}
      {isKycPending && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="hidden md:flex items-center gap-8 rounded-full px-12 py-6"
          style={{ background: tokens.warningBg, border: `1px solid ${tokens.warning}55` }}
        >
          <div className="w-8 h-8 rounded-full animate-pulse" style={{ background: tokens.warning }} />
          <Typography style={{ fontSize: F.small, fontWeight: 600, color: tokens.warning }}>
            Identity Under Review
          </Typography>
        </motion.div>
      )}

      {/* Theme toggle — Retail-3 (2026-07-11): compare light vs dark finance-v2 */}
      <Tooltip title={mode === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}>
        <IconButton onClick={toggleMode} size="small" sx={{ color: tokens.textSecondary, '&:hover': { background: tokens.accentSoft } }}>
          <FuseSvgIcon size={20}>{mode === 'light' ? 'heroicons-outline:moon' : 'heroicons-outline:sun'}</FuseSvgIcon>
        </IconButton>
      </Tooltip>

      {/* User avatar */}
      <div className="flex items-center gap-10">
        <div
          className="rounded-full flex items-center justify-center font-bold text-white shrink-0"
          style={{ background: tokens.accentGradient, width: 38, height: 38, fontSize: F.body }}
        >
          {initial}
        </div>
        <div className="hidden sm:block">
          <Typography style={{ fontSize: F.small, fontWeight: 600, color: tokens.textPrimary, lineHeight: 1.2 }}>
            {displayName}
          </Typography>
          <Typography style={{ fontSize: F.small, color: tokens.textMuted, lineHeight: 1.2 }}>
            {email}
          </Typography>
        </div>
      </div>

      {/* Right toggle */}
      <Tooltip title="Toggle quick stats">
        <IconButton onClick={rightToggle} size="small" sx={{ color: tokens.textSecondary, '&:hover': { background: tokens.accentSoft } }}>
          <FuseSvgIcon size={22}>heroicons-outline:chart-bar</FuseSvgIcon>
        </IconButton>
      </Tooltip>
    </div>
  );
}
