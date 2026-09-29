import { useEffect } from 'react';
import FusePageSimple from '@fuse/core/FusePageSimple';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Button, Chip, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import KycFaceCard from './steps/KycFaceCard';
import KycDocumentCard from './steps/KycDocumentCard';
import KycWebAuthnCard from './steps/KycWebAuthnCard';
import KycPendingStep from './steps/KycPendingStep';

// Without this, dropping an image file anywhere on the page outside the exact
// bounds of KycDocumentCard's dropzone falls through to the browser's default
// drag-and-drop behavior — navigating the whole tab to display the image as a
// page, wiping every card's in-progress form state. This is a page-wide net,
// not just the dropzone's own onDrop, because the default action fires on
// whatever element the cursor is over at drop time, not just the intended target.
function usePreventStrayFileDrop() {
  useEffect(() => {
    const preventDefault = (e) => e.preventDefault();
    window.addEventListener('dragover', preventDefault);
    window.addEventListener('drop', preventDefault);
    return () => {
      window.removeEventListener('dragover', preventDefault);
      window.removeEventListener('drop', preventDefault);
    };
  }, []);
}

const Root = styled(FusePageSimple)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.paper,
    boxShadow: `inset 0 0 0 1px ${theme.palette.divider}`,
  },
}));

const STATUS_COLOR = {
  'Not started': 'default',
  Submitted: 'info',
  Registered: 'success',
  Verified: 'success',
};

function StatusChip({ label }) {
  const colorKey = Object.keys(STATUS_COLOR).find((key) => label.startsWith(key));
  return <Chip size="small" label={label} color={STATUS_COLOR[colorKey] || 'default'} />;
}

function KycSection({ title, description, status, children }) {
  return (
    <Paper className="rounded-2xl p-24 flex flex-col gap-12">
      <div className="flex items-center justify-between">
        <Typography className="font-semibold">{title}</Typography>
        <StatusChip label={status} />
      </div>
      <Typography color="text.secondary">{description}</Typography>
      {children}
    </Paper>
  );
}

/**
 * Identity verification page. Renders one independent card per KYC
 * sub-domain (Face, Document, WebAuthn device) instead of a locked
 * step-by-step wizard — each is separately viewable/updatable at any
 * time. All functional/API logic lives in the card components
 * (face-api.js capture, Cloudinary document upload, WebAuthn
 * registration via useKycRepo.js) and is unchanged from the previous
 * wizard steps; this component only lays them out.
 *
 * External prop contract is unchanged: accepts { kycData, onBack }.
 * Used both as the full KYC entry point (via KycGuard/KycManagePage,
 * no onBack) and in "manage mode" from CivicUserGuard's "Back to Civic
 * Activation" flow (onBack provided) — see CivicUserGuard.jsx.
 */
export default function KycWizardPage({ kycData, onBack }) {
  usePreventStrayFileDrop();

  const isVerified = kycData?.kycStatus === 'FULLY_VERIFIED';
  const docsComplete = kycData?.documentSubmitted === true;
  const faceVerified = kycData?.faceVerified === true;
  const biometricRegistered = kycData?.biometricRegistered === true;
  const bioComplete = faceVerified || biometricRegistered;
  const readyForReview = docsComplete && bioComplete;
  const documentType = kycData?.documentType ?? null;
  const enrolledDevices = kycData?.enrolledDevices ?? [];

  return (
    <Root
      header={
        <div className="flex flex-1 w-full flex-col py-8 sm:py-16 px-16 md:px-24">
          {onBack && (
            <Button
              onClick={onBack}
              startIcon={<ArrowBackIcon />}
              size="small"
              sx={{ alignSelf: 'flex-start', mb: 1, textTransform: 'none', color: 'text.secondary' }}
            >
              Back to Civic Activation
            </Button>
          )}
          <Typography className="text-24 md:text-32 font-extrabold tracking-tight">
            Civic Identity Verification
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Face recognition, identity document, and device biometrics — verify each independently, any time.
          </Typography>
        </div>
      }
      content={
        <div className="w-full p-16 md:p-24 flex flex-col gap-16" style={{ maxWidth: 640 }}>
          {isVerified && (
            <Paper className="rounded-2xl p-24 flex items-center gap-16">
              <FuseSvgIcon size={28} color="success">
                heroicons-solid:badge-check
              </FuseSvgIcon>
              <div>
                <Typography className="font-semibold">You're verified</Typography>
                <Typography color="text.secondary">
                  KYC verification is complete — no restrictions on your account.
                </Typography>
              </div>
            </Paper>
          )}

          {!isVerified && readyForReview && <KycPendingStep
            docsComplete={docsComplete}
            bioComplete={bioComplete}
            faceVerified={faceVerified}
            biometricRegistered={biometricRegistered}
            isVerified={false}
          />}

          {!isVerified && (
            <>
              <KycSection
                title="Face Recognition"
                description="Live camera capture used to verify your identity against your face."
                status={faceVerified ? 'Verified' : 'Not started'}
              >
                <KycFaceCard faceVerified={faceVerified} />
              </KycSection>

              <KycSection
                title="Identity Document"
                description="A government-issued ID (NIN, passport, or driver's licence)."
                status={docsComplete ? 'Submitted' : 'Not started'}
              >
                <KycDocumentCard completed={docsComplete} documentType={documentType} />
              </KycSection>

              <KycSection
                title="Biometric Device (WebAuthn)"
                description="Register a fingerprint sensor or Face ID as an additional sign-in factor."
                status={
                  biometricRegistered
                    ? `Registered${enrolledDevices.length > 1 ? ` · ${enrolledDevices.length} devices` : ''}`
                    : 'Not started'
                }
              >
                <KycWebAuthnCard enrolledDevices={enrolledDevices} />
              </KycSection>
            </>
          )}

          {onBack && (
            <Button
              onClick={onBack}
              variant="contained"
              color="secondary"
              startIcon={<ArrowBackIcon />}
              sx={{ textTransform: 'none', alignSelf: 'flex-start' }}
            >
              Done — Return to Activation
            </Button>
          )}

          <Typography variant="caption" color="text.secondary" className="text-center">
            256-bit encrypted · Data never sold · ISO 27001 compliant
          </Typography>
        </div>
      }
    />
  );
}
