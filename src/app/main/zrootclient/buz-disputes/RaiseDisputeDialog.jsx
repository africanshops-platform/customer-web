import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
} from "@mui/material";
import { useCreateDispute } from "app/configs/data/server-calls/auth/userapp/a_disputes/useDisputesRepo";

/**
 * Raise-a-dispute dialog — launched from an order/food-order detail page for
 * a DELIVERED order only (the caller gates visibility of the trigger button
 * on isDelivered; this dialog itself does not re-check that).
 */
function RaiseDisputeDialog({ open, onClose, orderId, orderType }) {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const createDispute = useCreateDispute();

  const handleClose = () => {
    setSubject("");
    setDescription("");
    onClose();
  };

  const handleSubmit = () => {
    createDispute.mutate(
      { orderId, orderType, subject: subject.trim(), description: description.trim() },
      { onSuccess: handleClose },
    );
  };

  const canSubmit = subject.trim().length > 0 && description.trim().length > 0;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Report an issue with this order</DialogTitle>
      <DialogContent className="flex flex-col gap-16 pt-8">
        <Typography variant="body2" color="text.secondary">
          Tell us what went wrong. An admin will review this and get back to you.
        </Typography>
        <TextField
          label="Subject"
          size="small"
          fullWidth
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
        <TextField
          label="Description"
          size="small"
          fullWidth
          multiline
          minRows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          color="primary"
          disabled={!canSubmit || createDispute.isLoading}
          onClick={handleSubmit}
        >
          Submit dispute
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default RaiseDisputeDialog;
