import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { styled } from "@mui/material/styles";
import FusePageSimple from "@fuse/core/FusePageSimple";
import FuseLoading from "@fuse/core/FuseLoading";
import NavLinkAdapter from "@fuse/core/NavLinkAdapter";
import { Box, FormControl, InputLabel, MenuItem, Select, Typography, Button } from "@mui/material";
import {
  ReportProblemRounded,
  ChevronRight,
  HourglassTopRounded,
  VisibilityRounded,
  CheckCircleRounded,
  BlockRounded,
} from "@mui/icons-material";
import { useGetMyDisputes } from "app/configs/data/server-calls/auth/userapp/a_disputes/useDisputesRepo";

const Root = styled(FusePageSimple)(({ theme }) => ({
  "& .FusePageSimple-header": {
    backgroundColor: theme.palette.background.paper,
  },
  "& .FusePageSimple-content": {
    backgroundColor: "#f9fafb",
  },
}));

const STATUSES = [
  "OPEN",
  "UNDER_REVIEW",
  "RESOLVED_REFUND_CUSTOMER",
  "RESOLVED_RELEASE_MERCHANT",
  "RESOLVED_NO_ACTION",
  "CLOSED",
];

const STATUS_META = {
  OPEN: { label: "Open", icon: HourglassTopRounded, color: "#ea580c", bg: "rgba(249,115,22,0.12)" },
  UNDER_REVIEW: { label: "Under review", icon: VisibilityRounded, color: "#2563eb", bg: "rgba(59,130,246,0.12)" },
  RESOLVED_REFUND_CUSTOMER: {
    label: "Refund approved",
    icon: CheckCircleRounded,
    color: "#16a34a",
    bg: "rgba(34,197,94,0.12)",
  },
  RESOLVED_RELEASE_MERCHANT: {
    label: "Released to merchant",
    icon: CheckCircleRounded,
    color: "#16a34a",
    bg: "rgba(34,197,94,0.12)",
  },
  RESOLVED_NO_ACTION: { label: "No action taken", icon: BlockRounded, color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
  CLOSED: { label: "Closed", icon: BlockRounded, color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
};

function StatusPill({ status }) {
  const meta = STATUS_META[status] || STATUS_META.CLOSED;
  const Icon = meta.icon;
  return (
    <div
      className="flex items-center gap-6 px-12 py-4 rounded-full font-semibold text-13 shrink-0"
      style={{ background: meta.bg, color: meta.color }}
    >
      <Icon sx={{ fontSize: 16 }} />
      {meta.label}
    </div>
  );
}

function DisputeCard({ dispute, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <Box
        component={NavLinkAdapter}
        to={`/disputes/user/my-disputes/${dispute.id}/view`}
        className="flex items-center justify-between gap-16 p-20 rounded-2xl bg-white transition-all"
        sx={{
          textDecoration: "none",
          color: "inherit",
          border: "1px solid rgba(229, 231, 235, 1)",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
          "&:hover": { boxShadow: "0 8px 20px -6px rgba(234, 88, 12, 0.25)", borderColor: "rgba(249,115,22,0.35)" },
        }}
      >
        <div className="flex items-center gap-16 min-w-0">
          <div
            className="w-44 h-44 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" }}
          >
            <ReportProblemRounded sx={{ color: "white", fontSize: 22 }} />
          </div>
          <div className="min-w-0">
            <Typography className="font-bold truncate">{dispute.subject}</Typography>
            <Typography variant="caption" color="text.secondary" className="truncate block">
              {dispute.merchantName} · {new Date(dispute.updatedAt).toLocaleDateString()}
            </Typography>
          </div>
        </div>
        <div className="flex items-center gap-8 shrink-0">
          <StatusPill status={dispute.status} />
          <ChevronRight sx={{ color: "#d1d5db" }} />
        </div>
      </Box>
    </motion.div>
  );
}

function MyDisputesPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");

  const { data, isLoading } = useGetMyDisputes({ page, limit: 20, status: status || undefined });
  const items = data?.data?.items ?? [];
  const totalPages = data?.data?.totalPages ?? 1;

  const openCount = useMemo(() => items.filter((d) => d.status === "OPEN").length, [items]);
  const reviewCount = useMemo(() => items.filter((d) => d.status === "UNDER_REVIEW").length, [items]);
  const resolvedCount = useMemo(
    () => items.filter((d) => d.status.startsWith("RESOLVED")).length,
    [items],
  );

  return (
    <Root
      header={
        <div className="w-full px-16 md:px-24 py-24">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-6 md:p-24 relative overflow-hidden mb-16"
            style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" }}
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute w-56 h-56 rounded-full -top-16 -right-16" style={{ background: "rgba(255,255,255,0.3)" }} />
              <div className="absolute w-40 h-40 rounded-full -bottom-10 left-1/3" style={{ background: "rgba(255,255,255,0.2)" }} />
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-16">
              <div>
                <Typography className="text-24 font-extrabold text-white tracking-tight">My Disputes</Typography>
                <Typography className="text-white/80">
                  Issues you've reported on your orders, and where they stand.
                </Typography>
              </div>
              <div className="flex gap-24">
                <div className="text-center">
                  <Typography className="text-24 font-extrabold text-white">{openCount}</Typography>
                  <Typography variant="caption" className="text-white/80">Open</Typography>
                </div>
                <div className="text-center">
                  <Typography className="text-24 font-extrabold text-white">{reviewCount}</Typography>
                  <Typography variant="caption" className="text-white/80">In review</Typography>
                </div>
                <div className="text-center">
                  <Typography className="text-24 font-extrabold text-white">{resolvedCount}</Typography>
                  <Typography variant="caption" className="text-white/80">Resolved</Typography>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="flex items-center justify-end">
            <FormControl size="small" className="min-w-136" sx={{ bgcolor: "background.paper", borderRadius: 1 }}>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="">All</MenuItem>
                {STATUSES.map((s) => (
                  <MenuItem key={s} value={s}>
                    {STATUS_META[s]?.label ?? s.replace(/_/g, " ")}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </div>
      }
      content={
        <div className="w-full p-16 sm:p-24 pt-0">
          {isLoading && <FuseLoading />}

          {!isLoading && items.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-12 py-64 px-24 rounded-2xl bg-white"
              style={{ border: "1px dashed rgba(229, 231, 235, 1)" }}
            >
              <div
                className="w-64 h-64 rounded-full flex items-center justify-center mb-8"
                style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(234,88,12,0.1) 100%)" }}
              >
                <ReportProblemRounded sx={{ fontSize: 32, color: "#ea580c" }} />
              </div>
              <Typography className="font-bold text-18">Nothing to report — good news!</Typography>
              <Typography color="text.secondary" className="text-center max-w-320">
                You haven't raised any issues yet. If something goes wrong with a delivered order, open it and
                choose "Report an issue".
              </Typography>
              <Button
                component={NavLinkAdapter}
                to="/marketplace/user/orders"
                variant="contained"
                className="mt-8"
                sx={{
                  background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 700,
                  px: 3,
                }}
              >
                Go to my orders
              </Button>
            </motion.div>
          )}

          {!isLoading && items.length > 0 && (
            <div className="flex flex-col gap-12">
              {items.map((dispute, index) => (
                <DisputeCard key={dispute.id} dispute={dispute} index={index} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-12 mt-24">
              <Button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Typography variant="caption">
                Page {page} of {totalPages}
              </Typography>
              <Button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          )}
        </div>
      }
    />
  );
}

export default MyDisputesPage;
