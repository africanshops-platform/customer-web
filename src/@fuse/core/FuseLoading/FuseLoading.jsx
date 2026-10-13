import { useTimeout } from "@fuse/hooks";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import clsx from "clsx";
import Box from "@mui/material/Box";
import { keyframes } from "@mui/system";

// Spiral rotation animation
const spiralRotate = keyframes`
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
`;

// Pulse animation for the logo
const pulse = keyframes`
    0%, 100% {
        opacity: 1;
        transform: scale(1);
    }
    50% {
        opacity: 0.8;
        transform: scale(0.95);
    }
`;

// Gradient rotation for the outer ring
const gradientRotate = keyframes`
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
`;

// Fade in animation
const fadeIn = keyframes`
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;

/**
 * FuseLoading displays a professional loading state with company logo and spiral animation
 */
function FuseLoading(props) {
  const { delay = 0, className } = props;
  const [showLoading, setShowLoading] = useState(!delay);

  useTimeout(() => {
    setShowLoading(true);
  }, delay);

  return (
    <div
      className={clsx(
        className,
        "flex flex-1 h-full w-full self-center flex-col items-center justify-center p-24",
        !showLoading ? "hidden" : "",
      )}
      style={{
        background:
          "linear-gradient(135deg, rgba(249, 250, 251, 0.8) 0%, rgba(243, 244, 246, 0.9) 100%)",
      }}
    >
      {/* Loading Container */}
      <Box
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 4,
        }}
      >
        {/* Outer Gradient Ring */}
        <Box
          sx={{
            position: "absolute",
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FF6B35 100%)",
            animation: `${gradientRotate} 3s linear infinite`,
            opacity: 0.2,
          }}
        />

        {/* Spiral Ring 1 - Outer */}
        <Box
          sx={{
            position: "absolute",
            width: 130,
            height: 130,
            borderRadius: "50%",
            border: "3px solid transparent",
            borderTopColor: "#FF6B35",
            borderRightColor: "#FF6B35",
            animation: `${spiralRotate} 1.2s linear infinite`,
            opacity: 0.8,
          }}
        />

        {/* Spiral Ring 2 - Middle */}
        <Box
          sx={{
            position: "absolute",
            width: 110,
            height: 110,
            borderRadius: "50%",
            border: "3px solid transparent",
            borderTopColor: "#F7931E",
            borderLeftColor: "#F7931E",
            animation: `${spiralRotate} 1.5s linear infinite reverse`,
            opacity: 0.6,
          }}
        />

        {/* Spiral Ring 3 - Inner */}
        <Box
          sx={{
            position: "absolute",
            width: 90,
            height: 90,
            borderRadius: "50%",
            border: "2px solid transparent",
            borderTopColor: "#FFA726",
            borderRightColor: "#FFA726",
            borderBottomColor: "#FFA726",
            animation: `${spiralRotate} 1s linear infinite`,
            opacity: 0.4,
          }}
        />

        {/* Center Circle Background */}
        <Box
          sx={{
            position: "relative",
            width: 75,
            height: 75,
            borderRadius: "50%",
            backgroundColor: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            animation: `${pulse} 2s ease-in-out infinite`,
            zIndex: 1,
          }}
        >
          {/* Company Logo */}
          <img
            src="/assets/images/afslogo/afslogo.png"
            alt="AfricanShops"
            style={{
              width: "50px",
              height: "50px",
              objectFit: "contain",
            }}
          />
        </Box>
      </Box>

      {/* Loading Text */}
      <Typography
        className="text-14 font-semibold sm:text-16"
        sx={{
          color: "#FF6B35",
          animation: `${fadeIn} 0.6s ease-out`,
          letterSpacing: "0.5px",
          mt: 2,
        }}
      >
        Loading your dashboard...
      </Typography>

      {/* Subtle subtitle */}
      <Typography
        className="text-11 sm:text-12"
        sx={{
          color: "text.secondary",
          animation: `${fadeIn} 0.8s ease-out`,
          mt: 0.5,
          opacity: 0.7,
        }}
      >
        Please wait a moment
      </Typography>

      {/* Animated dots */}
      <Box
        sx={{
          display: "flex",
          gap: 0.5,
          mt: 2,
          animation: `${fadeIn} 1s ease-out`,
        }}
      >
        {[0, 1, 2].map((index) => (
          <Box
            key={index}
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: "#FF6B35",
              animation: `${pulse} 1.4s ease-in-out infinite`,
              animationDelay: `${index * 0.2}s`,
              opacity: 0.6,
            }}
          />
        ))}
      </Box>
    </div>
  );
}

export default FuseLoading;
