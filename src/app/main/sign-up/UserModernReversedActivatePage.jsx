import { Controller, useForm } from "react-hook-form";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import _ from "@lodash";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { useStoreUserPreSignUpFromOtp } from "app/configs/data/server-calls/useUsers/useUsersQuery";
import {
  getMerchantSignUpToken,
  removeUserSignUpToken,
  removeResendMerchantSignUpOtp,
  getResendMerchantSignUpOtp,
} from "app/configs/utils/authUtils";
import { Alert, CircularProgress, LinearProgress } from "@mui/material";
import { Email, AccessTime } from "@mui/icons-material";

/**
 * Form Validation Schema
 */
const schema = z.object({
  otp: z.string().min(1, "You must enter your OTP code"),
});

const defaultValues = {
  otp: "",
  preuser: "",
};

/**
 * Countdown Timer Component
 */
function CountdownTimer({ initialMinutes = 10, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60); // Convert to seconds
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      if (onExpire) onExpire();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = (timeLeft / (initialMinutes * 60)) * 100;

  // Determine color based on time remaining
  const getColor = () => {
    if (timeLeft <= 60) return "#dc2626"; // Red for last minute
    if (timeLeft <= 180) return "#f59e0b"; // Amber for last 3 minutes
    return "#22c55e"; // Green otherwise
  };

  return (
    <Box className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-8">
          <AccessTime sx={{ fontSize: "1.25rem", color: getColor() }} />
          <Typography variant="body2" className="font-semibold" style={{ color: getColor() }}>
            {isExpired ? "Code Expired" : "Time Remaining"}
          </Typography>
        </div>
        <Typography variant="body1" className="font-mono font-bold" style={{ color: getColor() }}>
          {isExpired
            ? "00:00"
            : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`}
        </Typography>
      </div>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: "rgba(0, 0, 0, 0.1)",
          "& .MuiLinearProgress-bar": {
            backgroundColor: getColor(),
            borderRadius: 4,
            transition: "background-color 0.3s ease",
          },
        }}
      />
      {isExpired && (
        <Typography variant="caption" className="text-red-600 mt-8 block text-center">
          Your verification code has expired. Please request a new one.
        </Typography>
      )}
    </Box>
  );
}

/**
 * UserModernReversedActivatePage Component
 * Professional OTP activation page with orange gradient branding
 */
function UserModernReversedActivatePage({ resendOTP }) {
  const remoteResponseToken = getMerchantSignUpToken();
  const avtivateMerchant = useStoreUserPreSignUpFromOtp();
  const clientSignUpData = getResendMerchantSignUpOtp();
  const [isCodeExpired, setIsCodeExpired] = useState(false);

  console.log("remote__User", remoteResponseToken);
  const { control, formState, handleSubmit, reset, getValues, setValue } = useForm({
    mode: "onChange",
    defaultValues,
    resolver: zodResolver(schema),
  });

  const { isValid, dirtyFields, errors } = formState;

  function onSubmit() {
    if (isCodeExpired) {
      return;
    }
    setValue("preuser", remoteResponseToken);
    avtivateMerchant.mutate(getValues());
  }

  function handleResendOTP() {
    setIsCodeExpired(false);
    reset(defaultValues);
    if (resendOTP) {
      resendOTP();
    }
  }

  useEffect(() => {
    if (avtivateMerchant?.isSuccess) {
      removeUserSignUpToken();
      removeResendMerchantSignUpOtp();
    }
  }, [avtivateMerchant?.isSuccess]);

  return (
    <div className="flex min-w-0 flex-auto flex-col items-center sm:justify-center md:p-32">
      <Paper className="flex min-h-full w-full overflow-hidden rounded-0 sm:min-h-auto sm:w-auto sm:rounded-2xl sm:shadow md:w-full md:max-w-6xl">
        {/* Left Side - Illustration */}

        {/* Right Side - Form */}
        <div className="w-full px-16 py-32 ltr:border-l-1 rtl:border-r-1 sm:w-auto sm:p-48 md:p-64">
          <div className="mx-auto w-full max-w-320 sm:mx-0 sm:w-320">
            {/* Logo with Orange Gradient Background */}
            <div
              className="flex h-56 w-56 items-center justify-center rounded-xl mb-32"
              style={{
                background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                boxShadow: "0 4px 20px rgba(234, 88, 12, 0.3)",
              }}
            >
              <img className="w-40" src="assets/images/afslogo/afslogo.png" alt="logo" />
            </div>

            <Typography className="text-4xl font-extrabold leading-tight tracking-tight">
              Verify Your Email
            </Typography>
            <div className="mt-8">
              <Typography className="text-gray-600">
                Enter the verification code sent to{" "}
                <span
                  className="font-semibold"
                  style={{
                    background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {clientSignUpData?.email || "your email"}
                </span>
              </Typography>
            </div>

            {/* Countdown Timer */}
            <div
              className="mt-32 p-20 rounded-xl border-2"
              style={{
                borderColor: isCodeExpired ? "#fecaca" : "#fed7aa",
                backgroundColor: isCodeExpired
                  ? "rgba(254, 202, 202, 0.1)"
                  : "rgba(254, 215, 170, 0.1)",
              }}
            >
              <CountdownTimer initialMinutes={10} onExpire={() => setIsCodeExpired(true)} />
            </div>

            {/* Info Box */}
            <div
              className="mt-24 p-16 rounded-xl border-2"
              style={{
                borderColor: "#e0e7ff",
                backgroundColor: "rgba(224, 231, 255, 0.1)",
              }}
            >
              <div className="flex items-start gap-12">
                <Email sx={{ color: "#6366f1", fontSize: "1.5rem", mt: 0.5 }} />
                <div>
                  <Typography variant="body2" className="font-semibold text-gray-900 mb-4">
                    Check Your Inbox
                  </Typography>
                  <Typography variant="caption" className="text-gray-700 leading-relaxed block">
                    The verification code will expire after 10 minutes for security purposes.
                  </Typography>
                </div>
              </div>
            </div>

            {/* Error/Success Messages */}
            {avtivateMerchant?.isError && (
              <Alert
                severity="error"
                className="mt-24"
                sx={{
                  borderRadius: "12px",
                  "& .MuiAlert-message": {
                    width: "100%",
                  },
                }}
              >
                Invalid or expired OTP code. Please try again or request a new code.
              </Alert>
            )}

            {avtivateMerchant?.isSuccess && (
              <Alert
                severity="success"
                className="mt-24"
                sx={{
                  borderRadius: "12px",
                  backgroundColor: "rgba(34, 197, 94, 0.1)",
                  color: "#166534",
                  "& .MuiAlert-icon": {
                    color: "#22c55e",
                  },
                }}
              >
                Account activated successfully! Redirecting to sign in...
              </Alert>
            )}

            {isCodeExpired && (
              <Alert
                severity="warning"
                className="mt-24"
                sx={{
                  borderRadius: "12px",
                  backgroundColor: "rgba(245, 158, 11, 0.1)",
                  color: "#92400e",
                  "& .MuiAlert-icon": {
                    color: "#f59e0b",
                  },
                }}
              >
                Your verification code has expired. Please request a new one below.
              </Alert>
            )}

            <form
              name="registerForm"
              noValidate
              className="mt-32 flex w-full flex-col justify-center"
              onSubmit={handleSubmit(onSubmit)}
            >
              <Controller
                name="otp"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    className="mb-24"
                    label="Verification Code"
                    type="text"
                    placeholder="Enter code"
                    error={!!errors.otp}
                    helperText={errors?.otp?.message}
                    variant="outlined"
                    required
                    fullWidth
                    autoFocus
                    disabled={isCodeExpired}
                    inputProps={{
                      style: {
                        fontSize: "1.25rem",
                        letterSpacing: "0.25rem",
                        textAlign: "center",
                        fontWeight: "600",
                      },
                      maxLength: 6,
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": {
                          borderColor: "#ea580c",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#ea580c",
                          borderWidth: "2px",
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "#ea580c",
                      },
                    }}
                  />
                )}
              />

              <Button
                variant="contained"
                className="w-full mt-16"
                aria-label="Verify"
                disabled={
                  _.isEmpty(dirtyFields) || !isValid || avtivateMerchant.isLoading || isCodeExpired
                }
                type="submit"
                size="large"
                sx={{
                  background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                  color: "white",
                  fontWeight: 600,
                  height: "48px",
                  fontSize: "1rem",
                  textTransform: "none",
                  "&:hover": {
                    background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
                    boxShadow: "0 4px 12px rgba(234, 88, 12, 0.4)",
                  },
                  "&:disabled": {
                    background: "#e5e7eb",
                    color: "#9ca3af",
                  },
                }}
              >
                {avtivateMerchant.isLoading ? (
                  <div className="flex items-center gap-8">
                    <CircularProgress size={20} sx={{ color: "white" }} />
                    <span>Activating Account...</span>
                  </div>
                ) : (
                  "Activate Account"
                )}
              </Button>

              {/* Resend OTP Section */}
              <div className="mt-32 flex flex-col items-center gap-16">
                <Typography variant="body2" className="text-gray-600 text-center">
                  Didn't receive the code?
                </Typography>
                <Button
                  variant="text"
                  onClick={handleResendOTP}
                  disabled={avtivateMerchant.isLoading}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    "&:hover": {
                      backgroundColor: "rgba(234, 88, 12, 0.05)",
                    },
                  }}
                >
                  Resend Verification Code
                </Button>
              </div>

              {/* Back to Sign In */}
              <div className="mt-32 flex items-center justify-center">
                <Typography variant="body2" className="text-gray-600">
                  Want to use a different email?
                </Typography>
                <a
                  className="ml-8 font-semibold text-sm cursor-pointer"
                  onClick={() => {
                    // Clearing the cookie alone isn't enough: this Link's target is the
                    // same "/sign-up" path we're already on, so react-router treats it as
                    // a no-op and never remounts this component to re-read the (now
                    // cleared) cookie. A hard navigation guarantees a fresh mount that
                    // actually lands on the registration form instead of back here.
                    removeUserSignUpToken();
                    removeResendMerchantSignUpOtp();
                    window.location.href = "/sign-up";
                  }}
                  style={{
                    background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Sign Up Again
                </a>
              </div>
            </form>
          </div>
        </div>
      </Paper>
    </div>
  );
}

export default UserModernReversedActivatePage;
