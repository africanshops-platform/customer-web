import { useSearchParams } from "react-router-dom";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Pagination from "@mui/material/Pagination";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { useReferralAccruals } from "app/configs/data/server-calls/useReferralLinks/useReferralLinksQuery";
import { formatKobo } from "app/main/africanshops-finance/finance-v2/hooks/useFintechApi";

const SHARE_TYPE_LABEL = {
  MERCHANT: "Merchant Referral",
  USER: "User Referral"
};

function StatusChip({ status }) {
  const isPaid = status === "REMITTED";
  return (
    <span
      className="rounded-full px-3 py-1 text-xs font-semibold"
      style={{
        background: isPaid ? "rgba(34, 197, 94, 0.12)" : "rgba(234, 179, 8, 0.12)",
        color: isPaid ? "#16a34a" : "#ca8a04"
      }}
    >
      {isPaid ? "Paid Out" : "Pending"}
    </span>
  );
}

/**
 * Referral revenue-share (2026-09-04) — this user's own accrual history:
 * date, which side earned it, amount, and whether it's been paid out yet
 * in the monthly remittance. Deliberately shallow — never shows which
 * referral or order the commission actually came from.
 */
function ReferralAccrualsTable() {
  // Platform-wide rule: pagination lives in the URL, not component state,
  // so back-navigation into this settings tab restores the page you were on.
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get("referralPage"), 10) || 1);
  const limit = 10;
  const { data, isLoading } = useReferralAccruals(page, limit);

  const setPage = (nextPage) => {
    const next = new URLSearchParams(searchParams);
    next.set("referralPage", String(nextPage));
    setSearchParams(next);
  };

  const items = data?.items ?? [];
  const pageCount = Math.max(1, Math.ceil((data?.total ?? 0) / limit));
  const isEmpty = !isLoading && items.length === 0;
  const hasRows = !isLoading && items.length > 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8" style={{ border: "2px solid rgba(234, 88, 12, 0.1)" }}>
      <div className="flex items-center gap-3 mb-6">
        <FuseSvgIcon size={22} style={{ color: "#ea580c" }}>
          heroicons-outline:currency-dollar
        </FuseSvgIcon>
        <Typography className="text-lg font-bold text-gray-800">Referral Earnings History</Typography>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <CircularProgress size={28} sx={{ color: "#f97316" }} />
        </div>
      )}

      {isEmpty && (
        <div className="text-center py-8">
          <Typography className="text-sm text-gray-500">
            No referral earnings yet — they show up here as soon as someone you referred completes an order.
          </Typography>
        </div>
      )}

      {hasRows && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr style={{ borderBottom: "2px solid rgba(229, 231, 235, 1)" }}>
                  {["Date", "Type", "Amount", "Status"].map((col) => (
                    <th key={col} className="py-3 px-3 text-left">
                      <Typography className="text-xs uppercase tracking-wider font-semibold text-gray-500">
                        {col}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr key={row.id} className="border-b" style={{ borderColor: "rgba(229, 231, 235, 0.6)" }}>
                    <td className="py-3 px-3">
                      <Typography className="text-sm text-gray-600">
                        {row.createdAt
                          ? new Date(row.createdAt).toLocaleDateString("en-NG", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric"
                            })
                          : "—"}
                      </Typography>
                    </td>
                    <td className="py-3 px-3">
                      <Typography className="text-sm text-gray-800">
                        {SHARE_TYPE_LABEL[row.shareType] ?? row.shareType}
                      </Typography>
                    </td>
                    <td className="py-3 px-3">
                      <Typography className="text-sm font-bold" style={{ color: "#16a34a" }}>
                        +{formatKobo(row.amountKobo)}
                      </Typography>
                    </td>
                    <td className="py-3 px-3">
                      <StatusChip status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pageCount > 1 && (
            <div className="flex justify-center pt-6">
              <Pagination count={pageCount} page={page} onChange={(_, v) => setPage(v)} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ReferralAccrualsTable;
