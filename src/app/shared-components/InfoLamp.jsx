import Box from "@mui/material/Box";
import { keyframes } from "@mui/material/styles";
import Lightbulb from "@mui/icons-material/Lightbulb";

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 6px 1px rgba(249, 115, 22, 0.45), 0 0 14px 2px rgba(249, 115, 22, 0.2); }
  50% { box-shadow: 0 0 12px 3px rgba(249, 115, 22, 0.75), 0 0 26px 7px rgba(249, 115, 22, 0.35); }
`;

/**
 * A lit orange lamp that says "this is good to know" without asking for anything.
 * Used where a checkout used to tell the buyer to read before proceeding: it informs and never blocks, so a fast
 * checkout is not slowed by a tick box. The glow is switched off for people who ask for reduced motion.
 */
function InfoLamp({ size = 48, label = "Good to know" }) {
  return (
    <Box
      role="img"
      aria-label={label}
      data-testid="info-lamp"
      sx={{
        width: size,
        height: size,
        borderRadius: "12px",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #fb923c 0%, #ea580c 100%)",
        animation: `${glow} 2.6s ease-in-out infinite`,
        "@media (prefers-reduced-motion: reduce)": {
          animation: "none",
          boxShadow: "0 0 10px 2px rgba(249, 115, 22, 0.5)",
        },
      }}
    >
      <Lightbulb
        sx={{
          color: "#fff7ed",
          fontSize: size * 0.55,
          filter: "drop-shadow(0 0 4px rgba(255, 237, 213, 0.9))",
        }}
      />
    </Box>
  );
}

export default InfoLamp;
