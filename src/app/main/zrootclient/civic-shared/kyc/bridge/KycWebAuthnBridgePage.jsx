import { useState } from 'react';
import { startRegistration } from '@simplewebauthn/browser';
import axios from 'axios';
import { Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { baseUrl } from 'app/configs/data/client/RepositoryAuthClient';

// See KycFaceCaptureBridgePage.jsx for the shared native<->WebView bridge
// contract (injected window.__KYC_BRIDGE_TOKEN__, postMessage results back).
// This page runs the FIDO2/WebAuthn registration ceremony in a real browser
// context (navigator.credentials.create() via @simplewebauthn/browser) so
// the origin/RP ID auth-service expects actually matches, rather than
// hand-rolling attestation encoding natively.

function postToNative(payload) {
  if (typeof window !== 'undefined' && window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify(payload));
  }
}

const webAuthnSupported = () => typeof window !== 'undefined' && !!window.PublicKeyCredential;

export default function KycWebAuthnBridgePage() {
  const [deviceName, setDeviceName] = useState('');
  const [state, setState] = useState('idle'); // idle | prompting | success | error
  const [error, setError] = useState(null);

  async function handleEnroll() {
    const token = window.__KYC_BRIDGE_TOKEN__;
    if (!token) {
      setError('Missing auth token from host app.');
      postToNative({ type: 'KYC_WEBAUTHN_ERROR', message: 'Missing auth token from host app.' });
      return;
    }
    if (!deviceName.trim()) {
      setError('Name this device first.');
      return;
    }
    if (!webAuthnSupported()) {
      setError('This device does not support WebAuthn.');
      postToNative({ type: 'KYC_WEBAUTHN_ERROR', message: 'WebAuthn not supported on this device.' });
      return;
    }

    setError(null);
    setState('prompting');
    const authHeaders = { headers: { userauthcredential: token } };

    try {
      const { data: options } = await axios.get(`${baseUrl}/auth-user/kyc/webauthn/register/options`, authHeaders);
      const attestation = await startRegistration(options);
      await axios.post(
        `${baseUrl}/auth-user/kyc/webauthn/register/verify`,
        { attestationResponse: attestation, deviceName: deviceName.trim() },
        authHeaders,
      );
      setState('success');
      postToNative({ type: 'KYC_WEBAUTHN_REGISTERED', deviceName: deviceName.trim() });
    } catch (err) {
      setState('error');
      let message;
      if (err.name === 'NotAllowedError') message = 'Biometric authentication was cancelled.';
      else if (err.name === 'InvalidStateError') message = 'This device may already be enrolled.';
      else message = err?.response?.data?.message || err.message || 'Enrollment failed. Please retry.';
      setError(message);
      postToNative({ type: 'KYC_WEBAUTHN_ERROR', message });
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#050d18', color: '#fff', p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
      <Typography sx={{ fontWeight: 700, fontSize: '1.1rem' }}>Register Device Biometric</Typography>

      {state !== 'success' && (
        <>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Name this device (e.g. My Phone)"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            sx={{
              maxWidth: 320,
              '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } },
            }}
          />
          <Button
            variant="contained"
            onClick={handleEnroll}
            disabled={state === 'prompting'}
            sx={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', borderRadius: 2.5, fontWeight: 700 }}
          >
            {state === 'prompting' ? <CircularProgress size={18} color="inherit" /> : 'Register Biometric'}
          </Button>
        </>
      )}

      {state === 'success' && (
        <Typography sx={{ color: '#4ade80', fontWeight: 700 }}>Device registered ✓</Typography>
      )}

      {error && (
        <Typography sx={{ color: '#fca5a5', fontSize: '0.85rem', textAlign: 'center', maxWidth: 320 }}>{error}</Typography>
      )}
    </Box>
  );
}
