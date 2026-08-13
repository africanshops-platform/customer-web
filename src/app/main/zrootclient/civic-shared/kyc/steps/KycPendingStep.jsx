import { useState } from 'react';
import { Box, Button, CircularProgress, Divider, Paper, Typography } from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BadgeIcon from '@mui/icons-material/Badge';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import RefreshIcon from '@mui/icons-material/Refresh';
import EmailIcon from '@mui/icons-material/Email';
import { KYC_STATUS_KEY } from 'app/configs/data/server-calls/auth/userapp/a_kyc/useKycRepo';
import { useQueryClient } from 'react-query';

/**
 * "Under review" banner shown above the KYC cards once documents + at
 * least one biometric are on file but the account isn't FULLY_VERIFIED
 * yet. Purely informational — the only functional logic here is the
 * "Check Approval Status" refresh (re-invalidates the KYC status query),
 * unchanged from the previous locked-stepper implementation. Layout is
 * now a plain Paper section instead of a full-screen dark step.
 */
export default function KycPendingStep({
  docsComplete = false,
  bioComplete = false,
  faceVerified = false,
  biometricRegistered = false,
  isVerified = false,
}) {
  const COMPLETED = [
    docsComplete && { icon: BadgeIcon, label: 'Identity document submitted' },
    (faceVerified || biometricRegistered) && {
      icon: FingerprintIcon,
      label:
        faceVerified && biometricRegistered
          ? 'Face scan + fingerprint enrolled (bimodal)'
          : faceVerified
            ? 'Face scan verified'
            : 'Fingerprint / Face ID enrolled',
    },
  ].filter(Boolean);

  const TIMELINE = [
    { day: 'Day 1', text: 'Automated document validation', done: true },
    { day: 'Day 1–2', text: 'Manual review by compliance team', done: isVerified },
    { day: 'Day 2', text: 'Approval notification via email', done: isVerified },
  ];

  const qc = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    await qc.invalidateQueries(KYC_STATUS_KEY);
    setTimeout(() => setRefreshing(false), 900);
  }

  return (
    <Paper className="rounded-2xl overflow-hidden">
      {/* Hero */}
      <Box
        sx={{
          px: 3,
          pt: 4,
          pb: 3,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: isVerified ? 'success.main' : 'action.hover',
          }}
        >
          {isVerified ? (
            <CheckCircleIcon sx={{ fontSize: 38 }} color="inherit" htmlColor="#fff" />
          ) : (
            <ShieldIcon color="success" sx={{ fontSize: 38 }} />
          )}
        </Box>

        <Typography className="font-extrabold" sx={{ fontSize: '1.4rem', mb: 1 }}>
          {isVerified ? 'Identity Verified' : 'Application Under Review'}
        </Typography>

        <Box
          sx={{
            px: 2,
            py: 0.5,
            borderRadius: 20,
            mb: 2,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: isVerified ? 'success.main' : 'warning.light',
            color: isVerified ? 'success.contrastText' : 'warning.contrastText',
          }}
        >
          {isVerified ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <HourglassTopIcon sx={{ fontSize: 16 }} />}
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: 0.5 }}>
            {isVerified ? 'APPROVED' : 'AWAITING APPROVAL'}
          </Typography>
        </Box>

        <Typography color="text.secondary" sx={{ maxWidth: 380, lineHeight: 1.7 }}>
          {isVerified ? (
            'Your identity has been verified and approved. You now have full access to all platform features.'
          ) : (
            <>
              All verification steps are complete. Our compliance team typically approves within{' '}
              <strong>1–2 business days</strong>.
            </>
          )}
        </Typography>
      </Box>

      <Box sx={{ px: 3, py: 3 }}>
        {/* Completed steps */}
        <Typography variant="caption" className="font-semibold" color="text.secondary">
          COMPLETED STEPS
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mt: 1, mb: 3 }}>
          {COMPLETED.map(({ icon: Icon, label }) => (
            <Box
              key={label}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.5,
                borderRadius: 2.5,
                bgcolor: 'action.hover',
              }}
            >
              <Icon color="secondary" sx={{ fontSize: 20 }} />
              <Typography sx={{ flex: 1 }} color="text.secondary">
                {label}
              </Typography>
              <CheckCircleIcon color="success" sx={{ fontSize: 18 }} />
            </Box>
          ))}
        </Box>

        {/* Timeline */}
        <Typography variant="caption" className="font-semibold" color="text.secondary">
          REVIEW TIMELINE
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', position: 'relative', mt: 1, mb: 3 }}>
          {TIMELINE.map(({ day, text, done }, i) => (
            <Box key={day} sx={{ display: 'flex', gap: 2, position: 'relative' }}>
              {i < TIMELINE.length - 1 && (
                <Box
                  sx={{
                    position: 'absolute',
                    left: 15,
                    top: 30,
                    bottom: -6,
                    width: 1,
                    bgcolor: done ? 'success.main' : 'divider',
                  }}
                />
              )}
              <Box sx={{ flexShrink: 0, mt: 1.4 }}>
                <Box
                  sx={{
                    width: 11,
                    height: 11,
                    borderRadius: '50%',
                    ml: '10px',
                    bgcolor: done ? 'success.main' : 'action.disabled',
                  }}
                />
              </Box>
              <Box sx={{ pb: 3 }}>
                <Typography sx={{ fontWeight: 700 }} color={done ? 'success.main' : 'text.disabled'}>
                  {day}
                </Typography>
                <Typography color={done ? 'text.primary' : 'text.disabled'}>{text}</Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {isVerified ? (
          <Box
            sx={{
              p: 2,
              borderRadius: 2.5,
              bgcolor: 'success.main',
              color: 'success.contrastText',
              display: 'flex',
              gap: 1.5,
              alignItems: 'flex-start',
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 20, flexShrink: 0, mt: 0.25 }} />
            <Typography sx={{ lineHeight: 1.7 }}>
              A confirmation email was sent to your registered address. Your profile is fully active.
            </Typography>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                p: 2,
                borderRadius: 2.5,
                mb: 3,
                bgcolor: 'info.main',
                color: 'info.contrastText',
                display: 'flex',
                gap: 1.5,
                alignItems: 'flex-start',
              }}
            >
              <EmailIcon sx={{ fontSize: 20, flexShrink: 0, mt: 0.25 }} />
              <Typography sx={{ lineHeight: 1.7 }}>
                You will receive an email once your identity is approved. Check your inbox and spam folder.
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="outlined"
              onClick={handleRefresh}
              disabled={refreshing}
              startIcon={refreshing ? <CircularProgress size={18} /> : <RefreshIcon />}
            >
              {refreshing ? 'Checking status…' : 'Check Approval Status'}
            </Button>

            <Divider sx={{ my: 2.5 }} />

            <Typography variant="caption" color="text.secondary" className="text-center" sx={{ display: 'block' }}>
              If review exceeds 3 business days, contact support@africanshops.org
            </Typography>
          </>
        )}
      </Box>
    </Paper>
  );
}
