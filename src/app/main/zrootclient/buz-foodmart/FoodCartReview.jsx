// import _ from "@lodash";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
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
import { motion } from "framer-motion";
import { useEffect, useState, Suspense, lazy } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAppSelector } from "app/store/hooks";
import { toast } from "react-toastify";
import useSellerCountries from "app/configs/data/server-calls/countries/useCountries";
import {
  getLgasByStateId,
  getStateByCountryId,
} from "app/configs/data/client/RepositoryClient";
import { useGetMyFoodCart } from "app/configs/data/server-calls/auth/userapp/a_foodmart/useFoodMartsRepo";
// import { formatCurrency } from "app/main/vendors-shop/PosUtils";
// import { selectUser } from "app/auth/user/store/userSlice";
import FoodCartSummaryAndPay from "./components/FoodCartSummaryAndPay";
import "../buz-marketplace/shops/checkout-comfort.css";
import FoodDeliveryTimePicker from "./components/FoodDeliveryTimePicker";
import DeliveryPointPanel from "./components/DeliveryPointPanel";
import { locateDestinationApi } from "app/configs/data/client/clientToApiRoutes";
import { useGetUserAddresses, useCreateUserAddress } from "app/configs/data/server-calls/auth/userapp/a_bookings/use-addresses";
import MyAddresses from "../buz-bookings/user-reservations/MyAddresses";
import { formatCurrency } from "../../vendors-shop/PosUtils";
import { selectUser } from "../../../auth/user/store/userSlice";




const ShopLocationMap = lazy(() => import("../buz-marketplace/components/maps/ShopLocationMap"));
const ShopLocationMapLoadingPlaceholder = lazy(
  () => import("../buz-marketplace/components/maps/ShopLocationMapLoadingPlaceholder"),
);

/**
 * Form Validation Schema — keeps all original food-order fields including district
 */
const schema = z.object({
  name: z
    .string()
    .min(1, "You must enter your name as it appears on your ID")
    .min(5, "Name must be at least 5 characters"),
  phone: z
    .string()
    .min(1, "You must enter a phone number for delivery contact")
    .min(5, "Phone number must be at least 5 characters"),
  address: z
    .string()
    .min(1, "You must enter a delivery address")
    .min(5, "Address must be at least 5 characters"),
  orderCountryDestination: z.string().min(1, "You must select a country for this order"),
  orderStateProvinceDestination: z.string().min(1, "You must select a state for this order"),
  orderLgaDestination: z.string().min(1, "You must select an L.G.A / County for this order"),
  district: z.string().min(1, "You must enter a district for this order"),
});

const payments = [
  { type: "Paystack", shortbio: "Fast, secure payment via Paystack", keycode: "PAYSTACK" },
  { type: "Flutterwave", shortbio: "Seamless payment via Flutterwave", keycode: "FLUTTERWAVE" },
  { type: "Pay on Delivery", shortbio: "Pay when your food order arrives", keycode: "PAYONDELIVERY" },
];

/**
 * Section header — consistent gradient card header used across all sections
 */
function SectionHeader({ icon, title, subtitle, action }) {
  return (
    <div
      className="p-4 sm:p-6"
      style={{
        background: "linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(234,88,12,0.05) 100%)",
      }}
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" }}
          >
            {icon}
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">{title}</h2>
            {subtitle && <p className="text-xs sm:text-sm text-gray-600">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
    </div>
  );
}


/**
 * Individual food cart item row in the Order Review section
 */
function ReviewFoodCartItem({ cartItem }) {
  const image = cartItem?.martMenu?.imageSrcs?.[0]?.url || cartItem?.imageSrcs?.[0]?.url;
  const title = cartItem?.martMenu?.title || cartItem?.title || "Menu Item";
  const price = cartItem?.martMenu?.price ?? cartItem?.price ?? 0;
  const quantity = cartItem?.quantity ?? 1;
  const unit = cartItem?.martMenu?.unitPerQuantity || cartItem?.unitPerQuantity || "serving";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl"
      style={{
        background: "linear-gradient(135deg, rgba(249,250,251,1) 0%, rgba(255,255,255,1) 100%)",
        border: "1px solid rgba(229,231,235,1)",
      }}
    >
      {/* Image */}
      {image ? (
        <img
          src={image}
          alt={title}
          className="w-full sm:w-24 h-24 object-cover rounded-xl shadow-md flex-shrink-0"
        />
      ) : (
        <div
          className="w-full sm:w-24 h-24 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)" }}
        >
          <span style={{ fontSize: "2rem" }}>🍽️</span>
        </div>
      )}

      {/* Details */}
      <div className="flex-1">
        <h3 className="text-base font-semibold text-gray-800 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 mb-1">
          ₦{formatCurrency(price)} / {unit}
        </p>
        <p className="text-sm text-gray-600">Qty: {quantity}</p>
      </div>

      {/* Price */}
      <div className="text-left sm:text-right w-full sm:w-auto flex-shrink-0">
        <p className="text-base font-bold text-gray-800">₦{formatCurrency(price)}</p>
        <p className="text-base text-orange-600 font-bold mt-1">
          Total: ₦{formatCurrency(price * quantity)}
        </p>
      </div>
    </motion.div>
  );
}

