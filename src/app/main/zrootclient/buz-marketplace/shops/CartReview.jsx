import _ from "@lodash";
import "./checkout-comfort.css";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import { useEffect, useState, Suspense, lazy } from "react";
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
import { useNavigate,  } from "react-router";
import { formatCurrency,  } from "src/app/main/vendors-shop/PosUtils";
// import { format } from "date-fns";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Controller } from "react-hook-form";
import { toast } from "react-toastify";
// import { PaystackButton } from "react-paystack";
import { selectUser } from "src/app/auth/user/store/userSlice";
import { useAppSelector } from "app/store/hooks";
// import { selectFuseCurrentLayoutConfig } from "@fuse/core/FuseSettings/fuseSettingsSlice";
import { useMyCart } from "app/configs/data/server-calls/auth/userapp/a_marketplace/useProductsRepo";

import useSellerCountries from "app/configs/data/server-calls/countries/useCountries";
import {
  getMarketsByLgaId,
  getLgaByStateId,
  getStateByCountryId,
} from "app/configs/data/client/clientToApiRoutes";
import MyAddresses from "../../buz-bookings/user-reservations/MyAddresses";
import useNearestPickup from "../../buz-bookings/user-reservations/useNearestPickup";
import CartSummaryAndPay from "./components/CartSummaryAndPay";
// import ClienttErrorPage from "../../components/ClienttErrorPage";

// Lazy load map components for better performance
const ShopLocationMap = lazy(() => import("../components/maps/ShopLocationMap"));
const ShopLocationMapLoadingPlaceholder = lazy(
  () => import("../components/maps/ShopLocationMapLoadingPlaceholder"),
);

const container = {
  show: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};
const item = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  show: {
    opacity: 1,
    y: 0,
  },
};

/**
 * Form Validation Schema
 */

const schema = z.object({
  name: z
    .string()
    .nonempty("You must enter name as is in your ID")
    .min(5, "The name must be at least 5 characters"),
  phone: z
    .string()
    .nonempty("You must enter a phone for reaching you")
    .min(5, "The phone number must be at least 5 characters"),
  address: z
    .string()
    .nonempty("You must enter an address as regulated by the government")
    .min(5, "The address must be at least 5 characters"),
  orderCountryDestination: z.string().nonempty("You must enter a country for this order"),
  orderStateProvinceDestination: z
    .string()
    .nonempty("You must enter a state destination for this order"),
  orderLgaDestination: z.string().nonempty("You must enter an L.G.A/County for this order"),
  orderMarketPickupDestination: z
    .string()
    .nonempty("You must enter a market pick up point for this order"),
});

/**
 * The CartReview page - Completely redesigned with professional, engaging look
 */
