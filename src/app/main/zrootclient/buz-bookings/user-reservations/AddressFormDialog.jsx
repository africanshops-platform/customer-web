import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  TextField,
  CircularProgress,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DeliveryLocationFields from "./DeliveryLocationFields";
import { useCreateUserAddress } from "app/configs/data/server-calls/auth/userapp/a_bookings/use-addresses";

/**
 * Form Validation Schema
 */
const addressSchema = z.object({
  name: z.string().nonempty("Name is required").min(3, "Name must be at least 3 characters"),
  phone: z
    .string()
    .nonempty("Phone number is required")
    .min(10, "Phone number must be at least 10 characters")
    .regex(/^[0-9+\s()-]+$/, "Invalid phone number format"),
  address: z
    .string()
    .nonempty("Address is required")
    .min(10, "Address must be at least 10 characters"),
  isDefault: z.boolean().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  lga: z.string().optional(),
  market: z.string().optional(),
});

/**
 * AddressFormDialog Component
 * Modal form for creating a new address
 */
function AddressFormDialog({ open, onClose, onSuccess }) {
  const createAddress = useCreateUserAddress();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
    setValue,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      isDefault: false,
      country: "",
      state: "",
      lga: "",
      market: "",
    },
    resolver: zodResolver(addressSchema),
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data) => {
    // empty location levels are sent as null so they are stored as 'not set'
    const payload = { ...data };
    ["country", "state", "lga", "market"].forEach((k) => {
      if (!payload[k]) delete payload[k];
    });
    createAddress.mutate(payload, {
      onSuccess: (response) => {
        if (response?.data?.success) {
          reset();
          onClose();
          if (onSuccess) {
            onSuccess(response?.data?.address);
          }
        }
      },
    });
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          m: 0,
          p: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
          color: "white",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(10px)",
            }}
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <span className="text-lg font-bold">Add New Address</span>
        </div>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            color: "white",
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      {/* Form Content */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ p: 3 }}>
          <div className="space-y-4">
            {/* Info Box */}
            <div
              className="p-3 rounded-lg flex items-start gap-3"
              style={{
                background: "rgba(59, 130, 246, 0.05)",
                border: "1px solid rgba(59, 130, 246, 0.2)",
              }}
            >
              <svg
                className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-xs text-gray-700">
                Save your address for faster checkout. You can mark it as default to auto-fill in
                future bookings.
              </p>
            </div>

            {/* Name Field */}
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  required
                  label="Full Name"
                  placeholder="John Doe"
                  variant="outlined"
                  fullWidth
                  error={!!errors.name}
                  helperText={errors?.name?.message}
                  InputProps={{
                    startAdornment: (
                      <svg
                        className="w-5 h-5 text-gray-400 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "#f97316",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#ea580c",
                      },
                    },
                  }}
                />
              )}
            />

            {/* Phone Field */}
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  required
                  label="Phone Number"
                  placeholder="08012345678"
                  variant="outlined"
                  fullWidth
                  error={!!errors.phone}
                  helperText={errors?.phone?.message}
                  InputProps={{
                    startAdornment: (
                      <svg
                        className="w-5 h-5 text-gray-400 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "#f97316",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#ea580c",
                      },
                    },
                  }}
                />
              )}
            />

            {/* Address Field */}
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  required
                  label="Complete Address"
                  placeholder="123 Main Street, Victoria Island, Lagos"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={3}
                  error={!!errors.address}
                  helperText={
                    errors?.address?.message || "Include street, city, state for verification"
                  }
                  InputProps={{
                    startAdornment: (
                      <svg
                        className="w-5 h-5 text-gray-400 mr-2 mt-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "#f97316",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#ea580c",
                      },
                    },
                  }}
                />
              )}
            />

            {/* Delivery location — saved with the address */}
            <Controller
              name="country"
              control={control}
              render={() => (
                <DeliveryLocationFields
                  value={{ country: watch("country"), state: watch("state"), lga: watch("lga"), market: watch("market") }}
                  onChange={(loc) => {
                    ["country", "state", "lga", "market"].forEach((k) => setValue(k, loc[k] || "", { shouldDirty: true }));
                  }}
                />
              )}
            />

            {/* Set as Default Checkbox */}
            <Controller
              name="isDefault"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      {...field}
                      checked={field.value}
                      sx={{
                        color: "#9ca3af",
                        "&.Mui-checked": {
                          color: "#ea580c",
                        },
                      }}
                    />
                  }
                  label={
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">Set as default address</span>
                      <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded">
                        Recommended
                      </span>
                    </div>
                  }
                />
              )}
            />
          </div>
        </DialogContent>

        {/* Footer */}
        <DialogActions sx={{ p: 3, pt: 0, gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleClose}
            disabled={createAddress.isLoading}
            sx={{
              textTransform: "none",
              borderColor: "#d1d5db",
              color: "#374151",
              "&:hover": {
                borderColor: "#9ca3af",
                backgroundColor: "#f9fafb",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!isValid || createAddress.isLoading}
            sx={{
              textTransform: "none",
              background:
                !isValid || createAddress.isLoading
                  ? "linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)"
                  : "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
              color: !isValid || createAddress.isLoading ? "#9ca3af" : "white",
              "&:hover": {
                background:
                  !isValid || createAddress.isLoading
                    ? "linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)"
                    : "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
              },
              "&:disabled": {
                background: "linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)",
                color: "#9ca3af",
              },
            }}
          >
            {createAddress.isLoading ? (
              <div className="flex items-center gap-2">
                <CircularProgress size={16} sx={{ color: "#9ca3af" }} />
                Saving...
              </div>
            ) : (
              "Save Address"
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default AddressFormDialog;
