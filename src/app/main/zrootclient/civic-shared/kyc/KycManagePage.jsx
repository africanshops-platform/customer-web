import { Box } from '@mui/material';
import FuseLoading from '@fuse/core/FuseLoading';
import { useGetKycStatus } from 'app/configs/data/server-calls/auth/userapp/a_kyc/useKycRepo';
import KycWizardPage from './KycWizardPage';

export default function KycManagePage() {
  const { data, isLoading } = useGetKycStatus();

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <FuseLoading />
      </Box>
    );
  }

  return <KycWizardPage kycData={data ?? {}} />;
}
