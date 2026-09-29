import { useState } from 'react';
import { startRegistration } from '@simplewebauthn/browser';
import { Alert, Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import DevicesIcon from '@mui/icons-material/Devices';
import { toast } from 'react-toastify';
import {
  useGetWebAuthnRegOptions,
  useVerifyWebAuthnReg,
} from 'app/configs/data/server-calls/auth/userapp/a_kyc/useKycRepo';

const webAuthnSupported = () => typeof window !== 'undefined' && !!window.PublicKeyCredential;

function formatDate(value) {
  if (!value) return null;
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return null;
  }
}

/**
 * Biometric Device (WebAuthn) card body. Lists enrolled devices when any
 * exist and shows a "Register another device" action, otherwise opens
 * straight into the registration flow. All functional logic (WebAuthn
 * registration options fetch, startRegistration, verify mutation) is
 * unchanged from the previous KycBiometricStep's fingerprint section —
 * only layout/theme changed.
 */
export default function KycWebAuthnCard({ enrolledDevices = [] }) {
  const [enrolling, setEnrolling] = useState(enrolledDevices.length === 0);
  const [deviceName, setDeviceName] = useState('');
  const [nameError, setNameError] = useState('');
  const [fpState, setFpState] = useState('idle');
  const getOptions = useGetWebAuthnRegOptions();
  const verifyReg = useVerifyWebAuthnReg();

  async function handleEnroll() {
    if (!deviceName.trim()) {
      setNameError('Name this device first');
      return;
    }
    setNameError('');
    setFpState('prompt');
    try {
      const optResp = await getOptions.mutateAsync();
      const options = optResp?.data;
      if (!options) throw new Error('No registration options from server');
      const attestation = await startRegistration(options);
      await verifyReg.mutateAsync({ attestationResponse: attestation, deviceName: deviceName.trim() });
      setFpState('success');
      setDeviceName('');
      setEnrolling(false);
    } catch (err) {
      setFpState('error');
      if (err.name === 'NotAllowedError') toast.error('Biometric authentication was cancelled.');
      else if (err.name === 'InvalidStateError') toast.warning('This device may already be enrolled.');
      else toast.error(err?.response?.data?.message || err.message || 'Enrolment failed. Please retry.');
    }
  }

  if (!enrolling) {
    return (
      <div className="flex flex-col gap-12 mt-8">
        <div className="flex flex-col gap-8">
          {enrolledDevices.map((device, i) => (
            <div
              key={`${device.deviceName}-${i}`}
              className="flex items-center gap-12 p-12 rounded-xl"
              style={{ border: '1px solid', borderColor: 'rgba(0,0,0,0.08)' }}
            >
              <DevicesIcon color="action" />
              <div className="flex-1">
                <Typography className="font-medium">{device.deviceName || 'Unknown device'}</Typography>
                {formatDate(device.registeredAt) && (
                  <Typography variant="caption" color="text.secondary">
                    Registered {formatDate(device.registeredAt)}
                  </Typography>
                )}
              </div>
            </div>
          ))}
        </div>
        <Button
          variant="outlined"
          startIcon={<FingerprintIcon />}
          onClick={() => {
            setFpState('idle');
            setEnrolling(true);
          }}
        >
          Register another device
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 mt-8">
      {!webAuthnSupported() ? (
        <Alert icon={<ErrorOutlineIcon />} severity="error">
          WebAuthn is not available in this browser. Use Chrome, Firefox, or Safari on a device with a fingerprint
          sensor or Face ID.
        </Alert>
      ) : (
        <>
          <Box className="flex flex-col items-center">
            <Box sx={{ position: 'relative', width: 96, height: 96, mb: 2 }}>
              {[1, 2, 3].map((ring) => (
                <Box
                  key={ring}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 96,
                    height: 96,
                    borderRadius: '50%',
                    border: '1.5px solid',
                    borderColor: fpState === 'prompt' ? 'secondary.main' : 'divider',
                    ...(fpState === 'prompt' && {
                      animation: `rippleRing ${1.4 + ring * 0.4}s ease-out infinite`,
                      animationDelay: `${ring * 0.3}s`,
                    }),
                    '@keyframes rippleRing': {
                      '0%': { transform: 'translate(-50%,-50%) scale(0.7)', opacity: 0.8 },
                      '100%': { transform: 'translate(-50%,-50%) scale(1.9)', opacity: 0 },
                    },
                  }}
                />
              ))}
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: fpState === 'prompt' ? 'secondary.main' : 'action.hover',
                }}
              >
                {fpState === 'prompt' ? (
                  <CircularProgress size={28} thickness={2.5} sx={{ color: '#fff' }} />
                ) : (
                  <FingerprintIcon sx={{ fontSize: 34 }} color={fpState === 'error' ? 'error' : 'action'} />
                )}
              </Box>
            </Box>
            <Typography className="font-semibold text-center" color={fpState === 'error' ? 'error' : 'text.primary'}>
              {fpState === 'prompt'
                ? 'Touch your fingerprint sensor or use Face ID…'
                : fpState === 'error'
                  ? 'Enrolment failed — please retry'
                  : 'Ready to enrol biometrics'}
            </Typography>
          </Box>

          <div className="flex items-start gap-12">
            <TextField
              fullWidth
              label="Device Name"
              placeholder="e.g. My iPhone, Work Laptop, Home Desktop"
              value={deviceName}
              onChange={(e) => {
                setDeviceName(e.target.value);
                setNameError('');
              }}
              error={!!nameError}
              helperText={nameError || 'A recognisable label for this authenticator device'}
              disabled={fpState === 'prompt'}
              inputProps={{ maxLength: 40 }}
              size="small"
            />
          </div>

          <Button
            fullWidth
            variant="contained"
            color={fpState === 'error' ? 'error' : 'secondary'}
            onClick={handleEnroll}
            disabled={fpState === 'prompt' || getOptions.isLoading || verifyReg.isLoading}
            startIcon={fpState === 'prompt' ? <CircularProgress size={18} color="inherit" /> : <FingerprintIcon />}
          >
            {fpState === 'prompt' ? 'Awaiting biometric…' : fpState === 'error' ? 'Retry Enrolment' : 'Enrol Fingerprint / Face ID'}
          </Button>

          {enrolledDevices.length > 0 && (
            <Button variant="text" onClick={() => setEnrolling(false)}>
              Cancel — back to device list
            </Button>
          )}
        </>
      )}

      <Typography variant="caption" color="text.secondary" className="text-center">
        Powered by WebAuthn (FIDO2) · Biometric data never leaves your device
      </Typography>
    </div>
  );
}
