import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import StorefrontIcon from "@mui/icons-material/Storefront";
import DirectionsCarFilledIcon from "@mui/icons-material/DirectionsCarFilled";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useGetMyRegisteredMachines } from "app/configs/data/server-calls/engineering/useMyMachinesRepo";
import { useCreateServiceBooking } from "app/configs/data/server-calls/engineering/useServiceBookingRepo";
import RegisterMachineDialog from "../my-machines/RegisterMachineDialog";

const SERVICE_TYPES = [
  { value: "REPAIR", label: "Repair" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "DIAGNOSTIC", label: "Diagnostic" },
];

const todayIso = () => new Date().toISOString().slice(0, 10);

/**
 * BookServiceDialog — the book-a-service flow reachable from a shop's
 * detail page (Phase E6c). Picks one of the customer's own registered
 * machines (or registers one inline), a service type + date, and where the
 * work happens: AT_SHOP (bring it in) or ON_SITE (shop comes to a captured
 * location, e.g. a roadside breakdown) — mirrors the backend's
 * ServiceLocationMode exactly, dropping site* fields whenever AT_SHOP is
 * chosen so a stale pin never rides along.
 */
function BookServiceDialog({ open, onClose, shopId, shopName }) {
  const navigate = useNavigate();
  const [machineId, setMachineId] = useState("");
  const [serviceType, setServiceType] = useState("REPAIR");
  const [requestedDate, setRequestedDate] = useState(todayIso());
  const [customerNotes, setCustomerNotes] = useState("");
  const [locationMode, setLocationMode] = useState("AT_SHOP");
  const [siteAddress, setSiteAddress] = useState("");
  const [siteCoords, setSiteCoords] = useState(null); // { lat, lng }
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [registerOpen, setRegisterOpen] = useState(false);

  const { data: machinesResp, isLoading: machinesLoading } = useGetMyRegisteredMachines();
  const machines = machinesResp?.data ?? [];

  const { mutate: createBooking, isLoading: booking } = useCreateServiceBooking();

  useEffect(() => {
    if (!open) return;
    setMachineId("");
    setServiceType("REPAIR");
    setRequestedDate(todayIso());
    setCustomerNotes("");
    setLocationMode("AT_SHOP");
    setSiteAddress("");
    setSiteCoords(null);
    setLocationError("");
  }, [open]);

  // Once machines finish loading, default to the customer's only machine
  // (or first one) so a returning customer with one vehicle isn't forced
  // to re-pick it every time.
  useEffect(() => {
    if (!machineId && machines.length > 0) setMachineId(machines[0].id);
  }, [machines, machineId]);

  const captureLocation = () => {
    if (!navigator?.geolocation) {
      setLocationError("Your browser doesn't support location capture — enter the address manually.");
      return;
    }
    setLocating(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSiteCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocationError("Couldn't get your location — enter the address manually, or try again.");
        setLocating(false);
      },
      { timeout: 10000, maximumAge: 60000 },
    );
  };

  const canSubmit = useMemo(() => {
    if (!machineId || !serviceType || !requestedDate) return false;
    if (locationMode === "ON_SITE" && !siteCoords) return false;
    return true;
  }, [machineId, serviceType, requestedDate, locationMode, siteCoords]);

  const handleSubmit = () => {
    const payload = {
      machineId,
      shopId,
      serviceType,
      requestedDate: new Date(requestedDate).toISOString(),
      customerNotes: customerNotes || undefined,
      serviceLocationMode: locationMode,
      ...(locationMode === "ON_SITE"
        ? { siteLatitude: siteCoords.lat, siteLongitude: siteCoords.lng, siteAddress: siteAddress || undefined }
        : {}),
    };

    createBooking(payload, {
      onSuccess: () => {
        onClose();
        navigate("/engineering/my-machines");
      },
    });
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Book a Service{shopName ? ` — ${shopName}` : ""}</DialogTitle>
        <DialogContent className="flex flex-col gap-4 pt-2">
          {!machinesLoading && machines.length === 0 && (
            <Alert severity="info" className="mb-1">
              You haven't registered a machine yet.{" "}
              <Button size="small" onClick={() => setRegisterOpen(true)} sx={{ p: 0, minWidth: "auto", verticalAlign: "baseline" }}>
                Register one now
              </Button>
              .
            </Alert>
          )}

          <TextField
            select
            label="Which machine?"
            fullWidth
            value={machineId}
            onChange={(e) => setMachineId(e.target.value)}
            disabled={machinesLoading || machines.length === 0}
          >
            {machines.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {m.nickname || m.plateNumber || m.serialNumber || "Unnamed machine"}
              </MenuItem>
            ))}
          </TextField>

          <Button
            size="small"
            startIcon={<DirectionsCarFilledIcon />}
            onClick={() => setRegisterOpen(true)}
            sx={{ alignSelf: "flex-start", color: "#0f766e" }}
          >
            + Register a different machine
          </Button>

          <TextField
            select
            label="Service type"
            fullWidth
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
          >
            {SERVICE_TYPES.map((t) => (
              <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
            ))}
          </TextField>

          <TextField
            label="Requested date"
            type="date"
            fullWidth
            value={requestedDate}
            onChange={(e) => setRequestedDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: todayIso() }}
          />

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Where should the work happen?</p>
            <ToggleButtonGroup
              value={locationMode}
              exclusive
              fullWidth
              onChange={(_e, value) => value && setLocationMode(value)}
            >
              <ToggleButton value="AT_SHOP" sx={{ textTransform: "none", gap: 1 }}>
                <StorefrontIcon fontSize="small" /> I'll bring it to the shop
              </ToggleButton>
              <ToggleButton value="ON_SITE" sx={{ textTransform: "none", gap: 1 }}>
                <MyLocationIcon fontSize="small" /> Shop comes to me
              </ToggleButton>
            </ToggleButtonGroup>
          </div>

          {locationMode === "ON_SITE" && (
            <div className="flex flex-col gap-2 bg-teal-50 border border-teal-100 rounded-xl p-4">
              <Button
                variant="outlined"
                startIcon={locating ? <CircularProgress size={16} /> : <MyLocationIcon />}
                onClick={captureLocation}
                disabled={locating}
                sx={{ alignSelf: "flex-start", borderColor: "#0f766e", color: "#0f766e" }}
              >
                {siteCoords ? "Update my location" : "Use my current location"}
              </Button>

              {siteCoords && (
                <p className="text-sm text-teal-800 flex items-center gap-1">
                  <CheckCircleIcon sx={{ fontSize: "1rem" }} /> Location captured ({siteCoords.lat.toFixed(4)}, {siteCoords.lng.toFixed(4)})
                </p>
              )}
              {locationError && <p className="text-sm text-red-600">{locationError}</p>}

              <TextField
                label="Address / landmark (optional)"
                placeholder="e.g. Along Kubwa Expressway, near the flyover"
                fullWidth
                size="small"
                value={siteAddress}
                onChange={(e) => setSiteAddress(e.target.value)}
              />
            </div>
          )}

          <TextField
            label="Notes for the shop (optional)"
            placeholder="Describe the issue, or anything the shop should know"
            fullWidth
            multiline
            minRows={2}
            value={customerNotes}
            onChange={(e) => setCustomerNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions className="px-6 pb-4">
          <Button onClick={onClose} disabled={booking}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!canSubmit || booking}
            sx={{ backgroundColor: "#0f766e", "&:hover": { backgroundColor: "#0d5f58" } }}
          >
            {booking ? <CircularProgress size={20} sx={{ color: "white" }} /> : "Request booking"}
          </Button>
        </DialogActions>
      </Dialog>

      <RegisterMachineDialog
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onRegistered={(newMachine) => { if (newMachine?.id) setMachineId(newMachine.id); }}
      />
    </>
  );
}

export default BookServiceDialog;
