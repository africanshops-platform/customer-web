import CircularProgress from "@mui/material/CircularProgress";
import { motion } from "framer-motion";

/**
 * F28: the loading state shown INSIDE the order summary card while the page follows a payment to an order. The same look as the full-page "Processing
 * Payment..." overlay (orange ring around the logo, pulsing words) at card size, plus three steps so the customer sees where it is:
 *   Payment received -> Placing your order -> Order confirmed
 * stage: checking (nothing known yet) | received (the money is there) | placing (the order is being made) | unsure (our servers could not be reached; no steps shown,
 * because we do not know). The server drives the stage; the page only shows it.
 */
const WORDS = {
  checking: { title: "Confirming your payment...", subtitle: "Please do not pay again" },
  received: { title: "Payment received", subtitle: "Getting your order ready..." },
  placing: { title: "Placing your order...", subtitle: "Your payment was received" },
  unsure: { title: "Still checking your payment...", subtitle: "Please do not pay again" },
};

/** Which of the three steps is done / active / waiting for a stage. */
export function stepStates(stage) {
  if (stage === "received" || stage === "placing") return ["done", "active", "todo"];
  if (stage === "checking") return ["active", "todo", "todo"];
  return null; // unsure: no steps
}

const STEP_LABELS = ["Payment received", "Placing your order", "Order confirmed"];

export default function PaymentCheckingLoader({ stage = "checking", title, subtitle, testId = "pay-checking-loader" }) {
  const words = WORDS[stage] || WORDS.checking;
  const steps = stepStates(stage);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="mt-4 flex flex-col items-center gap-3 rounded-xl px-4 py-5"
      style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.10) 0%, rgba(234,88,12,0.05) 100%)", border: "1px solid rgba(234,88,12,0.2)" }}
      role="status"
      aria-live="polite"
      data-testid={testId}
      data-stage={stage}
    >
      <div className="relative" style={{ width: 72, height: 72 }}>
        <CircularProgress size={72} thickness={3} sx={{ color: "#ea580c", position: "absolute", top: 0, left: 0 }} />
        <div
          className="absolute rounded-full flex items-center justify-center shadow-lg"
          style={{ top: 10, left: 10, width: 52, height: 52, background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" }}
        >
          <img
            src="/assets/images/afslogo/afslogo.png"
            alt="AfricanShops"
            style={{ width: 34, height: 34 }}
            onError={(e) => {
              e.target.style.display = "none";
              e.target.parentElement.innerHTML = '<div style="color: white; font-size: 1.1rem; font-weight: 900;">AS</div>';
            }}
          />
        </div>
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute rounded-full"
          style={{ inset: -4, border: "2px solid #ea580c" }}
        />
      </div>
      <motion.div animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} className="text-center">
        <p className="text-sm font-extrabold" style={{ color: "#ea580c" }}>{title || words.title}</p>
        <p className="text-xs font-medium" style={{ color: "#6b7280" }}>{subtitle || words.subtitle}</p>
      </motion.div>
      {steps && (
        <ol className="w-full max-w-[260px] space-y-1.5" data-testid={testId + "-steps"}>
          {steps.map((state, i) => (
            <li key={STEP_LABELS[i]} className="flex items-center gap-2 text-xs" data-state={state} style={{ color: state === "todo" ? "#9ca3af" : state === "done" ? "#16a34a" : "#ea580c", fontWeight: state === "active" ? 700 : 500 }}>
              <span
                className="inline-flex items-center justify-center rounded-full"
                style={{ width: 16, height: 16, fontSize: 10, background: state === "done" ? "#16a34a" : "transparent", color: state === "done" ? "#fff" : "inherit", border: state === "done" ? "none" : "2px solid currentColor" }}
              >
                {state === "done" ? "\u2713" : ""}
              </span>
              {STEP_LABELS[i]}
            </li>
          ))}
        </ol>
      )}
    </motion.div>
  );
}
