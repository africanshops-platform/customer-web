import { Controller, useForm } from "react-hook-form";
import { lighten, styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Link, useParams } from "react-router-dom";
import _ from "@lodash";
import Paper from "@mui/material/Paper";
import AvatarGroup from "@mui/material/AvatarGroup";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import FormHelperText from "@mui/material/FormHelperText";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSingleShopplans } from "app/configs/data/server-calls/shopplans/useShopPlans";
import { useEffect, useMemo, useState } from "react";
import CountrySelect from "src/app/apselects/countryselect";
import useHubs from "app/configs/data/server-calls/tradehubs/useTradeHubs";
import {
  getLgaByStateId,
  getMarketsByLgaId,
  getStateByCountryId,
} from "app/configs/data/client/clientToApiRoutes";
import StateSelect from "src/app/apselects/stateselect";
import LgaSelect from "src/app/apselects/lgaselect";
import MarketSelect from "src/app/apselects/marketselect";
import TradehubSelect from "src/app/apselects/tradehubselect";
import { InputAdornment } from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import FuseUtils from "@fuse/utils/FuseUtils";

import { orange } from "@mui/material/colors";
import clsx from "clsx";
import {
  getStorage,
  ref,
  deleteObject,
  uploadBytesResumable,
  uploadString,
  getDownloadURL,
} from "firebase/storage";
import { firebaseApp } from "src/app/auth/services/firebase/initializeFirebase";
import { useShopSignUpWithOtp } from "app/configs/data/server-calls/useUsers/useUsersQuery";
import {
  getMerchantSignUpToken,
  getResendMerchantSignUpOtp,
  removeMerchantSignUpToken,
  removeResendMerchantSignUpOtp,
  setResendMerchantSignUpOtp,
} from "app/configs/utils/authUtils";
import MerchantModernReversedActivatePage from "./MerchantModernReversedActivatePage";
/**
 * Form Validation Schema
 */
const schema = z
  .object({
    shopname: z.string().nonempty("You must enter your business/shop name"),
    shopemail: z.string().email("You must enter a valid email").nonempty("You must enter an email"),
    password: z
      .string()
      .nonempty("Please enter your password.")
      .min(8, "Password is too short - should be 8 chars minimum."),
    passwordConfirm: z.string().nonempty("Password confirmation is required"),
    acceptTermsConditions: z
      .boolean()
      .refine((val) => val === true, "The terms and conditions must be accepted."),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords must match",
    path: ["passwordConfirm"],
  });
const defaultValues = {
  shopname: "",
  shopemail: "",
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
  shopphone: "",
  verified: "false",
  shopplan: "",
};

const STEPS = {
  CATEGORY: 0,
  LOCATION: 1,
  MOREINFO: 2,
  IMAGES: 3,
  DESCRIPTION: 4,
  //   PRICE: 5,
};

/***Styled */
const Root = styled("div")(({ theme }) => ({
  "& .productImageFeaturedStar": {
    position: "absolute",
    top: 0,
    right: 0,
    color: orange[400],
    opacity: 0,
  },
  "& .productImageUpload": {
    transitionProperty: "box-shadow",
    transitionDuration: theme.transitions.duration.short,
    transitionTimingFunction: theme.transitions.easing.easeInOut,
  },
  "& .productImageItem": {
    transitionProperty: "box-shadow",
    transitionDuration: theme.transitions.duration.short,
    transitionTimingFunction: theme.transitions.easing.easeInOut,
    "&:hover": {
      "& .productImageFeaturedStar": {
        opacity: 0.8,
      },
    },
    "&.featured": {
      pointerEvents: "none",
      boxShadow: theme.shadows[3],
      "& .productImageFeaturedStar": {
        opacity: 1,
      },
      "&:hover .productImageFeaturedStar": {
        opacity: 1,
      },
    },
  },
}));

/**
 * The modern reversed sign up page.
 */
