import { Controller, useForm } from "react-hook-form";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Link, useLocation } from "react-router-dom";
import _ from "@lodash";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import FormHelperText from "@mui/material/FormHelperText";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PersonOff, RefreshOutlined } from "@mui/icons-material";
import useGetUserAppSetting from "app/configs/data/server-calls/auth/userapp/a_userapp_settings/useAppSettingDomain";
import CountrySelect from "src/app/apselects/countryselect";

import {
  getLgaByStateId,
  getMarketsByLgaId,
  getStateByCountryId,
} from "app/configs/data/client/clientToApiRoutes";
import StateSelect from "src/app/apselects/stateselect";
import LgaSelect from "src/app/apselects/lgaselect";
import MarketSelect from "src/app/apselects/marketselect";
// import TradehubSelect from "src/app/apselects/tradehubselect";
// import { InputAdornment } from "@mui/material";

// import clsx from "clsx";
import { useShopSignUpWithOtp } from "app/configs/data/server-calls/useUsers/useUsersQuery";
import {
  getMerchantSignUpToken,
  getResendMerchantSignUpOtp,
  removeUserSignUpToken,
  removeResendMerchantSignUpOtp,
  setResendMerchantSignUpOtp,
} from "app/configs/utils/authUtils";
import MerchantModernReversedActivatePage from "./UserModernReversedActivatePage";
/**
 * Form Validation Schema
 */
const schema = z
  .object({
    name: z.string().min(1, "You must enter your business/shop name"),
    email: z.string().email("You must enter a valid email").min(1, "You must enter an email"),
    password: z
      .string()
      .min(1, "Please enter your password.")
      .min(8, "Password is too short - should be 8 chars minimum."),
    passwordConfirm: z.string().min(1, "Password confirmation is required"),
    acceptTermsConditions: z
      .boolean()
      .refine((val) => val === true, "The terms and conditions must be accepted."),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords must match",
    path: ["passwordConfirm"],
  });
const defaultValues = {
  name: "",
  email: "",
  password: "",
  passwordConfirm: "",
  acceptTermsConditions: false,

  userOwner: "",
  address: "",
  businessCountry: "",
  businezState: "",
  businezLga: "",
  tradehub: "",
  market: "",

  coverimage: "",
  shoplogo: "",
  phone: "",
  verified: "false",
  shopplan: "",
};

const STEPS = {
  CATEGORY: 0,
  LOCATION: 1,
  // MOREINFO: 2,
  DESCRIPTION: 2,
};


/* ─────────────────────────────────────────────────────────
   Shown when usersRegistrationEnabled === false in app settings
   ───────────────────────────────────────────────────────── */
function RegistrationDisabledNotice({ onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center text-center w-full pt-8"
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
        <PersonOff sx={{ fontSize: "2.75rem", color: "#ea580c" }} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.35 }}
      >
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Registrations Temporarily Paused
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-5 max-w-xs mx-auto">
          New account registrations are currently paused while we apply important security
          and onboarding improvements.
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
          Our team is reviewing and improving the onboarding process. Existing accounts are
          completely unaffected. New registrations will be re-enabled shortly — usually within a
          short time.
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
          className="w-full flex items-center justify-center gap-2 font-semibold text-sm py-3.5 rounded-xl"
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
        Already have an account?{" "}
        <Link
          to="/sign-in"
          style={{
            background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontWeight: 600,
          }}
        >
          Sign in here
        </Link>
      </p>
    </motion.div>
  );
}

/**
 * The modern reversed sign up page.
 */