function CartReview() {
  const user = useAppSelector(selectUser);
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));
  const navigate = useNavigate();

  const { data: cart, isLoading: cartLoading } = useMyCart(user?.id);
  const [selectedPaymentOption, setSelectedPaymentOption] = useState("");

  // State for MyAddresses modal
  const [addressModalOpen, setAddressModalOpen] = useState(false);

  // State for payment close dialog
  const [paymentCloseDialogOpen, setPaymentCloseDialogOpen] = useState(false);

  // State for payment processing (placeholder for now - will be integrated with actual payment mutation)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  if (cart?.data?.cartSession?.cartProducts?.length < 1) {
    navigate("/marketplace/cart");
  }
  const handleChange = (event) => {
    setSelectedPaymentOption(event.target.value);
  };

  const methods = useForm({
    mode: "onChange",
    defaultValues: {},
    resolver: zodResolver(schema),
  });
  const { reset, watch, control, formState, getValues, setValue, trigger } = methods;
  const { errors, isValid, dirtyFields } = formState;
  const {
    name,
    phone,
    address,
    orderCountryDestination,
    orderStateProvinceDestination,
    orderLgaDestination,
    orderMarketPickupDestination,
  } = watch();

  const publicKey = "pk_test_2af8648e2d689f0a4d5263e706543f3835c2fe6a";
  const email = user?.email;

  const payments = [
    {
      type: "Paystack",
      shortbio: "Payment using paystack channel",
      keycode: "PAYSTACK",
    },
    {
      type: "Flutterwave",
      shortbio: "Payment using flutterwave channel",
      keycode: "FLUTTERWAVE",
    },
    {
      type: "Pay on delivery",
      shortbio: "Payment on delivery of your package",
      keycode: "PAYONDELIVERY",
    },
  ];

  const { data: countryData } = useSellerCountries();
  const [loading, setLoading] = useState(false);
  const [blgas, setBlgas] = useState([]);
  const [markets, setBMarkets] = useState([]);
  const [stateData, setStateData] = useState([]);
  const [selectedMarketData, setSelectedMarketData] = useState(null);

  useEffect(() => {
    if (getValues()?.orderCountryDestination) {
      findStatesByCountry(getValues()?.orderCountryDestination);
    }

    if (getValues()?.orderStateProvinceDestination) {
      getLgasFromState(getValues()?.orderStateProvinceDestination);
    }

    if (getValues()?.orderLgaDestination) {
      getMarketsFromLgaId(getValues()?.orderLgaDestination);
    }
  }, [
    getValues()?.orderCountryDestination,
    getValues()?.orderStateProvinceDestination,
    getValues()?.orderLgaDestination,
  ]);

  console.log("Markets LOCATIONS", selectedMarketData?.lat);

  // Update selected market data when market selection changes
  useEffect(() => {
    if (orderMarketPickupDestination && markets?.length > 0) {
      const selectedMarket = markets.find((market) => market.id === orderMarketPickupDestination);
      setSelectedMarketData(selectedMarket);
    } else {
      setSelectedMarketData(null);
    }
  }, [orderMarketPickupDestination, markets]);

  async function findStatesByCountry() {
    setLoading(true);
    const stateResponseData = await getStateByCountryId(getValues()?.orderCountryDestination);

    if (stateResponseData) {
      setStateData(stateResponseData?.data?.states);

      setTimeout(
        function () {
          setLoading(false);
        }.bind(this),
        250,
      );
    }
  }

  
  //**Get L.G.As from state_ID data */
  async function getLgasFromState(sid) {
    setLoading(true);
    const responseData = await getLgaByStateId(sid);

    if (responseData) {
      setBlgas(responseData?.data?.lgas);
      setTimeout(
        function () {
          setLoading(false);
        }.bind(this),
        250,
      );
    }
  }

  //**Get Markets from lga_ID data */
  async function getMarketsFromLgaId(lid) {
    if (lid) {
      setLoading(true);
      const responseData = await getMarketsByLgaId(lid);
      if (responseData) {
        setBMarkets(responseData?.data?.markets);
        setTimeout(
          function () {
            setLoading(false);
          }.bind(this),
          250,
        );
      }
    }
  }

  /**
   * Fill the destination selects the way a person does: set a level, let its list load, then the next.
   * Setting all four at once leaves the dropdowns showing blank (their options arrive after the values),
   * so each value is applied only after the list that contains it has loaded.
   */
  const applyDeliveryLocation = async ({ country, state, lga, market }) => {
    const opts = { shouldValidate: true, shouldDirty: true, shouldTouch: true };
    if (country) {
      setValue("orderCountryDestination", country, opts);
      await findStatesByCountry();
    }
    if (country && state) {
      setValue("orderStateProvinceDestination", state, opts);
      await getLgasFromState(state);
    }
    if (state && lga) {
      setValue("orderLgaDestination", lga, opts);
      await getMarketsFromLgaId(lga);
    }
    if (lga && market) {
      setValue("orderMarketPickupDestination", market, opts);
    }
  };

  // Handle address selection from MyAddresses modal
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

    // The address's saved delivery location fills the destination too — the dependent lists
    // (states, LGAs, markets) load from these ids through the existing effect above.
    await applyDeliveryLocation({
      country: selectedAddress.country,
      state: selectedAddress.state,
      lga: selectedAddress.lga,
      market: selectedAddress.market,
    });

    // Trigger validation for all fields to ensure form validity
    await trigger(["name", "phone", "address"]);
  };

  // "Use my nearest pickup point": the server ranks operational markets by distance from the device location
  const { locate: locateNearestPickup, locating: locatingNearest } = useNearestPickup((loc) => applyDeliveryLocation(loc));

  const onClose = () => {
    setPaymentCloseDialogOpen(true);
  };

  return (
    <FusePageSimple
      content={
        <>
          <div className="checkout-comfort min-h-screen flex flex-col px-4 md:px-8 lg:px-12 py-8 md:py-12">
            <div className="max-w-[1600px] mx-auto w-full">
              <div className="flex flex-1 flex-col lg:flex-row gap-6 lg:gap-8">
                {/* Left Side - Review & Form (60% width, scrollable) */}
                <div className="w-full lg:w-[60%] lg:overflow-y-auto lg:pr-4">
                  <div className="max-w-full">
                    {/* Customer Billing & Shipping Address Section */}
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
                                Customer Billing & Shipping Address
                              </h2>
                              <p className="text-xs sm:text-sm text-gray-600">
                                Required for order delivery
                              </p>
                            </div>
                          </div>
                          <button
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
                                errors?.address?.message || "Include street, city for verification"
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
                            Your information is securely stored and will only be used for order
                            delivery and communication purposes.
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Delivery Location Selection Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden"
                      style={{
                        border: "2px solid rgba(234, 88, 12, 0.1)",
                      }}
                    >
                      {/* Header */}
                      <div
                        className="p-4 sm:p-6"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(234, 88, 12, 0.05) 100%)",
                        }}
                      >
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
                          <div>
                            <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                              Delivery Location & Pickup Point
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-600">
                              Select your nearest warehouse for pickup
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Form Content */}
                      <div className="p-4 sm:p-6 space-y-4">
                        <Button
                          variant="outlined"
                          onClick={locateNearestPickup}
                          disabled={locatingNearest}
                          data-testid="use-nearest-pickup"
                          sx={{ textTransform: "none", borderColor: "#ea580c", color: "#ea580c", fontWeight: 600 }}
                        >
                          {locatingNearest ? "Finding your nearest pickup point…" : "📍 Use my nearest pickup point"}
                        </Button>
                        {/* Country and State Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Country Select */}
                          <div>
                            <Typography className="mb-2 text-sm font-semibold text-gray-700">
                              Country
                            </Typography>
                            <Controller
                              control={control}
                              name="orderCountryDestination"
                              render={({ field }) => (
                                <FormControl fullWidth error={!!errors.orderCountryDestination}>
                                  <Select
                                    {...field}
                                    value={orderCountryDestination || ""}
                                    displayEmpty
                                    MenuProps={{ className: "checkout-comfort" }}
                                    renderValue={(v) => (((countryData?.data?.countries) || []).find((o) => o?.id === v)?.name) || (v ? "Loading…" : "Select Country")}
                                    variant="outlined"
                                    startAdornment={
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
                                          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                      </svg>
                                    }
                                    sx={{
                                      "& .MuiOutlinedInput-notchedOutline": {
                                        borderColor: errors.orderCountryDestination
                                          ? "#ef4444"
                                          : "#e5e7eb",
                                      },
                                      "&:hover .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "#f97316",
                                      },
                                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "#ea580c",
                                      },
                                    }}
                                  >
                                    <MenuItem value="" disabled>
                                      Select Country
                                    </MenuItem>
                                    {countryData?.data?.countries?.map((buzcountry, index) => (
                                      <MenuItem key={index} value={buzcountry?.id}>
                                        {buzcountry?.name}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                  {errors.orderCountryDestination && (
                                    <Typography className="text-xs text-red-600 mt-1">
                                      {errors.orderCountryDestination.message}
                                    </Typography>
                                  )}
                                </FormControl>
                              )}
                            />
                          </div>

                          {/* State Select */}
                          <div>
                            <Typography className="mb-2 text-sm font-semibold text-gray-700">
                              State / Province
                            </Typography>
                            <Controller
                              control={control}
                              name="orderStateProvinceDestination"
                              render={({ field }) => (
                                <FormControl
                                  fullWidth
                                  error={!!errors.orderStateProvinceDestination}
                                >
                                  <Select
                                    {...field}
                                    value={orderStateProvinceDestination || ""}
                                    displayEmpty
                                    MenuProps={{ className: "checkout-comfort" }}
                                    renderValue={(v) => (((stateData) || []).find((o) => o?.id === v)?.name) || (v ? "Loading…" : "Select State")}
                                    variant="outlined"
                                    disabled={!stateData || stateData.length === 0}
                                    startAdornment={
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
                                          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                                        />
                                      </svg>
                                    }
                                    sx={{
                                      "& .MuiOutlinedInput-notchedOutline": {
                                        borderColor: errors.orderStateProvinceDestination
                                          ? "#ef4444"
                                          : "#e5e7eb",
                                      },
                                      "&:hover .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "#f97316",
                                      },
                                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "#ea580c",
                                      },
                                    }}
                                  >
                                    <MenuItem value="" disabled>
                                      Select State
                                    </MenuItem>
                                    {stateData?.map((buzstate, index) => (
                                      <MenuItem key={index} value={buzstate?.id}>
                                        {buzstate?.name}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                  {errors.orderStateProvinceDestination && (
                                    <Typography className="text-xs text-red-600 mt-1">
                                      {errors.orderStateProvinceDestination.message}
                                    </Typography>
                                  )}
                                </FormControl>
                              )}
                            />
                          </div>
                        </div>

                        {/* LGA and Market Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* LGA Select */}
                          <div>
                            <Typography className="mb-2 text-sm font-semibold text-gray-700">
                              L.G.A / County
                            </Typography>
                            <Controller
                              control={control}
                              name="orderLgaDestination"
                              render={({ field }) => (
                                <FormControl fullWidth error={!!errors.orderLgaDestination}>
                                  <Select
                                    {...field}
                                    value={orderLgaDestination || ""}
                                    displayEmpty
                                    MenuProps={{ className: "checkout-comfort" }}
                                    renderValue={(v) => (((blgas) || []).find((o) => o?.id === v)?.name) || (v ? "Loading…" : "Select L.G.A")}
                                    variant="outlined"
                                    disabled={!blgas || blgas.length === 0}
                                    startAdornment={
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
                                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                        />
                                      </svg>
                                    }
                                    sx={{
                                      "& .MuiOutlinedInput-notchedOutline": {
                                        borderColor: errors.orderLgaDestination
                                          ? "#ef4444"
                                          : "#e5e7eb",
                                      },
                                      "&:hover .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "#f97316",
                                      },
                                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "#ea580c",
                                      },
                                    }}
                                  >
                                    <MenuItem value="" disabled>
                                      Select L.G.A
                                    </MenuItem>
                                    {blgas?.map((lga, index) => (
                                      <MenuItem key={index} value={lga?.id}>
                                        {lga?.name}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                  {errors.orderLgaDestination && (
                                    <Typography className="text-xs text-red-600 mt-1">
                                      {errors.orderLgaDestination.message}
                                    </Typography>
                                  )}
                                </FormControl>
                              )}
                            />
                          </div>

                          {/* Market Warehouse Select */}
                          <div>
                            <Typography className="mb-2 text-sm font-semibold text-gray-700">
                              Market Pickup Point
                            </Typography>
                            <Controller
                              control={control}
                              name="orderMarketPickupDestination"
                              render={({ field }) => (
                                <FormControl
                                  fullWidth
                                  error={!!errors.orderMarketPickupDestination}
                                >
                                  <Select
                                    {...field}
                                    value={orderMarketPickupDestination || ""}
                                    displayEmpty
                                    MenuProps={{ className: "checkout-comfort" }}
                                    renderValue={(v) => (((markets) || []).find((o) => o?.id === v)?.name) || (v ? "Loading…" : "Select Market")}
                                    variant="outlined"
                                    disabled={!markets || markets.length === 0}
                                    startAdornment={
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
                                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                        />
                                      </svg>
                                    }
                                    sx={{
                                      "& .MuiOutlinedInput-notchedOutline": {
                                        borderColor: errors.orderMarketPickupDestination
                                          ? "#ef4444"
                                          : "#e5e7eb",
                                      },
                                      "&:hover .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "#f97316",
                                      },
                                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "#ea580c",
                                      },
                                    }}
                                  >
                                    <MenuItem value="" disabled>
                                      Select Market
                                    </MenuItem>
                                    {markets?.map((market, index) => (
                                      <MenuItem key={index} value={market?.id}>
                                        {market?.name}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                  {errors.orderMarketPickupDestination && (
                                    <Typography className="text-xs text-red-600 mt-1">
                                      {errors.orderMarketPickupDestination.message}
                                    </Typography>
                                  )}
                                </FormControl>
                              )}
                            />
                          </div>
                        </div>

                        {/* Info about warehouse selection */}
                        {selectedMarketData && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 rounded-xl"
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
                                <p className="font-semibold text-gray-800 text-sm">
                                  Selected Pickup Point: {selectedMarketData.name}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  View the location on the map below the payment summary
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>

                    {/* Order Items Review */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden"
                      style={{
                        border: "2px solid rgba(234, 88, 12, 0.1)",
                      }}
                    >
                      {/* Header */}
                      <div
                        className="p-4 sm:p-6"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(234, 88, 12, 0.05) 100%)",
                        }}
                      >
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
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                              />
                            </svg>
                          </div>
                          <div>
                            <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                              Order Items
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {cart?.data?.cartSession?.cartProducts?.length || 0} item
                              {cart?.data?.cartSession?.cartProducts?.length !== 1 ? "s" : ""} in
                              your cart
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="p-4 sm:p-6 space-y-4">
                        {cart?.data?.cartSession?.cartProducts?.length > 0 ? (
                          cart?.data?.cartSession?.cartProducts?.map((cartItem) => (
                            <ReviewCartItem
                              key={cartItem?.id}
                              id={cartItem?.id}
                              title={cartItem?.product?.name}
                              image={cartItem?.product?.imageLinks[0]?.url}
                              seller="Apple Authorized Reseller"
                              unitsLeft={cartItem?.product?.quantityInStock}
                              cartQuantity={cartItem?.quantity}
                              price={cartItem?.product?.price}
                              oldPrice={cartItem?.product?.listprice}
                              discount="-70%"
                              cartItem={cartItem}
                            />
                          ))
                        ) : (
                          <Typography className="text-md text-center py-8 text-gray-500">
                            No product in cart
                          </Typography>
                        )}
                      </div>
                    </motion.div>

                    {/* Payment Method Selection */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.25 }}
                      className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden"
                      style={{
                        border: "2px solid rgba(234, 88, 12, 0.1)",
                      }}
                    >
                      {/* Header */}
                      <div
                        className="p-4 sm:p-6"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(234, 88, 12, 0.05) 100%)",
                        }}
                      >
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
                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                              />
                            </svg>
                          </div>
                          <div>
                            <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                              Payment Method
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-600">
                              Choose how you'd like to pay
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Payment Options */}
                      <div className="p-4 sm:p-6 space-y-3">
                        {payments.map((payment) => (
                          <motion.div
                            key={payment.keycode}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => setSelectedPaymentOption(payment.keycode)}
                            className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                              selectedPaymentOption === payment.keycode
                                ? "ring-2 ring-orange-500"
                                : "hover:bg-gray-50"
                            }`}
                            style={{
                              background:
                                selectedPaymentOption === payment.keycode
                                  ? "linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(234, 88, 12, 0.05) 100%)"
                                  : "rgba(249, 250, 251, 0.5)",
                              border:
                                selectedPaymentOption === payment.keycode
                                  ? "2px solid rgba(234, 88, 12, 0.3)"
                                  : "2px solid rgba(229, 231, 235, 1)",
                            }}
                          >
                            <div className="flex items-center gap-4">
                              {/* Radio Button */}
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                  selectedPaymentOption === payment.keycode
                                    ? "border-orange-600"
                                    : "border-gray-300"
                                }`}
                              >
                                {selectedPaymentOption === payment.keycode && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-3 h-3 rounded-full"
                                    style={{
                                      background:
                                        "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                                    }}
                                  />
                                )}
                              </div>

                              {/* Icon */}
                              <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                  selectedPaymentOption === payment.keycode
                                    ? "bg-orange-100"
                                    : "bg-gray-100"
                                }`}
                              >
                                {payment.keycode === "PAYSTACK" && (
                                  <svg
                                    className={`w-5 h-5 ${
                                      selectedPaymentOption === payment.keycode
                                        ? "text-orange-600"
                                        : "text-gray-600"
                                    }`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                    />
                                  </svg>
                                )}
                                {payment.keycode === "FLUTTERWAVE" && (
                                  <svg
                                    className={`w-5 h-5 ${
                                      selectedPaymentOption === payment.keycode
                                        ? "text-orange-600"
                                        : "text-gray-600"
                                    }`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                )}
                                {payment.keycode === "PAYONDELIVERY" && (
                                  <svg
                                    className={`w-5 h-5 ${
                                      selectedPaymentOption === payment.keycode
                                        ? "text-orange-600"
                                        : "text-gray-600"
                                    }`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                  </svg>
                                )}
                              </div>

                              {/* Payment Details */}
                              <div className="flex-1">
                                <h3
                                  className={`text-sm sm:text-base font-bold ${
                                    selectedPaymentOption === payment.keycode
                                      ? "text-orange-600"
                                      : "text-gray-800"
                                  }`}
                                >
                                  {payment.type}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                                  {payment.shortbio}
                                </p>
                              </div>

                              {/* Selected Badge */}
                              {selectedPaymentOption === payment.keycode && (
                                <motion.div
                                  initial={{ scale: 0, rotate: -180 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  transition={{ type: "spring", stiffness: 200 }}
                                  className="flex-shrink-0"
                                >
                                  <svg
                                    className="w-6 h-6 text-green-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2.5}
                                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                </motion.div>
                              )}
                            </div>
                          </motion.div>
                        ))}

                        {/* Warning if no payment method selected */}
                        {!selectedPaymentOption && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 rounded-xl flex items-start gap-3 mt-4"
                            style={{
                              background:
                                "linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(220, 38, 38, 0.05) 100%)",
                              border: "1px solid rgba(239, 68, 68, 0.2)",
                            }}
                          >
                            <svg
                              className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"
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
                            <p className="text-sm text-red-700 font-semibold">
                              Please select a payment method to continue
                            </p>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>

                    {/* Terms & Conditions */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden"
                      style={{
                        border: "2px solid rgba(234, 88, 12, 0.1)",
                      }}
                    >
                      {/* Header */}
                      <div
                        className="p-4 sm:p-6"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(234, 88, 12, 0.05) 100%)",
                        }}
                      >
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
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>
                          <div>
                            <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                              Terms & Conditions
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-600">
                              Please read before proceeding
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Terms Content */}
                      <div className="p-4 sm:p-6">
                        <div
                          className="max-h-[320px] overflow-y-auto p-4 rounded-xl"
                          style={{
                            background: "rgba(249, 250, 251, 1)",
                            border: "1px solid rgba(229, 231, 235, 1)",
                          }}
                        >
                          <p className="text-orange-600 font-semibold mb-3">
                            Terms and conditions on placing an order on Africanshops
                          </p>
                          <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                            This may be because: 1) Your order is below the minimum purchase amount
                            of 2,000 naira or above the maximum purchase amount of 250,000 naira; or
                            2) Cash on delivery is not available for your delivery address or the
                            pick-up station selected; or 3) You have had multiple failed delivery
                            attempts or cancelled orders; or 4) the number you are using to place
                            the order is a number that has a restriction
                          </p>
                          <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                            By placing an order, you agree to our delivery terms and conditions. All
                            orders are subject to availability and confirmation of the order price.
                            Dispatch times may vary according to availability and subject to any
                            delays resulting from postal delays or force majeure for which we will
                            not be responsible.
                          </p>
                          <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                            We reserve the right to refuse any order you place with us. We may, in
                            our sole discretion, limit or cancel quantities purchased per person,
                            per household or per order. These restrictions may include orders placed
                            by or under the same customer account, the same credit card, and/or
                            orders that use the same billing and/or shipping address.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Right Side - Payment Summary & Map (30% width, sticky position) */}
                <div className="w-full lg:w-[30%] lg:sticky lg:top-20 lg:self-start">
                  {/* Container for both summary and map with fixed heights */}
                  <div className="flex flex-col gap-4 lg:gap-6 lg:h-[calc(100vh-120px)]">
                    {/* Payment Summary - 40% of available height on desktop, full on mobile */}
                    <div className="lg:h-[40%] lg:min-h-[350px] lg:max-h-[500px]">
                      <CartSummaryAndPay
                        cartSessionPayload={cart?.data?.cartSession}
                        methodOfPay={selectedPaymentOption}
                        name={name}
                        phone={phone}
                        address={address}
                        orderCountryDestination={orderCountryDestination}
                        orderStateProvinceDestination={orderStateProvinceDestination}
                        orderLgaDestination={orderLgaDestination}
                        orderMarketPickupDestination={orderMarketPickupDestination}
                        selectedMarketData={selectedMarketData}
                        dirtyFields={dirtyFields}
                        isValid={isValid}
                        setIsProcessingPayment={setIsProcessingPayment}
                      />
                    </div>

                    {/* Warehouse Location Map - 60% of available height on desktop, full on mobile */}
                    <div className="lg:h-[60%] lg:min-h-[540px] min-h-[460px]">
                      {selectedMarketData?.lat && selectedMarketData?.lng ? (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.4 }}
                          className="bg-white rounded-2xl shadow-lg overflow-hidden h-full w-full"
                          style={{
                            border: "2px solid rgba(234, 88, 12, 0.1)",
                          }}
                        >
                          <Suspense
                            fallback={
                              <div className="w-full h-full flex items-center justify-center">
                                <ShopLocationMapLoadingPlaceholder />
                              </div>
                            }
                          >
                            <ShopLocationMap
                              shopData={{
                                id: selectedMarketData?.id,
                                shopName: selectedMarketData?.name,
                                address: selectedMarketData?.address || "Market Address",
                                city: selectedMarketData?.city || "City",
                                state: selectedMarketData?.state || "State",
                                country: selectedMarketData?.country || "Nigeria",
                                coordinates: [
                                  parseFloat(selectedMarketData?.lat),
                                  parseFloat(selectedMarketData?.lng),
                                ],
                                zoom: 14,
                                phone: selectedMarketData?.phone || "+234 800 000 0000",
                                isVerified: true,
                                rating: 4.8,
                                totalSales: 1234,
                              }}
                            />
                          </Suspense>
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.4 }}
                          className="bg-white rounded-2xl shadow-lg overflow-hidden h-full flex items-center justify-center p-6 sm:p-8"
                          style={{
                            border: "2px solid rgba(234, 88, 12, 0.1)",
                            background:
                              "linear-gradient(135deg, rgba(249, 115, 22, 0.05) 0%, rgba(234, 88, 12, 0.02) 100%)",
                          }}
                        >
                          <div className="text-center max-w-sm">
                            <div
                              className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                              style={{
                                background:
                                  "linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(234, 88, 12, 0.1) 100%)",
                              }}
                            >
                              <svg
                                className="w-8 h-8 sm:w-10 sm:h-10 text-orange-600"
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
                            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2">
                              Select a Pickup Location
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                              Choose a market warehouse from the delivery location section above to
                              view its location on the map
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* My Addresses Modal */}
          <MyAddresses
            open={addressModalOpen}
            onClose={() => setAddressModalOpen(false)}
            onSelectAddress={handleSelectAddress}
            onCreateNew={() => {
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
            open={isProcessingPayment}
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
              <span className="font-bold text-xl">Complete Your Order</span>
            </DialogTitle>

            <DialogContent sx={{ padding: "32px 24px" }}>
              <div className="space-y-4">
                <Typography variant="h6" className="font-bold text-gray-800">
                  Don't miss out on your order!
                </Typography>

                <Typography variant="body1" className="text-gray-700 leading-relaxed">
                  Your order is almost complete. By closing now without payment, you risk:
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
                      <strong>Losing these products</strong> - Stock is limited and selling fast
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
                      <strong>Price increases</strong> - Promotional prices may change
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
                      <strong>Cart expiration</strong> - Your cart items will be released back to
                      inventory
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
                        Secure Your Order Now
                      </Typography>
                      <Typography variant="caption" className="text-gray-600">
                        Complete payment to guarantee your purchase
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
        </>
      }
      scroll={isMobile ? "normal" : "page"}
    />
  );
}

export default CartReview;

const ReviewCartItem = ({
  id,
  image,
  title,
  seller,
  unitsLeft,
  price,
  oldPrice,
  discount,
  cartQuantity,
  cartItem, // full cart item object to check for bulk order
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl"
      style={{
        background:
          "linear-gradient(135deg, rgba(249, 250, 251, 1) 0%, rgba(255, 255, 255, 1) 100%)",
        border: "1px solid rgba(229, 231, 235, 1)",
      }}
    >
      <img
        src={image}
        alt={title}
        className="w-full sm:w-24 h-24 object-cover rounded-lg shadow-md"
      />
      <div className="flex-1">
        <h3 className="text-base font-semibold text-gray-800 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 mb-1">Seller: {seller}</p>
        <p className="text-sm text-red-500 font-medium">{unitsLeft} units left</p>
        <p className="text-sm text-gray-600 mt-1">Quantity: {cartQuantity}</p>
      </div>
      <div className="text-left sm:text-right w-full sm:w-auto">
        <p className="text-lg font-bold text-gray-800">
          {" "}
          ₦{" "}
          {(() => {
            let itemPrice = price;

            if (cartItem?.isBulkOrder && cartItem?.bulkPriceTierId) {
              // Find the matching price tier from product's priceTiers array
              const matchingTier = cartItem?.product?.priceTiers?.find(
                (tier) => (tier?.id || tier?._id) === cartItem?.bulkPriceTierId,
              );

              if (matchingTier) {
                itemPrice = matchingTier?.price;
              }
            }

            return formatCurrency(parseInt(itemPrice));
          })()}
        </p>
        {oldPrice && !(oldPrice === undefined) && (
          <>
            <p className="text-sm text-gray-500 line-through">{formatCurrency(oldPrice)}</p>
            <p className="text-sm text-orange-600 font-semibold">{discount}</p>
          </>
        )}
        <p className="text-base text-orange-600 font-bold mt-2">
          Total: ₦{" "}
          {(() => {
            let itemPrice = price;

            if (cartItem?.isBulkOrder && cartItem?.bulkPriceTierId) {
              // Find the matching price tier from product's priceTiers array
              const matchingTier = cartItem?.product?.priceTiers?.find(
                (tier) => (tier?.id || tier?._id) === cartItem?.bulkPriceTierId,
              );

              if (matchingTier) {
                itemPrice = matchingTier?.price;
              }
            }

            return formatCurrency(parseInt(itemPrice) * parseInt(cartQuantity));
          })()}
        </p>
      </div>
    </motion.div>
  );
};
