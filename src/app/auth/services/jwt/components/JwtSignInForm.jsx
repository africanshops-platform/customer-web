import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import _ from "@lodash";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { LockOutlined, RefreshOutlined } from "@mui/icons-material";
import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import useGetUserAppSetting from "app/configs/data/server-calls/auth/userapp/a_userapp_settings/useAppSettingDomain";
import useJwtAuth from "../useJwtAuth";
import { useVerify2faLogin } from "app/configs/data/server-calls/auth/admin-auth";

const defaultValues = {
  email: "",
  password: "",
  remember: true,
};

/* ─────────────────────────────────────────────────────────
   Shown when usersLoginEnabled === false in app settings
   ───────────────────────────────────────────────────────── */
function LoginDisabledNotice({ onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-32 flex flex-col items-center text-center w-full"
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.75 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1, type: "spring", stiffness: 180 }}
        className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
        style={{
          background: "linear-gradient(135deg, rgba(249,115,22,0.12) 0%, rgba(234,88,12,0.07) 100%)",
          boxShadow: "0 0 0 8px rgba(249,115,22,0.06)",
        }}
      >
        <LockOutlined sx={{ fontSize: "2.75rem", color: "#ea580c" }} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.35 }}
      >
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Login Temporarily Unavailable
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-5 max-w-xs mx-auto">
          User logins are currently paused while our team applies security updates to keep
          your account protected.
        </p>
      </motion.div>

      {/* Info card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.35 }}
        className="w-full px-5 py-4 rounded-2xl mb-6 text-left"
        style={{
          background: "rgba(249,115,22,0.06)",
          border: "1px solid rgba(249,115,22,0.18)",
        }}
      >
        <p className="text-sm font-bold text-orange-700 mb-1.5">What's happening?</p>
        <p className="text-sm text-gray-600 leading-relaxed">
          Our team is performing routine security maintenance. Your account and data are
          completely safe — no action is needed on your end. This is usually resolved
          within a short time.
        </p>
      </motion.div>

      {/* Retry button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="w-full"
      >
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onRetry}
          className="w-full flex items-center justify-center gap-2 font-semibold text-sm py-3.5 rounded-xl transition-all"
          style={{
            background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
            color: "white",
            boxShadow: "0 4px 14px rgba(234,88,12,0.35)",
          }}
        >
          <RefreshOutlined sx={{ fontSize: "1.1rem" }} />
          Check Again
        </motion.button>
      </motion.div>

      <p className="text-xs text-gray-400 mt-5">
        Need urgent help?{" "}
        <span className="text-orange-500 font-semibold cursor-pointer">
          Contact support
        </span>
      </p>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main login form
   ───────────────────────────────────────────────────────── */
function JwtSignInForm() {
  const { signIn, isLoading } = useJwtAuth();
  const [showPassword, setShowPassword] = useState(false);
  // F30: set when the account has the authenticator on; the form then asks for the code instead of the password.
  const [challenge, setChallenge] = useState(null);
  const [totpCode, setTotpCode] = useState("");
  const verify = useVerify2faLogin();

  // Fetch app settings — cached for 5 minutes, so this is near-instant on repeat visits
  const {
    data: appSettings,
    isLoading: settingsLoading,
    refetch: refetchSettings,
  } = useGetUserAppSetting();

  const usersLoginEnabled = appSettings?.data?.payload?.usersLoginEnabled;
  // console.log("usersLoginEnabled", usersLoginEnabled);

  const { control, formState, handleSubmit } = useForm({
    mode: "onChange",
    defaultValues,
  });
  const { isValid, dirtyFields, errors } = formState;

  function onSubmit({ email, password }) {
    signIn({ email, password })
      .then((result) => {
        if (result?.requiresTwoFactor) setChallenge(result);
      })
      .catch((error) => {
        console.error("FormJSXError", error);
        toast.error(error?.message);
      });
  }

  // Block login only when the setting explicitly resolves to false.
  // While still loading, or on network error, we fail open (show the form).
  if (!settingsLoading && usersLoginEnabled === false) {
    return <LoginDisabledNotice onRetry={refetchSettings} />;
  }

  if (challenge) {
    const code = totpCode.trim();
    const submitCode = () => {
      if (!code || verify.isLoading) return;
      verify.mutate(
        { tempToken: challenge.tempToken, totpCode: code },
        {
          onError: (error) => {
            // The challenge is gone (expired, or too many wrong codes): start again from the password.
            if (error?.response?.status === 429 || /challenge|login again/i.test(error?.response?.data?.message ?? "")) {
              setChallenge(null);
              setTotpCode("");
            }
          },
        },
      );
    };

    return (
      <div className="mt-32 flex w-full flex-col justify-center">
        <h3 className="text-xl font-bold mb-8">Enter your code</h3>
        <p className="text-sm text-gray-500 mb-24">
          Open your authenticator app and enter the 6-digit code for AfricanShops. Lost your phone? Use one of your backup codes instead.
        </p>
        <TextField
          autoFocus
          fullWidth
          label="Authenticator or backup code"
          value={totpCode}
          onChange={(e) => setTotpCode(e.target.value.replace(/\s/g, ""))}
          onKeyDown={(e) => e.key === "Enter" && submitCode()}
          inputProps={{ autoComplete: "one-time-code", maxLength: 12 }}
        />
        <Button
          variant="contained"
          className="mt-16 w-full"
          disabled={!code || verify.isLoading}
          onClick={submitCode}
          size="large"
          sx={{
            background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
            color: "white",
            fontWeight: 600,
            height: "48px",
            "&:disabled": { background: "#e5e7eb", color: "#9ca3af" },
          }}
        >
          {verify.isLoading ? "Checking..." : "Verify and sign in"}
        </Button>
        <Button
          className="mt-8"
          onClick={() => {
            setChallenge(null);
            setTotpCode("");
          }}
        >
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <form
      name="loginForm"
      noValidate
      className="mt-32 flex w-full flex-col justify-center"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            className="mb-24"
            label="Email"
            autoFocus
            type="email"
            error={!!errors.email}
            helperText={errors?.email?.message}
            variant="outlined"
            required
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": { borderColor: "#ea580c" },
                "&.Mui-focused fieldset": { borderColor: "#ea580c", borderWidth: "2px" },
              },
              "& .MuiInputLabel-root.Mui-focused": { color: "#ea580c" },
            }}
          />
        )}
      />

      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            className="mb-24"
            label="Password"
            type={showPassword ? "text" : "password"}
            error={!!errors.password}
            helperText={errors?.password?.message}
            variant="outlined"
            required
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword((v) => !v)}
                    onMouseDown={(e) => e.preventDefault()}
                    edge="end"
                    sx={{ color: "#ea580c" }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": { borderColor: "#ea580c" },
                "&.Mui-focused fieldset": { borderColor: "#ea580c", borderWidth: "2px" },
              },
              "& .MuiInputLabel-root.Mui-focused": { color: "#ea580c" },
            }}
          />
        )}
      />

      <div className="flex flex-col items-center justify-center sm:flex-row sm:justify-between">
        <Controller
          name="remember"
          control={control}
          render={({ field }) => (
            <FormControl>
              <FormControlLabel
                label="Remember me"
                control={
                  <Checkbox
                    size="small"
                    {...field}
                    sx={{ "&.Mui-checked": { color: "#ea580c" } }}
                  />
                }
              />
            </FormControl>
          )}
        />

        <Link
          className="text-md font-medium"
          to="/forgot-password"
          style={{
            background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Forgot password?
        </Link>
      </div>

      <Button
        variant="contained"
        className="mt-16 w-full"
        aria-label="Sign in"
        disabled={_.isEmpty(dirtyFields) || !isValid || isLoading}
        type="submit"
        size="large"
        sx={{
          background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
          color: "white",
          fontWeight: 600,
          height: "48px",
          fontSize: "1rem",
          "&:hover": { background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)" },
          "&:disabled": { background: "#e5e7eb", color: "#9ca3af" },
        }}
      >
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}

export default JwtSignInForm;