function UserModernReversedSignUpPage() {
  const clientSignUpData = getResendMerchantSignUpOtp();
  const remoteResponseToken = getMerchantSignUpToken();
  const sigupClientUsers = useShopSignUpWithOtp();

  // Referral signup-capture (2026-08-14): a shared referral link lands here as
  // /sign-up?usersref=CODE (or adminref/merchantref) — see referral.service.ts's
  // buildReferralLinks. Captured once per visit so it survives the OTP-resend
  // retry, which reuses this same registration attempt.
  const routerLocation = useLocation();
  const refParams = useMemo(() => {
    const params = new URLSearchParams(routerLocation.search);
    const ref = {};
    if (params.get("usersref")) ref.usersref = params.get("usersref");
    if (params.get("adminref")) ref.adminref = params.get("adminref");
    if (params.get("merchantref")) ref.merchantref = params.get("merchantref");
    return Object.keys(ref).length > 0 ? ref : undefined;
  }, [routerLocation.search]);

  // App-settings gate — same pattern as JwtSignInForm
  const {
    data: appSettings,
    isLoading: settingsLoading,
    refetch: refetchSettings,
  } = useGetUserAppSetting();
  const usersRegistrationEnabled = appSettings?.data?.payload?.usersRegistrationEnabled;
  const { control, formState, handleSubmit, setValue, watch, getValues } = useForm({
    mode: "onChange",
    defaultValues,
    resolver: zodResolver(schema),
  });
  const { isValid, dirtyFields, errors } = formState;

  const location = watch("location");
  const businezState = watch("businezState");
  const businezLga = watch("businezLga");
  const market = watch("market");

  const shopregistry = {
    ...getValues(),
    businessCountry: getValues()?.location?.id,
    businezState: getValues()?.businezState?.id,
    businezLga: getValues()?.businezLga?.id,
    tradehub: getValues()?.tradehub?.id,
    market: getValues()?.market?.id,
  };

  function onSubmit() {
    sigupClientUsers.mutate({ formData: shopregistry, refParams });
  }

  // Resend OTP on expiration of OTP
  const resendOTP = () => {
    if (!clientSignUpData?.email) {
      removeUserSignUpToken();
      removeResendMerchantSignUpOtp();
      return;
    }
    sigupClientUsers.mutate({ formData: clientSignUpData, refParams });
  };

  const [step, setStep] = useState(STEPS.CATEGORY);
  const onBack = () => {
    setStep((value) => value - 1);
  };

  const onNext = () => {
    setStep((value) => value + 1);
  };
  const secondaryAction = useMemo(() => {
    if (step === STEPS.CATEGORY) {
      return undefined;
    }
    return onBack;
  }, [step]);

  const setCustomValue = (id, value) => {
    setValue(id, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const [, setLoading] = useState(false);
  const [blgas, setBlgas] = useState([]);
  const [markets, setBMarkets] = useState([]);
  const [stateData, setStateData] = useState([]);

  useEffect(() => {
    if (location?.id?.length > 0) {
      findStatesByCountry(location?.id);
    }

    if (getValues()?.businezState?.id?.length > 0) {
      getLgasFromState(getValues()?.businezState?.id);
    }

    if (getValues()?.businezLga?.id?.length > 0) {
      getMarketsFromLgaId(getValues()?.businezLga?.id);
    }
  }, [location?.id, businezState?.id, businezLga?.id, sigupClientUsers?.isSuccess]);

  useEffect(() => {
    if (sigupClientUsers?.isSuccess) {
      if (shopregistry?.businessCountry) {
        setResendMerchantSignUpOtp(shopregistry);
      }
    }
  }, [sigupClientUsers?.isSuccess, remoteResponseToken]);

  async function findStatesByCountry(countryId) {
    setLoading(true);
    const stateResponseData = await getStateByCountryId(countryId);

    if (stateResponseData) {
      setStateData(stateResponseData?.data?.states);
      setTimeout(() => setLoading(false), 250);
    }
  }

  // Get L.G.As from state_ID data
  async function getLgasFromState(sid) {
    setLoading(true);
    const responseData = await getLgaByStateId(sid);

    if (responseData) {
      setBlgas(responseData?.data?.lgas);
      setTimeout(() => setLoading(false), 250);
    }
  }

  // Get Markets from lga_ID data
  async function getMarketsFromLgaId(lid) {
    if (lid) {
      setLoading(true);
      const responseData = await getMarketsByLgaId(lid);
      if (responseData) {
        setBMarkets(responseData?.data?.markets);
        setTimeout(() => setLoading(false), 250);
      }
    }
  }

  let bodyContent = (
    <div className="flex flex-col gap-8">
      <Typography className="text-lg font-semibold text-gray-900 mb-4">
        Email Details{" "}
        <span className="block mt-2 text-sm font-medium text-gray-600">
          What e-mail are you looking to use as your primary contact email
        </span>
      </Typography>
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            className="mb-24"
            label="Name"
            autoFocus
            type="text"
            error={!!errors.name}
            helperText={errors?.name?.message}
            variant="outlined"
            required
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": { borderColor: "#ea580c" },
                "&.Mui-focused fieldset": { borderColor: "#ea580c" },
              },
              "& .MuiInputLabel-root.Mui-focused": { color: "#ea580c" },
            }}
          />
        )}
      />
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            className="mb-24"
            label="Email Address"
            type="email"
            error={!!errors.email}
            helperText={errors?.email?.message}
            variant="outlined"
            required
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": { borderColor: "#ea580c" },
                "&.Mui-focused fieldset": { borderColor: "#ea580c" },
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
            type="password"
            error={!!errors.password}
            helperText={errors?.password?.message}
            variant="outlined"
            required
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": { borderColor: "#ea580c" },
                "&.Mui-focused fieldset": { borderColor: "#ea580c" },
              },
              "& .MuiInputLabel-root.Mui-focused": { color: "#ea580c" },
            }}
          />
        )}
      />
      <Controller
        name="passwordConfirm"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            className="mb-24"
            label="Confirm Password"
            type="password"
            error={!!errors.passwordConfirm}
            helperText={errors?.passwordConfirm?.message}
            variant="outlined"
            required
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": { borderColor: "#ea580c" },
                "&.Mui-focused fieldset": { borderColor: "#ea580c" },
              },
              "& .MuiInputLabel-root.Mui-focused": { color: "#ea580c" },
            }}
          />
        )}
      />
    </div>
  );

  if (step === STEPS.LOCATION) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Typography className="text-lg font-semibold text-gray-900 mb-4">
          Location : Where are you located?
          <span className="block mt-2 text-xs text-gray-600">
            Note: This location will be used as your closest pick-up location
          </span>
        </Typography>
        <CountrySelect value={location} onChange={(value) => setCustomValue("location", value)} />

        {location?.id && (
          <StateSelect
            states={stateData}
            value={businezState}
            onChange={(value) => setCustomValue("businezState", value)}
          />
        )}

        {businezState?.id && (
          <LgaSelect
            blgas={blgas}
            value={businezLga}
            onChange={(value) => setCustomValue("businezLga", value)}
          />
        )}

        {businezState?.id && businezLga?.id && (
          <MarketSelect
            markets={markets}
            value={market}
            onChange={(value) => setCustomValue("market", value)}
          />
        )}
      </div>
    );
  }

  // if (step == STEPS.MOREINFO) {
  //   bodyContent = (
  //     <div className="flex flex-col gap-8">
  //       <Typography className="text-lg font-semibold text-gray-900 mb-4">
  //         More Info : Provide us some more info to set you up nicely
  //         <span className="block mt-2 text-xs text-gray-600">
  //           Note: This address provided here will be used as your delivery and billing address
  //         </span>
  //       </Typography>
  //       <>
  //         <Controller
  //           name="phone"
  //           control={control}
  //           render={({ field }) => (
  //             <TextField
  //               {...field}
  //               className="mt-8 mb-16"
  //               label="Phone Number"
  //               id="phone"
  //               variant="outlined"
  //               placeholder="Enter your phone number"
  //               fullWidth
  //               error={!!errors.phone}
  //               helperText={errors?.phone?.message}
  //               sx={{
  //                 '& .MuiOutlinedInput-root': {
  //                   '&:hover fieldset': {
  //                     borderColor: '#ea580c',
  //                   },
  //                   '&.Mui-focused fieldset': {
  //                     borderColor: '#ea580c',
  //                   },
  //                 },
  //                 '& .MuiInputLabel-root.Mui-focused': {
  //                   color: '#ea580c',
  //                 },
  //               }}
  //             />
  //           )}
  //         />

  //         <Controller
  //           name="address"
  //           control={control}
  //           render={({ field }) => (
  //             <TextField
  //               {...field}
  //               className="mt-8 mb-16"
  //               label="Business Address"
  //               id="address"
  //               variant="outlined"
  //               placeholder="Enter your full business address"
  //               fullWidth
  //               multiline
  //               rows={3}
  //               error={!!errors.address}
  //               helperText={errors?.address?.message}
  //               sx={{
  //                 '& .MuiOutlinedInput-root': {
  //                   '&:hover fieldset': {
  //                     borderColor: '#ea580c',
  //                   },
  //                   '&.Mui-focused fieldset': {
  //                     borderColor: '#ea580c',
  //                   },
  //                 },
  //                 '& .MuiInputLabel-root.Mui-focused': {
  //                   color: '#ea580c',
  //                 },
  //               }}
  //             />
  //           )}
  //         />
  //       </>
  //     </div>
  //   );
  // }
  if (step === STEPS.DESCRIPTION) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Typography className="text-lg font-semibold text-gray-900 mb-4">
          Terms & Conditions : Accept our terms and conditions and proceed
        </Typography>
        <Controller
          name="acceptTermsConditions"
          control={control}
          render={({ field }) => (
            <FormControl className="items-center" error={!!errors.acceptTermsConditions}>
              <FormControlLabel
                label="I agree to the Terms of Service and Privacy Policy"
                control={
                  <Checkbox
                    size="small"
                    {...field}
                    sx={{
                      "&.Mui-checked": {
                        color: "#ea580c",
                      },
                    }}
                  />
                }
              />
              <FormHelperText>{errors?.acceptTermsConditions?.message}</FormHelperText>
            </FormControl>
          )}
        />
      </div>
    );
  }
  return (
    <div className="flex min-w-0 flex-auto flex-col items-center sm:justify-center md:p-32">
      <Paper className="flex min-h-full w-full overflow-hidden rounded-0 sm:min-h-auto sm:w-auto sm:rounded-2xl sm:shadow md:w-full md:max-w-6xl">
        {/* Right Side - Illustration */}
        <Box
          className="relative hidden h-full flex-auto items-center justify-center overflow-hidden p-64 md:flex lg:px-112"
          style={{
            background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
          }}
        >
          {/* Decorative SVG Background */}
          <svg
            className="pointer-events-none absolute inset-0"
            viewBox="0 0 960 540"
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMax slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g className="opacity-20" fill="none" stroke="white" strokeWidth="100">
              <circle r="234" cx="196" cy="23" />
              <circle r="234" cx="790" cy="491" />
            </g>
          </svg>
          <Box
            component="svg"
            className="absolute -right-64 -top-64 opacity-20"
            viewBox="0 0 220 192"
            width="220px"
            height="192px"
            fill="none"
          >
            <defs>
              <pattern
                id="signup-pattern"
                x="0"
                y="0"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <rect x="0" y="0" width="4" height="4" fill="white" />
              </pattern>
            </defs>
            <rect width="220" height="192" fill="url(#signup-pattern)" />
          </Box>

          <div className="relative z-10 w-full max-w-2xl">
            <div className="text-7xl font-bold leading-none text-white">
              <div>Join Our</div>
              <div>Community</div>
            </div>
            <div className="mt-24 text-lg leading-6 tracking-tight text-white/90">
              Start your journey with AfricanShops and connect with thousands of merchants across
              Africa.
            </div>

            {/* Features Grid */}
            <div className="mt-32 grid grid-cols-2 gap-16">
              <div className="flex flex-col">
                <div className="flex h-44 w-44 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <Typography className="text-2xl font-bold text-white">🛍️</Typography>
                </div>
                <Typography className="mt-12 text-lg font-semibold text-white">
                  Easy Setup
                </Typography>
                <Typography className="mt-4 text-sm text-white/80">
                  Get your shop online in minutes
                </Typography>
              </div>
              <div className="flex flex-col">
                <div className="flex h-44 w-44 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <Typography className="text-2xl font-bold text-white">📊</Typography>
                </div>
                <Typography className="mt-12 text-lg font-semibold text-white">
                  Track Sales
                </Typography>
                <Typography className="mt-4 text-sm text-white/80">
                  Real-time analytics and insights
                </Typography>
              </div>
              <div className="flex flex-col">
                <div className="flex h-44 w-44 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <Typography className="text-2xl font-bold text-white">🌍</Typography>
                </div>
                <Typography className="mt-12 text-lg font-semibold text-white">
                  Reach Customers
                </Typography>
                <Typography className="mt-4 text-sm text-white/80">
                  Connect with buyers nationwide
                </Typography>
              </div>
              <div className="flex flex-col">
                <div className="flex h-44 w-44 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <Typography className="text-2xl font-bold text-white">💳</Typography>
                </div>
                <Typography className="mt-12 text-lg font-semibold text-white">
                  Secure Payments
                </Typography>
                <Typography className="mt-4 text-sm text-white/80">
                  Safe and reliable transactions
                </Typography>
              </div>
            </div>
          </div>
        </Box>

        {/* Left Side - Form */}
        {!remoteResponseToken.length > 0 ? (
          <div className="w-full px-16 py-32 ltr:border-l-1 rtl:border-r-1 sm:w-auto sm:p-48 md:p-64">
            <div className="mx-auto w-full max-w-320 sm:mx-0 sm:w-320">
              {/* Logo — always visible */}
              <div
                className="flex h-56 w-56 items-center justify-center rounded-xl mb-32"
                style={{
                  background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                  boxShadow: "0 4px 20px rgba(234, 88, 12, 0.3)",
                }}
              >
                <img className="w-40" src="assets/images/afslogo/afslogo.png" alt="logo" />
              </div>

              {/* Gate: block registration only when explicitly disabled */}
              {!settingsLoading && usersRegistrationEnabled === false ? (
                <RegistrationDisabledNotice onRetry={refetchSettings} />
              ) : (
                <>
                  <Typography className="text-4xl font-extrabold leading-tight tracking-tight">
                    Create Your Account
                  </Typography>
                  <div className="mt-8 flex items-baseline font-medium">
                    <Typography className="text-gray-600">Already have an account?</Typography>
                    <Link
                      className="ml-4 font-semibold"
                      to="/sign-in"
                      style={{
                        background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      Sign in
                    </Link>
                  </div>

                  {/* Progress Indicator */}
                  <div className="mt-32 mb-24">
                    <div className="flex items-center justify-between relative">
                      {["Email", "Location", "Terms"].map((label, idx) => (
                        <div key={idx} className="flex flex-col items-center flex-1 relative">
                          <div
                            className={`w-32 h-32 rounded-full flex items-center justify-center z-10 ${
                              step >= idx ? "text-white" : "bg-gray-200 text-gray-400"
                            }`}
                            style={
                              step >= idx
                                ? { background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" }
                                : {}
                            }
                          >
                            <Typography className="text-xs font-bold">{idx + 1}</Typography>
                          </div>
                          <Typography className="mt-4 text-xs text-gray-600">{label}</Typography>
                        </div>
                      ))}
                      {/* Progress Line */}
                      <div
                        className="absolute top-16 left-0 right-0 h-2 bg-gray-200"
                        style={{ zIndex: 0 }}
                      >
                        <div
                          className="h-full transition-all duration-300"
                          style={{
                            width: `${(step / 2) * 100}%`,
                            background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <form
                    name="registerForm"
                    noValidate
                    className="mt-32 flex w-full flex-col justify-center"
                    onSubmit={handleSubmit(onSubmit)}
                  >
                    <div
                      className="max-h-[50vh] overflow-y-auto pr-8"
                      style={{ scrollbarWidth: "thin", scrollbarColor: "#ea580c #f5f5f4" }}
                    >
                      {bodyContent}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-16 mt-32">
                      <Button
                        variant="outlined"
                        size="large"
                        onClick={secondaryAction}
                        disabled={step === STEPS.CATEGORY}
                        sx={{
                          flex: 1,
                          borderColor: "#ea580c",
                          color: "#ea580c",
                          fontWeight: 600,
                          "&:hover": {
                            borderColor: "#c2410c",
                            backgroundColor: "rgba(234, 88, 12, 0.05)",
                          },
                          "&:disabled": { borderColor: "#e5e7eb", color: "#9ca3af" },
                        }}
                      >
                        Back
                      </Button>
                      {step < 2 ? (
                        <Button
                          variant="contained"
                          size="large"
                          onClick={onNext}
                          disabled={step === STEPS.DESCRIPTION}
                          sx={{
                            flex: 1,
                            background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                            color: "white",
                            fontWeight: 600,
                            "&:hover": { background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)" },
                          }}
                        >
                          Next
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          size="large"
                          aria-label="Register"
                          disabled={_.isEmpty(dirtyFields) || !isValid || sigupClientUsers?.isLoading}
                          type="submit"
                          sx={{
                            flex: 1,
                            background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                            color: "white",
                            fontWeight: 600,
                            "&:hover": { background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)" },
                            "&:disabled": { background: "#e5e7eb", color: "#9ca3af" },
                          }}
                        >
                          {sigupClientUsers?.isLoading
                            ? "Creating Account..."
                            : "Create Your Free Account"}
                        </Button>
                      )}
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        ) : (
          <MerchantModernReversedActivatePage resendOTP={resendOTP} />
        )}
      </Paper>
    </div>
  );
}

export default UserModernReversedSignUpPage;
