import { useState } from 'react';
import { Box, Button, CircularProgress, Tooltip, Typography } from '@mui/material';
import AccountBalanceIcon  from '@mui/icons-material/AccountBalance';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ArrowForwardIcon    from '@mui/icons-material/ArrowForward';
import CheckCircleIcon     from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon    from '@mui/icons-material/ErrorOutline';
import FingerprintIcon     from '@mui/icons-material/Fingerprint';
import GavelIcon           from '@mui/icons-material/Gavel';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import PeopleIcon          from '@mui/icons-material/People';
import SecurityIcon        from '@mui/icons-material/Security';
import SportsIcon          from '@mui/icons-material/Sports';
import VerifiedUserIcon    from '@mui/icons-material/VerifiedUser';
import FaceIcon            from '@mui/icons-material/Face';
import { useUpgradeToCivicUser } from 'app/configs/data/server-calls/auth/userapp/a_civic_user/useCivicUserRepo';

const F = {
  brand:  'clamp(1.76rem, 2.6vw, 2.2rem)',
  sub:    'clamp(1.3rem,  1.8vw, 1.56rem)',
  title:  'clamp(2.2rem,  3.5vw, 3rem)',
  body:   'clamp(1.5rem,  2.2vw, 1.9rem)',
  label:  'clamp(1.44rem, 2vw,   1.76rem)',
  btn:    'clamp(1.4rem,  2vw,   1.76rem)',
  badge:  'clamp(1.2rem,  1.6vw, 1.44rem)',
};

const MODULES = [
  { icon: AccountBalanceIcon,  label: 'Civic Tax',      color: '#a78bfa', desc: 'Pay & track community taxes' },
  { icon: GavelIcon,           label: 'Governance',     color: '#60a5fa', desc: 'Vote in digital elections'   },
  { icon: SecurityIcon,        label: 'Security SOC',   color: '#f87171', desc: 'Report & monitor incidents'  },
  { icon: PeopleIcon,          label: 'Community',      color: '#34d399', desc: 'Engage in civic discourse'   },
  { icon: HealthAndSafetyIcon, label: 'Healthcare',     color: '#fb923c', desc: 'Access health services'      },
  { icon: SportsIcon,          label: 'Youth & Sports', color: '#fbbf24', desc: 'Youth programs & tournaments'},
];

