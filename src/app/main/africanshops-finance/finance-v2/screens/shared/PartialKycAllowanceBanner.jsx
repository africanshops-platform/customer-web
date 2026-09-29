import Typography from '@mui/material/Typography';
import { NavLink } from 'react-router-dom';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useFinanceTheme } from '../../FinanceThemeContext';

// KYC gating (2026-08-11): monthlyCapKobo is null for a fully-verified
// account or a MERCHANT (which gets a separate full block instead of a
// cap, see checkTransferLimits() on the backend) — render nothing then.
// Only a partially-verified USER/ADMIN account carries real allowance
// figures, sourced live from the ledger on every kyc/status call.
export default function PartialKycAllowanceBanner({ submission }) {
  const { tokens } = useFinanceTheme();
  if (!submission || submission.monthlyCapKobo == null) return null;

  const capNaira = submission.monthlyCapKobo / 100;
  const usedNaira = submission.monthlyUsedKobo / 100;
  const remainingNaira = submission.monthlyRemainingKobo / 100;

  return (
    <div
      className="rounded-2xl p-16 flex items-start gap-10"
      style={{ background: tokens.warningBg, border: `1px solid ${tokens.warning}44` }}
    >
      <FuseSvgIcon size={18} style={{ color: tokens.warning, marginTop: 2, flexShrink: 0 }}>
        heroicons-outline:information-circle
      </FuseSvgIcon>
      <Typography style={{ fontSize: '1.44rem', color: tokens.textPrimary, lineHeight: 1.5 }}>
        You can move up to <b>₦{remainingNaira.toLocaleString('en-NG')}</b> more this month (₦
        {usedNaira.toLocaleString('en-NG')} of ₦{capNaira.toLocaleString('en-NG')} used) while your
        KYC is pending.{' '}
        <NavLink to="/africanshops/finance-v2/kyc" style={{ fontWeight: 700, textDecoration: 'underline', color: tokens.warning }}>
          Complete KYC
        </NavLink>{' '}
        to remove this limit.
      </Typography>
    </div>
  );
}

// Shared amount-vs-remaining-allowance guard — used by Transfer/Withdrawal/
// SendToBank forms alongside their existing available-balance check.
export function exceedsMonthlyAllowance(submission, amountNaira) {
  if (!submission || submission.monthlyCapKobo == null) return false;
  return amountNaira * 100 > submission.monthlyRemainingKobo;
}
