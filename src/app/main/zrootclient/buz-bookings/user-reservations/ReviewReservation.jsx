import _ from "@lodash";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Button,
  Backdrop,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import FusePageSimple from "@fuse/core/FusePageSimple";
import useThemeMediaQuery from "@fuse/hooks/useThemeMediaQuery";
import FuseLoading from "@fuse/core/FuseLoading";
import {
  useGetUserSingleTrip,
  useCancelUserReservation,
} from "app/configs/data/server-calls/auth/userapp/a_bookings/use-reservations";
import { useParams } from "react-router";
import { formatCurrency, formatDateUtil } from "src/app/main/vendors-shop/PosUtils";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { PaystackButton } from "react-paystack";
import { selectUser } from "src/app/auth/user/store/userSlice";
import { useAppSelector } from "app/store/hooks";
import {
  useVerifyPaystackPaymentMutation,
  useBookingsCheckoutReadiness,
} from "app/configs/data/server-calls/auth/paystack-payments/usePaystackPaymentsRepo";
import ClienttErrorPage from "../../components/ClienttErrorPage";
import PlacedReservation from "./PlacedReservation";
import MyAddresses from "./MyAddresses";

/**
 * Form Validation Schema
 */
const schema = z.object({
  name: z
    .string()
    .min(1, "You must enter name as is in your ID")
    .min(5, "The name must be at least 5 characters"),
  phone: z
    .string()
    .min(1, "You must enter a phone for reaching you")
    .min(5, "The phone number must be at least 5 characters"),
  address: z
    .string()
    .min(1, "You must enter an address as regulated by the government")
    .min(5, "The address must be at least 5 characters"),
});

/**
 * The Courses page.
 */
