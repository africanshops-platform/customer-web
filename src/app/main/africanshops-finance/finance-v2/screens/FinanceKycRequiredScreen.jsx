import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFinanceTheme } from '../FinanceThemeContext';

/**
 * FinanceKycRequiredScreen — the real gate for a user with no fintech
 * account who hasn't finished identity verification yet.
 *
 * Before this existed, FinanceShellPage sent every account-less user
 * straight into WalletSetupWizard regardless of KYC status — a
 * logged-in-but-unverified user could create a wallet with no identity
 * check at all. This screen sits in front of that: anyone who isn't
 * FULLY_VERIFIED sees this instead, with a single path forward — finish
 * KYC at the existing /account/kyc flow (KycWizardPage) — before wallet
 * setup is offered. Once verified, FinanceShellPage's existing check lets
 * WalletSetupWizard render as before.
 *
 * Deliberately its own screen rather than reusing KycWizardPage/KycGuard's
 * generic messaging — that copy is written for the civic-vertical context
 * (voting, civic tax), not "why can't I see my money."
 */

const STAGE_COPY = {
  NONE: {
    title: "Let's verify your identity first",
    body: "Before you can open a wallet and use AfricanShops Finance, we need to confirm who you are. It only takes a few minutes.",
    cta: 'Start Identity Verification',
  },
  FACE_VERIFIED: {
    title: "You're partway there",
    body: 'Your face verification is saved. Finish the remaining steps — document upload and biometric registration — to unlock your wallet.',
    cta: 'Continue Verification',
  },
  DOCUMENT_VERIFIED: {
    title: "You're partway there",
    body: 'Your documents are saved. Finish biometric registration to unlock your wallet.',
    cta: 'Continue Verification',
  },
  BIOMETRIC_REGISTERED: {
    title: 'Almost done',
    body: 'Your verification is ready to submit for review.',
    cta: 'Submit for Review',
  },
  PENDING_REVIEW: {
    title: 'Verification in review',
    body: "Your identity documents are being reviewed by our team. This usually doesn't take long — check back shortly, or continue below to see your status.",
    cta: 'Check Verification Status',
  },
};

export default function FinanceKycRequiredScreen({ kycStatus }) {
  const { tokens } = useFinanceTheme();
  const stage = STAGE_COPY[kycStatus] ?? STAGE_COPY.NONE;

  return (
    <div
      className="flex items-center justify-center min-h-screen px-16"
      style={{ background: tokens.pageBg }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm text-center rounded-2xl p-32"
        style={{ background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, boxShadow: tokens.cardShadow }}
      >
        <div
          className="w-64 h-64 rounded-full flex items-center justify-center mx-auto mb-24"
          style={{ background: tokens.accentGradient }}
        >
          <FuseSvgIcon size={32} sx={{ color: 'white' }}>
            heroicons-outline:shield-check
          </FuseSvgIcon>
        </div>

        <Typography
          className="font-bold mb-8"
          style={{ fontSize: '1.3rem', color: tokens.textPrimary }}
        >
          {stage.title}
        </Typography>

        <Typography
          className="mb-24"
          style={{ fontSize: '0.9rem', color: tokens.textMuted, lineHeight: 1.6 }}
        >
          {stage.body}
        </Typography>

        <Button
          component={Link}
          to="/account/kyc"
          fullWidth
          variant="contained"
          size="large"
          sx={{
            background: tokens.accentGradient,
            borderRadius: '12px',
            fontWeight: 700,
            py: 1.5,
            textTransform: 'none',
          }}
        >
          {stage.cta}
        </Button>

        <Typography
          className="mt-16"
          style={{ fontSize: '0.78rem', color: tokens.textMuted }}
        >
          Once verification is complete, you'll be able to set up your wallet and use AfricanShops
          Finance right away.
        </Typography>
      </motion.div>
    </div>
  );
}
