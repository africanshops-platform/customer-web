import { useState } from "react";
import { motion } from "framer-motion";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { toast } from "react-toastify";
import { useReissueDeliveryCode } from "app/configs/data/server-calls/auth/userapp/a_marketplace/useProductsRepo";

/** The code as big, easy-to-read digits with a copy button — used wherever the customer is shown a code. */
export function DeliveryCodeReveal({ code }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.info("Select the code and copy it.");
    }
  }

  return (
    <div
      className="rounded-2xl text-center px-4 py-6"
      style={{
        background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
        border: "2px dashed #f97316",
      }}
      data-testid="delivery-code"
    >
      <p className="text-xs font-bold uppercase tracking-widest text-orange-700 mb-2">
        Your delivery code
      </p>
      <p
        className="font-mono font-extrabold text-orange-600 select-all"
        style={{ fontSize: "2.6rem", letterSpacing: "0.45rem" }}
        data-testid="delivery-code-digits"
      >
        {code}
      </p>
      <Button size="small" onClick={copy} sx={{ mt: 1, color: "#c2410c" }}>
        {copied ? "Copied ✓" : "Copy code"}
      </Button>
    </div>
  );
}

const RULES = [
  "Give this code to the delivery person ONLY when your order is in your hands.",
  "Never share it earlier, by phone, or with anyone who is not delivering your order.",
];

/** Shown at checkout success: the code appears once, so the customer is told to keep it. */
export function DeliveryCodeSuccessCard({ code, orderViewPath }) {
  return (
    <motion.div className="mb-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      {code ? (
        <>
          <DeliveryCodeReveal code={code} />
          <ul className="mt-3 space-y-1 text-sm text-gray-700 list-disc pl-5">
            {RULES.map((r) => (
              <li key={r}>{r}</li>
            ))}
            <li>We also emailed it to you. If you lose it, you can get a new one from your order page.</li>
          </ul>
        </>
      ) : (
        <div className="rounded-xl p-4 text-sm text-gray-700" style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}>
          Your delivery code is on its way to your email. You can also get a code any time from{" "}
          <a href={orderViewPath} className="font-semibold text-orange-600 underline">
            your order page
          </a>
          .
        </div>
      )}
    </motion.div>
  );
}

/** On the order page: no code is ever re-displayed — the customer can ask for a NEW one. */
export function DeliveryCodePanel({ order, orderId }) {
  const reissue = useReissueDeliveryCode();
  const [newCode, setNewCode] = useState(null);

  if (!order || order.isDelivered || order.isCancelled) return null;

  function getNewCode() {
    reissue.mutate(orderId, {
      onSuccess: (res) => setNewCode(res?.data?.deliveryCode ?? null),
    });
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-4"
        style={{ background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)", border: "1px solid #fdba74" }}
        data-testid="delivery-code-panel"
      >
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-1">Your delivery code</h3>
          <p className="text-sm text-gray-700">
            You were shown a code when you paid (and we emailed it). Give it to the delivery person when your order
            arrives — never before. Lost it? Get a new one; the old code then stops working.
          </p>
        </div>
        <Button
          variant="contained"
          disabled={reissue.isLoading}
          onClick={getNewCode}
          data-testid="get-new-code"
          sx={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", whiteSpace: "nowrap" }}
        >
          {reissue.isLoading ? "Getting a new code…" : "Get a new code"}
        </Button>
      </motion.div>

      <Dialog open={Boolean(newCode)} onClose={() => setNewCode(null)} fullWidth maxWidth="xs">
        <DialogTitle>Your new delivery code</DialogTitle>
        <DialogContent className="flex flex-col gap-3">
          {newCode && <DeliveryCodeReveal code={newCode} />}
          <p className="text-sm text-gray-600">
            The previous code no longer works. This is the only time we show it — we also emailed it to you.
          </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewCode(null)}>Done</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