function MerchantModernReversedSignUpPage() {
  // const Map = useMemo(
  //     () => (() => import('../../../../../components/map')),
  //     [location]
  // )
  const clientSignUpData = getResendMerchantSignUpOtp();
  const remoteResponseToken = getMerchantSignUpToken();
  const routeParams = useParams();
  const { accountId } = routeParams;
  const { data: plan, isLoading } = useSingleShopplans(accountId);
  const sigupMerchant = useShopSignUpWithOtp();
  const { control, formState, handleSubmit, reset, setValue, watch, getValues } = useForm({
    mode: "onChange",
    defaultValues,
    resolver: zodResolver(schema),
  });
  const { isValid, dirtyFields, errors } = formState;

  const location = watch("location");
  //   const businessCountry = watch("businessCountry");
  const businezState = watch("businezState");
  const businezLga = watch("businezLga");
  const market = watch("market");
  const tradehub = watch("tradehub");
  const images = watch("images");

  const shopregistry = {
    ...getValues(),
    businessCountry: getValues()?.location?._id,
    businezState: getValues()?.businezState?._id,
    businezLga: getValues()?.businezLga?._id,
    tradehub: getValues()?.tradehub?._id,
    market: getValues()?.market?._id,
    shopplan: accountId,
  };

  function onSubmit() {
    if (images?.length > 0) {
      const fileName = new Date().getTime() + images[0]?.id;
      const storage = getStorage(firebaseApp);
      const storageRef = ref(storage, `/shopbanners/${fileName}`);
      const uploadTask = uploadString(storageRef, images[0]?.url, "data_url");

      uploadTask.then((snapshot) => {
        console.log("uploadSnaps11", snapshot);
        getDownloadURL(snapshot.ref).then((downloadURL) => {
          setValue("coverimage", downloadURL);
          sigupMerchant.mutate({ formData: shopregistry });
        });
      });
    } else {
      sigupMerchant.mutate({ formData: shopregistry });
    }
  }

  /****Resend OTP on expiration of OTP */
  const resendOTP = () => {
    if (!clientSignUpData) {
      if (window.confirm("Some hitch occured, restart the unboarding process?")) {
        removeMerchantSignUpToken();
        removeResendMerchantSignUpOtp();
      }
    }
    sigupMerchant.mutate({ formData: clientSignUpData });
  };

  const [step, setStep] = useState(STEPS.CATEGORY);
  const onBack = () => {
    setStep((value) => value - 1);
  };

  const onNext = () => {
    setStep((value) => value + 1);
  };
  const actionLable = useMemo(() => {
    if (step == STEPS.PRICE) {
      return "Create";
    }
    return "Next";
  }, [step]);
  const secondaryActionLable = useMemo(() => {
    if (step == STEPS.CATEGORY) {
      return undefined;
    }
    return "Back";
  }, [step]);

  const secondaryAction = useMemo(() => {
    if (step == STEPS.CATEGORY) {
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

  const [loading, setLoading] = useState(false);
  const [blgas, setBlgas] = useState([]);
  const [markets, setBMarkets] = useState([]);
  const [stateData, setStateData] = useState([]);

  useEffect(() => {
    if (location?._id?.length > 0) {
      console.log(`Getting stated in this country ${location?.name}`);
      findStatesByCountry(location?._id);
    }

    if (getValues()?.businezState?._id?.length > 0) {
      getLgasFromState(getValues()?.businezState?._id);
    }

    if (getValues()?.businezLga?._id?.length > 0) {
      getMarketsFromLgaId(getValues()?.businezLga?._id);
    }
  }, [location?._id, businezState?._id, businezLga?._id, sigupMerchant?.isSuccess]);

  useEffect(() => {
    if (sigupMerchant?.isSuccess) {
      if (shopregistry?.businessCountry) {
        setResendMerchantSignUpOtp(shopregistry);
      }
      if (clientSignUpData?.businessCountry) {
        setResendMerchantSignUpOtp(clientSignUpData);
      }
    }
  }, [plan?.data?.plankey, sigupMerchant?.isSuccess, remoteResponseToken]);

  async function findStatesByCountry(countryId) {
    setLoading(true);
    const stateResponseData = await getStateByCountryId(countryId);

    if (stateResponseData) {
      setStateData(stateResponseData?.data);

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
      setBlgas(responseData?.data);
      setTimeout(
        function () {
          setLoading(false);
        }.bind(this),
        250,
      );
    }
  }

  //**Get Marketss from lga_ID data */ getShopById
  async function getMarketsFromLgaId(lid) {
    if (lid) {
      setLoading(true);
      const responseData = await getMarketsByLgaId(lid);
      if (responseData) {
        setBMarkets(responseData?.data);
        setTimeout(
          function () {
            setLoading(false);
          }.bind(this),
          250,
        );
      }
    }
  }

  let bodyContent = (
    <div className="flex flex-col gap-8">
      <Typography
        // as="h3"
        className="px-[10px] xs:px-[30px] pt-[26px] pb-[25px] text-dark dark:text-white/[.87] text-[18px] font-semibold border-b border-regular dark:border-white/10"
      >
        Email Details :{" "}
        <span className="mt-2 flex items-baseline font-medium">
          What e-mail are you looking to use as you business email
        </span>
      </Typography>
      <>
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[30vh] overflow-y-auto"> */}
        <>
          <Controller
            name="shopname"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                className="mb-24"
                label="Shop/Business Name"
                autoFocus
                type="name"
                error={!!errors.shopname}
                helperText={errors?.shopname?.message}
                variant="outlined"
                required
                fullWidth
              />
            )}
          />

          <Controller
            name="shopemail"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                className="mb-24"
                label="Shop/Business Email"
                type="email"
                error={!!errors.shopemail}
                helperText={errors?.shopemail?.message}
                variant="outlined"
                required
                fullWidth
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
                label="Password (Confirm)"
                type="password"
                error={!!errors.passwordConfirm}
                helperText={errors?.passwordConfirm?.message}
                variant="outlined"
                required
                fullWidth
              />
            )}
          />
        </>

        {/* </div> */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[30vh] overflow-y-auto"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[30vh] overflow-y-auto"></div>
      </>
    </div>
  );

  if (step == STEPS.LOCATION) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Typography
          // as="h3"
          className="px-[40px] xs:px-[30px] pt-[26px] pb-[25px] text-dark dark:text-white/[.87] text-[18px] font-semibold border-b border-regular dark:border-white/10"
        >
          Business Location : Where is this merchant operations located
        </Typography>
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[30vh] overflow-y-auto"></div>
          <CountrySelect value={location} onChange={(value) => setCustomValue("location", value)} />

          {location?._id && (
            <StateSelect
              states={stateData}
              value={businezState}
              onChange={(value) => setCustomValue("businezState", value)}
            />
          )}

          {businezState?._id && (
            <LgaSelect
              blgas={blgas}
              value={businezLga}
              onChange={(value) => setCustomValue("businezLga", value)}
            />
          )}

          {businezState?._id && businezLga?._id && (
            <MarketSelect
              markets={markets}
              value={market}
              onChange={(value) => setCustomValue("market", value)}
            />
          )}

          {/* <Map center={location?.latlng 
                        } /> */}
        </>
      </div>
    );
  }

  if (step == STEPS.MOREINFO) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Typography
          // as="h3"
          className="px-[40px] xs:px-[30px] pt-[26px] pb-[25px] text-dark dark:text-white/[.87] text-[18px] font-semibold border-b border-regular dark:border-white/10"
        >
          More Info : Provide us some more info to set your business up nicely
        </Typography>
        <>
          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[30vh] overflow-y-auto"></div> */}
          <TradehubSelect
            value={tradehub}
            onChange={(value) => setCustomValue("tradehub", value)}
          />

          <Controller
            name="shopphone"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                className="mt-8 mb-16"
                label="Merchant Phone"
                id="shopphone"
                variant="outlined"
                InputProps={{
                  startAdornment: <InputAdornment position="start">Phone</InputAdornment>,
                }}
                fullWidth
                error={!!errors.shopphone}
                helperText={errors?.shopphone?.message}
              />
            )}
          />

          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                className="mt-8 mb-16"
                label="Merchant Phone"
                id="address"
                variant="outlined"
                InputProps={{
                  startAdornment: <InputAdornment position="start">Address</InputAdornment>,
                }}
                fullWidth
                error={!!errors.address}
                helperText={errors?.address?.message}
              />
            )}
          />
        </>
      </div>
    );
  }

  if (step == STEPS.IMAGES) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Typography
          // as="h3"
          className="px-[40px] xs:px-[30px] pt-[26px] pb-[25px] text-dark dark:text-white/[.87] text-[18px] font-semibold border-b border-regular dark:border-white/10"
        >
          Shop Cover Image : Provide an image to be used as your profile cover image
        </Typography>
        <>
          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[30vh] overflow-y-auto"></div> */}
          <Controller
            name="images"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Box
                sx={{
                  backgroundColor: (theme) =>
                    theme.palette.mode === "light"
                      ? lighten(theme.palette.background.default, 0.4)
                      : lighten(theme.palette.background.default, 0.02),
                }}
                component="label"
                htmlFor="button-file"
                className="productImageUpload flex items-center justify-center relative w-128 h-128 rounded-16 mx-12 mb-24 overflow-hidden cursor-pointer shadow hover:shadow-lg"
              >
                <input
                  accept="image/*"
                  className="hidden"
                  id="button-file"
                  type="file"
                  onChange={async (e) => {
                    function readFileAsync() {
                      return new Promise((resolve, reject) => {
                        const file = e?.target?.files?.[0];

                        if (!file) {
                          return;
                        }

                        const reader = new FileReader();
                        reader.onload = () => {
                          resolve({
                            id: FuseUtils.generateGUID(),
                            url: `data:${file.type};base64,${btoa(reader.result)}`,
                            type: "image",
                          });
                        };
                        reader.onerror = reject;
                        reader.readAsBinaryString(file);
                      });
                    }

                    const newImage = await readFileAsync();
                    onChange([newImage]);
                  }}
                />
                <FuseSvgIcon size={32} color="action">
                  heroicons-outline:upload
                </FuseSvgIcon>
              </Box>
            )}
          />

          <Controller
            name="featuredImageId"
            control={control}
            defaultValue=""
            render={({ field: { onChange, value } }) => {
              return (
                <>
                  {images?.map((media) => (
                    <div
                      onClick={() => onChange(media.id)}
                      onKeyDown={() => onChange(media.id)}
                      role="button"
                      tabIndex={0}
                      className={clsx(
                        "productImageItem flex items-center justify-center relative w-128 h-128 rounded-16 mx-12 mb-24 overflow-hidden cursor-pointer outline-none shadow hover:shadow-lg",
                        media.id === value && "featured",
                      )}
                      key={media.id}
                    >
                      <FuseSvgIcon className="productImageFeaturedStar">
                        heroicons-solid:star
                      </FuseSvgIcon>
                      <img className="max-w-none w-auto h-full" src={media.url} alt="product" />
                    </div>
                  ))}
                </>
              );
            }}
          />
        </>
      </div>
    );
  }

  //   console.log("IMAGES", images);
  if (step == STEPS.DESCRIPTION) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Typography
          // as="h3"
          className="px-[40px] xs:px-[30px] pt-[26px] pb-[25px] text-dark dark:text-white/[.87] text-[18px] font-semibold border-b border-regular dark:border-white/10"
        >
          Business Bio : Provide a brief bio about your business
        </Typography>
        <>
          <Controller
            name="shopbio"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                className="mt-8 mb-16"
                required
                label="Short Description"
                autoFocus
                type="shopbio"
                id="shopbio"
                variant="outlined"
                fullWidth
                multiline
                rows={3}
                error={!!errors.shopbio}
                helperText={errors?.shopbio?.message}
              />
            )}
          />

          <Controller
            name="acceptTermsConditions"
            control={control}
            render={({ field }) => (
              <FormControl className="items-center" error={!!errors.acceptTermsConditions}>
                <FormControlLabel
                  label="I agree to the Terms of Service and Privacy Policy"
                  control={<Checkbox size="small" {...field} />}
                />
                <FormHelperText>{errors?.acceptTermsConditions?.message}</FormHelperText>
              </FormControl>
            )}
          />
        </>
      </div>
    );
  }
  return (
    <div className="flex min-w-0 flex-auto flex-col items-center sm:justify-center md:p-32">
      <Paper className="flex min-h-full w-full overflow-hidden rounded-0 sm:min-h-auto sm:w-auto sm:rounded-2xl sm:shadow md:w-full md:max-w-6xl">
        <Box
          className="relative hidden h-full flex-auto items-center justify-center overflow-hidden p-64 md:flex lg:px-112"
          sx={{ backgroundColor: "primary.main" }}
        >
          <svg
            className="pointer-events-none absolute inset-0"
            viewBox="0 0 960 540"
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMax slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            <Box
              component="g"
              sx={{ color: "primary.light" }}
              className="opacity-20"
              fill="none"
              stroke="currentColor"
              strokeWidth="100"
            >
              <circle r="234" cx="196" cy="23" />
              <circle r="234" cx="790" cy="491" />
            </Box>
          </svg>
          <Box
            component="svg"
            className="absolute -right-64 -top-64 opacity-20"
            sx={{ color: "primary.light" }}
            viewBox="0 0 220 192"
            width="220px"
            height="192px"
            fill="none"
          >
            <defs>
              <pattern
                id="837c3e70-6c3a-44e6-8854-cc48c737b659"
                x="0"
                y="0"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <rect x="0" y="0" width="4" height="4" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="220" height="192" fill="url(#837c3e70-6c3a-44e6-8854-cc48c737b659)" />
          </Box>

          <div className="relative z-10 w-full max-w-2xl">
            <div className="text-7xl font-bold leading-none text-gray-100">
              <div>Welcome to</div>
              <div>our community</div>
            </div>
            <Typography className="text-sm font-bold leading-none text-gray-100">
              You have chosen our {plan?.data?.plansname} plan
            </Typography>
            <div className="mt-24 text-lg leading-6 tracking-tight text-gray-400">
              {/* This plan enables you to.... */}
              {plan?.data?.planinfo}
            </div>
          </div>
        </Box>

        {/* {(plan?.data?.plankey === 'MANUFACTURERS' || plan?.data?.plankey === 'WHOLESALEANDRETAILERS' || plan?.data?.plankey === 'RETAIL' ) && */}
        <>
          {!remoteResponseToken.length > 0 ? (
            <div className="w-full px-16 py-32 ltr:border-l-1 rtl:border-r-1 sm:w-auto sm:p-48 md:p-64">
              <div className="mx-auto w-full max-w-320 sm:mx-0 sm:w-320">
                <img className="w-40" src="assets/images/afslogo/afslogo.png" alt="logo" />

                <Typography className="mt-32 text-4xl font-extrabold leading-tight tracking-tight">
                  Sign up for trade based activities
                </Typography>
                <div className="mt-2 flex items-baseline font-medium">
                  <Typography>Already have an account?</Typography>
                  <Link className="ml-4" to="/sign-in">
                    Sign in
                  </Link>
                </div>

                <form
                  name="registerForm"
                  noValidate
                  className="mt-32 flex w-full flex-col justify-center overflow-scroll"
                  onSubmit={handleSubmit(onSubmit)}
                >
                  {bodyContent}

                  <Button
                    className="bg-regularBG dark:bg-regularBGdark h-[50px] ltr:mr-[20px] rtl:ml-[20px] px-[22px] text-[15px] text-body dark:text-white/60 hover:text-light font-normal border-regular dark:border-white/10"
                    size="large"
                    onClick={secondaryAction}
                    disabled={step == STEPS.CATEGORY}
                  >
                    Back
                  </Button>
                  {step < 4 ? (
                    <Button
                      className="bg-regularBG dark:bg-regularBGdark h-[50px] ltr:mr-[20px] rtl:ml-[20px] px-[22px] text-[15px] text-body dark:text-white/60 hover:text-light font-normal border-regular dark:border-white/10"
                      size="large"
                      onClick={onNext}
                      disabled={step == STEPS.DESCRIPTION}
                    >
                      Next
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="contained"
                        color="secondary"
                        className=" mt-24 w-full"
                        aria-label="Register"
                        disabled={_.isEmpty(dirtyFields) || !isValid || sigupMerchant?.isLoading}
                        type="submit"
                        size="large"
                      >
                        Create your free account
                      </Button>
                    </>
                  )}
                </form>
              </div>
            </div>
          ) : (
            <MerchantModernReversedActivatePage resendOTP={resendOTP} />
          )}
        </>
        {/* } */}

        {/* {(plan?.data?.plankey === 'REALESTATES') &&
        
        <div className="w-full px-16 py-32 ltr:border-l-1 rtl:border-r-1 sm:w-auto sm:p-48 md:p-64">
            <div className="mx-auto w-full max-w-320 sm:mx-0 sm:w-320">
              <img
                className="w-48"
                src="assets/images/afslogo/afLogo.svg"
                alt="logo"
              />

              <Typography className="mt-32 text-4xl font-extrabold leading-tight tracking-tight">
                Sign up for real estate based activities
              </Typography>
              <div className="mt-2 flex items-baseline font-medium">
                <Typography>Already have an account?</Typography>
                <Link className="ml-4" to="/sign-in">
                  Sign in
                </Link>
              </div>
            </div>
        </div>
        } */}
      </Paper>
    </div>
  );
}

export default MerchantModernReversedSignUpPage;
