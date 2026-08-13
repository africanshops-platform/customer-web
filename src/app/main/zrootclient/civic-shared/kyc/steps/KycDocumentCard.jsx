import { useRef, useState } from 'react';
import { Box, Button, CircularProgress, LinearProgress, TextField, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import { toast } from 'react-toastify';
import {
  uploadDocumentImage,
  useSubmitDocument,
} from 'app/configs/data/server-calls/auth/userapp/a_kyc/useKycRepo';

const DOC_TYPES = [
  { value: 'NIN', label: 'NIN', sublabel: 'National Identity', icon: '🪪', placeholder: 'e.g. 12345678901' },
  { value: 'PASSPORT', label: 'Passport', sublabel: 'International', icon: '📕', placeholder: 'e.g. A12345678' },
  {
    value: 'DRIVERS_LICENSE',
    label: "Driver's Lic",
    sublabel: "Driver's Licence",
    icon: '🚗',
    placeholder: 'e.g. ABC001234',
  },
];

const DOC_LABEL = {
  NIN: 'National Identity Number (NIN)',
  PASSPORT: 'International Passport',
  DRIVERS_LICENSE: "Driver's Licence",
};

// ─── Summary shown when documentSubmitted === true ─────────────────────────────
function DocumentSubmittedSummary({ documentType, onUpdate }) {
  const label = DOC_LABEL[documentType] ?? 'Identity Document';
  return (
    <div className="flex items-center justify-between mt-8">
      <div className="flex items-center gap-8">
        <CheckCircleIcon color="success" />
        <div>
          <Typography className="font-medium">{label}</Typography>
          <Typography variant="caption" color="text.secondary">
            Submitted — awaiting admin review
          </Typography>
        </div>
      </div>
      <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onUpdate}>
        Update
      </Button>
    </div>
  );
}

/**
 * Identity Document card body. Shows a compact submitted summary with an
 * "Update" action when already done, otherwise the document type / legal
 * name / document number / photo upload form. All functional logic (file
 * validation, Cloudinary upload via uploadDocumentImage, submitDocument
 * mutation) is unchanged from the previous KycDocumentStep — only
 * layout/theme changed.
 */
