import { useState } from "react";
import { useParams } from "react-router";
import { styled } from "@mui/material/styles";
import FusePageSimple from "@fuse/core/FusePageSimple";
import FuseLoading from "@fuse/core/FuseLoading";
import { Box, Button, Chip, Divider, TextField, Typography } from "@mui/material";
import ClienttErrorPage from "src/app/main/zrootclient/components/ClienttErrorPage";
import {
  useAddDisputeNote,
  useGetMyDisputeDetail,
} from "app/configs/data/server-calls/auth/userapp/a_disputes/useDisputesRepo";

const RESOLVED_STATUSES = [
  "RESOLVED_REFUND_CUSTOMER",
  "RESOLVED_RELEASE_MERCHANT",
  "RESOLVED_NO_ACTION",
  "CLOSED",
];

const Root = styled(FusePageSimple)(({ theme }) => ({
  "& .FusePageSimple-header": {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: "solid",
    borderColor: theme.palette.divider,
  },
}));

const STATUS_COLOR = {
  OPEN: "warning",
  UNDER_REVIEW: "info",
  RESOLVED_REFUND_CUSTOMER: "success",
  RESOLVED_RELEASE_MERCHANT: "success",
  RESOLVED_NO_ACTION: "default",
  CLOSED: "default",
};

function DisputeDetailPage() {
  const { disputeId } = useParams();
  const { data, isLoading, isError } = useGetMyDisputeDetail(disputeId);
  const dispute = data?.data;
  const [note, setNote] = useState("");
  const addNote = useAddDisputeNote();

  const handleSendNote = () => {
    if (!note.trim()) return;
    addNote.mutate({ disputeId, note: note.trim() }, { onSuccess: () => setNote("") });
  };

  if (isError) return <ClienttErrorPage />;

  return (
    <Root
      header={
        <div className="flex flex-1 w-full items-center justify-between py-16 px-16 md:px-24 gap-16">
          <Typography className="text-24 font-extrabold tracking-tight">Dispute</Typography>
        </div>
      }
      content={
        <div className="w-full p-16 sm:p-24 max-w-2xl">
          {isLoading || !dispute ? (
            <FuseLoading />
          ) : (
            <div className="flex flex-col gap-16">
              <div className="flex items-center justify-between gap-16">
                <Typography className="text-20 font-bold">{dispute.subject}</Typography>
                <Chip
                  size="small"
                  label={dispute.status.replace(/_/g, " ")}
                  color={STATUS_COLOR[dispute.status] || "default"}
                />
              </div>

              <Typography color="text.secondary">Merchant: {dispute.merchantName}</Typography>

              <Typography className="whitespace-pre-wrap">{dispute.description}</Typography>

              {dispute.resolutionNote && (
                <Box className="p-16 rounded-lg" sx={{ bgcolor: "success.light" }}>
                  <Typography variant="caption" color="text.secondary">
                    Resolution
                  </Typography>
                  <Typography className="whitespace-pre-wrap">{dispute.resolutionNote}</Typography>
                </Box>
              )}

              <Divider />

              <Typography variant="subtitle1" className="font-bold">
                Activity
              </Typography>
              <div className="flex flex-col gap-12">
                {(dispute.events ?? []).map((event) => (
                  <Box key={event.id}>
                    <Typography variant="caption" color="text.secondary">
                      {event.adminName} · {new Date(event.createdAt).toLocaleString()}
                    </Typography>
                    {event.note && <Typography className="whitespace-pre-wrap">{event.note}</Typography>}
                  </Box>
                ))}
                {(!dispute.events || dispute.events.length === 0) && (
                  <Typography variant="caption" color="text.secondary">
                    No activity yet — an admin hasn't picked this up.
                  </Typography>
                )}
              </div>

              {!RESOLVED_STATUSES.includes(dispute.status) && (
                <>
                  <Divider />
                  <Typography variant="subtitle1" className="font-bold">
                    Reply
                  </Typography>
                  <TextField
                    size="small"
                    fullWidth
                    multiline
                    minRows={2}
                    placeholder="Add more context for the admin reviewing this..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <Box className="flex justify-end">
                    <Button
                      variant="contained"
                      color="primary"
                      disabled={!note.trim() || addNote.isLoading}
                      onClick={handleSendNote}
                    >
                      Send reply
                    </Button>
                  </Box>
                </>
              )}
            </div>
          )}
        </div>
      }
    />
  );
}

export default DisputeDetailPage;
