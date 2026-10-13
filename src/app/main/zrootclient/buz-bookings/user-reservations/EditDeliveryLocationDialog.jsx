import { useEffect, useState } from "react";
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useUpdateUserAddress } from "app/configs/data/server-calls/auth/userapp/a_bookings/use-addresses";
import DeliveryLocationFields from "./DeliveryLocationFields";

/** Add or change the delivery location saved on an existing address. */
function EditDeliveryLocationDialog({ open, address, onClose }) {
  const update = useUpdateUserAddress();
  const [loc, setLoc] = useState({ country: "", state: "", lga: "", market: "" });

  useEffect(() => {
    if (open && address) {
      setLoc({
        country: address.country || "",
        state: address.state || "",
        lga: address.lga || "",
        market: address.market || "",
      });
    }
  }, [open, address]);

  const save = () => {
    // empty levels are sent as null so they are cleared on the address
    const formData = Object.fromEntries(Object.entries(loc).map(([k, v]) => [k, v || null]));
    update.mutate({ addressId: address.id, formData }, { onSuccess: () => onClose() });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle>Delivery location — {address?.name}</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <DeliveryLocationFields value={loc} onChange={setLoc} />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={save}
          disabled={update.isLoading}
          data-testid="save-delivery-location"
          sx={{ textTransform: "none", background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" }}
        >
          {update.isLoading ? <CircularProgress size={18} color="inherit" /> : "Save location"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditDeliveryLocationDialog;
