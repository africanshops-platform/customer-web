import { motion } from "framer-motion";
import { Backdrop, CircularProgress, Typography } from "@mui/material";
import { STEP_LABELS, WORDS, stepStates } from "app/main/zrootclient/checkout-intent/PaymentCheckingLoader";

const STEP_TEXT = { done: "#86efac", active: "#ffffff", todo: "#9ca3af" };
const STEP_RING = { active: "#ea580c", todo: "#6b7280" };

/**
 * The full-screen "Processing Payment..." cover shown while a card payment is being confirmed with the server.
 * One component for every card checkout that confirms after paying (hotel booking, engineering invoice), so the screens never differ.
 * Moved out of ReviewReservation.jsx unchanged (2026-11-18).
 *
 * @param {boolean} open Show the cover.
 * @param {string} [stage] Only for the intent checkouts (food, marketplace): checking | received | placing | unsure. Adds the second line for that
 *   stage and the three steps (Payment received, Placing your order, Order confirmed). Without it the cover is exactly the hotel booking's.
 */
function PaymentProcessingOverlay({ open = false, stage }) {
  const words = stage ? WORDS[stage] || WORDS.checking : null;
  const steps = stage ? stepStates(stage) : null;
  return (
    <Backdrop
      sx={{
        zIndex: (theme) => theme.zIndex.modal + 1000,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(8px)",
      }}
      open={open}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-6 px-4"
      >
        {/* Logo with Circular Progress */}
        <div className="relative">
          {/* Circular Progress - Orange Theme */}
          <CircularProgress
            size={160}
            thickness={3}
            sx={{
              color: "#ea580c",
              position: "absolute",
              top: -20,
              left: -20,
            }}
          />

          {/* AfricanShops Logo Container */}
          <div
            className="w-[120px] h-[120px] rounded-full flex items-center justify-center shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
            }}
          >
            <img
              src="/assets/images/afslogo/afslogo.png"
              alt="AfricanShops"
              className="w-20 h-20"
              onError={(e) => {
                // Fallback if logo doesn't exist
                e.target.style.display = "none";
                e.target.parentElement.innerHTML = `
                  <div style="color: white; font-size: 2.5rem; font-weight: 900;">AS</div>
                `;
              }}
            />
          </div>

          {/* Pulsing Ring Animation */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.2, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 rounded-full"
            style={{
              border: "3px solid #ea580c",
              margin: "-20px",
            }}
          />
        </div>

        {/* Processing Text with Pulse Animation */}
        <motion.div
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="text-center"
        >
          <Typography
            sx={{
              fontSize: { xs: "1.5rem", sm: "2rem" },
              fontWeight: 800,
              background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: 2,
            }}
          >
            Processing Payment...
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "#e5e7eb",
              fontSize: { xs: "0.9rem", sm: "1rem" },
              fontWeight: 500,
            }}
          >
            {words ? words.subtitle : "Please wait while we verify your payment"}
          </Typography>
        </motion.div>

        {words && (
          <Typography variant="body1" sx={{ color: "#fed7aa", fontSize: { xs: "1rem", sm: "1.15rem" }, fontWeight: 700 }} data-testid="pay-overlay-title" data-stage={stage}>
            {words.title}
          </Typography>
        )}

        {steps && (
          <ol className="w-full max-w-[280px] space-y-2" data-testid="pay-overlay-steps">
            {steps.map((state, i) => (
              <li
                key={STEP_LABELS[i]}
                className="flex items-center gap-3 text-sm font-semibold"
                data-state={state}
                style={{ color: STEP_TEXT[state] }}
              >
                <span
                  className="inline-flex items-center justify-center rounded-full"
                  style={{
                    width: 20,
                    height: 20,
                    fontSize: 12,
                    background: state === "done" ? "#16a34a" : "transparent",
                    color: "#ffffff",
                    border: state === "done" ? "none" : `2px solid ${STEP_RING[state]}`,
                  }}
                >
                  {state === "done" ? "\u2713" : ""}
                </span>
                {STEP_LABELS[i]}
              </li>
            ))}
          </ol>
        )}

        {/* Security Icons with Animation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-4 mt-4"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm">
            <svg
              className="w-5 h-5 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <Typography variant="caption" className="text-white font-semibold">
              Secure
            </Typography>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm">
            <svg
              className="w-5 h-5 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <Typography variant="caption" className="text-white font-semibold">
              Protected
            </Typography>
          </div>
        </motion.div>

        {/* Warning Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="max-w-md mx-auto mt-4"
        >
          <div
            className="p-4 rounded-xl flex items-start gap-3"
            style={{
              background: "rgba(234, 88, 12, 0.15)",
              border: "2px solid rgba(234, 88, 12, 0.3)",
              backdropFilter: "blur(10px)",
            }}
          >
            <svg
              className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <Typography
                variant="body2"
                sx={{
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: { xs: "0.8rem", sm: "0.875rem" },
                }}
              >
                Do not close or refresh this page
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "#e5e7eb",
                  fontSize: { xs: "0.7rem", sm: "0.75rem" },
                  display: "block",
                  marginTop: "4px",
                }}
              >
                Your payment is being securely processed
              </Typography>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </Backdrop>
  );
}

export default PaymentProcessingOverlay;
