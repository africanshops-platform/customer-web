import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Alert, Button, CircularProgress, Paper, TextField, Typography } from "@mui/material";
import { Api } from "app/configs/data/client/RepositoryClient";

const naira = (kobo) =>
  kobo == null
    ? "—"
    : `₦${(Number(BigInt(kobo)) / 100).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pct = (bp) => `${(Number(bp || 0) / 100).toString()}%`;
const messageOf = (e, fallback) => e?.response?.data?.message?.toString?.() || fallback;

/**
 * Pay page of a walk-in parcel (W2a). Shows the invoice, checks the sender's phone with a one-time code, and keeps "Pay" disabled
 * while the payment services are not ready. Payment itself arrives in the next step (W2b), so Pay stays disabled for now.
 */
function WalkInPayPage() {
  const { waybillNo } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [ready, setReady] = useState(null); // null = checking
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState("phone"); // phone | code | verified
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [trail, setTrail] = useState(null);

  const load = useCallback(() => {
    Api()
      .get(`/public/waybills/${encodeURIComponent(waybillNo)}`)
      .then((res) => {
        setInvoice(res.data);
        if (res.data.verified) setStep("verified");
      })
      .catch((e) => setLoadError(messageOf(e, "We could not find this waybill.")));
  }, [waybillNo]);

  useEffect(() => {
    load();
    Api()
      .get("/public/walk-in-parcel/readiness")
      .then((res) => setReady(res.data?.healthy === true))
      .catch(() => setReady(false));
  }, [load]);

  async function sendCode() {
    setBusy(true);
    setError("");
    try {
      await Api().post(`/public/waybills/${encodeURIComponent(waybillNo)}/otp`, { phone: phone.trim() });
      setNote("If that number matches the sender on this waybill, we have sent a code. It lasts 10 minutes.");
      setStep("code");
    } catch (e) {
      setError(messageOf(e, "We could not send a code right now."));
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    setBusy(true);
    setError("");
    try {
      const res = await Api().post(`/public/waybills/${encodeURIComponent(waybillNo)}/verify`, { phone: phone.trim(), code: code.trim() });
      setTrail(res.data);
      setStep("verified");
    } catch (e) {
      setError(messageOf(e, "That code did not work."));
    } finally {
      setBusy(false);
    }
  }

  if (loadError) {
    return (
      <div className="p-24 max-w-md mx-auto">
        <Alert severity="error">{loadError}</Alert>
      </div>
    );
  }
  if (!invoice) {
    return (
      <div className="p-48 flex justify-center">
        <CircularProgress />
      </div>
    );
  }

  const inv = invoice.invoice;
  const insured = Number(inv.insurancePercentBp) > 0;
  const payable = invoice.payable;

  return (
    <div className="p-16 sm:p-24 max-w-md mx-auto w-full flex flex-col gap-16">
      <div>
        <Typography variant="h5" className="font-bold">Pay for your parcel</Typography>
        <Typography color="text.secondary">
          {invoice.warehouseName} · {invoice.waybillNo}
        </Typography>
      </div>

      <Paper variant="outlined" className="p-16 flex flex-col gap-8" data-testid="pay-invoice">
        <Typography variant="body2" color="text.secondary">
          To {invoice.destination} · {invoice.totalWeightKg} kg
          {(invoice.parcels || []).length ? ` · ${(invoice.parcels || []).map((p) => p.description).join(", ")}` : ""}
        </Typography>
        <div className="flex justify-between"><span>Shipping</span><b>{naira(inv.shippingKobo)}</b></div>
        <div className="flex justify-between"><span>Handling ({pct(inv.handlingPercentBp)})</span><b>{naira(inv.handlingKobo)}</b></div>
        {insured && (
          <div className="flex justify-between">
            <span>Insurance ({pct(inv.insurancePercentBp)}, covers {naira(inv.insuredValueKobo)})</span>
            <b>{naira(inv.insurancePremiumKobo)}</b>
          </div>
        )}
        <div className="flex justify-between text-20 mt-8"><span className="font-semibold">Total</span><b>{naira(inv.totalKobo)}</b></div>
      </Paper>

      {!payable && <Alert severity="info">This waybill can no longer be paid ({String(invoice.status).toLowerCase()}).</Alert>}

      {payable && step !== "verified" && (
        <Paper variant="outlined" className="p-16 flex flex-col gap-12">
          <Typography className="font-semibold">Confirm it is you</Typography>
          <Typography variant="body2" color="text.secondary">
            We will text a code to the sender's phone on this waybill ({invoice.senderPhoneMasked}). Type the number to receive it.
          </Typography>
          <TextField label="Sender's phone number" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={step === "code"} fullWidth />
          {step === "phone" && (
            <Button variant="contained" disabled={busy || phone.trim().length < 7} onClick={sendCode}>
              {busy ? "Sending…" : "Send me a code"}
            </Button>
          )}
          {step === "code" && (
            <>
              {note && <Alert severity="info">{note}</Alert>}
              <TextField
                label="6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputProps={{ inputMode: "numeric" }}
                fullWidth
              />
              <div className="flex gap-8">
                <Button variant="contained" disabled={busy || code.length !== 6} onClick={verify}>
                  {busy ? "Checking…" : "Confirm"}
                </Button>
                <Button disabled={busy} onClick={() => { setStep("phone"); setCode(""); setError(""); }}>
                  Use another number or resend
                </Button>
              </div>
            </>
          )}
          {error && <Alert severity="error">{error}</Alert>}
        </Paper>
      )}

      {payable && step === "verified" && (
        <Paper variant="outlined" className="p-16 flex flex-col gap-12">
          <Alert severity="success">Phone confirmed{trail?.trailStamp ? ` on ${trail.trailStamp}` : ""}.{trail?.trailRef ? ` Reference ${trail.trailRef}.` : ""}</Alert>
          {ready === false && <Alert severity="warning">Payments are temporarily unavailable. Please try again in a few minutes.</Alert>}
          {/* Pay stays disabled: payment goes live in the next step (W2b). It will also stay disabled whenever the readiness check fails. */}
          <Button variant="contained" size="large" disabled data-testid="pay-button">
            Pay {naira(inv.totalKobo)}
          </Button>
          <Typography variant="caption" color="text.secondary">
            Card and bank-transfer payment opens here very soon. Your parcel is quoted and your phone is confirmed.
          </Typography>
        </Paper>
      )}
    </div>
  );
}

export default WalkInPayPage;