/**
 * FoodCartReview — improved checkout review page for food orders
 */
function FoodCartReview() {
  const user = useAppSelector(selectUser);
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));
  const { data: foodCart } = useGetMyFoodCart(user?.id);
  const [selectedPaymentOption, setSelectedPaymentOption] = useState("");
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentCloseDialogOpen, setPaymentCloseDialogOpen] = useState(false);

  const { data: countryData } = useSellerCountries();
  const [stateData, setStateData] = useState([]);
  const [blgas, setBlgas] = useState([]);
  // exact point the customer shared from their device: prices the delivery distance from the restaurant precisely
  const [exactPoint, setExactPoint] = useState(null);
  const [locatingExact, setLocatingExact] = useState(false);
  const [located, setLocated] = useState(null); // nearest LGA/state/country of the pinned point
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [deliverBy, setDeliverBy] = useState("");

  const methods = useForm({
    mode: "onChange",
    defaultValues: {},
    resolver: zodResolver(schema),
  });
  const { watch, control, formState, getValues, setValue, trigger } = methods;
  const { errors, isValid, dirtyFields } = formState;
  const {
    name,
    phone,
    address,
    orderCountryDestination,
    orderStateProvinceDestination,
    orderLgaDestination,
    district,
  } = watch();

  // Cascade: country → state → lga
  useEffect(() => {
    if (getValues()?.orderCountryDestination) findStatesByCountry();
  }, [orderCountryDestination]);

  useEffect(() => {
    if (getValues()?.orderStateProvinceDestination)
      getLgasFromState(getValues().orderStateProvinceDestination);
  }, [orderStateProvinceDestination]);

  async function findStatesByCountry() {
    const res = await getStateByCountryId(getValues()?.orderCountryDestination);
    if (res) setStateData(res?.data?.states || []);
  }

  async function getLgasFromState(sid) {
    const res = await getLgasByStateId(sid);
    if (res) setBlgas(res?.data?.lgas || []);
  }

  /**
   * Fill the destination selects the way a person does: set a level, let its list load, then the next.
   * Setting all four at once leaves the dropdowns blank (their options arrive after the values).
   */
  const applyDeliveryLocation = async ({ country, state, lga }) => {
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
    }
  };

  const handleSelectAddress = async (selectedAddress) => {
    setValue("name", selectedAddress.name, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    setValue("phone", selectedAddress.phone, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    setValue("address", selectedAddress.address, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    // the saved address's delivery location fills the destination too
    await applyDeliveryLocation({
      country: selectedAddress.country,
      state: selectedAddress.state,
      lga: selectedAddress.lga,
    });
    await trigger(["name", "phone", "address"]);
  };

  const { data: savedAddresses = [] } = useGetUserAddresses({ enabled: Boolean(user?.id) });
  const createAddress = useCreateUserAddress();

  /** A new pin (tap, drag, search, device location): remember it, then fill Country / State / L.G.A from it so the
   *  fee can be priced straight away. The selects stay editable. */
  const setDeliveryPoint = async (pt) => {
    setExactPoint(pt);
    try {
      const res = await locateDestinationApi(pt.lat, pt.lng);
      const data = res?.data;
      if (data?.success) {
        setLocated(data);
        await applyDeliveryLocation({ country: data.country?.id, state: data.state?.id, lga: data.lga?.id });
      }
    } catch (err) {
      setLocated(null);
      toast.info(err?.response?.data?.message || "We could not match that spot to a delivery area — choose your Country, State and L.G.A below.");
    }
  };

  /** "Use my current location": the device position. */
  const shareExactLocation = () => {
    if (!navigator.geolocation) {
      toast.info("This device can't share its location — tap the map to place your pin instead.");
      return;
    }
    setLocatingExact(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocatingExact(false);
        setSelectedAddressId(null);
        setDeliveryPoint({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        setLocatingExact(false);
        toast.info("Location permission was declined — tap the map or search your address instead.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  /** One click: a saved address fills the whole form (name, phone, street, area) and its pinned point. */
  const pickSavedAddress = async (a) => {
    setSelectedAddressId(a.id);
    await handleSelectAddress(a);
    if (a.latitude != null && a.longitude != null) {
      setExactPoint({ lat: a.latitude, lng: a.longitude });
      setLocated(null);
    } else {
      setExactPoint(null);
      setLocated(null);
    }
  };

  const useDifferentAddress = () => {
    setSelectedAddressId(null);
    setExactPoint(null);
    setLocated(null);
    ["address", "district"].forEach((k) => setValue(k, "", { shouldValidate: true, shouldDirty: true }));
  };

  /** Keep this delivery address (with its pin) for next time. */
  const saveCurrentAddress = (label) => {
    createAddress.mutate(
      {
        name,
        phone,
        address,
        label,
        isDefault: savedAddresses.length === 0,
        country: orderCountryDestination || undefined,
        state: orderStateProvinceDestination || undefined,
        lga: orderLgaDestination || undefined,
        latitude: exactPoint?.lat,
        longitude: exactPoint?.lng,
      },
      { onSuccess: (res) => res?.data?.address?.id && setSelectedAddressId(res.data.address.id) },
    );
  };

  // The customer's default saved address is picked for them once, so a returning customer starts with a full form.
  const [autoPicked, setAutoPicked] = useState(false);
  useEffect(() => {
    if (autoPicked || !savedAddresses.length || name || address) return;
    const preferred = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
    setAutoPicked(true);
    pickSavedAddress(preferred);
  }, [savedAddresses]); // eslint-disable-line react-hooks/exhaustive-deps

  const cartProducts = foodCart?.data?.userFoodCartSession?.cartProducts || [];
  const cartSession = foodCart?.data?.userFoodCartSession || {};

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      "&:hover fieldset": { borderColor: "#f97316" },
      "&.Mui-focused fieldset": { borderColor: "#ea580c" },
    },
  };

  const selectSx = {
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#f97316" },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#ea580c" },
  };

  return (
    <FusePageSimple
      content={
        <>
          <div className="checkout-comfort min-h-screen flex flex-col px-4 md:px-8 lg:px-12 py-8 md:py-12">
            <div className="max-w-[1600px] mx-auto w-full">
              <div className="flex flex-1 flex-col lg:flex-row gap-6 lg:gap-8">

                {/* ─── LEFT: Form sections (scrollable) ─── */}
                <div className="w-full lg:w-[60%] lg:overflow-y-auto lg:pr-4 space-y-6">

                  {/* ── Section 1: Customer Details ── */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden"
                    style={{ border: "2px solid rgba(234,88,12,0.1)" }}
                  >
                    <SectionHeader
                      icon={
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      }
                      title="Customer Billing & Delivery Address"
                      subtitle="Required for food order delivery"
                      action={
                        <button
                          type="button"
                          onClick={() => setAddressModalOpen(true)}
                          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold w-full sm:w-auto transition-all hover:shadow-md"
                          style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", color: "white" }}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Use Saved Address
                        </button>
                      }
                    />

                    <div className="p-4 sm:p-6 space-y-4">
                      {/* Address preview badge */}
                      {(name || address) && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-4 rounded-xl"
                          style={{
                            background: "linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(22,163,74,0.05) 100%)",
                            border: "1px solid rgba(34,197,94,0.2)",
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                              {name && <p className="font-semibold text-gray-800">{name}</p>}
                              {address && (
                                <p className="text-sm text-gray-600 mt-0.5">
                                  {address} {phone && `| ${phone}`}
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Name */}
                      <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            required
                            label="Full Name (as per ID)"
                            variant="outlined"
                            fullWidth
                            error={!!errors.name}
                            helperText={errors?.name?.message}
                            sx={inputSx}
                          />
                        )}
                      />

                      {/* Phone */}
                      <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            required
                            label="Phone Number"
                            variant="outlined"
                            fullWidth
                            error={!!errors.phone}
                            helperText={errors?.phone?.message}
                            sx={inputSx}
                          />
                        )}
                      />

                      {/* Address */}
                      <Controller
                        name="address"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            required
                            label="Delivery Address"
                            variant="outlined"
                            fullWidth
                            multiline
                            rows={3}
                            error={!!errors.address}
                            helperText={errors?.address?.message || "Include street, area, and city"}
                            sx={inputSx}
                          />
                        )}
                      />

                      {/* Info note */}
                      <div
                        className="p-4 rounded-xl flex items-start gap-3"
                        style={{ background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.2)" }}
                      >
                        <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-gray-700">
                          Your information is securely stored and used only for food order delivery and communication.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* ── Section 2: Delivery Location ── */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden"
                    style={{ border: "2px solid rgba(234,88,12,0.1)" }}
                  >
                    <SectionHeader
                      icon={
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      }
                      title="Where should we deliver?"
                      subtitle="Your home or current address — the restaurant delivers straight to your door"
                    />

                    <div className="p-4 sm:p-6 space-y-4">
                      <DeliveryPointPanel
                        addresses={savedAddresses}
                        selectedAddressId={selectedAddressId}
                        onPickSaved={pickSavedAddress}
                        onDifferentAddress={useDifferentAddress}
                        point={exactPoint}
                        onPointChange={(pt) => {
                          setSelectedAddressId(null);
                          setDeliveryPoint(pt);
                        }}
                        locating={locatingExact}
                        onUseCurrentLocation={shareExactLocation}
                        searchText={[address, district].filter(Boolean).join(", ")}
                        located={located}
                        canSave={Boolean(user?.id) && !selectedAddressId && Boolean(name && phone && address)}
                        saving={createAddress.isLoading}
                        onSave={saveCurrentAddress}
                      />
                      {/* Country + State */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Typography className="mb-2 text-sm font-semibold text-gray-700">Country</Typography>
                          <Controller
                            control={control}
                            name="orderCountryDestination"
                            render={({ field }) => (
                              <FormControl fullWidth error={!!errors.orderCountryDestination}>
                                <Select {...field} value={orderCountryDestination || ""} displayEmpty MenuProps={{ className: "checkout-comfort" }} renderValue={(v) => ((countryData?.data?.countries || []).find((o) => o?.id === v)?.name) || (v ? "Loading…" : "Select Country")} variant="outlined" sx={selectSx}>
                                  <MenuItem value="" disabled>Select Country</MenuItem>
                                  {countryData?.data?.countries?.map((c, i) => (
                                    <MenuItem key={i} value={c?.id}>{c?.name}</MenuItem>
                                  ))}
                                </Select>
                                {errors.orderCountryDestination && (
                                  <Typography className="text-xs text-red-600 mt-1">{errors.orderCountryDestination.message}</Typography>
                                )}
                              </FormControl>
                            )}
                          />
                        </div>

                        <div>
                          <Typography className="mb-2 text-sm font-semibold text-gray-700">State / Province</Typography>
                          <Controller
                            control={control}
                            name="orderStateProvinceDestination"
                            render={({ field }) => (
                              <FormControl fullWidth error={!!errors.orderStateProvinceDestination}>
                                <Select {...field} value={orderStateProvinceDestination || ""} displayEmpty MenuProps={{ className: "checkout-comfort" }} renderValue={(v) => ((stateData || []).find((o) => o?.id === v)?.name) || (v ? "Loading…" : "Select State")} variant="outlined" disabled={!stateData?.length} sx={selectSx}>
                                  <MenuItem value="" disabled>Select State</MenuItem>
                                  {stateData?.map((s, i) => (
                                    <MenuItem key={i} value={s?.id}>{s?.name}</MenuItem>
                                  ))}
                                </Select>
                                {errors.orderStateProvinceDestination && (
                                  <Typography className="text-xs text-red-600 mt-1">{errors.orderStateProvinceDestination.message}</Typography>
                                )}
                              </FormControl>
                            )}
                          />
                        </div>
                      </div>

                      {/* LGA + district / landmark */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Typography className="mb-2 text-sm font-semibold text-gray-700">L.G.A / County</Typography>
                          <Controller
                            control={control}
                            name="orderLgaDestination"
                            render={({ field }) => (
                              <FormControl fullWidth error={!!errors.orderLgaDestination}>
                                <Select {...field} value={orderLgaDestination || ""} displayEmpty MenuProps={{ className: "checkout-comfort" }} renderValue={(v) => ((blgas || []).find((o) => o?.id === v)?.name) || (v ? "Loading…" : "Select L.G.A")} variant="outlined" disabled={!blgas?.length} sx={selectSx}>
                                  <MenuItem value="" disabled>Select L.G.A</MenuItem>
                                  {blgas?.map((l, i) => (
                                    <MenuItem key={i} value={l?.id}>{l?.name}</MenuItem>
                                  ))}
                                </Select>
                                {errors.orderLgaDestination && (
                                  <Typography className="text-xs text-red-600 mt-1">{errors.orderLgaDestination.message}</Typography>
                                )}
                              </FormControl>
                            )}
                          />
                        </div>

                        <div>
                          <Typography className="mb-2 text-sm font-semibold text-gray-700">District / Nearest Landmark</Typography>
                          <Controller
                            name="district"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                required
                                variant="outlined"
                                fullWidth
                                placeholder="e.g. Garki Area 11, near GTBank"
                                error={!!errors.district}
                                helperText={errors?.district?.message || "Helps riders find your door"}
                                sx={inputSx}
                              />
                            )}
                          />
                        </div>
                      </div>

                    </div>
                  </motion.div>

                  <FoodDeliveryTimePicker cartItems={cartProducts} value={deliverBy} onChange={setDeliverBy} />

                  {/* ── Section 3: Order Items Review ── */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden"
                    style={{ border: "2px solid rgba(234,88,12,0.1)" }}
                  >
                    <SectionHeader
                      icon={
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      }
                      title="Your Food Order"
                      subtitle={`${cartProducts.length} item${cartProducts.length !== 1 ? "s" : ""} in your cart`}
                    />

                    <div className="p-4 sm:p-6 space-y-4">
                      {cartProducts.length > 0 ? (
                        cartProducts.map((cartItem, idx) => (
                          <ReviewFoodCartItem key={cartItem?.id || idx} cartItem={cartItem} />
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <span style={{ fontSize: "3rem" }}>🍽️</span>
                          <Typography className="text-gray-500 mt-4">No items in your food cart</Typography>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* ── Section 4: Payment Method ── */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden"
                    style={{ border: "2px solid rgba(234,88,12,0.1)" }}
                  >
                    <SectionHeader
                      icon={
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      }
                      title="Payment Method"
                      subtitle="Choose how you'd like to pay for your food order"
                    />

                    <div className="p-4 sm:p-6 space-y-3">
                      {payments.map((payment) => (
                        <motion.div
                          key={payment.keycode}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => setSelectedPaymentOption(payment.keycode)}
                          className="p-4 rounded-xl cursor-pointer transition-all duration-200"
                          style={{
                            background:
                              selectedPaymentOption === payment.keycode
                                ? "linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(234,88,12,0.05) 100%)"
                                : "rgba(249,250,251,0.5)",
                            border:
                              selectedPaymentOption === payment.keycode
                                ? "2px solid rgba(234,88,12,0.3)"
                                : "2px solid rgba(229,231,235,1)",
                          }}
                        >
                          <div className="flex items-center gap-4">
                            {/* Custom radio */}
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                selectedPaymentOption === payment.keycode ? "border-orange-600" : "border-gray-300"
                              }`}
                            >
                              {selectedPaymentOption === payment.keycode && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="w-3 h-3 rounded-full"
                                  style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" }}
                                />
                              )}
                            </div>

                            {/* Icon */}
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                selectedPaymentOption === payment.keycode ? "bg-orange-100" : "bg-gray-100"
                              }`}
                            >
                              {payment.keycode === "PAYONDELIVERY" ? (
                                <svg
                                  className={`w-5 h-5 ${selectedPaymentOption === payment.keycode ? "text-orange-600" : "text-gray-600"}`}
                                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                              ) : (
                                <svg
                                  className={`w-5 h-5 ${selectedPaymentOption === payment.keycode ? "text-orange-600" : "text-gray-600"}`}
                                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                              )}
                            </div>

                            {/* Label */}
                            <div className="flex-1">
                              <h3 className={`text-sm sm:text-base font-bold ${selectedPaymentOption === payment.keycode ? "text-orange-600" : "text-gray-800"}`}>
                                {payment.type}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">{payment.shortbio}</p>
                            </div>

                            {/* Tick */}
                            {selectedPaymentOption === payment.keycode && (
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 200 }}
                              >
                                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      ))}

                      {!selectedPaymentOption && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 rounded-xl flex items-start gap-3 mt-2"
                          style={{
                            background: "linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(220,38,38,0.05) 100%)",
                            border: "1px solid rgba(239,68,68,0.2)",
                          }}
                        >
                          <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <p className="text-sm text-red-700 font-semibold">Please select a payment method to continue</p>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>

                  {/* ── Section 5: Terms & Conditions ── */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.25 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden"
                    style={{ border: "2px solid rgba(234,88,12,0.1)" }}
                  >
                    <SectionHeader
                      icon={
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      }
                      title="Terms & Conditions"
                      subtitle="Please read before placing your food order"
                    />

                    <div className="p-4 sm:p-6">
                      <div
                        className="max-h-64 overflow-y-auto p-4 rounded-xl space-y-3"
                        style={{ background: "rgba(249,250,251,1)", border: "1px solid rgba(229,231,235,1)" }}
                      >
                        <p className="text-orange-600 font-semibold">
                          Terms and conditions for food orders on Africanshops
                        </p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          Your order may not be eligible for Cash on Delivery if: 1) The total is below ₦2,000 or above ₦250,000; 2) COD is unavailable for your delivery address or selected pickup station; 3) You have had multiple failed deliveries or cancelled orders; 4) Your phone number has delivery restrictions.
                        </p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          By placing an order, you agree to our food order delivery terms. All orders are subject to availability and confirmation. Delivery times may vary. We reserve the right to refuse, limit, or cancel orders per person, household, or account.
                        </p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          Refund policy: Refunds are subject to the individual restaurant's policy as displayed on their profile. Please review the restaurant's refund policy before completing your purchase.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* ─── RIGHT: Order Summary + Map (sticky) ─── */}
                <div className="w-full lg:w-[30%] lg:sticky lg:top-20 lg:self-start">
                  <div className="flex flex-col gap-4 lg:gap-6 lg:h-[calc(100vh-120px)]">
                    {/* Payment Summary — 40% height on desktop */}
                    <div className="lg:h-[40%] lg:min-h-[350px] lg:max-h-[500px]">
                      {/* FoodCartSummaryAndPay */}
                      <FoodCartSummaryAndPay
                        cartSession={cartSession}
                        intemsInCart={cartProducts}
                        methodOfPay={selectedPaymentOption}
                        name={name}
                        phone={phone}
                        address={address}
                        orderCountryDestination={orderCountryDestination}
                        orderStateProvinceDestination={orderStateProvinceDestination}
                        orderLgaDestination={orderLgaDestination}
                        district={district}
                        dirtyFields={dirtyFields}
                        isValid={isValid}
                        setIsProcessingPayment={setIsProcessingPayment}
                        exactPoint={exactPoint}
                        deliverBy={deliverBy}
                      />
                    </div>

                    {/* Pickup Location Map — 60% height on desktop */}
                    <div className="lg:h-[60%] lg:min-h-[450px] min-h-[400px]">
                      {exactPoint?.lat && exactPoint?.lng ? (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.4 }}
                          className="bg-white rounded-2xl shadow-lg overflow-hidden h-full w-full"
                          style={{ border: "2px solid rgba(234,88,12,0.1)" }}
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
                                id: "delivery-point",
                                shopName: "Your delivery point",
                                address: address || "Your delivery address",
                                city: district || "",
                                state: "",
                                country: "Nigeria",
                                coordinates: [
                                  exactPoint.lat,
                                  exactPoint.lng,
                                ],
                                zoom: 14,
                                phone: phone || "",
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
                            border: "2px solid rgba(234,88,12,0.1)",
                            background: "linear-gradient(135deg, rgba(249,115,22,0.05) 0%, rgba(234,88,12,0.02) 100%)",
                          }}
                        >
                          <div className="text-center max-w-sm">
                            <div
                              className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                              style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(234,88,12,0.1) 100%)" }}
                            >
                              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2">Share your location to see your delivery point</h3>
                            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                              Tap “Use my current location” above to pin where the restaurant should deliver.
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

          {/* ── Saved Addresses Modal ── */}
          <MyAddresses
            open={addressModalOpen}
            onClose={() => setAddressModalOpen(false)}
            onSelectAddress={handleSelectAddress}
            onCreateNew={() => {
              setAddressModalOpen(false);
              toast.info("Fill in your address details in the form above");
            }}
          />

          {/* ── Payment Processing Backdrop ── */}
          <Backdrop
            sx={{
              zIndex: (theme) => theme.zIndex.modal + 1000,
              backgroundColor: "rgba(0,0,0,0.75)",
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
                <CircularProgress
                  size={160}
                  thickness={3}
                  sx={{ color: "#ea580c", position: "absolute", top: -20, left: -20 }}
                />
                <div
                  className="w-[120px] h-[120px] rounded-full flex items-center justify-center shadow-2xl"
                  style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" }}
                >
                  <img
                    src="/assets/images/logo/logo.svg"
                    alt="AfricanShops"
                    className="w-20 h-20"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML = `<div style="color: white; font-size: 2.5rem; font-weight: 900;">AS</div>`;
                    }}
                  />
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-full"
                  style={{ border: "3px solid #ea580c", margin: "-20px" }}
                />
              </div>

              {/* Processing Text */}
              <motion.div
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
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
                  sx={{ color: "#e5e7eb", fontSize: { xs: "0.9rem", sm: "1rem" }, fontWeight: 500 }}
                >
                  Please wait while we confirm your food order
                </Typography>
              </motion.div>

              {/* Security Badges */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-4 mt-4"
              >
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <Typography variant="caption" className="text-white font-semibold">Secure</Typography>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm">
                  <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <Typography variant="caption" className="text-white font-semibold">Protected</Typography>
                </div>
              </motion.div>

              {/* Do-not-close Warning */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="max-w-md mx-auto mt-4"
              >
                <div
                  className="p-4 rounded-xl flex items-start gap-3"
                  style={{
                    background: "rgba(234,88,12,0.15)",
                    border: "2px solid rgba(234,88,12,0.3)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <svg className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <Typography
                      variant="body2"
                      sx={{ color: "#fff", fontWeight: 600, fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
                    >
                      Do not close or refresh this page
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "#e5e7eb", fontSize: { xs: "0.7rem", sm: "0.75rem" }, display: "block", marginTop: "4px" }}
                    >
                      Your payment is being securely processed
                    </Typography>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </Backdrop>

          {/* ── Order Close Warning Dialog ── */}
          <Dialog
            open={paymentCloseDialogOpen}
            onClose={() => setPaymentCloseDialogOpen(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: "16px", overflow: "hidden" } }}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="font-bold text-xl">Complete Your Food Order</span>
            </DialogTitle>

            <DialogContent sx={{ padding: "32px 24px" }}>
              <div className="space-y-4">
                <Typography variant="h6" className="font-bold text-gray-800">Don't abandon your cart!</Typography>
                <Typography variant="body1" className="text-gray-700 leading-relaxed">
                  Your food order is almost complete. Leaving now may cause:
                </Typography>
                <div className="space-y-3 ml-4">
                  {[
                    "Your cart items to be released back",
                    "Menu availability to change",
                    "Restaurant preparation slots to be lost",
                  ].map((risk) => (
                    <div key={risk} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <Typography variant="body2" className="text-gray-600">{risk}</Typography>
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>

            <DialogActions sx={{ padding: "16px 24px 24px", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
              <Button
                onClick={() => setPaymentCloseDialogOpen(false)}
                variant="outlined"
                fullWidth
                sx={{ borderColor: "#9ca3af", color: "#6b7280", "&:hover": { borderColor: "#6b7280", backgroundColor: "#f3f4f6" }, textTransform: "none", fontWeight: 600, padding: "10px 24px" }}
              >
                Leave Without Paying
              </Button>
              <Button
                onClick={() => { setPaymentCloseDialogOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                variant="contained"
                fullWidth
                sx={{
                  background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                  color: "white",
                  "&:hover": { background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)", boxShadow: "0 8px 20px rgba(234,88,12,0.4)" },
                  textTransform: "none",
                  fontWeight: "bold",
                  padding: "10px 24px",
                }}
              >
                Complete Order Now
              </Button>
            </DialogActions>
          </Dialog>
        </>
      }
      scroll={isMobile ? "normal" : "page"}
    />
  );
}

export default FoodCartReview;
