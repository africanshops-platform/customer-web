import CircularProgress from "@mui/material/CircularProgress";
import { motion } from "framer-motion";

/**
 * F28: the loading state shown INSIDE the order summary card while the page confirms a payment with the server (confirming, still placing the order, or
 * the server could not be reached). The same look as the full-page "Processing Payment..." overlay (orange ring around the logo, pulsing words), at card size,
 * so the rest of the page stays usable. Shown for as long as the page is still asking; it is never shown once the customer is told it failed.
 */
export default function PaymentCheckingLoader({ title = "Confirming your payment...", subtitle = "Please do not pay again", testId = "pay-checking-loader" }) {
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
        <p className="text-sm font-extrabold" style={{ color: "#ea580c" }}>{title}</p>
        <p className="text-xs font-medium" style={{ color: "#6b7280" }}>{subtitle}</p>
      </motion.div>
    </motion.div>
  );
}
