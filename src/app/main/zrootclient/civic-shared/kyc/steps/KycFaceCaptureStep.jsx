import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import {
  Alert, Box, Button, CircularProgress, LinearProgress, Typography,
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReplayIcon from '@mui/icons-material/Replay';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import { toast } from 'react-toastify';
import { useSubmitFace } from 'app/configs/data/server-calls/auth/userapp/a_kyc/useKycRepo';
import DuplicateFaceDialog, { isDuplicateFaceError } from '../DuplicateFaceDialog';

const F = {
  heading: 'clamp(1.76rem, 2.6vw, 2.2rem)',
  sub:     'clamp(1.3rem,  1.8vw, 1.56rem)',
  body:    'clamp(1.5rem,  2.2vw, 1.9rem)',
  label:   'clamp(1.44rem, 2vw,   1.76rem)',
  small:   'clamp(1.3rem,  1.8vw, 1.56rem)',
  btn:     'clamp(1.3rem,  2vw,   1.76rem)',
  badge:   'clamp(1.3rem,  1.8vw, 1.5rem)',
};

// ─── module-level model cache ─────────────────────────────────────────────────
let _modelsReady = false;
let _modelsPromise = null;
async function ensureModels() {
  if (_modelsReady) return;
  if (_modelsPromise) return _modelsPromise;
  _modelsPromise = Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  ]).then(() => { _modelsReady = true; });
  return _modelsPromise;
}

const TIPS = [
  'Look directly at the camera',
  'Ensure your face is well-lit',
  'Remove glasses if possible',
  'Keep a neutral expression',
];

