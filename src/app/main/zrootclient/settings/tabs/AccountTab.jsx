import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { useEffect, useState } from "react";
import { PageSkeleton } from "app/shared-components/loading";
import useSellerCountries from "app/configs/data/server-calls/countries/useCountries";
import {
  Avatar,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  Button,
  Typography,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  getLgaByStateId,
  getMarketsByLgaId,
  getStateByCountryId,
} from "app/configs/data/client/clientToApiRoutes";
import { firebaseApp } from "src/app/auth/services/firebase/initializeFirebase";
import { getStorage, ref, deleteObject, uploadString, getDownloadURL } from "firebase/storage";
import FuseUtils from "@fuse/utils/FuseUtils";
import { toast } from "react-toastify";
import {
  useGetAuthUserDetails,
  useUserUpdateMutation,
} from "app/configs/data/server-calls/useUsers/useUsersQuery";
import { motion } from "framer-motion";

const defaultValues = {
  avatar: "",
  name: "",
  tradehub: "",
  userOwner: "",
  businessCountry: "",
  businezState: "",
  businezLga: "",
  market: "",
  usingParentId: "",
  coverimage: "",
  shoplogo: "",
  phone: "",
  address: "",
  userbio: "",
  shopplan: "",
  instagram: "",
  twitter: "",
  facebook: "",
  linkedin: "",
  email: "",
  postalCode: "",
};

/**
 * Form Validation Schema
 */
const schema = z.object({
  name: z.string().min(1, "Name is required"),
  userbio: z.string().nullable().optional(),
  email: z.string().email("Invalid email").min(1, "Email is required"),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  businessCountry: z.string().min(1, "Country is required"),
  businezState: z.string().min(1, "State is required"),
  businezLga: z.string().min(1, "L.G.A/County is required"),
  market: z.string().min(1, "Market is required"),
  postalCode: z.string().nullable().optional(),
  instagram: z.string().nullable().optional(),
  twitter: z.string().nullable().optional(),
  facebook: z.string().nullable().optional(),
  linkedin: z.string().nullable().optional(),
});

