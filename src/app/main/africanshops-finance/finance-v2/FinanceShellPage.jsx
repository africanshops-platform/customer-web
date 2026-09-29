import { styled } from '@mui/material/styles';
import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import FinanceHeader from './screens/shared/FinanceHeader';
import FinanceSidebarLeft from './screens/shared/FinanceSidebarLeft';
import FinanceSidebarRight from './screens/shared/FinanceSidebarRight';
import { useMyAccount, useBalance, useTransactionHistory, useKycStatus } from './hooks/useFintechApi';
import WalletSetupWizard from './screens/WalletSetupWizard';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useSelector } from 'react-redux';
import { selectUser } from 'src/app/auth/user/store/userSlice';
import { FinanceThemeProvider, useFinanceTheme } from './FinanceThemeContext';

// Backgrounds are set per-theme via inline styles on the header/sidebar/content
// components themselves (tokens.pageBg etc.) so this shell can switch between
// the light and dark finance-v2 variants at runtime — only structural/layout
// rules live here.
const Root = styled(FusePageSimpleWithMargin)(({ theme }) => ({
  '& .FusePageSimple-header': {
    borderBottomWidth: 1,
    borderStyle: 'solid',
  },
  '& .FusePageSimple-leftSidebar': {
    width: 240,
    backgroundColor: 'transparent',
  },
  '& .FusePageSimple-rightSidebar': {
    width: 260,
    backgroundColor: 'transparent',
  },
}));

function FinanceShellInner() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftOpen, setLeftOpen] = useState(!isMobile);
  const [rightOpen, setRightOpen] = useState(!isMobile);
  const navigate = useNavigate();
  const { tokens } = useFinanceTheme();

  useEffect(() => {
    setLeftOpen(!isMobile);
    setRightOpen(!isMobile);
  }, [isMobile]);

  const { data: rawAccount, isLoading: accountLoading } = useMyAccount();
  const { data: balance, isLoading: balanceLoading, refetch: refetchBalance } = useBalance('NGN');
  const { data: txHistory, refetch: refetchTxHistory } = useTransactionHistory({ limit: 5 });
  const { data: kycStatus, isLoading: kycLoading } = useKycStatus();
  const authUser = useSelector(selectUser);

  // Retail-9 (2026-07-12) bugfix: accountName on the fintech `accounts` row
  // is set once at wallet-creation time and never kept in sync with the
  // user's actual profile name — every finance screen showing "Account Name"
  // was displaying that stale snapshot (e.g. a generic "Guest User" default)
  // instead of the real, current name already shown correctly in the main
  // site header/dropdown. Overriding once here, at the single shared source,
  // so every consumer of `account` via Outlet context gets it for free.
  const realName = authUser?.name || authUser?.data?.displayName;
  const account = useMemo(
    () => (rawAccount && realName ? { ...rawAccount, accountName: realName } : rawAccount),
    [rawAccount, realName],
  );

  // Retail-6 (2026-07-12) bugfix: withdrawals/transfers/High-Yield fund all
  // mutate balance server-side, but the balance shown here comes from this
  // one useBalance() instance owned by the shell — child screens had no way
  // to tell it to refetch, so a successful mutation left the old balance on
  // screen until an unrelated navigation/remount happened to refire it.
  // Exposed via Outlet context so any child screen can call it post-success.
  const refetchFinanceData = useCallback(() => {
    refetchBalance();
    refetchTxHistory();
  }, [refetchBalance, refetchTxHistory]);

  const handleLeftToggle = useCallback(() => setLeftOpen(v => !v), []);
  const handleRightToggle = useCallback(() => setRightOpen(v => !v), []);

  const recentTx = useMemo(() => txHistory?.transactions ?? txHistory ?? [], [txHistory]);

  const header = useMemo(() => (
    <FinanceHeader
      leftToggle={handleLeftToggle}
      rightToggle={handleRightToggle}
      kycStatus={kycStatus?.kycStatus}
    />
  ), [handleLeftToggle, handleRightToggle, kycStatus?.kycStatus]);

  const leftSidebar = useMemo(() => <FinanceSidebarLeft />, []);

  const rightSidebar = useMemo(() => (
    <FinanceSidebarRight
      balance={balance}
      balanceLoading={balanceLoading}
      recentTx={recentTx}
      account={account}
    />
  ), [balance, balanceLoading, recentTx, account]);

  // 2026-09-02: reverted the KYC-before-wallet-creation gate (added
  // 2026-08-02) to match the mobile app's flow, on the founder's explicit
  // direction — provision the wallet first, verify identity after. Money
  // movement past a KYC-appropriate cap is enforced server-side by
  // checkTransferLimits (fintech-accounts.service.ts), not by blocking
  // wallet creation itself.
  if (accountLoading || kycLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: tokens.pageBg }}>
        <div className="text-center">
          <CircularProgress sx={{ color: tokens.accentSolid }} />
          <Typography className="mt-16 text-sm" style={{ color: tokens.textPrimary }}>Loading your wallet…</Typography>
        </div>
      </div>
    );
  }

  // Show wallet setup wizard for brand-new, already-verified users
  if (account === null) {
    return (
      <div style={{ background: tokens.pageBg, minHeight: '100vh' }}>
        <WalletSetupWizard onComplete={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <Root
      header={header}
      content={
        <div
          className="w-full h-full"
          style={{ background: tokens.pageBg, minHeight: '100%' }}
        >
          <Outlet context={{ account, balance, balanceLoading, kycStatus, refetchFinanceData }} />
        </div>
      }
      leftSidebarOpen={leftOpen}
      leftSidebarOnClose={() => setLeftOpen(false)}
      leftSidebarContent={leftSidebar}
      rightSidebarOpen={rightOpen}
      rightSidebarOnClose={() => setRightOpen(false)}
      rightSidebarContent={rightSidebar}
      scroll="content"
    />
  );
}

function FinanceShell() {
  return (
    <FinanceThemeProvider>
      <FinanceShellInner />
    </FinanceThemeProvider>
  );
}

export default memo(FinanceShell);
