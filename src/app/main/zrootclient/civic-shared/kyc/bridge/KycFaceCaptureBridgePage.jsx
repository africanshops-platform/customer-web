import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import axios from 'axios';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { baseUrl } from 'app/configs/data/client/RepositoryAuthClient';
import DuplicateFaceDialog, { DUPLICATE_FACE_BODY, isDuplicateFaceError } from '../DuplicateFaceDialog';

// ─── Native <-> WebView bridge ────────────────────────────────────────────────
//
// This page is never opened by a person in a normal browser tab -- it is
// loaded inside a react-native-webview host by the mobile apps (civic-mobile
// today) so that face-api.js/getUserMedia can run in a real browser context,
// since neither exists natively in React Native and adding a native face
// library would mean a new native module + a full EAS rebuild before any of
// this could even be tested. The mobile host authenticates by injecting
// window.__KYC_BRIDGE_TOKEN__ via injectedJavaScriptBeforeContentLoaded --
// never via the URL, which would leak the token into browser history/logs.
// The result is relayed back the same way every RN WebView expects:
// window.ReactNativeWebView.postMessage(JSON.stringify(...)).
//
// This page is intentionally NOT wired through AuthApi() / the normal
// civic-web auth context -- the WebView has no access to this app's own
// localStorage session, so it authenticates purely via the injected token.

function postToNative(payload) {
  if (typeof window !== 'undefined' && window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify(payload));
  }
}

let _modelsReady = false;
let _modelsPromise = null;
async function ensureModels() {
  if (_modelsReady) return undefined;
  if (_modelsPromise) return _modelsPromise;
  _modelsPromise = Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  ]).then(() => {
    _modelsReady = true;
  });
  return _modelsPromise;
}

function captureButtonLabel(detection) {
  if (detection === 'scanning') return 'Detecting…';
  if (detection === 'missed') return 'Try Again';
  return 'Capture Face';
}

export default function KycFaceCaptureBridgePage() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [modelState, setModelState] = useState('loading');
  const [cameraState, setCameraState] = useState('starting');
  const [detection, setDetection] = useState('idle');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  // Bumped to restart the camera after a failed submission (the stream is stopped once a face is captured).
  const [cameraAttempt, setCameraAttempt] = useState(0);

  useEffect(() => {
    ensureModels()
      .then(() => setModelState('ready'))
      .catch(() => setModelState('error'));
  }, []);

  useEffect(() => {
    if (modelState !== 'ready') return undefined;
    let stream;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } })
      .then((s) => {
        stream = s;
        streamRef.current = s;
        setCameraState('active');
      })
      .catch((err) => setCameraState(err.name === 'NotAllowedError' ? 'denied' : 'unavailable'));
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [modelState, cameraAttempt]);

  useEffect(() => {
    if (cameraState !== 'active' || !videoRef.current || !streamRef.current) return;
    videoRef.current.srcObject = streamRef.current;
    videoRef.current.play().catch(() => undefined);
  }, [cameraState]);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function handleCapture() {
    if (!videoRef.current || !_modelsReady) return;
    setDetection('scanning');
    setError(null);
    try {
      const result = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!result) {
        setDetection('missed');
        return;
      }

      const descriptor = Array.from(result.descriptor);
      stopCamera();
      setDetection('found');
      await submitDescriptor(descriptor);
    } catch {
      setDetection('idle');
      setError('Detection error. Please try again.');
    }
  }

  // After a refused/failed submission the camera was already stopped and detection sits on "found" with no button,
  // which stranded the user. Reset so they can capture again.
  function resetForRetry() {
    setDetection('idle');
    setDuplicateOpen(false);
    setCameraState('starting');
    setCameraAttempt((n) => n + 1);
  }

  async function submitDescriptor(descriptor) {
    const token = window.__KYC_BRIDGE_TOKEN__;
    if (!token) {
      setError('Missing auth token from host app.');
      postToNative({ type: 'KYC_FACE_ERROR', message: 'Missing auth token from host app.' });
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(
        `${baseUrl}/auth-user/kyc/face`,
        { faceDescriptor: descriptor },
        { headers: { userauthcredential: token } },
      );
      postToNative({ type: 'KYC_FACE_CAPTURED' });
    } catch (err) {
      if (isDuplicateFaceError(err)) {
        // One face, one account: the host app shows its own native pop-up; a plain browser shows the dialog below.
        postToNative({ type: 'KYC_FACE_DUPLICATE', message: DUPLICATE_FACE_BODY });
        setDuplicateOpen(true);
      } else {
        const message = err?.response?.data?.message || 'Face submission failed. Please retry.';
        setError(message);
        postToNative({ type: 'KYC_FACE_ERROR', message });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#050d18', color: '#fff', p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', mb: 2 }}>Face Verification</Typography>

      {modelState === 'loading' && <CircularProgress size={28} sx={{ color: '#60a5fa', mb: 2 }} />}
      {modelState === 'error' && (
        <Typography sx={{ color: '#fca5a5', fontSize: '0.85rem', textAlign: 'center', mb: 2 }}>
          Face detection models failed to load.
        </Typography>
      )}
      {modelState === 'ready' && cameraState === 'denied' && (
        <Typography sx={{ color: '#fcd34d', fontSize: '0.85rem', textAlign: 'center', mb: 2 }}>
          Camera access denied.
        </Typography>
      )}
      {modelState === 'ready' && cameraState === 'unavailable' && (
        <Typography sx={{ color: '#fca5a5', fontSize: '0.85rem', textAlign: 'center', mb: 2 }}>
          No camera detected.
        </Typography>
      )}

      {cameraState === 'active' && detection !== 'found' && (
        <Box sx={{ width: '100%', maxWidth: 360, borderRadius: 3, overflow: 'hidden', mb: 2, bgcolor: '#000' }}>
          <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', display: 'block', maxHeight: 320, objectFit: 'cover' }} />
        </Box>
      )}

      {detection === 'found' && !error && !duplicateOpen && (
        <Typography sx={{ color: '#4ade80', fontWeight: 700, mb: 2 }}>
          {submitting ? 'Submitting…' : 'Face captured ✓'}
        </Typography>
      )}

      {error && (
        <Typography sx={{ color: '#fca5a5', fontSize: '0.85rem', textAlign: 'center', mb: 2 }}>{error}</Typography>
      )}

      {detection === 'found' && error && !submitting && (
        <Button variant="outlined" onClick={resetForRetry} sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)', borderRadius: 2.5, fontWeight: 700 }}>
          Try Again
        </Button>
      )}

      <DuplicateFaceDialog open={duplicateOpen} onClose={resetForRetry} />

      {cameraState === 'active' && detection !== 'found' && (
        <Button
          variant="contained"
          onClick={handleCapture}
          disabled={modelState !== 'ready' || detection === 'scanning'}
          sx={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', borderRadius: 2.5, fontWeight: 700 }}
        >
          {captureButtonLabel(detection)}
        </Button>
      )}
    </Box>
  );
}