export default function KycFaceCaptureStep() {
  const videoRef  = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);

  const [modelState,  setModelState]  = useState('loading');
  const [cameraState, setCameraState] = useState('starting');
  const [detection,   setDetection]   = useState('idle');
  const [captured,    setCaptured]    = useState(false);
  const [preview,     setPreview]     = useState(null);
  const [descriptor,  setDescriptor]  = useState(null);
  const [tipIndex,    setTipIndex]    = useState(0);
  const [duplicateOpen, setDuplicateOpen] = useState(false);

  const submitFace = useSubmitFace();

  useEffect(() => {
    const t = setInterval(() => setTipIndex((i) => (i + 1) % TIPS.length), 3500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    ensureModels()
      .then(() => setModelState('ready'))
      .catch(() => setModelState('error'));
  }, []);

  useEffect(() => {
    if (modelState !== 'ready') return;
    let stream;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } })
      .then((s) => {
        stream = s; streamRef.current = s;
        setCameraState('active');
      })
      .catch((err) => setCameraState(err.name === 'NotAllowedError' ? 'denied' : 'unavailable'));
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, [modelState]);

  // Set srcObject after the video element mounts (cameraState === 'active' triggers its render)
  useEffect(() => {
    if (cameraState !== 'active' || !videoRef.current || !streamRef.current) return;
    videoRef.current.srcObject = streamRef.current;
    videoRef.current.play().catch(() => {});
  }, [cameraState]);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function handleCapture() {
    if (!videoRef.current || !_modelsReady) return;
    setDetection('scanning');
    try {
      const result = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!result) { setDetection('missed'); return; }

      const canvas = canvasRef.current;
      if (canvas && videoRef.current) {
        canvas.width  = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
        setPreview(canvas.toDataURL('image/jpeg', 0.85));
      }
      setDescriptor(Array.from(result.descriptor));
      setDetection('found');
      stopCamera();
      setCaptured(true);
    } catch {
      setDetection('idle');
      toast.error('Detection error. Please try again.');
    }
  }

  function handleRetry() {
    setCaptured(false); setPreview(null); setDescriptor(null);
    setDetection('idle'); setCameraState('starting'); setModelState('loading');
    _modelsReady = false; _modelsPromise = null;
    ensureModels().then(() => setModelState('ready')).catch(() => setModelState('error'));
  }

  async function handleSubmit() {
    try {
      await submitFace.mutateAsync({ faceDescriptor: descriptor });
    } catch (err) {
      if (isDuplicateFaceError(err)) {
        setDuplicateOpen(true);
        return;
      }
      toast.error(err?.response?.data?.message || 'Face submission failed. Please retry.');
    }
  }

  // After a refused duplicate the user must capture again (or sign in to the other account).
  function handleDuplicateClose() {
    setDuplicateOpen(false);
    handleRetry();
  }

  const detectionColor = { idle: '#60a5fa', scanning: '#f59e0b', found: '#4ade80', missed: '#ef4444' };
  const detectionLabel = { idle: 'Ready to scan', scanning: 'Scanning…', found: 'Face detected ✓', missed: 'No face found — try again' };

  return (
    <Box sx={{ color: '#fff' }}>
      <DuplicateFaceDialog open={duplicateOpen} onClose={handleDuplicateClose} />
      {/* Step header */}
      <Box sx={{ px: 3.5, pt: 3.5, pb: 2.5, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(96,165,250,0.15))',
            border: '1px solid rgba(96,165,250,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <CameraAltIcon sx={{ fontSize: 20, color: '#60a5fa' }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: F.heading, color: '#fff' }}>
              Face Verification
            </Typography>
            <Typography sx={{ fontSize: F.sub, color: 'rgba(255,255,255,0.4)' }}>
              Step 1 of 4 · Live capture required
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ px: 3.5, py: 3 }}>
        {/* Model loading */}
        {modelState === 'loading' && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography sx={{ fontSize: F.body, color: 'rgba(255,255,255,0.65)' }}>
                Loading face detection AI…
              </Typography>
              <CircularProgress size={16} sx={{ color: '#60a5fa' }} />
            </Box>
            <LinearProgress sx={{
              borderRadius: 2, height: 5, bgcolor: 'rgba(255,255,255,0.08)',
              '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg,#3b82f6,#60a5fa)' },
            }} />
            <Typography sx={{ fontSize: F.small, color: 'rgba(255,255,255,0.3)', mt: 1 }}>
              Model files served from /public/models/ · First load may take a few seconds
            </Typography>
          </Box>
        )}

        {modelState === 'error' && (
          <Alert icon={<ErrorOutlineIcon />} severity="error"
            sx={{ mb: 3, bgcolor: 'rgba(239,68,68,0.1)', color: '#fca5a5',
              border: '1px solid rgba(239,68,68,0.2)',
              '& .MuiAlert-message': { fontSize: F.body } }}>
            Face detection models not found in <code>/public/models/</code>. Run the model download script and rebuild the Docker image.
          </Alert>
        )}

        {modelState === 'ready' && cameraState === 'denied' && (
          <Alert severity="warning" sx={{ mb: 3, bgcolor: 'rgba(245,158,11,0.1)', color: '#fcd34d',
            border: '1px solid rgba(245,158,11,0.2)',
            '& .MuiAlert-message': { fontSize: F.body } }}>
            Camera access denied. Grant permission in your browser settings and refresh.
          </Alert>
        )}

        {modelState === 'ready' && cameraState === 'unavailable' && (
          <Alert severity="error" sx={{ mb: 3, bgcolor: 'rgba(239,68,68,0.1)', color: '#fca5a5',
            border: '1px solid rgba(239,68,68,0.2)',
            '& .MuiAlert-message': { fontSize: F.body } }}>
            No camera detected. A webcam is required for face verification.
          </Alert>
        )}

        {/* Live feed */}
        {!captured && cameraState === 'active' && (
          <Box sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden', mb: 3,
            background: '#000', border: '1px solid rgba(255,255,255,0.08)' }}>
            <video ref={videoRef} autoPlay playsInline muted
              style={{ width: '100%', display: 'block', maxHeight: 320, objectFit: 'cover' }} />

            <Box component="svg" viewBox="0 0 640 480"
              sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              <ellipse cx="320" cy="240" rx="140" ry="170"
                fill="none" stroke={detectionColor[detection]} strokeWidth="2.5" strokeDasharray="12 6"
                style={{
                  transition: 'stroke 0.4s ease',
                  animation: detection === 'scanning' ? 'dashRotate 1.2s linear infinite' : 'none',
                }} />
              <style>{`@keyframes dashRotate { to { stroke-dashoffset: -18; } }`}</style>
            </Box>

            {detection === 'scanning' && (
              <Box sx={{
                position: 'absolute', left: '15%', right: '15%', height: 2,
                background: 'linear-gradient(90deg, transparent, #60a5fa, transparent)',
                animation: 'scanLine 1.2s ease-in-out infinite',
                '@keyframes scanLine': {
                  '0%': { top: '20%', opacity: 0.8 }, '50%': { opacity: 1 }, '100%': { top: '80%', opacity: 0.8 },
                },
              }} />
            )}

            <Box sx={{
              position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
              px: 2.5, py: 0.75, borderRadius: 20,
              background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
              border: `1px solid ${detectionColor[detection]}33`,
              display: 'flex', alignItems: 'center', gap: 1,
            }}>
              <Box sx={{
                width: 9, height: 9, borderRadius: '50%', bgcolor: detectionColor[detection],
                ...(detection === 'scanning' && {
                  animation: 'blink 0.8s ease-in-out infinite',
                  '@keyframes blink': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } },
                }),
              }} />
              <Typography sx={{ fontSize: F.badge, color: '#fff', fontWeight: 600 }}>
                {detectionLabel[detection]}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Captured preview */}
        {captured && preview && (
          <Box sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden', mb: 3,
            border: '2px solid rgba(74,222,128,0.4)', boxShadow: '0 0 32px rgba(74,222,128,0.15)' }}>
            <img src={preview} alt="Captured"
              style={{ width: '100%', display: 'block', maxHeight: 300, objectFit: 'cover' }} />
            <Box sx={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.72))',
            }} />
            <Box sx={{ position: 'absolute', bottom: 14, left: 0, right: 0,
              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
              <CheckCircleIcon sx={{ color: '#4ade80', fontSize: 22 }} />
              <Typography sx={{ color: '#4ade80', fontWeight: 700, fontSize: F.label }}>
                Face captured successfully
              </Typography>
            </Box>
          </Box>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Tip carousel */}
        {!captured && cameraState === 'active' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3,
            p: 2, borderRadius: 2.5, background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.15)' }}>
            <LightbulbOutlinedIcon sx={{ fontSize: 20, color: '#f59e0b', flexShrink: 0 }} />
            <Typography sx={{ fontSize: F.body, color: 'rgba(255,255,255,0.65)' }}>
              {TIPS[tipIndex]}
            </Typography>
          </Box>
        )}

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          {!captured && cameraState === 'active' && (
            <Button fullWidth variant="contained"
              onClick={handleCapture}
              disabled={modelState !== 'ready' || detection === 'scanning'}
              startIcon={detection === 'scanning' ? <CircularProgress size={18} color="inherit" /> : <CameraAltIcon />}
              sx={{
                py: 1.6, borderRadius: 2.5, fontWeight: 700, fontSize: F.btn,
                background: detection === 'scanning' ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                '&:hover': { background: 'linear-gradient(135deg, #1e40af, #2563eb)' },
              }}
            >
              {detection === 'scanning' ? 'Detecting Face…' : detection === 'missed' ? 'Try Again' : 'Capture Face'}
            </Button>
          )}

          {captured && (
            <>
              <Button variant="outlined" onClick={handleRetry} disabled={submitFace.isLoading}
                startIcon={<ReplayIcon />}
                sx={{
                  borderRadius: 2.5, fontSize: F.btn,
                  borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)',
                  '&:hover': { borderColor: 'rgba(255,255,255,0.4)', bgcolor: 'rgba(255,255,255,0.05)' },
                }}>
                Retake
              </Button>
              <Button fullWidth variant="contained"
                onClick={handleSubmit} disabled={submitFace.isLoading}
                startIcon={submitFace.isLoading ? <CircularProgress size={18} color="inherit" /> : <CheckCircleIcon />}
                sx={{
                  py: 1.6, borderRadius: 2.5, fontWeight: 700, fontSize: F.btn,
                  background: 'linear-gradient(135deg, #16a34a, #4ade80)',
                  '&:hover': { background: 'linear-gradient(135deg, #15803d, #22c55e)' },
                }}>
                {submitFace.isLoading ? 'Submitting…' : 'Confirm & Continue'}
              </Button>
            </>
          )}
        </Box>

        <Typography sx={{ fontSize: F.small, color: 'rgba(255,255,255,0.25)', mt: 2.5, textAlign: 'center' }}>
          Face data is stored as a 128-point mathematical descriptor. No photo is saved on our servers.
        </Typography>
      </Box>
    </Box>
  );
}
