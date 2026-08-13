import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import FormHelperText from "@mui/material/FormHelperText";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { CircularProgress, Chip } from "@mui/material";
import { motion } from "framer-motion";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { toast } from "react-toastify";
import {
  useUserUpdateMutation,
  useGetAuthUserDetails,
} from "app/configs/data/server-calls/useUsers/useUsersQuery";
import { useEffect } from "react";
import SessionsSection from "./SessionsSection";

const defaultValues = {
  twoStepVerification: false,
  askPasswordChange: false,
};

/**
 * Form Validation Schema
 */
const schema = z.object({
  twoStepVerification: z.boolean(),
  askPasswordChange: z.boolean(),
});

function SecuritySetting() {
  const { data: userProfileData } = useGetAuthUserDetails();
  const { control, handleSubmit, formState, watch, reset } = useForm({
    defaultValues,
    mode: "onChange",
    resolver: zodResolver(schema),
  });

  const { isDirty } = formState;
  const { twoStepVerification, askPasswordChange } = watch();
  const updateUserDetails = useUserUpdateMutation();

  console.log("Full userProfileData in SecuritySetting:", userProfileData);
  console.log("Security Setting Form State:", { twoStepVerification, askPasswordChange });
  console.log("user details in Security Settings:", watch());

  // Populate form with user data from API
  useEffect(() => {
    if (userProfileData?.data?.user) {
      const userData = userProfileData.data.user;
      console.log("User data from API in SecuritySetting:", userData);
      reset({
        twoStepVerification: userData?.twoStepVerification ?? false,
        askPasswordChange: userData?.askPasswordChange ?? false,
      });
    } else if (userProfileData?.user) {
      // Fallback for different API response structure
      const userData = userProfileData.user;
      console.log("User data from API (fallback) in SecuritySetting:", userData);
      reset({
        twoStepVerification: userData?.twoStepVerification ?? false,
        askPasswordChange: userData?.askPasswordChange ?? false,
      });
    }
  }, [userProfileData, reset]);

  // Handle successful update
  useEffect(() => {
    if (updateUserDetails?.isSuccess) {
      toast.success("Security preferences updated successfully!");
    }
  }, [updateUserDetails?.isSuccess]);

  // Handle update error
  useEffect(() => {
    if (updateUserDetails?.isError) {
      toast.error(
        updateUserDetails?.error?.response?.data?.message ||
          "Failed to update security preferences. Please try again.",
      );
    }
  }, [updateUserDetails?.isError]);

  /**
   * Form Submit
   */
  function onSubmit(formData) {
    console.log("Security Settings:", formData);
    const postData = {
      twoStepVerification: formData.twoStepVerification,
      askPasswordChange: formData.askPasswordChange,
    };
    console.log("Post Data to be sent:", postData);
    updateUserDetails.mutate(postData);
  }

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6"
      style={{
        border: "2px solid rgba(234, 88, 12, 0.1)",
      }}
    >
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
          }}
        >
          <FuseSvgIcon className="text-white" size={24}>
            heroicons-solid:shield-check
          </FuseSvgIcon>
        </div>
        <div>
          <Typography className="text-xl font-bold text-gray-800">Security Preferences</Typography>
          <Typography className="text-sm text-gray-600">
            Keep your account more secure with following preferences
          </Typography>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6">
          {/* Two-Step Verification */}
          <div
            className="p-4 rounded-xl transition-all"
            style={{
              background: twoStepVerification
                ? "linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(22, 163, 74, 0.05) 100%)"
                : "rgba(249, 250, 251, 1)",
              border: twoStepVerification
                ? "2px solid rgba(34, 197, 94, 0.2)"
                : "2px solid rgba(229, 231, 235, 1)",
            }}
          >
            <Controller
              name="twoStepVerification"
              control={control}
              render={({ field: { onChange, value } }) => (
                <div className="flex flex-col w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                          value ? "bg-green-100" : "bg-gray-100"
                        }`}
                      >
                        <FuseSvgIcon
                          size={20}
                          className={value ? "text-green-600" : "text-gray-600"}
                        >
                          heroicons-solid:device-mobile
                        </FuseSvgIcon>
                      </div>
                      <div className="flex-1">
                        <Typography className="text-base font-semibold text-gray-800">
                          Enable 2-Step Authentication
                        </Typography>
                        <FormHelperText className="mt-1">
                          Protects you against password theft by requesting an authentication code
                          via SMS on every login
                        </FormHelperText>
                      </div>
                    </div>
                    <Switch
                      onChange={(ev) => {
                        onChange(ev.target.checked);
                      }}
                      checked={value}
                      name="twoStepVerification"
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "#22c55e",
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                          backgroundColor: "#22c55e",
                        },
                      }}
                    />
                  </div>
                  {value && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 pt-4 border-t border-green-200"
                    >
                      <div className="flex items-start gap-2">
                        <FuseSvgIcon size={16} className="text-green-600 mt-0.5">
                          heroicons-solid:check-circle
                        </FuseSvgIcon>
                        <Typography className="text-xs text-green-700">
                          You'll receive a verification code via SMS whenever you sign in from a new
                          device
                        </Typography>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            />
          </div>

          {/* Password Change Reminder */}
          <div
            className="p-4 rounded-xl transition-all"
            style={{
              background: askPasswordChange
                ? "linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(22, 163, 74, 0.05) 100%)"
                : "rgba(249, 250, 251, 1)",
              border: askPasswordChange
                ? "2px solid rgba(34, 197, 94, 0.2)"
                : "2px solid rgba(229, 231, 235, 1)",
            }}
          >
            <Controller
              name="askPasswordChange"
              control={control}
              render={({ field: { onChange, value } }) => (
                <div className="flex flex-col w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                          value ? "bg-green-100" : "bg-gray-100"
                        }`}
                      >
                        <FuseSvgIcon
                          size={20}
                          className={value ? "text-green-600" : "text-gray-600"}
                        >
                          heroicons-solid:clock
                        </FuseSvgIcon>
                      </div>
                      <div className="flex-1">
                        <Typography className="text-base font-semibold text-gray-800">
                          Ask to Change Password Every 6 Months
                        </Typography>
                        <FormHelperText className="mt-1">
                          A simple but effective way to be protected against data leaks and password
                          theft
                        </FormHelperText>
                      </div>
                    </div>
                    <Switch
                      onChange={(ev) => {
                        onChange(ev.target.checked);
                      }}
                      checked={value}
                      name="askPasswordChange"
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "#22c55e",
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                          backgroundColor: "#22c55e",
                        },
                      }}
                    />
                  </div>
                  {value && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 pt-4 border-t border-green-200"
                    >
                      <div className="flex items-start gap-2">
                        <FuseSvgIcon size={16} className="text-green-600 mt-0.5">
                          heroicons-solid:check-circle
                        </FuseSvgIcon>
                        <Typography className="text-xs text-green-700">
                          You'll receive a reminder notification to update your password every 6
                          months
                        </Typography>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            />
          </div>

          {/* Security Recommendation */}
          {(!twoStepVerification || !askPasswordChange) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl"
              style={{
                background: "rgba(251, 146, 60, 0.05)",
                border: "1px solid rgba(251, 146, 60, 0.2)",
              }}
            >
              <div className="flex items-start gap-3">
                <FuseSvgIcon size={20} className="text-orange-600 mt-0.5">
                  heroicons-solid:shield-exclamation
                </FuseSvgIcon>
                <div>
                  <Typography className="text-sm font-semibold text-gray-800 mb-1">
                    Security Recommendation
                  </Typography>
                  <Typography className="text-xs text-gray-600">
                    We highly recommend enabling all security features to protect your account from
                    unauthorized access
                  </Typography>
                </div>
              </div>
            </motion.div>
          )}

          {/* Security Status Badge */}
          {twoStepVerification && askPasswordChange && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(22, 163, 74, 0.05) 100%)",
                border: "2px solid rgba(34, 197, 94, 0.2)",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <FuseSvgIcon size={20} className="text-green-600">
                    heroicons-solid:shield-check
                  </FuseSvgIcon>
                </div>
                <div>
                  <Typography className="text-sm font-bold text-green-800">
                    Maximum Security Enabled
                  </Typography>
                  <Typography className="text-xs text-green-700">
                    Your account is well protected with all security features active
                  </Typography>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between gap-4 mt-6">
          <div className="flex items-center gap-2">
            {isDirty && (
              <Chip
                label="Unsaved Changes"
                size="small"
                sx={{
                  background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                  color: "white",
                  fontWeight: "bold",
                }}
              />
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="contained"
              type="submit"
              disabled={!isDirty || updateUserDetails.isLoading}
              sx={{
                background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                color: "white",
                fontWeight: "bold",
                minWidth: "140px",
                "&:hover": {
                  background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
                  boxShadow: "0 8px 20px rgba(234, 88, 12, 0.4)",
                },
                "&.Mui-disabled": {
                  background: "linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)",
                  color: "#9ca3af",
                },
              }}
            >
              {updateUserDetails.isLoading ? (
                <CircularProgress size={24} className="text-white" />
              ) : (
                "Save Settings"
              )}
            </Button>
          </div>
        </div>
      </form>
    </motion.div>
    <SessionsSection />
    </>
  );
}

export default SecuritySetting;
