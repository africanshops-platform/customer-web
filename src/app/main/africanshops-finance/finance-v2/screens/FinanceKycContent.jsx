import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { uploadDocumentImage } from 'app/configs/data/server-calls/auth/userapp/a_kyc/useKycRepo';
import { useFinanceTheme } from '../FinanceThemeContext';
import {
  useFintechKycStatus,
  useSubmitNationalId,
  useSubmitIdentity,
  useSubmitUtilityBill,
} from '../hooks/useFintechApi';

const F = {
  pageTitle: 'clamp(2.2rem, 3.5vw, 2.8rem)',
  body: 'clamp(1.5rem, 2.2vw, 1.9rem)',
  label: 'clamp(1.44rem, 2vw, 1.76rem)',
  small: 'clamp(1.3rem, 1.8vw, 1.56rem)',
};

const container = { show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };

function StatusPill({ status, tokens }) {
  const map = {
    pending: { label: 'Not started', color: tokens.textMuted, bg: 'transparent', border: tokens.cardBorder },
    submitted: { label: 'Under review', color: '#fff', bg: tokens.warning, border: tokens.warning },
    verified: { label: 'Verified', color: '#fff', bg: tokens.success, border: tokens.success },
    rejected: { label: 'Rejected', color: '#fff', bg: tokens.danger, border: tokens.danger },
  };
  const s = map[status] ?? map.pending;
  return (
    <span
      className="rounded-full px-12 py-4"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color, fontSize: F.small, fontWeight: 700 }}
    >
      {s.label}
    </span>
  );
}