function AccountTab() {
  const { control, watch, reset, handleSubmit, formState, getValues, setValue } = useForm({
    defaultValues,
    mode: "onChange",
    resolver: zodResolver(schema),
  });

  const { isValid, errors, isDirty } = formState;
  const { avatar, businessCountry, businezState, businezLga } = watch();

  const [loading, setLoading] = useState(false);
  const { data: userProfileData, isLoading: isProfileLoading } = useGetAuthUserDetails();
  const { data: countryData } = useSellerCountries();
  const updateUserDetails = useUserUpdateMutation();

  const [blgas, setBlgas] = useState([]);
  const [markets, setBMarkets] = useState([]);
  const [stateData, setStateData] = useState([]);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [isLoadingLgas, setIsLoadingLgas] = useState(false);
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(false);

  // console.log("User Profile Data", userProfileData?.data?.user);
  // console.log("Form State:", { isValid, isDirty, errors });

  // Initialize form with user data
  useEffect(() => {
    if (userProfileData?.data?.user) {
      const userData = userProfileData.data.user;
      // Convert null values to empty strings for form compatibility
      reset({
        name: userData?.name || "",
        email: userData?.email || "",
        phone: userData?.phone || "",
        address: userData?.address || "",
        userbio: userData?.userbio || "",
        postalCode: userData?.postalCode || "",
        instagram: userData?.instagram || "",
        twitter: userData?.twitter || "",
        facebook: userData?.facebook || "",
        linkedin: userData?.linkedin || "",
        avatar: userData?.avatar || "",
        coverimage: userData?.coverimage || "",
        businessCountry: userData?.countryorigin || "",
        businezState: userData?.stateorigin || "",
        businezLga: userData?.lgaorigin || "",
        market: userData?.pickUpOrigin || userData?.market || "",
      });
    }
  }, [userProfileData?.data, reset]);

  // Load dependent dropdowns on country change
  useEffect(() => {
    if (businessCountry) {
      findStatesByCountry(businessCountry);
      // Reset dependent fields when country changes
      if (getValues().businessCountry !== businessCountry) {
        setValue("businezState", "");
        setValue("businezLga", "");
        setValue("market", "");
        setBlgas([]);
        setBMarkets([]);
      }
    }
  }, [businessCountry]);

  // Load dependent dropdowns on state change
  useEffect(() => {
    if (businezState) {
      getLgasFromState(businezState);
      // Reset dependent fields when state changes
      if (getValues().businezState !== businezState) {
        setValue("businezLga", "");
        setValue("market", "");
        setBMarkets([]);
      }
    }
  }, [businezState]);

  // Load dependent dropdowns on LGA change
  useEffect(() => {
    if (businezLga) {
      getMarketsFromLgaId(businezLga);
      // Reset dependent field when LGA changes
      if (getValues().businezLga !== businezLga) {
        setValue("market", "");
      }
    }
  }, [businezLga]);

  async function findStatesByCountry(countryId) {
    setIsLoadingStates(true);
    try {
      const stateResponseData = await getStateByCountryId(countryId);
      if (stateResponseData?.data?.states) {
        setStateData(stateResponseData.data.states);
      }
    } catch (error) {
      console.error("Error loading states:", error);
      toast.error("Failed to load states");
    } finally {
      setIsLoadingStates(false);
    }
  }

  async function getLgasFromState(stateId) {
    setIsLoadingLgas(true);
    try {
      const responseData = await getLgaByStateId(stateId);
      if (responseData?.data?.lgas) {
        setBlgas(responseData.data.lgas);
      }
    } catch (error) {
      console.error("Error loading LGAs:", error);
      toast.error("Failed to load LGAs");
    } finally {
      setIsLoadingLgas(false);
    }
  }

  async function getMarketsFromLgaId(lgaId) {
    if (!lgaId) return;
    setIsLoadingMarkets(true);
    try {
      const responseData = await getMarketsByLgaId(lgaId);
      if (responseData?.data?.markets) {
        setBMarkets(responseData.data.markets);
      }
    } catch (error) {
      console.error("Error loading markets:", error);
      toast.error("Failed to load markets");
    } finally {
      setIsLoadingMarkets(false);
    }
  }

  /**
   * Form Submit
   */
  async function onSubmit() {
    setLoading(true);
    try {
      if (avatar && avatar.startsWith("data:")) {
        // New image uploaded
        const fileName = new Date().getTime() + FuseUtils.generateGUID();
        const storage = getStorage(firebaseApp);
        const storageRef = ref(storage, `/shopbanners/${fileName}`);
        const uploadTask = uploadString(storageRef, avatar, "data_url");

        // Delete old image if exists
        if (getValues()?.coverimage) {
          const desertRef = ref(storage, `${getValues()?.coverimage}`);
          try {
            await deleteObject(desertRef);
          } catch (error) {
            console.log("Error deleting old image:", error);
          }
        }

        const snapshot = await uploadTask;
        const downloadURL = await getDownloadURL(snapshot.ref);
        setValue("coverimage", downloadURL);

        // Update with new image URL
        await updateUserDetails.mutateAsync({
          ...getValues(),
          coverimage: downloadURL,
        });
      } else {
        // No new image, just update other fields
        console.log("Update valies on client:", getValues());
        // return
        await updateUserDetails.mutateAsync(getValues());
      }

      toast.success("Profile updated successfully!");
      // Reset dirty fields after successful save
      reset(getValues());
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

  // First load: the form used to draw with empty fields and fill about a second later, which looked blank.
  // Show the page skeleton (settings pages use the boxed badge) until the profile arrives.
  if (isProfileLoading) {
    return <PageSkeleton centerpiece="box" body="form" title="Loading your settings" />;
  }

  return (
    <div className="w-full max-w-5xl">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
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
                heroicons-solid:user-circle
              </FuseSvgIcon>
            </div>
            <div>
              <Typography className="text-xl font-bold text-gray-800">
                Profile Information
              </Typography>
              <Typography className="text-sm text-gray-600">
                Following information is publicly displayed, be careful!
              </Typography>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Avatar Upload */}
            <div className="sm:col-span-2 flex justify-center">
              <Controller
                control={control}
                name="avatar"
                render={({ field: { onChange, value } }) => (
                  <Box className="relative">
                    <Box
                      sx={{
                        borderWidth: 4,
                        borderStyle: "solid",
                        borderColor: "#f97316",
                      }}
                      className="relative flex items-center justify-center w-32 h-32 rounded-full overflow-hidden transition-all hover:shadow-xl"
                    >
                      <div className="absolute inset-0 bg-black bg-opacity-40 z-10 transition-opacity hover:bg-opacity-50" />
                      <div className="absolute inset-0 flex items-center justify-center z-20">
                        <label htmlFor="button-avatar" className="flex p-3 cursor-pointer">
                          <input
                            accept="image/*"
                            className="hidden"
                            id="button-avatar"
                            type="file"
                            onChange={async (e) => {
                              const file = e?.target?.files?.[0];
                              if (!file) return;

                              const reader = new FileReader();
                              reader.onload = () => {
                                if (reader.result) {
                                  onChange(reader.result);
                                }
                              };
                              reader.readAsDataURL(file);
                            }}
                          />
                          <FuseSvgIcon className="text-white" size={32}>
                            heroicons-outline:camera
                          </FuseSvgIcon>
                        </label>
                      </div>
                      <Avatar
                        sx={{
                          backgroundColor: "background.default",
                          color: "text.secondary",
                        }}
                        className="object-cover w-full h-full text-3xl font-bold"
                        src={value || getValues()?.avatar}
                        alt={getValues()?.name}
                      >
                        {getValues()?.name?.charAt(0)?.toUpperCase()}
                      </Avatar>
                    </Box>
                    <Typography className="text-xs text-center mt-2 text-gray-500">
                      Click to upload
                    </Typography>
                  </Box>
                )}
              />
            </div>

            {/* Name */}
            <div className="sm:col-span-2">
              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Shop Name"
                    placeholder="Enter shop name"
                    error={!!errors.name}
                    helperText={errors?.name?.message}
                    variant="outlined"
                    required
                    fullWidth
                    disabled
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FuseSvgIcon size={20} className="text-orange-600">
                            heroicons-solid:user-circle
                          </FuseSvgIcon>
                        </InputAdornment>
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
            </div>

            {/* Address */}
            <div className="sm:col-span-2">
              <Controller
                control={control}
                name="address"
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Shop Address"
                    placeholder="Enter your shop address"
                    error={!!errors.address}
                    helperText={errors?.address?.message}
                    variant="outlined"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FuseSvgIcon size={20} className="text-orange-600">
                            heroicons-solid:location-marker
                          </FuseSvgIcon>
                        </InputAdornment>
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
            </div>

            {/* Shop Bio */}
            <div className="sm:col-span-2">
              <Controller
                control={control}
                name="userbio"
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Shop Bio"
                    placeholder="Brief description for your profile..."
                    error={!!errors.userbio}
                    helperText={
                      errors?.userbio?.message ||
                      "Brief description for your profile. Basic HTML and Emoji are allowed."
                    }
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" className="self-start mt-4">
                          <FuseSvgIcon size={20} className="text-orange-600">
                            heroicons-solid:menu-alt-2
                          </FuseSvgIcon>
                        </InputAdornment>
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
            </div>

            {/* Postal Code */}
            <div className="sm:col-span-1">
              <Controller
                control={control}
                name="postalCode"
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Postal Code"
                    placeholder="Enter postal code"
                    variant="outlined"
                    fullWidth
                    error={!!errors.postalCode}
                    helperText={errors?.postalCode?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FuseSvgIcon size={20} className="text-orange-600">
                            heroicons-solid:mail
                          </FuseSvgIcon>
                        </InputAdornment>
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
            </div>
          </div>
        </motion.div>

        {/* Personal Information Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
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
                heroicons-solid:identification
              </FuseSvgIcon>
            </div>
            <div>
              <Typography className="text-xl font-bold text-gray-800">
                Contact Information
              </Typography>
              <Typography className="text-sm text-gray-600">
                Communication details for customer reach. These will be kept private.
              </Typography>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Email */}
            <div className="sm:col-span-1">
              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email Address"
                    placeholder="your@email.com"
                    variant="outlined"
                    fullWidth
                    required
                    disabled
                    error={!!errors.email}
                    helperText={errors?.email?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FuseSvgIcon size={20} className="text-orange-600">
                            heroicons-solid:mail
                          </FuseSvgIcon>
                        </InputAdornment>
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
            </div>

            {/* Phone */}
            <div className="sm:col-span-1">
              <Controller
                control={control}
                name="phone"
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Phone Number"
                    placeholder="+234 800 000 0000"
                    variant="outlined"
                    fullWidth
                    required
                    error={!!errors.phone}
                    helperText={errors?.phone?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FuseSvgIcon size={20} className="text-orange-600">
                            heroicons-solid:phone
                          </FuseSvgIcon>
                        </InputAdornment>
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
            </div>
          </div>
        </motion.div>

        {/* Geographic Location Section */}
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
                heroicons-solid:globe
              </FuseSvgIcon>
            </div>
            <div>
              <Typography className="text-xl font-bold text-gray-800">
                Geographic Location
              </Typography>
              <Typography className="text-sm text-gray-600">
                Your merchant activity location. These will be kept private.
              </Typography>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Country */}
            <div className="sm:col-span-1">
              <Controller
                control={control}
                name="businessCountry"
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.businessCountry} required>
                    <InputLabel>Country</InputLabel>
                    <Select
                      {...field}
                      label="Country"
                      startAdornment={
                        <InputAdornment position="start">
                          <FuseSvgIcon size={20} className="text-orange-600">
                            heroicons-solid:globe
                          </FuseSvgIcon>
                        </InputAdornment>
                      }
                      sx={{
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: errors.businessCountry ? "#ef4444" : "#e5e7eb",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#f97316",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#ea580c",
                        },
                      }}
                    >
                      {countryData?.data?.countries?.map((country) => (
                        <MenuItem key={country.id} value={country.id}>
                          {country.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.businessCountry && (
                      <FormHelperText>{errors.businessCountry.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </div>

            {/* State */}
            <div className="sm:col-span-1">
              <Controller
                control={control}
                name="businezState"
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    error={!!errors.businezState}
                    required
                    disabled={!businessCountry || isLoadingStates}
                  >
                    <InputLabel>State / Province</InputLabel>
                    <Select
                      {...field}
                      label="State / Province"
                      startAdornment={
                        <InputAdornment position="start">
                          {isLoadingStates ? (
                            <CircularProgress size={20} className="text-orange-600" />
                          ) : (
                            <FuseSvgIcon size={20} className="text-orange-600">
                              heroicons-solid:map
                            </FuseSvgIcon>
                          )}
                        </InputAdornment>
                      }
                      sx={{
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: errors.businezState ? "#ef4444" : "#e5e7eb",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#f97316",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#ea580c",
                        },
                      }}
                    >
                      {stateData?.length > 0 ? (
                        stateData.map((state) => (
                          <MenuItem key={state.id || state._id} value={state.id || state._id}>
                            {state.name}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>
                          {isLoadingStates ? "Loading..." : "Select a country first"}
                        </MenuItem>
                      )}
                    </Select>
                    {errors.businezState && (
                      <FormHelperText>{errors.businezState.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </div>

            {/* LGA */}
            <div className="sm:col-span-1">
              <Controller
                control={control}
                name="businezLga"
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    error={!!errors.businezLga}
                    required
                    disabled={!businezState || isLoadingLgas}
                  >
                    <InputLabel>L.G.A / County</InputLabel>
                    <Select
                      {...field}
                      label="L.G.A / County"
                      startAdornment={
                        <InputAdornment position="start">
                          {isLoadingLgas ? (
                            <CircularProgress size={20} className="text-orange-600" />
                          ) : (
                            <FuseSvgIcon size={20} className="text-orange-600">
                              heroicons-solid:office-building
                            </FuseSvgIcon>
                          )}
                        </InputAdornment>
                      }
                      sx={{
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: errors.businezLga ? "#ef4444" : "#e5e7eb",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#f97316",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#ea580c",
                        },
                      }}
                    >
                      {blgas?.length > 0 ? (
                        blgas.map((lga) => (
                          <MenuItem key={lga.id || lga._id} value={lga.id || lga._id}>
                            {lga.name}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>
                          {isLoadingLgas ? "Loading..." : "Select a state first"}
                        </MenuItem>
                      )}
                    </Select>
                    {errors.businezLga && (
                      <FormHelperText>{errors.businezLga.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </div>

            {/* Market */}
            <div className="sm:col-span-1">
              <Controller
                control={control}
                name="market"
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    error={!!errors.market}
                    required
                    disabled={!businezLga || isLoadingMarkets}
                  >
                    <InputLabel>Market / District</InputLabel>
                    <Select
                      {...field}
                      label="Market / District"
                      startAdornment={
                        <InputAdornment position="start">
                          {isLoadingMarkets ? (
                            <CircularProgress size={20} className="text-orange-600" />
                          ) : (
                            <FuseSvgIcon size={20} className="text-orange-600">
                              heroicons-solid:shopping-bag
                            </FuseSvgIcon>
                          )}
                        </InputAdornment>
                      }
                      sx={{
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: errors.market ? "#ef4444" : "#e5e7eb",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#f97316",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#ea580c",
                        },
                      }}
                    >
                      {markets?.length > 0 ? (
                        markets.map((market) => (
                          <MenuItem key={market.id || market._id} value={market.id || market._id}>
                            {market.name}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>
                          {isLoadingMarkets ? "Loading..." : "Select L.G.A first"}
                        </MenuItem>
                      )}
                    </Select>
                    {errors.market && <FormHelperText>{errors.market.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </div>
          </div>
        </motion.div>

        {/* Social Media Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
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
                heroicons-solid:share
              </FuseSvgIcon>
            </div>
            <div>
              <Typography className="text-xl font-bold text-gray-800">Social Media</Typography>
              <Typography className="text-sm text-gray-600">
                Connect your social media handles (optional)
              </Typography>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Instagram */}
            <div className="sm:col-span-1">
              <Controller
                control={control}
                name="instagram"
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Instagram"
                    placeholder="@yourhandle"
                    variant="outlined"
                    fullWidth
                    error={!!errors.instagram}
                    helperText={errors?.instagram?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FuseSvgIcon size={20} className="text-orange-600">
                            heroicons-solid:camera
                          </FuseSvgIcon>
                        </InputAdornment>
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
            </div>

            {/* Twitter */}
            <div className="sm:col-span-1">
              <Controller
                control={control}
                name="twitter"
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Twitter / X"
                    placeholder="@yourhandle"
                    variant="outlined"
                    fullWidth
                    error={!!errors.twitter}
                    helperText={errors?.twitter?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FuseSvgIcon size={20} className="text-orange-600">
                            heroicons-solid:hashtag
                          </FuseSvgIcon>
                        </InputAdornment>
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
            </div>

            {/* Facebook */}
            <div className="sm:col-span-1">
              <Controller
                control={control}
                name="facebook"
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Facebook"
                    placeholder="Your Facebook handle"
                    variant="outlined"
                    fullWidth
                    error={!!errors.facebook}
                    helperText={errors?.facebook?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FuseSvgIcon size={20} className="text-orange-600">
                            heroicons-solid:thumb-up
                          </FuseSvgIcon>
                        </InputAdornment>
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
            </div>

            {/* LinkedIn */}
            <div className="sm:col-span-1">
              <Controller
                control={control}
                name="linkedin"
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="LinkedIn"
                    placeholder="Your LinkedIn profile"
                    variant="outlined"
                    fullWidth
                    error={!!errors.linkedin}
                    helperText={errors?.linkedin?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FuseSvgIcon size={20} className="text-orange-600">
                            heroicons-solid:briefcase
                          </FuseSvgIcon>
                        </InputAdornment>
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
            </div>
          </div>
        </motion.div>

        {/* Form Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="flex items-center justify-between gap-4 bg-white rounded-2xl shadow-lg p-6"
          style={{
            border: "2px solid rgba(234, 88, 12, 0.1)",
          }}
        >
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
            {!isValid && isDirty && (
              <Typography className="text-sm text-red-600">
                Please fix errors before saving
              </Typography>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outlined"
              disabled={!isDirty || loading}
              onClick={() => reset()}
              sx={{
                borderColor: "#9ca3af",
                color: "#6b7280",
                "&:hover": {
                  borderColor: "#6b7280",
                  backgroundColor: "#f3f4f6",
                },
                fontWeight: 600,
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              type="submit"
              disabled={!isDirty || !isValid || loading || updateUserDetails.isLoading}
              sx={{
                background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                color: "white",
                fontWeight: "bold",
                minWidth: "120px",
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
              {loading || updateUserDetails.isLoading ? (
                <CircularProgress size={24} className="text-white" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </motion.div>
      </form>
    </div>
  );
}

export default AccountTab;