export default function CivicActivationPage({ kycData = {}, onManageBiometrics }) {
  const { mutate, isLoading, isSuccess, isError, error } = useUpgradeToCivicUser();
  const [upgraded, setUpgraded] = useState(false);

  const faceVerified    = kycData?.faceVerified        === true;
  const biometricReg    = kycData?.biometricRegistered === true;
  const bothBiometrics  = faceVerified && biometricReg;
  const oneBiometric    = faceVerified || biometricReg;

  function handleUpgrade() {
    mutate(undefined, {
      onSuccess: () => setUpgraded(true),
    });
  }

  const is404 = error?.response?.status === 404;

  return (
    <Box sx={{
      position: 'fixed', inset: 0, zIndex: 1300,
      background: 'linear-gradient(135deg, #050d18 0%, #0a1929 40%, #0b2416 100%)',
      overflowY: 'auto',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      pt: { xs: 8, md: 10 }, pb: { xs: 4, md: 6 }, px: 2,
      '&::before': {
        content: '""', position: 'fixed', inset: 0, zIndex: -1,
        background: [
          'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(30,80,180,0.18) 0%, transparent 70%)',
          'radial-gradient(ellipse 60% 40% at 80% 100%, rgba(22,163,74,0.12) 0%, transparent 60%)',
        ].join(','),
      },
    }}>
      

      {/* Branding */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, mt: 1 }}>
        <Box sx={{
          width: 44, height: 44, borderRadius: '12px',
          background: 'linear-gradient(135deg, #1d4ed8, #4ade80)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 24px rgba(29,78,216,0.4)',
        }}>
          <FingerprintIcon sx={{ color: '#fff', fontSize: 24 }} />
        </Box>
        <Box>
          <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: F.brand, lineHeight: 1.2 }}>
            AfricanShops Civic Platform
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: F.sub }}>
            Nigeria · Community-Driven Governance
          </Typography>
        </Box>
      </Box>

      {/* KYC verified badge */}
      <Box sx={{
        px: 2.5, py: 0.6, borderRadius: 20, mb: 3,
        background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)',
        display: 'flex', alignItems: 'center', gap: 1,
      }}>
        <CheckCircleIcon sx={{ fontSize: 16, color: '#4ade80' }} />
        <Typography sx={{ color: '#4ade80', fontSize: F.badge, fontWeight: 700, letterSpacing: 0.5 }}>
          IDENTITY VERIFIED
        </Typography>
      </Box>

      {/* Card */}
      <Box sx={{
        width: '100%', maxWidth: 600,
        flexShrink: 0,
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: 4, overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
      }}>

        {/* Hero */}
        <Box sx={{
          px: 3.5, pt: 4.5, pb: 3.5,
          background: 'linear-gradient(180deg, rgba(29,78,216,0.1) 0%, transparent 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        }}>
          <Box sx={{ position: 'relative', mb: 3 }}>
            {[1, 2].map((r) => (
              <Box key={r} sx={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%,-50%)',
                width: 88 + r * 28, height: 88 + r * 28, borderRadius: '50%',
                border: '1px solid rgba(29,78,216,0.15)',
                animation: `civicGlow ${2 + r * 0.7}s ease-in-out infinite`,
                animationDelay: `${r * 0.4}s`,
                '@keyframes civicGlow': {
                  '0%,100%': { opacity: 0.35, transform: 'translate(-50%,-50%) scale(1)'    },
                  '50%':     { opacity: 0.8,  transform: 'translate(-50%,-50%) scale(1.06)' },
                },
              }} />
            ))}
            <Box sx={{
              width: 88, height: 88, borderRadius: '50%', position: 'relative', zIndex: 1,
              background: 'linear-gradient(135deg, rgba(29,78,216,0.3), rgba(96,165,250,0.12))',
              border: '1.5px solid rgba(96,165,250,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 48px rgba(29,78,216,0.25)',
            }}>
              <VerifiedUserIcon sx={{
                fontSize: 46, color: '#60a5fa',
                animation: 'shieldFloat 3s ease-in-out infinite',
                '@keyframes shieldFloat': {
                  '0%,100%': { transform: 'translateY(0)'    },
                  '50%':     { transform: 'translateY(-5px)' },
                },
              }} />
            </Box>
          </Box>

          <Typography sx={{ fontWeight: 800, fontSize: F.title, color: '#fff', mb: 1.5, lineHeight: 1.25 }}>
            Activate Your Civic Access
          </Typography>
          <Typography sx={{ fontSize: F.body, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, maxWidth: 440 }}>
            Your identity is verified. One more step — activate your{' '}
            <strong style={{ color: '#93c5fd' }}>Civic User profile</strong> to unlock
            Nigeria's digital governance platform and all 6 civic modules.
          </Typography>
        </Box>

        <Box sx={{ px: 3.5, pt: 3, pb: 2.5 }}>

          {/* ── Biometric status ────────────────────────────────── */}
          <Typography sx={{ fontSize: F.label, letterSpacing: 0.6, color: 'rgba(255,255,255,0.35)', fontWeight: 600, mb: 1.5 }}>
            BIOMETRIC STATUS
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
            {/* Face scan */}
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1.5,
              p: 1.75, borderRadius: 2.5,
              background: faceVerified ? 'rgba(74,222,128,0.04)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${faceVerified ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.06)'}`,
            }}>
              <Box sx={{
                width: 36, height: 36, borderRadius: '9px', flexShrink: 0,
                background: faceVerified ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${faceVerified ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.1)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FaceIcon sx={{ fontSize: 18, color: faceVerified ? '#4ade80' : 'rgba(255,255,255,0.3)' }} />
              </Box>
              <Typography sx={{ flex: 1, fontSize: F.body, color: faceVerified ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.35)' }}>
                Face Scan
              </Typography>
              {faceVerified
                ? <CheckCircleIcon sx={{ fontSize: 18, color: '#4ade80' }} />
                : <Typography sx={{ fontSize: F.badge, color: 'rgba(255,255,255,0.25)' }}>Not done</Typography>
              }
            </Box>

            {/* Fingerprint */}
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1.5,
              p: 1.75, borderRadius: 2.5,
              background: biometricReg ? 'rgba(74,222,128,0.04)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${biometricReg ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.06)'}`,
            }}>
              <Box sx={{
                width: 36, height: 36, borderRadius: '9px', flexShrink: 0,
                background: biometricReg ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${biometricReg ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.1)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FingerprintIcon sx={{ fontSize: 18, color: biometricReg ? '#4ade80' : 'rgba(255,255,255,0.3)' }} />
              </Box>
              <Typography sx={{ flex: 1, fontSize: F.body, color: biometricReg ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.35)' }}>
                Fingerprint / Device Biometric
              </Typography>
              {biometricReg
                ? <CheckCircleIcon sx={{ fontSize: 18, color: '#4ade80' }} />
                : <Typography sx={{ fontSize: F.badge, color: 'rgba(255,255,255,0.25)' }}>Not done</Typography>
              }
            </Box>

            {/* "Add biometrics" nudge when only one is done */}
            {oneBiometric && !bothBiometrics && (
              <Button
                onClick={onManageBiometrics}
                startIcon={<AddCircleOutlineIcon />}
                sx={{
                  mt: 0.5, alignSelf: 'flex-start',
                  color: '#93c5fd', fontSize: F.badge, fontWeight: 600, textTransform: 'none',
                  px: 0, '&:hover': { color: '#60a5fa', background: 'transparent' },
                }}
              >
                Add {faceVerified ? 'fingerprint' : 'face scan'} for stronger bimodal security →
              </Button>
            )}

            {/* "Go to KYC wizard" for users with no biometrics at all */}
            {!oneBiometric && (
              <Button
                onClick={onManageBiometrics}
                startIcon={<AddCircleOutlineIcon />}
                sx={{
                  mt: 0.5, alignSelf: 'flex-start',
                  color: '#f9a8d4', fontSize: F.badge, fontWeight: 600, textTransform: 'none',
                  px: 0, '&:hover': { color: '#f472b6', background: 'transparent' },
                }}
              >
                Complete biometric verification in KYC wizard →
              </Button>
            )}
          </Box>

          {/* ── Module grid ─────────────────────────────────────── */}
          <Typography sx={{ fontSize: F.label, letterSpacing: 0.6, color: 'rgba(255,255,255,0.35)', fontWeight: 600, mb: 2 }}>
            WHAT YOU UNLOCK
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 3 }}>
            {MODULES.map(({ icon: Icon, label, color, desc }) => (
              <Box key={label} sx={{
                p: 2, borderRadius: 2.5,
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'flex-start', gap: 1.5,
                transition: 'border-color 0.2s',
                '&:hover': { borderColor: `${color}40` },
              }}>
                <Box sx={{
                  width: 36, height: 36, borderRadius: '9px', flexShrink: 0,
                  background: `${color}1a`, border: `1px solid ${color}33`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon sx={{ fontSize: 18, color }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: F.label, color: '#fff', fontWeight: 700, lineHeight: 1.3 }}>
                    {label}
                  </Typography>
                  <Typography sx={{ fontSize: F.badge, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
                    {desc}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          {/* ── Progress checklist ──────────────────────────────── */}
          <Box sx={{ p: 2.5, borderRadius: 2.5, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', mb: 3 }}>
            {[
              { done: true,  text: 'Identity document submitted' },
              { done: oneBiometric, text: oneBiometric ? `Biometric verified (${bothBiometrics ? 'face + fingerprint' : faceVerified ? 'face scan' : 'fingerprint'})` : 'Biometric verification pending' },
              { done: true,  text: 'KYC approved by compliance team' },
              { done: false, text: 'Activate Civic User profile', active: true },
            ].map(({ done, text, active }) => (
              <Box key={text} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.75 }}>
                <Box sx={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: done ? 'rgba(74,222,128,0.15)' : active ? 'rgba(96,165,250,0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1.5px solid ${done ? 'rgba(74,222,128,0.4)' : active ? 'rgba(96,165,250,0.4)' : 'rgba(255,255,255,0.1)'}`,
                }}>
                  {done
                    ? <CheckCircleIcon sx={{ fontSize: 14, color: '#4ade80' }} />
                    : <Box sx={{ width: 7, height: 7, borderRadius: '50%', background: active ? '#60a5fa' : 'rgba(255,255,255,0.2)' }} />
                  }
                </Box>
                <Typography sx={{
                  fontSize: F.body,
                  color: done ? 'rgba(255,255,255,0.65)' : active ? '#93c5fd' : 'rgba(255,255,255,0.3)',
                  fontWeight: active ? 700 : 400,
                }}>
                  {text}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Error */}
          {isError && (
            <Box sx={{
              p: 2, borderRadius: 2, mb: 2,
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              display: 'flex', gap: 1.5, alignItems: 'flex-start',
            }}>
              <ErrorOutlineIcon sx={{ fontSize: 18, color: '#f87171', flexShrink: 0, mt: 0.25 }} />
              <Typography sx={{ fontSize: F.body, color: '#fca5a5', lineHeight: 1.6 }}>
                {is404
                  ? 'Civic upgrade service is not yet live. Please check back shortly or contact support.'
                  : (error?.response?.data?.message ?? 'Upgrade failed. Please try again.')}
              </Typography>
            </Box>
          )}

          {/* Success */}
          {(isSuccess || upgraded) && (
            <Box sx={{
              p: 2.5, borderRadius: 2.5, mb: 2,
              background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)',
              display: 'flex', gap: 1.5, alignItems: 'center',
            }}>
              <CheckCircleIcon sx={{ fontSize: 22, color: '#4ade80', flexShrink: 0 }} />
              <Typography sx={{ fontSize: F.body, color: '#86efac', lineHeight: 1.6, fontWeight: 600 }}>
                Civic access activated! Redirecting you to the platform…
              </Typography>
            </Box>
          )}

          {/* CTA */}
          <Tooltip
            title={is404 ? 'Civic upgrade is coming soon — check back shortly' : ''}
            placement="top" arrow
          >
            <span style={{ display: 'block' }}>
              <Button
                fullWidth
                variant="contained"
                disabled={isLoading || upgraded || is404}
                onClick={handleUpgrade}
                endIcon={isLoading
                  ? <CircularProgress size={18} sx={{ color: 'rgba(255,255,255,0.6)' }} />
                  : <ArrowForwardIcon />
                }
                sx={{
                  py: 2, borderRadius: 3, fontWeight: 800, fontSize: F.btn,
                  background: (isLoading || upgraded || is404)
                    ? 'rgba(255,255,255,0.07)'
                    : 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 50%, #16a34a 100%)',
                  color: (isLoading || upgraded || is404) ? 'rgba(255,255,255,0.25)' : '#fff',
                  textTransform: 'none', letterSpacing: 0.5,
                  boxShadow: (isLoading || upgraded || is404) ? 'none' : '0 8px 32px rgba(29,78,216,0.35)',
                  transition: 'all 0.3s ease',
                  '&:hover': (isLoading || upgraded || is404) ? {} : {
                    boxShadow: '0 12px 40px rgba(29,78,216,0.5)',
                    transform: 'translateY(-1px)',
                  },
                  '&:disabled': { background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.25)' },
                }}
              >
                {isLoading ? 'Activating…' : upgraded ? 'Activated ✓' : 'Become a Civic User'}
              </Button>
            </span>
          </Tooltip>

          {/* Manage KYC link */}
          <Box sx={{ textAlign: 'center', mt: 2.5 }}>
            <Button
              onClick={onManageBiometrics}
              startIcon={<FingerprintIcon sx={{ fontSize: 16 }} />}
              sx={{
                color: 'rgba(255,255,255,0.3)', fontSize: F.sub, fontWeight: 500,
                textTransform: 'none',
                '&:hover': { color: 'rgba(255,255,255,0.6)', background: 'transparent' },
              }}
            >
              Manage biometrics / KYC settings
            </Button>
          </Box>
        </Box>
      </Box>

      <Typography sx={{ color: 'rgba(255,255,255,0.2)', fontSize: F.sub, textAlign: 'center', mt: 3, pb: 2 }}>
        Your information is sent over an encrypted connection.
      </Typography>
    </Box>
  );
}