function DocumentCard({ title, description, tokens, status, rejectionReason, children }) {
  return (
    <motion.div
      variants={item}
      className="rounded-2xl p-24"
      style={{ background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}` }}
    >
      <div className="flex items-center justify-between mb-8">
        <Typography style={{ fontSize: F.label, fontWeight: 700, color: tokens.textPrimary }}>{title}</Typography>
        <StatusPill status={status} tokens={tokens} />
      </div>
      <Typography style={{ fontSize: F.body, color: tokens.textMuted, marginBottom: 16 }}>{description}</Typography>
      {rejectionReason && (
        <Typography style={{ fontSize: F.body, color: tokens.danger, marginBottom: 12 }}>
          Rejected: {rejectionReason} — please resubmit below.
        </Typography>
      )}
      {status !== 'submitted' && status !== 'verified' && children}
    </motion.div>
  );
}

function NationalIdCard({ account, submission, tokens }) {
  const [idNumber, setIdNumber] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { mutate: submitNationalId, isLoading } = useSubmitNationalId();

  async function handleSubmit() {
    if (!idNumber.trim() || !file) return;
    setUploading(true);
    try {
      const nationalIdImageUrl = await uploadDocumentImage(file);
      setUploading(false);
      await submitNationalId({ accountNumber: account.accountNumber, nationalIdNumber: idNumber.trim(), nationalIdImageUrl });
      toast.success('National ID submitted — pending admin review.');
    } catch (error) {
      setUploading(false);
      toast.error(error?.message ?? 'Could not submit National ID — please try again.');
    }
  }

  const busy = uploading || isLoading;

  return (
    <DocumentCard
      title="National ID"
      description="A government-issued ID card, showing the ID number."
      tokens={tokens}
      status={submission?.nationalIdStatus}
      rejectionReason={submission?.nationalIdRejectionReason}
    >
      <div className="flex flex-col gap-12">
        <TextField label="ID number" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} size="small" fullWidth />
        <label htmlFor="national-id-upload">
          <input
            id="national-id-upload"
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <div
            className="flex items-center justify-center gap-10 rounded-xl py-16 cursor-pointer"
            style={{ border: `1.5px dashed ${tokens.cardBorder}`, color: tokens.textMuted }}
          >
            <FuseSvgIcon size={18} style={{ color: tokens.accentSolid }}>heroicons-outline:upload</FuseSvgIcon>
            <Typography style={{ fontSize: F.body, color: tokens.textPrimary, fontWeight: 600 }}>
              {file ? file.name : 'Upload ID image'}
            </Typography>
          </div>
        </label>
        <Button
          variant="contained"
          color="secondary"
          disabled={!idNumber.trim() || !file || busy}
          onClick={handleSubmit}
          startIcon={busy ? <CircularProgress size={16} color="inherit" /> : null}
        >
          Submit
        </Button>
      </div>
    </DocumentCard>
  );
}

function IdentityCard({ account, submission, tokens }) {
  const [identityType, setIdentityType] = useState('BVN');
  const [identityNumber, setIdentityNumber] = useState('');
  const { mutate: submitIdentity, isLoading } = useSubmitIdentity();

  async function handleSubmit() {
    if (!identityNumber.trim()) return;
    try {
      const data = await submitIdentity({ accountNumber: account.accountNumber, identityType, identityNumber: identityNumber.trim() });
      if (data?.identityStatus === 'verified') {
        toast.success(`${identityType} verified.`);
      } else {
        toast.error(`${identityType} could not be verified — check the number and try again.`);
      }
      setIdentityNumber('');
    } catch (error) {
      toast.error(error?.message ?? 'Could not verify identity');
    }
  }

  return (
    <DocumentCard
      title="Identity (BVN or NIN)"
      description="Verified instantly against a government database — no document upload, no waiting for admin review."
      tokens={tokens}
      status={submission?.identityStatus}
      rejectionReason={submission?.identityStatus === 'rejected' ? 'Could not verify this number against the database.' : null}
    >
      <div className="flex flex-col gap-12">
        <div className="flex gap-12">
          <TextField
            select
            label="Type"
            value={identityType}
            onChange={(e) => setIdentityType(e.target.value)}
            size="small"
            style={{ width: 120 }}
          >
            <MenuItem value="BVN">BVN</MenuItem>
            <MenuItem value="NIN">NIN</MenuItem>
          </TextField>
          <TextField
            label={`${identityType} number`}
            value={identityNumber}
            onChange={(e) => setIdentityNumber(e.target.value)}
            size="small"
            fullWidth
          />
        </div>
        <Button
          variant="contained"
          color="secondary"
          disabled={!identityNumber.trim() || isLoading}
          onClick={handleSubmit}
          startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : null}
        >
          Verify
        </Button>
      </div>
    </DocumentCard>
  );
}

function UtilityBillCard({ account, submission, tokens }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { mutate: submitUtilityBill, isLoading } = useSubmitUtilityBill();

  async function handleSubmit() {
    if (!file) return;
    setUploading(true);
    try {
      const utilityBillImageUrl = await uploadDocumentImage(file);
      setUploading(false);
      await submitUtilityBill({ accountNumber: account.accountNumber, utilityBillImageUrl });
      toast.success('Utility bill submitted — pending admin review.');
    } catch (error) {
      setUploading(false);
      toast.error(error?.message ?? 'Could not submit utility bill — please try again.');
    }
  }

  const busy = uploading || isLoading;

  return (
    <DocumentCard
      title="Utility Bill"
      description="A recent utility bill (electricity, water, etc.) showing the address on file."
      tokens={tokens}
      status={submission?.utilityBillStatus}
      rejectionReason={submission?.utilityBillRejectionReason}
    >
      <div className="flex flex-col gap-12">
        <label htmlFor="utility-bill-upload">
          <input
            id="utility-bill-upload"
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <div
            className="flex items-center justify-center gap-10 rounded-xl py-16 cursor-pointer"
            style={{ border: `1.5px dashed ${tokens.cardBorder}`, color: tokens.textMuted }}
          >
            <FuseSvgIcon size={18} style={{ color: tokens.accentSolid }}>heroicons-outline:upload</FuseSvgIcon>
            <Typography style={{ fontSize: F.body, color: tokens.textPrimary, fontWeight: 600 }}>
              {file ? file.name : 'Upload utility bill'}
            </Typography>
          </div>
        </label>
        <Button
          variant="contained"
          color="secondary"
          disabled={!file || busy}
          onClick={handleSubmit}
          startIcon={busy ? <CircularProgress size={16} color="inherit" /> : null}
        >
          Submit
        </Button>
      </div>
    </DocumentCard>
  );
}

export default function FinanceKycContent() {
  const { account } = useOutletContext();
  const { tokens } = useFinanceTheme();
  const { data: submission, isLoading } = useFintechKycStatus(account?.accountNumber);

  if (isLoading) {
    return (
      <div className="w-full px-16 md:px-24 xl:px-32 py-24 flex justify-center">
        <CircularProgress size={28} />
      </div>
    );
  }

  const overallStatus = submission?.overallStatus ?? 'pending';

  if (overallStatus === 'verified') {
    return (
      <div className="w-full px-16 md:px-24 xl:px-32 py-24">
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 gap-20">
          <motion.div
            variants={item}
            className="rounded-2xl p-24 flex items-start gap-16"
            style={{ background: tokens.successBg, border: `1px solid ${tokens.success}` }}
          >
            <div
              className="rounded-full flex items-center justify-center shrink-0"
              style={{ width: 44, height: 44, background: tokens.success }}
            >
              <FuseSvgIcon size={22} color="white">heroicons-solid:badge-check</FuseSvgIcon>
            </div>
            <div>
              <Typography style={{ fontSize: F.label, fontWeight: 700, color: tokens.textPrimary }}>You're verified</Typography>
              <Typography style={{ fontSize: F.body, color: tokens.textMuted, marginTop: 4 }}>
                KYC verification is complete — your account has no restrictions on moving money.
              </Typography>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full px-16 md:px-24 xl:px-32 py-24">
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 gap-20" style={{ maxWidth: 640 }}>
        <motion.div variants={item}>
          <Typography style={{ fontSize: F.pageTitle, fontWeight: 800, color: tokens.textPrimary }}>
            Complete KYC verification
          </Typography>
          <Typography style={{ fontSize: F.body, color: tokens.textMuted, marginTop: 8 }}>
            Before you can transfer, withdraw, or move money from this account, we need to verify who you
            are. Complete all three below — your account unlocks once every one is verified.
          </Typography>
        </motion.div>

        <NationalIdCard account={account} submission={submission} tokens={tokens} />
        <IdentityCard account={account} submission={submission} tokens={tokens} />
        <UtilityBillCard account={account} submission={submission} tokens={tokens} />
      </motion.div>
    </div>
  );
}
