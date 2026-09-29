import { useState } from "react";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { motion } from "framer-motion";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { useReferralLinks } from "app/configs/data/server-calls/useReferralLinks/useReferralLinksQuery";
import { formatKobo } from "app/main/africanshops-finance/finance-v2/hooks/useFintechApi";
import ReferralAccrualsTable from "./ReferralAccrualsTable";

function StatTile({ label, value, color }) {
  return (
    <div className="text-center p-4 rounded-xl" style={{ background: color, color: "#fff" }}>
      <Typography className="text-2xl font-bold">{value ?? 0}</Typography>
      <Typography className="text-xs" style={{ opacity: 0.9 }}>{label}</Typography>
    </div>
  );
}

function CopyField({ label, value }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="flex items-center justify-between gap-3 p-4 rounded-xl min-w-0"
      style={{ background: "rgba(249, 250, 251, 1)", border: "2px solid rgba(229, 231, 235, 1)" }}
    >
      <div className="min-w-0">
        <Typography className="text-xs text-gray-500">{label}</Typography>
        <Typography className="text-sm font-mono font-semibold text-gray-800 truncate">
          {value || "—"}
        </Typography>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        disabled={!value}
        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold flex-shrink-0 cursor-pointer"
        style={{
          background: copied ? "rgba(34, 197, 94, 0.1)" : "#fef2f2",
          color: copied ? "#16a34a" : "#ea580c",
          border: "none"
        }}
      >
        <FuseSvgIcon size={16}>{copied ? "heroicons-solid:check" : "heroicons-outline:clipboard-list"}</FuseSvgIcon>
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

/**
 * Referral tracking phase 1 (2026-08-14) — code/tracking only, no reward
 * payout yet. Idempotent on the backend: fetching this never rotates an
 * already-issued code, so a link already shared elsewhere keeps resolving.
 */
function ReferralLinksTab() {
  const { data, isLoading } = useReferralLinks();

  return (
    <div className="w-full max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6"
        style={{ border: "2px solid rgba(234, 88, 12, 0.1)" }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" }}
          >
            <FuseSvgIcon className="text-white" size={24}>
              heroicons-solid:share
            </FuseSvgIcon>
          </div>
          <div>
            <Typography className="text-xl font-bold text-gray-800">Referral Links</Typography>
            <Typography className="text-sm text-gray-600">
              Share your links — anyone who signs up through them is tracked as your referral
            </Typography>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <CircularProgress size={28} sx={{ color: "#f97316" }} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <StatTile label="Total Referrals" value={data?.stats?.totalReferrals} color="linear-gradient(135deg, #f97316 0%, #ea580c 100%)" />
              <StatTile label="Merchant Referrals" value={data?.stats?.merchantReferrals} color="linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)" />
              <StatTile label="User Referrals" value={data?.stats?.userReferrals} color="linear-gradient(135deg, #22c55e 0%, #16a34a 100%)" />
              <StatTile label="Completed Referrals" value={data?.stats?.completedReferrals} color="linear-gradient(135deg, #eab308 0%, #ca8a04 100%)" />
            </div>

            {/* Referral revenue-share earnings (2026-09-04) — 2% of commission on a
            referred user's orders, accrued per transaction, paid out monthly. */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <StatTile label="Total Earned" value={formatKobo(data?.stats?.totalRewardsEarnedKobo ?? 0)} color="linear-gradient(135deg, #16a34a 0%, #15803d 100%)" />
              <StatTile label="Pending (Not Yet Paid Out)" value={formatKobo(data?.stats?.pendingRewardsKobo ?? 0)} color="linear-gradient(135deg, #ca8a04 0%, #a16207 100%)" />
              <StatTile label="Paid Out So Far" value={formatKobo(data?.stats?.paidRewardsKobo ?? 0)} color="linear-gradient(135deg, #f97316 0%, #ea580c 100%)" />
            </div>

            <div className="grid gap-3 mb-6">
              <CopyField label="Your referral code" value={data?.referralCode} />
              <CopyField label="Merchant sign-up link" value={data?.merchantReferralLink} />
              <CopyField label="User sign-up link" value={data?.userReferralLink} />
            </div>
          </>
        )}
      </motion.div>

      <ReferralAccrualsTable />
    </div>
  );
}

export default ReferralLinksTab;
