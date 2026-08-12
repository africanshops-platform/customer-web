import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

const FinanceShellPage = lazy(() => import('./FinanceShellPage'));
const FinanceOverviewContent = lazy(() => import('./screens/FinanceOverviewContent'));
const FinanceTransactionsContent = lazy(() => import('./screens/FinanceTransactionsContent'));
const FinanceTransferContent = lazy(() => import('./screens/FinanceTransferContent'));
const FinanceExternalTransferContent = lazy(() => import('./screens/FinanceExternalTransferContent'));
const FinanceWithdrawalContent = lazy(() => import('./screens/FinanceWithdrawalContent'));
const FinanceSavingsContent = lazy(() => import('./screens/FinanceSavingsContent'));
const FinanceWalletsContent = lazy(() => import('./screens/FinanceWalletsContent'));
const FinanceCardsContent = lazy(() => import('./screens/FinanceCardsContent'));
const FinanceMarketsContent = lazy(() => import('./screens/FinanceMarketsContent'));
const FinanceSettingsContent = lazy(() => import('./screens/FinanceSettingsContent'));
const FinanceKycContent = lazy(() => import('./screens/FinanceKycContent'));
const FinanceFundAccountContent = lazy(() => import('./screens/FinanceFundAccountContent'));
const FinanceReceiveMoneyContent = lazy(() => import('./screens/FinanceReceiveMoneyContent'));

const LAYOUT = {
  layout: {
    config: {
      navbar: { display: false },
      toolbar: { display: true },
      footer: { display: false },
      leftSidePanel: { display: false },
      rightSidePanel: { display: false },
    },
  },
};

const financePagesConfig = {
  settings: LAYOUT,
  auth: ['user'],
  routes: [
    {
      path: 'africanshops/finance-v2',
      element: <FinanceShellPage />,
      children: [
        { path: '', element: <Navigate to="overview" replace /> },
        { path: 'overview', element: <FinanceOverviewContent /> },
        { path: 'transactions', element: <FinanceTransactionsContent /> },
        { path: 'transfer', element: <FinanceTransferContent /> },
        { path: 'transfer-external', element: <FinanceExternalTransferContent /> },
        { path: 'withdrawal', element: <FinanceWithdrawalContent /> },
        { path: 'savings', element: <FinanceSavingsContent /> },
        { path: 'wallets', element: <FinanceWalletsContent /> },
        { path: 'cards', element: <FinanceCardsContent /> },
        { path: 'markets', element: <FinanceMarketsContent /> },
        { path: 'settings', element: <FinanceSettingsContent /> },
        { path: 'kyc', element: <FinanceKycContent /> },
        { path: 'fund-account', element: <FinanceFundAccountContent /> },
        { path: 'receive-money', element: <FinanceReceiveMoneyContent /> },
      ],
    },
  ],
};

export default financePagesConfig;