function ReviewReservation() {
  const user = useAppSelector(selectUser);
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));

  // State for MyAddresses modal
  const [addressModalOpen, setAddressModalOpen] = useState(false);

  // State for payment close dialog
  const [paymentCloseDialogOpen, setPaymentCloseDialogOpen] = useState(false);

  // State for cancel confirmation dialog
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // A failed Paystack attempt now gets its reservation auto-cancelled
  // server-side (frees the poisoned BK<reservationId> reference instead of
  // waiting out the 1-hour auto-expiry) — so this exact reservationId can
  // never be paid again. Once that happens, block further "Pay" clicks
  // instead of letting the user retry against a reference Paystack will
  // reject as a duplicate.
  const [paymentFailedPermanently, setPaymentFailedPermanently] = useState(false);

  const routeParams = useParams();
  const { reservationId } = routeParams;

  const { data: singlereservation, isLoading, isError } = useGetUserSingleTrip(reservationId);

  const methods = useForm({
    mode: "onChange",
    defaultValues: {},
    resolver: zodResolver(schema),
  });
  const { watch, control, formState, setValue, trigger } = methods;
  const { errors, isValid, dirtyFields } = formState;
  const { name, phone, address } = watch();

  const verifyPayment = useVerifyPaystackPaymentMutation();
  const cancelReservation = useCancelUserReservation();
  const readiness = useBookingsCheckoutReadiness();

  const { VITE_PAYSTACK_PUBLIC_KEY } = import.meta.env;
  const totalPrice = singlereservation?.data?.reservation?.totalPrice ?? 0;
  const amount = Math.round(totalPrice * 100);
  const email = user?.email;
  const vatRate = Math.round(totalPrice * 0.075);

  const onSuccess = async (paystackResponse) => {
    //1. Verify payment from backend
    //2. update state of order setting isPaid=true

    // Validate that all required fields are present
    if (!name || !phone || !address) {
      toast.error("Please fill in all required fields (Name, Phone, Address)");
      return;
    }

    const paymentMetaData = {
      name,
      phone,
      address,
      amount,
      vat: vatRate,
      reservationToPay: singlereservation?.data?.reservation?.id,
      paymentResult: paystackResponse,
      reference: paystackResponse?.reference,
    };

    // Use mutate with callbacks to handle errors properly
    verifyPayment.mutate(paymentMetaData, {
      onError: (error) => {
        console.error("Payment verification error:", error);

        // Extract error message from different possible error structures
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Payment verification failed. Please contact support.";

        // Handle array of error messages
        if (Array.isArray(errorMessage)) {
          errorMessage.forEach((msg) => toast.error(msg));
        } else {
          toast.error(errorMessage);
        }

        // A Paystack-confirmed failure ("Payment not successful") cancels this
        // reservation server-side and frees its reference — retrying against
        // this same reservationId will always be rejected by Paystack as a
        // duplicate reference from here on, so stop offering that option.
        if (String(errorMessage).toLowerCase().includes("payment not successful")) {
          setPaymentFailedPermanently(true);
          toast.error("This reservation was cancelled after the failed payment. Please search again to book.");
        }
      },
    });
  };
  const onClose = () => {
    setPaymentCloseDialogOpen(true);
  };

  // Handle cancel reservation
  const handleCancelReservation = () => {
    setCancelDialogOpen(true);
  };

  // Confirm cancel reservation
  const confirmCancelReservation = () => {
    cancelReservation.mutate({ reservationId: singlereservation?.data?.reservation?.id });
    setCancelDialogOpen(false);
  };

  // Handle address selection from modal
  const handleSelectAddress = async (selectedAddress) => {
    // Set each field individually with shouldValidate and shouldDirty flags
    setValue("name", selectedAddress.name, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
    setValue("phone", selectedAddress.phone, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
    setValue("address", selectedAddress.address, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });

    // Trigger validation for all fields to ensure form validity
    await trigger(["name", "phone", "address"]);

    // Show success message
    // toast.success("Address populated successfully!");
  };

  if (isLoading) {
    return <FuseLoading />;
  }

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="flex flex-col flex-1 items-center justify-center h-full"
      >
        <ClienttErrorPage
          message="Error occurred while retrieving your reservation for onward processing"
        />
      </motion.div>
    );
  }

  if (!singlereservation?.data?.reservation) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="flex flex-col flex-1 items-center justify-center h-full"
      >
        <Typography color="text.secondary" variant="h5">
          No reservations for review found!
        </Typography>
      </motion.div>
    );
  }

  return (
    <FusePageSimple
      content={
        <>
          <div className="min-h-screen flex flex-col px-4 md:px-8 lg:mx-200 py-8 md:py-12">
            <div className="flex flex-1 flex-col lg:flex-row gap-6 lg:gap-8">
              {/* Map */}

              {/* Main Content */}

              <div className="flex-1 w-full lg:w-2/3">
                <div className="max-w-5xl mx-auto">
                  {singlereservation?.data?.reservation?.isPaid && (
                    <span className="inline-flex items-center gap-x-1.5 bg-green-500 dark:bg-white/10 text-success h-[45px] px-[14px] text-xs font-medium border border-normal dark:border-white/10 rounded-md sm:justify-center sm:px-0">
                      {`Payment of ${formatCurrency(totalPrice)} has been received for this reservation.`}
                      <br />
                      <Typography className="text-sm">
                        Head on to see reservation details {"==>"}
                      </Typography>
                    </span>
                  )}

                  {!singlereservation?.data?.reservation?.isPaid && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden"
                        style={{
                          border: "2px solid rgba(234, 88, 12, 0.1)",
                        }}
                      >
                        {/* Header with Gradient */}
                        <div
                          className="p-4 sm:p-6"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(234, 88, 12, 0.05) 100%)",
                          }}
                        >
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{
                                  background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
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
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                              </div>
                              <div>
                                <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                                  Customer Information
                                </h2>
                                <p className="text-xs sm:text-sm text-gray-600">
                                  Required for booking confirmation
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setAddressModalOpen(true)}
                              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all hover:shadow-md text-xs sm:text-sm font-semibold w-full sm:w-auto"
                              style={{
                                background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                                color: "white",
                              }}
                            >
                              <svg
                                className="w-4 h-4"
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
                              Use Saved Address
                            </button>
                          </div>
                        </div>

                        {/* Form Content */}
                        <div className="p-4 sm:p-6 space-y-4">
                          {/* Display Current Values if Set */}
                          {(name || address) && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="p-4 rounded-xl mb-4"
                              style={{
                                background:
                                  "linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(22, 163, 74, 0.05) 100%)",
                                border: "1px solid rgba(34, 197, 94, 0.2)",
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <svg
                                  className="w-5 h-5 text-green-600 mt-1 flex-shrink-0"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                <div className="flex-1">
                                  {name && <p className="font-semibold text-gray-800">{name}</p>}
                                  {address && (
                                    <p className="text-sm text-gray-600 mt-1">
                                      {address} {phone && `| ${phone}`}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}

                          {/* Name Field */}
                          <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                required
                                label="Full Name (as per ID)"
                                id="name"
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
                                id="phone"
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
                                id="address"
                                variant="outlined"
                                fullWidth
                                multiline
                                rows={3}
                                error={!!errors.address}
                                helperText={
                                  errors?.address?.message ||
                                  "Include street, city, state for verification"
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

                          {/* Info Box */}
                          <div
                            className="p-4 rounded-xl flex items-start gap-3"
                            style={{
                              background: "rgba(59, 130, 246, 0.05)",
                              border: "1px solid rgba(59, 130, 246, 0.2)",
                            }}
                          >
                            <svg
                              className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
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
                            <p className="text-sm text-gray-700">
                              Your information is securely stored and will only be used for booking
                              confirmation and communication purposes. We comply with data
                              protection regulations.
                            </p>
                          </div>
                        </div>
                    </motion.div>
                  )}

                  {/* Placed Reservation Component */}
                  <PlacedReservation
                    reservation={singlereservation?.data?.reservation}
                    onPayClick={() => {
                      // Scroll to payment button or trigger payment
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    onCancelClick={handleCancelReservation}
                    isCancelling={cancelReservation.isLoading}
                  />

                  {/* Terms & Conditions */}
                  <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                    <div className="border-b pb-2 mb-2">
                      <h2 className="text-lg font-semibold">3. TERMS & CONDITIONS</h2>
                    </div>

                    <div
                      className="mb-4 max-h-[480px] overflow-y-auto border border-gray-200 rounded p-3"
                      style={{ lineHeight: "1.6" }}
                    >
                      <div className="flex items-center mb-2" />
                      <div className="bg-gray-100 p-2 rounded-lg pb-4">
                        <p className="text-blue-500 font-semibold">
                          Terms and condition on booking a reservation on Africanshops.
                        </p>
                        <p className="text-sm">
                          This may be because: 1) Your order is below the minimum purchase amount of
                          2,000 naira or above the maximum purchase amount of 250,000 naira; or 2)
                          Cash on delivery is not available for your delivery address or the pick-up
                          station selected; or 3) You have had multiple failed delivery attempts or
                          cancelled orders; or 4) the number you are using to place the order is a
                          number that has a restriction
                        </p>
                        <p className="text-sm">
                          This may be because: 1) Your order is below the minimum purchase amount of
                          2,000 naira or above the maximum purchase amount of 250,000 naira; or 2)
                          Cash on delivery is not available for your delivery address or the pick-up
                          station selected; or 3) You have had multiple failed delivery attempts or
                          cancelled orders; or 4) the number you are using to place the order is a
                          number that has a restriction
                        </p>
                        <p className="text-sm">
                          This may be because: 1) Your order is below the minimum purchase amount of
                          2,000 naira or above the maximum purchase amount of 250,000 naira; or 2)
                          Cash on delivery is not available for your delivery address or the pick-up
                          station selected; or 3) You have had multiple failed delivery attempts or
                          cancelled orders; or 4) the number you are using to place the order is a
                          number that has a restriction
                        </p>
                        <p className="text-sm">
                          This may be because: 1) Your order is below the minimum purchase amount of
                          2,000 naira or above the maximum purchase amount of 250,000 naira; or 2)
                          Cash on delivery is not available for your delivery address or the pick-up
                          station selected; or 3) You have had multiple failed delivery attempts or
                          cancelled orders; or 4) the number you are using to place the order is a
                          number that has a restriction
                        </p>

                        <p className="text-sm">
                          This may be because: 1) Your order is below the minimum purchase amount of
                          2,000 naira or above the maximum purchase amount of 250,000 naira; or 2)
                          Cash on delivery is not available for your delivery address or the pick-up
                          station selected; or 3) You have had multiple failed delivery attempts or
                          cancelled orders; or 4) the number you are using to place the order is a
                          number that has a restriction
                        </p>
                        <p className="text-sm">
                          This may be because: 1) Your order is below the minimum purchase amount of
                          2,000 naira or above the maximum purchase amount of 250,000 naira; or 2)
                          Cash on delivery is not available for your delivery address or the pick-up
                          station selected; or 3) You have had multiple failed delivery attempts or
                          cancelled orders; or 4) the number you are using to place the order is a
                          number that has a restriction
                        </p>
                        <p className="text-sm">
                          This may be because: 1) Your order is below the minimum purchase amount of
                          2,000 naira or above the maximum purchase amount of 250,000 naira; or 2)
                          Cash on delivery is not available for your delivery address or the pick-up
                          station selected; or 3) You have had multiple failed delivery attempts or
                          cancelled orders; or 4) the number you are using to place the order is a
                          number that has a restriction
                        </p>
                      </div>
                      <br />
                      <br />
                      <br />
                    </div>
                  </div>
                </div>

                {/* end of AI build  */}
              </div>

              <div className="w-full lg:w-1/3 lg:sticky lg:top-20 lg:self-start">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-white rounded-2xl shadow-2xl overflow-hidden"
                  style={{
                    border: "2px solid rgba(234, 88, 12, 0.15)",
                  }}
                >
                  {/* Header with Gradient */}
                  <div
                    className="p-4 sm:p-6"
                    style={{
                      background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                          />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold text-white">Booking Summary</h2>
                        <p className="text-xs sm:text-sm text-white/80">
                          Review your reservation details
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="p-4 sm:p-6 space-y-4">
                    {/* Property Image/Icon */}
                    <div
                      className="relative h-40 rounded-xl overflow-hidden"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(234, 88, 12, 0.05) 100%)",
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg
                          className="w-20 h-20 text-orange-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Check-in/Check-out Dates */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div
                        className="p-3 sm:p-4 rounded-xl"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(22, 163, 74, 0.05) 100%)",
                          border: "1px solid rgba(34, 197, 94, 0.2)",
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <svg
                            className="w-4 h-4 text-green-600 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                            />
                          </svg>
                          <span className="text-xs font-semibold text-gray-600">Check In</span>
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-gray-800">
                          {formatDateUtil(singlereservation?.data?.reservation?.startDate)}
                        </p>
                      </div>

                      <div
                        className="p-3 sm:p-4 rounded-xl"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(220, 38, 38, 0.05) 100%)",
                          border: "1px solid rgba(239, 68, 68, 0.2)",
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <svg
                            className="w-4 h-4 text-red-600 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                          <span className="text-xs font-semibold text-gray-600">Check Out</span>
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-gray-800">
                          {formatDateUtil(singlereservation?.data?.reservation?.endDate)}
                        </p>
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div
                      className="p-4 rounded-xl space-y-3"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(249, 115, 22, 0.05) 0%, rgba(234, 88, 12, 0.02) 100%)",
                        border: "1px solid rgba(234, 88, 12, 0.15)",
                      }}
                    >
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-semibold text-gray-800">
                          ₦ {formatCurrency(totalPrice)}
                        </span>
                      </div>

                      {/* VAT Calculation (7.5% in Nigeria) */}
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">VAT (7.5%)</span>
                          <div className="group relative">
                            <svg
                              className="w-4 h-4 text-gray-400 cursor-help"
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
                            <div className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap z-10">
                              Required for tax compliance
                            </div>
                          </div>
                        </div>
                        <span className="font-semibold text-gray-800">
                          ₦ {formatCurrency(totalPrice * 0.075)}
                        </span>
                      </div>

                      <div className="h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent" />

                      {/* Total with VAT */}
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-lg font-bold text-gray-800">Total</span>
                        <div className="text-right">
                          <span
                            className="text-2xl font-extrabold"
                            style={{
                              background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                              backgroundClip: "text",
                            }}
                          >
                            ₦ {formatCurrency(totalPrice * 1.075)}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">(incl. VAT)</p>
                        </div>
                      </div>
                    </div>

                    {/* Promo Code Section */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Promo code"
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors text-sm"
                      />
                      <button
                        type="button"
                        className="px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:shadow-md"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(234, 88, 12, 0.1) 100%)",
                          color: "#ea580c",
                          border: "2px solid rgba(234, 88, 12, 0.2)",
                        }}
                      >
                        APPLY
                      </button>
                    </div>

                    {/* Payment Button */}
                    {!singlereservation?.data?.reservation?.isPaid && (
                      <div className="relative">
                        <style>
                          {`
                            .paystack-button-enabled:hover {
                              transform: translateY(-2px);
                              box-shadow: 0 8px 25px rgba(234, 88, 12, 0.5) !important;
                            }
                            .paystack-button-enabled:active {
                              transform: translateY(0px);
                            }
                          `}
                        </style>
                        <PaystackButton
                          text={`🔒 Pay ₦${formatCurrency(totalPrice * 1.075)}`}
                          className={`w-full py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base md:text-lg transition-all duration-300 ${
                            !isValid || _.isEmpty(dirtyFields) || !name || !phone || !address
                              ? ""
                              : "paystack-button-enabled"
                          }`}
                          style={{
                            background:
                              !isValid || _.isEmpty(dirtyFields) || !name || !phone || !address
                                ? "linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)"
                                : "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                            color:
                              !isValid || _.isEmpty(dirtyFields) || !name || !phone || !address
                                ? "#9ca3af"
                                : "white",
                            border: "none",
                            cursor:
                              !isValid || _.isEmpty(dirtyFields) || !name || !phone || !address
                                ? "not-allowed"
                                : "pointer",
                            boxShadow:
                              !isValid || _.isEmpty(dirtyFields) || !name || !phone || !address
                                ? "none"
                                : "0 4px 15px rgba(234, 88, 12, 0.4)",
                            filter:
                              !isValid || _.isEmpty(dirtyFields) || !name || !phone || !address
                                ? "grayscale(20%)"
                                : "none",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          reference={`BK${reservationId}`}
                          email={email}
                          amount={totalPrice * 1.075 * 100}
                          vat={vatRate}
                          metadata={{
                            userId: user?.id,
                            reservationId,
                          }}
                          publicKey={VITE_PAYSTACK_PUBLIC_KEY}
                          onSuccess={(reference) => onSuccess(reference)}
                          onClose={() => onClose()}
                          disabled={
                            _.isEmpty(dirtyFields) ||
                            !isValid ||
                            !name ||
                            !phone ||
                            !address ||
                            verifyPayment?.isLoading ||
                            paymentFailedPermanently ||
                            readiness.data?.healthy === false
                          }
                        />
                        {paymentFailedPermanently && (
                          <Typography
                            variant="body2"
                            className="mt-3 text-center"
                            sx={{ color: "#dc2626", fontWeight: 600 }}
                          >
                            This reservation was cancelled after the failed payment attempt. Please search again to book.
                          </Typography>
                        )}
                        {!paymentFailedPermanently && readiness.data?.healthy === false && (
                          <Typography
                            variant="body2"
                            className="mt-3 text-center"
                            sx={{ color: "#dc2626", fontWeight: 600 }}
                          >
                            We can't confirm booking services are ready to process payment right now. Please try again shortly.
                          </Typography>
                        )}
                        {(!isValid || _.isEmpty(dirtyFields) || !name || !phone || !address) && (
                          <div className="mt-3 text-center">
                            <div
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg"
                              style={{
                                background:
                                  "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)",
                                border: "1px solid rgba(239, 68, 68, 0.2)",
                              }}
                            >
                              <svg
                                className="w-4 h-4 text-red-600 flex-shrink-0"
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
                              <p className="text-xs text-red-700 font-semibold">
                                Please fill in all customer information above to proceed
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Payment Success Message */}
                    {singlereservation?.data?.reservation?.isPaid && (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="p-4 rounded-xl flex items-center gap-3"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.1) 100%)",
                          border: "2px solid rgba(34, 197, 94, 0.3)",
                        }}
                      >
                        <svg
                          className="w-8 h-8 text-green-600 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <div>
                          <p className="font-bold text-green-800 text-sm">Payment Successful!</p>
                          <p className="text-xs text-green-700 mt-1">
                            ₦{formatCurrency(vatRate)} paid. Track your trip below.
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* Security Badges */}
                    <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-green-600"
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
                        <span className="text-xs text-gray-600 font-medium">Secure Payment</span>
                      </div>
                      <div className="w-px h-4 bg-gray-300" />
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-blue-600"
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
                        <span className="text-xs text-gray-600 font-medium">Protected</span>
                      </div>
                    </div>

                    {/* Terms */}
                    <p className="text-xs text-gray-500 text-center leading-relaxed">
                      By proceeding, you agree to our{" "}
                      <span className="text-orange-600 hover:underline cursor-pointer font-medium">
                        Terms & Conditions
                      </span>{" "}
                      and{" "}
                      <span className="text-orange-600 hover:underline cursor-pointer font-medium">
                        Privacy Policy
                      </span>
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* My Addresses Modal */}
          <MyAddresses
            open={addressModalOpen}
            onClose={() => setAddressModalOpen(false)}
            onSelectAddress={handleSelectAddress}
            onCreateNew={() => {
              // User wants to create a new address - they can fill the form manually
              toast.info("Please fill in your address details in the form above");
            }}
          />

          {/* Payment Processing Backdrop */}
          <Backdrop
            sx={{
              zIndex: (theme) => theme.zIndex.modal + 1000,
              backgroundColor: "rgba(0, 0, 0, 0.75)",
              backdropFilter: "blur(8px)",
            }}
            open={verifyPayment?.isLoading || false}
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
                    src="/assets/images/logo/logo.svg"
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
                  Please wait while we verify your payment
                </Typography>
              </motion.div>

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

          {/* Payment Close Warning Dialog */}
          <Dialog
            open={paymentCloseDialogOpen}
            onClose={() => setPaymentCloseDialogOpen(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: "16px",
                overflow: "hidden",
              },
            }}
          >
            <DialogTitle
              sx={{
                background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                color: "white",
                padding: "24px",
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span className="font-bold text-xl">Complete Your Reservation</span>
            </DialogTitle>

            <DialogContent sx={{ padding: "32px 24px" }}>
              <div className="space-y-4">
                <Typography variant="h6" className="font-bold text-gray-800">
                  Don't miss out on your booking!
                </Typography>

                <Typography variant="body1" className="text-gray-700 leading-relaxed">
                  Your reservation is almost complete. By closing now without payment, you risk:
                </Typography>

                <div className="space-y-3 ml-4">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    <Typography variant="body2" className="text-gray-600">
                      <strong>Losing this property</strong> - Other guests are actively booking
                    </Typography>
                  </div>

                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    <Typography variant="body2" className="text-gray-600">
                      <strong>Price increases</strong> - Rates may change based on demand
                    </Typography>
                  </div>

                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    <Typography variant="body2" className="text-gray-600">
                      <strong>Cancellation of reservation</strong> - Unpaid bookings expire after 30
                      minutes
                    </Typography>
                  </div>
                </div>

                <div
                  className="p-4 rounded-xl mt-6"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(234, 88, 12, 0.05) 100%)",
                    border: "2px solid rgba(234, 88, 12, 0.2)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-6 h-6 text-orange-600 flex-shrink-0"
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
                    <div>
                      <Typography variant="body2" className="font-bold text-gray-800">
                        Secure Your Booking Now
                      </Typography>
                      <Typography variant="caption" className="text-gray-600">
                        Complete payment to guarantee your reservation
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>

            <DialogActions
              sx={{
                padding: "16px 24px 24px",
                gap: 2,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <Button
                onClick={() => setPaymentCloseDialogOpen(false)}
                variant="outlined"
                fullWidth
                sx={{
                  borderColor: "#9ca3af",
                  color: "#6b7280",
                  "&:hover": {
                    borderColor: "#6b7280",
                    backgroundColor: "#f3f4f6",
                  },
                  textTransform: "none",
                  fontWeight: 600,
                  padding: "10px 24px",
                }}
              >
                Leave Without Payment
              </Button>

              <Button
                onClick={() => {
                  setPaymentCloseDialogOpen(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                variant="contained"
                fullWidth
                sx={{
                  background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                  color: "white",
                  "&:hover": {
                    background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
                    boxShadow: "0 8px 20px rgba(234, 88, 12, 0.4)",
                  },
                  textTransform: "none",
                  fontWeight: "bold",
                  padding: "10px 24px",
                }}
              >
                Complete Payment Now
              </Button>
            </DialogActions>
          </Dialog>

          {/* Cancel Reservation Confirmation Dialog */}
          <Dialog
            open={cancelDialogOpen}
            onClose={() => setCancelDialogOpen(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: "16px",
                overflow: "hidden",
              },
            }}
          >
            <DialogTitle
              sx={{
                background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                color: "white",
                padding: "24px",
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span className="font-bold text-xl">Cancel Reservation?</span>
            </DialogTitle>

            <DialogContent sx={{ padding: "32px 24px" }}>
              <div className="space-y-4">
                <Typography variant="h6" className="font-bold text-gray-800">
                  Are you sure you want to cancel this reservation?
                </Typography>

                <Typography variant="body1" className="text-gray-700 leading-relaxed">
                  Please consider the following before cancelling:
                </Typography>

                <div className="space-y-3 ml-4">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    <Typography variant="body2" className="text-gray-600">
                      <strong>Your reservation will be permanently cancelled</strong>
                    </Typography>
                  </div>

                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    <Typography variant="body2" className="text-gray-600">
                      <strong>This property may not be available later</strong> - Other guests are
                      actively booking
                    </Typography>
                  </div>

                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    <Typography variant="body2" className="text-gray-600">
                      <strong>Prices may increase</strong> if you try to book again
                    </Typography>
                  </div>

                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    <Typography variant="body2" className="text-gray-600">
                      <strong>Cancellation is immediate and cannot be undone</strong>
                    </Typography>
                  </div>
                </div>

                {/* Reservation Details Summary */}
                <div
                  className="p-4 rounded-xl mt-6"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(185, 28, 28, 0.05) 100%)",
                    border: "2px solid rgba(220, 38, 38, 0.2)",
                  }}
                >
                  <Typography variant="body2" className="font-bold text-gray-800 mb-2">
                    Reservation Details:
                  </Typography>
                  <div className="space-y-1 text-sm text-gray-700">
                    <div className="flex justify-between">
                      <span>Check-in:</span>
                      <span className="font-semibold">
                        {formatDateUtil(singlereservation?.data?.reservation?.startDate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Check-out:</span>
                      <span className="font-semibold">
                        {formatDateUtil(singlereservation?.data?.reservation?.endDate)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-red-200">
                      <span>Total Amount:</span>
                      <span className="font-bold text-red-700">
                        ₦ {formatCurrency(totalPrice * 1.075)}
                      </span>
                    </div>
                  </div>
                </div>

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
                  <Typography variant="caption" className="text-gray-700">
                    <strong>Note:</strong> If you're experiencing issues with payment, please
                    contact our support team instead of cancelling.
                  </Typography>
                </div>
              </div>
            </DialogContent>

            <DialogActions
              sx={{
                padding: "16px 24px 24px",
                gap: 2,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <Button
                onClick={() => setCancelDialogOpen(false)}
                variant="outlined"
                fullWidth
                sx={{
                  borderColor: "#9ca3af",
                  color: "#6b7280",
                  "&:hover": {
                    borderColor: "#6b7280",
                    backgroundColor: "#f3f4f6",
                  },
                  textTransform: "none",
                  fontWeight: 600,
                  padding: "10px 24px",
                }}
              >
                Keep My Reservation
              </Button>

              <Button
                onClick={confirmCancelReservation}
                variant="contained"
                fullWidth
                disabled={cancelReservation.isLoading}
                sx={{
                  background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                  color: "white",
                  "&:hover": {
                    background: "linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)",
                    boxShadow: "0 8px 20px rgba(220, 38, 38, 0.4)",
                  },
                  "&:disabled": {
                    background:
                      "linear-gradient(135deg, rgba(220, 38, 38, 0.5) 0%, rgba(185, 28, 28, 0.5) 100%)",
                    color: "rgba(255, 255, 255, 0.7)",
                  },
                  textTransform: "none",
                  fontWeight: "bold",
                  padding: "10px 24px",
                }}
              >
                {cancelReservation.isLoading ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Cancelling...
                  </div>
                ) : (
                  "Yes, Cancel Reservation"
                )}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      }
      scroll={isMobile ? "normal" : "page"}
    />
  );
}

export default ReviewReservation;
