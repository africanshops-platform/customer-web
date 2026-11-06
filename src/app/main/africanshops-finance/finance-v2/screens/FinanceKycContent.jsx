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
    pending: { label: 'NOT STARTED', color: tokens.textSecondary, bg: tokens.borderColor },
    submitted: { label: 'UNDER REVIEW', color: tokens.warning, bg: tokens.warningBg },
    verified: { label: 'VERIFIED', color: tokens.success, bg: tokens.successBg },
    rejected: { label: 'REJECTED', color: tokens.danger, bg: tokens.dangerBg },
  };
  const s = map[status] ?? map.pending;
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', borderRadius: 99, padding: '3px 10px' }}>
      {s.label}
    </span>
  );
}

function DocumentCard({ title, description, tokens, status, rejectionReason, children }) {
  return (
    <motion.div
      variants={item}
      className="p-24"
      style={{ background: status === 'rejected' ? tokens.dangerBg : tokens.cardBg, border: `2px solid ${{ verified: tokens.success, rejected: tokens.danger }[status] ?? tokens.cardBorder}`, borderRadius: 20 }}
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

const DOCS = [['nationalIdStatus', 'National ID'], ['identityStatus', 'BVN or NIN'], ['utilityBillStatus', 'Utility bill']];

function SideCards({ submission, tokens }) {
  const done = DOCS.filter(([k]) => submission?.[k] === 'verified').length;
  const card = { background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, boxShadow: tokens.cardShadow, borderRadius: 20, padding: 20 };
  const R = 15.9;
  return (
    <div style={{ display: 'grid', gap: 16, position: 'sticky', top: 16 }}>
      <div style={{ ...card, display: 'flex', gap: 18, alignItems: 'center' }}>
        <svg width="96" height="96" viewBox="0 0 42 42" role="img" aria-label={`${done} of 3 checks verified`}>
          <circle cx="21" cy="21" r={R} fill="none" stroke={tokens.borderColor} strokeWidth="5" />
          <circle cx="21" cy="21" r={R} fill="none" stroke={tokens.accentSolid} strokeWidth="5" strokeLinecap="round" strokeDasharray={`${(done / 3) * 100} 100`} transform="rotate(-90 21 21)" />
          <text x="21" y="24" textAnchor="middle" fontSize="8" fontWeight="800" fill={tokens.textPrimary}>{done}/3</text>
        </svg>
        <div>
          <b style={{ fontSize: 17, color: tokens.textPrimary }}>Three quick checks</b>
          <div style={{ color: tokens.textSecondary, fontSize: 13.5 }}>Your account unlocks once every one is verified. Your documents are used only to verify you.</div>
        </div>
      </div>
      <div style={card}>
        <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: tokens.textPrimary }}>What it unlocks</h3>
        {[
          ['Today', 'Up to ₦100,000 every 30 days'],
          ['After verification', 'A daily limit of ₦500,000, which you can raise up to ₦5,000,000'],
          ['Also', 'No monthly cap on moving money out'],
        ].map(([l, v]) => (
          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '9px 0', borderBottom: `1px dashed ${tokens.borderColor}`, fontSize: 14, color: tokens.textSecondary }}>
            <span>{l}</span><b style={{ color: tokens.textPrimary, textAlign: 'right' }}>{v}</b>
          </div>
        ))}
      </div>
      <div style={{ ...card, background: tokens.accentSoft, border: `1px solid ${tokens.accentSolid}33`, boxShadow: 'none' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: tokens.textPrimary }}>Tips for a quick approval</h3>
        {[
          ['📷', 'A clear photo', 'All four corners visible, no glare, text readable.'],
          ['🪪', 'Matching details', 'The name and number must match what you entered.'],
          ['🏠', 'A recent bill', 'Electricity, water or similar, with your address on it.'],
          ['⏱', 'BVN or NIN is instant', 'It is checked straight away; the two documents are reviewed by our team.'],
        ].map(([icon, title, text]) => (
          <div key={title} style={{ display: 'flex', gap: 12, padding: '8px 0' }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: tokens.cardBg, display: 'grid', placeItems: 'center', fontSize: 14, flex: 'none' }}>{icon}</div>
            <div style={{ fontSize: 13, color: tokens.textSecondary }}><b style={{ display: 'block', color: tokens.textPrimary }}>{title}</b>{text}</div>
          </div>
        ))}
      </div>
    </div>
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
        <motion.div variants={container} initial="hidden" animate="show" style={{ display: 'grid', gap: 20, gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr)', alignItems: 'start' }}>
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
          <SideCards submission={submission} tokens={tokens} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full px-16 md:px-24 xl:px-32 py-24">
      <motion.div variants={container} initial="hidden" animate="show" style={{ display: 'grid', gap: 20, gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr)', alignItems: 'start' }}>
        <div className="grid gap-20" style={{ minWidth: 0 }}>
        <NationalIdCard account={account} submission={submission} tokens={tokens} />
        <IdentityCard account={account} submission={submission} tokens={tokens} />
        <UtilityBillCard account={account} submission={submission} tokens={tokens} />
        </div>
        <SideCards submission={submission} tokens={tokens} />
      </motion.div>
    </div>
  );
}
