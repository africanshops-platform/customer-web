import { Box, Button, Typography } from '@mui/material';
import FuseLoading from '@fuse/core/FuseLoading';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import { useGetKycStatus } from 'app/configs/data/server-calls/auth/userapp/a_kyc/useKycRepo';
import KycWizardPage from './KycWizardPage';

function KycLoadingScreen() {
  return (
    <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <FuseLoading />
    </Box>
  );
}

function KycErrorScreen({ error, refetch }) {
  const is5xx = error?.response?.status >= 500;
  return (
    <Box
      sx={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2.5,
        px: 3,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          bgcolor: 'error.main',
          color: 'error.contrastText',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <WifiOffIcon sx={{ fontSize: 34 }} />
      </Box>
      <Box sx={{ maxWidth: 420 }}>
        <Typography className="font-bold" sx={{ fontSize: '1.4rem', mb: 1 }}>
          {is5xx ? 'KYC Service Temporarily Unavailable' : 'Unable to Verify Identity'}
        </Typography>
        <Typography color="text.secondary" sx={{ lineHeight: 1.75 }}>
          {is5xx
            ? 'Our identity verification service is experiencing a temporary issue. Your account and data are safe. Please try again in a few minutes.'
            : 'A network error occurred while checking your identity status. Please check your connection and try again.'}
        </Typography>
      </Box>
      <Button variant="contained" color="secondary" onClick={refetch}>
        Try Again
      </Button>
      <Typography variant="caption" color="text.disabled">
        Error {error?.response?.status ?? 'NETWORK'} · {new Date().toLocaleTimeString()}
      </Typography>
    </Box>
  );
}

/**
 * Gates its children behind KYC completion. Renders `children` once the
 * account is FULLY_VERIFIED, otherwise renders the identity verification
 * page (KycWizardPage) in place of them. Gating logic is unchanged from
 * before — only the visual wrapper changed: the previous implementation
 * used a `position: fixed, inset: 0` dark full-screen overlay to force a
 * modal takeover over any surrounding app chrome. The new KycWizardPage
 * is a normal in-page FusePageSimple layout (light-themed, independent
 * cards, no locked stepper), so a hard fixed-position overlay would just
 * double up on background/chrome for no benefit — it now renders in
 * normal document flow like any other routed page content.
 */
export default function KycGuard({ children }) {
  const { data, isLoading, isError, error, refetch } = useGetKycStatus();

  if (isLoading) return <KycLoadingScreen />;
  if (isError) return <KycErrorScreen error={error} refetch={refetch} />;

  const kycStatus = data?.kycStatus ?? 'NONE';
  if (kycStatus === 'FULLY_VERIFIED') return children;

  return <KycWizardPage kycData={data ?? {}} />;
}
