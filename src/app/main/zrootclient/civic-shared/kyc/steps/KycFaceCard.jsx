import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  LinearProgress,
  Typography,
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReplayIcon from '@mui/icons-material/Replay';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import { toast } from 'react-toastify';
import { useSubmitFace } from 'app/configs/data/server-calls/auth/userapp/a_kyc/useKycRepo';

// ─── module-level face-api.js model cache ──────────────────────────────────────
let _modelsReady = false;
let _modelsPromise = null;
function ensureModels() {
  if (_modelsReady) return Promise.resolve();
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

const TIPS = [
  'Look directly at the camera',
  'Ensure your face is well-lit',
  'Remove glasses if possible',
  'Keep a neutral expression',
];

// Live camera detection-state cues — kept as literal colors since they convey
// real-time state, not a themed brand color.
const detectionColor = { idle: '#60a5fa', scanning: '#f59e0b', found: '#4ade80', missed: '#ef4444' };
const detectionLabel = {
  idle: 'Ready to scan',
  scanning: 'Scanning…',
  found: 'Face detected ✓',
  missed: 'No face found — try again',
};

/**
 * Face Recognition card body. Shows a compact verified state with a
 * "Re-verify" action when already done, otherwise embeds the live camera
 * capture + face-api.js detection flow. All functional logic (model
 * loading, getUserMedia, face-api.js detection/descriptor extraction,
 * submitFace mutation) is unchanged from the previous KycBiometricStep's
 * face section — only layout/theme changed.
 */
export default function KycFaceCard({ faceVerified = false }) {
  const [localDone, setLocalDone] = useState(faceVerified);
  const [reverifying, setReverifying] = useState(false);
  // Camera/models only ever spin up after an explicit click — never just
  // from this card being on screen (it's always mounted now, unlike the
  // old locked-stepper design where the section only mounted on navigation).
  const [started, setStarted] = useState(false);

  const [modelState, setModelState] = useState('idle');
  const [cameraState, setCameraState] = useState('idle');
  const [detection, setDetection] = useState('idle');
  const [captured, setCaptured] = useState(false);
  const [preview, setPreview] = useState(null);
  const [descriptor, setDescriptor] = useState(null);
  const [tipIndex, setTipIndex] = useState(0);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const submitFace = useSubmitFace();

  const showCapture = !localDone || reverifying;

  // Sync prop changes (e.g. after KYC status refetch)
  useEffect(() => {
    if (faceVerified) setLocalDone(true);
  }, [faceVerified]);

  // Tips carousel
  useEffect(() => {
    if (!showCapture || !started) return;
    const t = setInterval(() => setTipIndex((i) => (i + 1) % TIPS.length), 3500);
    return () => clearInterval(t);
  }, [showCapture, started]);

  // Load face-api models — gated on `started`, not just showCapture, so the
  // model/camera chain never begins just because this card is mounted.
  useEffect(() => {
    if (!showCapture || !started || modelState !== 'idle') return;
    setModelState('loading');
    ensureModels()
      .then(() => setModelState('ready'))
      .catch(() => setModelState('error'));
  }, [showCapture, started, modelState]);

  // Open camera once models are ready
  useEffect(() => {
    if (modelState !== 'ready' || !showCapture || !started) return;
    setCameraState('starting');
    let stream;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } })
      .then((s) => {
        stream = s;
        streamRef.current = s;
        setCameraState('active');
      })
      .catch((err) => setCameraState(err.name === 'NotAllowedError' ? 'denied' : 'unavailable'));
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, [modelState, showCapture, started]);

  useEffect(() => {
    if (cameraState !== 'active' || !videoRef.current || !streamRef.current) return;
    videoRef.current.srcObject = streamRef.current;
    videoRef.current.play().catch(() => {});
  }, [cameraState]);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function openCapture() {
    stopCamera();
    setReverifying(true);
    setStarted(false);
    setModelState('idle');
    setCameraState('idle');
    setDetection('idle');
    setCaptured(false);
    setPreview(null);
    setDescriptor(null);
  }

  function handleCancel() {
    stopCamera();
    setStarted(false);
    setModelState('idle');
    setCameraState('idle');
    setDetection('idle');
  }

  async function handleCapture() {
    if (!videoRef.current || !_modelsReady) return;
    setDetection('scanning');
    try {
      const result = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();
      if (!result) {
        setDetection('missed');
        return;
      }
      const canvas = canvasRef.current;
      if (canvas && videoRef.current) {
        canvas.width = videoRef.current.videoWidth;
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
    setCaptured(false);
    setPreview(null);
    setDescriptor(null);
    setDetection('idle');
    _modelsReady = false;
    _modelsPromise = null;
    setModelState('idle');
    setCameraState('idle');
  }

  async function handleSubmit() {
    try {
      await submitFace.mutateAsync({ faceDescriptor: descriptor });
      setLocalDone(true);
      setReverifying(false);
      setStarted(false);
      stopCamera();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Face submission failed. Please retry.');
    }
  }

  if (!showCapture) {
    return (
      <div className="flex items-center justify-between mt-8">
        <div className="flex items-center gap-8">
          <CheckCircleIcon color="success" />
          <Typography>Verified ✓</Typography>
        </div>
        <Button variant="outlined" startIcon={<ReplayIcon />} onClick={openCapture}>
          Re-verify
        </Button>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="flex flex-col items-center gap-12 mt-8 py-16">
        <Typography color="text.secondary" className="text-center">
          Camera stays off until you start a scan.
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<CameraAltIcon />}
          onClick={() => setStarted(true)}
        >
          Start Face Scan
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 mt-8">
      {modelState === 'loading' && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography color="text.secondary">Loading face detection AI…</Typography>
            <CircularProgress size={16} />
          </Box>
          <LinearProgress sx={{ borderRadius: 2, height: 5 }} />
        </Box>
      )}

      {modelState === 'error' && (
        <Alert icon={<ErrorOutlineIcon />} severity="error">
          Face detection models not found in <code>/public/models/</code>. Contact support.
        </Alert>
      )}

      {modelState === 'ready' && cameraState === 'denied' && (
        <Alert severity="warning">Camera access denied. Grant permission in browser settings and retry.</Alert>
      )}

      {modelState === 'ready' && cameraState === 'unavailable' && (
        <Alert severity="error">No camera detected. A webcam is required.</Alert>
      )}

      {!captured && cameraState === 'active' && (
        <Box
          sx={{
            position: 'relative',
            borderRadius: 3,
            overflow: 'hidden',
            background: '#000',
            aspectRatio: '4 / 3',
            maxHeight: 520,
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
          />
          <Box
            component="svg"
            viewBox="0 0 640 480"
            sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          >
            <ellipse
              cx="320"
              cy="240"
              rx="140"
              ry="170"
              fill="none"
              stroke={detectionColor[detection]}
              strokeWidth="2.5"
              strokeDasharray="12 6"
              style={{
                transition: 'stroke 0.4s ease',
                animation: detection === 'scanning' ? 'dashRotate 1.2s linear infinite' : 'none',
              }}
            />
            <style>{`@keyframes dashRotate { to { stroke-dashoffset: -18; } }`}</style>
          </Box>
          <Box
            sx={{
              position: 'absolute',
              bottom: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              px: 2.5,
              py: 0.75,
              borderRadius: 20,
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(8px)',
              border: `1px solid ${detectionColor[detection]}33`,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 9,
                height: 9,
                borderRadius: '50%',
                bgcolor: detectionColor[detection],
                ...(detection === 'scanning' && {
                  animation: 'blink 0.8s ease-in-out infinite',
                  '@keyframes blink': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } },
                }),
              }}
            />
            <Typography sx={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600 }}>
              {detectionLabel[detection]}
            </Typography>
          </Box>
        </Box>
      )}

      {captured && preview && (
        <Box
          sx={{
            position: 'relative',
            borderRadius: 3,
            overflow: 'hidden',
            border: '2px solid rgba(74,222,128,0.4)',
            aspectRatio: '4 / 3',
            maxHeight: 520,
          }}
        >
          <img
            src={preview}
            alt="Captured"
            style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
          />
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.72))',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 14,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <CheckCircleIcon sx={{ color: '#4ade80', fontSize: 20 }} />
            <Typography sx={{ color: '#4ade80', fontWeight: 700 }}>Face captured</Typography>
          </Box>
        </Box>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {!captured && cameraState === 'active' && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1.75,
            borderRadius: 2.5,
            background: 'rgba(245,158,11,0.07)',
            border: '1px solid rgba(245,158,11,0.15)',
          }}
        >
          <LightbulbOutlinedIcon sx={{ fontSize: 18, color: '#f59e0b', flexShrink: 0 }} />
          <Typography color="text.secondary">{TIPS[tipIndex]}</Typography>
        </Box>
      )}

      <div className="flex gap-12">
        {!captured && cameraState === 'active' && (
          <Button variant="outlined" onClick={handleCancel} disabled={detection === 'scanning'}>
            Cancel
          </Button>
        )}
        {!captured && cameraState === 'active' && (
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            onClick={handleCapture}
            disabled={modelState !== 'ready' || detection === 'scanning'}
            startIcon={
              detection === 'scanning' ? <CircularProgress size={18} color="inherit" /> : <CameraAltIcon />
            }
          >
            {detection === 'scanning' ? 'Detecting Face…' : detection === 'missed' ? 'Try Again' : 'Capture Face'}
          </Button>
        )}
        {captured && (
          <>
            <Button variant="outlined" onClick={handleRetry} disabled={submitFace.isLoading} startIcon={<ReplayIcon />}>
              Retake
            </Button>
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              onClick={handleSubmit}
              disabled={submitFace.isLoading}
              startIcon={
                submitFace.isLoading ? <CircularProgress size={18} color="inherit" /> : <CheckCircleIcon />
              }
            >
              {submitFace.isLoading ? 'Submitting…' : 'Confirm & Save'}
            </Button>
          </>
        )}
      </div>

      <Typography variant="caption" color="text.secondary" className="text-center">
        Stored as a 128-point mathematical descriptor · No photo saved on our servers
      </Typography>
    </div>
  );
}