export default function KycDocumentCard({ completed = false, documentType = null }) {
  // When already completed, start in "view" mode (summary); user can switch to edit form
  const [showForm, setShowForm] = useState(!completed);

  const fileRef = useRef(null);

  const [docType, setDocType] = useState('NIN');
  const [legalName, setLegalName] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});

  const submitDocument = useSubmitDocument();
  const selectedDoc = DOC_TYPES.find((d) => d.value === docType);

  function handleFile(selected) {
    if (!selected) return;
    if (!selected.type.startsWith('image/')) {
      toast.warning('Please select an image file.');
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      toast.warning('File must be under 5 MB.');
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setErrors((e) => ({ ...e, file: undefined }));
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  function validate() {
    const errs = {};
    if (!legalName.trim()) errs.legalName = 'Full legal name is required';
    if (!docNumber.trim()) errs.docNumber = 'Document number is required';
    if (!file) errs.file = 'Upload a clear photo of your document';
    return errs;
  }

  async function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setUploading(true);
    setUploadProgress(0);

    const t = setInterval(() => setUploadProgress((p) => (p < 82 ? p + 11 : p)), 300);
    try {
      const imageUrl = await uploadDocumentImage(file);
      setUploadProgress(100);
      clearInterval(t);
      await submitDocument.mutateAsync({
        documentType: docType,
        documentNumber: docNumber.trim().toUpperCase(),
        documentImageUrl: imageUrl,
        legalName: legalName.trim(),
      });
      setShowForm(false);
    } catch (err) {
      clearInterval(t);
      toast.error(err?.response?.data?.message || err.message || 'Submission failed. Please retry.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }

  const busy = uploading || submitDocument.isLoading;

  if (completed && !showForm) {
    return <DocumentSubmittedSummary documentType={documentType} onUpdate={() => setShowForm(true)} />;
  }

  return (
    <div className="flex flex-col gap-12 mt-8">
      {/* Document type cards */}
      <Typography variant="caption" className="font-semibold" color="text.secondary">
        SELECT DOCUMENT TYPE
      </Typography>
      <div className="flex gap-12">
        {DOC_TYPES.map((d) => {
          const selected = docType === d.value;
          return (
            <Box
              key={d.value}
              onClick={() => !busy && setDocType(d.value)}
              sx={{
                flex: 1,
                p: 1.75,
                borderRadius: 2.5,
                cursor: busy ? 'default' : 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease',
                border: '1.5px solid',
                borderColor: selected ? 'secondary.main' : 'divider',
                bgcolor: selected ? 'action.selected' : 'transparent',
              }}
            >
              <Typography sx={{ fontSize: '1.8rem', lineHeight: 1, mb: 0.75 }}>{d.icon}</Typography>
              <Typography className="font-semibold" color={selected ? 'secondary.main' : 'text.primary'}>
                {d.label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {d.sublabel}
              </Typography>
            </Box>
          );
        })}
      </div>

      {/* Full legal name — the canonical name matched against later (e.g. withdrawal beneficiaries) */}
      <TextField
        fullWidth
        label="Full Legal Name"
        value={legalName}
        onChange={(e) => {
          setLegalName(e.target.value);
          setErrors((er) => ({ ...er, legalName: undefined }));
        }}
        error={!!errors.legalName}
        helperText={errors.legalName || 'Exactly as it appears on your ID document'}
        disabled={busy}
        placeholder="e.g. Eke Ferdinand Udoka"
        size="small"
      />

      {/* Document number */}
      <TextField
        fullWidth
        label="Document Number"
        value={docNumber}
        onChange={(e) => {
          setDocNumber(e.target.value);
          setErrors((er) => ({ ...er, docNumber: undefined }));
        }}
        error={!!errors.docNumber}
        helperText={errors.docNumber || `Enter the number exactly as it appears on your ${selectedDoc?.label}`}
        disabled={busy}
        placeholder={selectedDoc?.placeholder}
        inputProps={{ style: { textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: 3 } }}
        size="small"
      />

      {/* Drop zone */}
      <Typography variant="caption" className="font-semibold" color="text.secondary">
        DOCUMENT PHOTO
      </Typography>
      <Box
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !busy && fileRef.current?.click()}
        sx={{
          borderRadius: 3,
          cursor: busy ? 'default' : 'pointer',
          border: '2px dashed',
          borderColor: errors.file ? 'error.main' : isDragging ? 'secondary.main' : 'divider',
          bgcolor: isDragging ? 'action.hover' : 'transparent',
          transition: 'all 0.2s ease',
          overflow: 'hidden',
        }}
      >
        {preview ? (
          <Box sx={{ position: 'relative' }}>
            <img src={preview} alt="Document" style={{ width: '100%', display: 'block', maxHeight: 200, objectFit: 'cover' }} />
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.72))',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                pb: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EditIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.85)' }} />
                <Typography sx={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)' }}>
                  Click or drag to replace
                </Typography>
              </Box>
            </Box>
          </Box>
        ) : (
          <Box sx={{ py: 4.5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '14px',
                bgcolor: 'action.hover',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CloudUploadIcon color="secondary" />
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography className="font-medium">
                {isDragging ? 'Drop it here!' : 'Drag & drop or click to upload'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                JPG, PNG, WEBP · Max 5 MB
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {errors.file && (
        <Typography variant="caption" color="error">
          {errors.file}
        </Typography>
      )}

      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files?.[0])} />

      {/* Upload progress */}
      {uploading && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {uploadProgress < 100 ? 'Uploading to secure storage…' : 'Upload complete'}
            </Typography>
            <Typography variant="caption" color="secondary" className="font-semibold">
              {uploadProgress}%
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={uploadProgress} sx={{ borderRadius: 2, height: 5 }} />
        </Box>
      )}

      <Button
        fullWidth
        variant="contained"
        color="secondary"
        onClick={handleSubmit}
        disabled={busy}
        startIcon={busy ? <CircularProgress size={18} color="inherit" /> : <CheckCircleIcon />}
      >
        {busy ? (uploading ? 'Uploading…' : 'Submitting Document…') : 'Submit Document'}
      </Button>

      <Typography variant="caption" color="text.secondary" className="text-center">
        Document data is encrypted in transit and at rest. Used solely for identity verification.
      </Typography>
    </div>
  );
}
