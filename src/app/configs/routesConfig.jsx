import FuseUtils from "@fuse/utils";
import FuseLoading from "@fuse/core/FuseLoading";
import { Navigate } from "react-router-dom";
import settingsConfig from "app/configs/settingsConfig";
import SignInConfig from "../main/sign-in/SignInConfig";
import SignUpConfig from "../main/sign-up/SignUpConfig";
import Error404Page from "../main/404/Error404Page";
import authRoleExamplesConfigs from "../main/auth/authRoleExamplesConfigs";

/***Authentication-based-config starts*/
import SignAcceptInviteConfig from "../main/sign-accept-invite/SignAcceptInviteConfig";
import forgotPasswordConfig from "../main/sign-forgot-password/forgotPasswordPagesConfig";
import resetPasswordConfig from "../main/sign-reset-password/resetPasswordPagesConfig";
import SignOutConfig from "../main/sign-out/SignOutConfig";
/***##########################Authentication-based-config ends#########################*/

/***Bookings & Reservations-based-config  starts*/
import userReservationPagesConfig from "../main/zrootclient/buz-bookings/user-reservations/userReservationPagesConfig";
/***#######################################Bookings & Reservations-based-config  ends########################*/
import financePagesConfig from "../main/africanshops-finance/finance-v2/financePagesConfig";
import AfricanshopsMessengerAppConfig from "../main/africanshops-messenger/AfricanshopsMessengerAppConfig";

import blogAppConfig from "../main/newsblog/blogAppConfig";
import userMarketPlacePagesConfig from "../main/zrootclient/buz-marketplace/userMarketPlacePagesConfig";
import userDisputesPagesConfig from "../main/zrootclient/buz-disputes/userDisputesPagesConfig";
import userFoodMartPagesConfig from "../main/zrootclient/buz-foodmart/userFoodMartPagesConfig";
import UserSettingsAppConfig from "../main/zrootclient/settings/UserSettingsAppConfig";
import userProfileAppConfig from "../main/zrootclient/profile/userProfileAppConfig";
import MarketplaceWithSidebarsContentScrollComponent from "../main/zrootclient/buz-marketplace/shops/marketplace/MarketplaceWithSidebarsContentScrollComponent";
import BookingsPageWithSidebarsContentScrollComponent from "../main/zrootclient/buz-bookings/bookingsPage/BookingsPageWithSidebarsContentScrollComponent";
import FoodMartWithSidebarsContentScrollPage from "../main/zrootclient/buz-foodmart/foodMartPage/FoodMartWithSidebarsContentScrollPage";
import VisitFoodMartWithContentScrollPage from "../main/zrootclient/buz-foodmart/visitFoodMartPage/VisitFoodMartWithContentScrollPage";
import BookingsSinglePageWithSidebarsContentScroll from "../main/zrootclient/buz-bookings/bookingsSinglePage/BookingsSinglePageWithSidebarsContentScroll";
import FoodMartSingleMenuWithContentScrollPage from "../main/zrootclient/buz-foodmart/foodMartSingleMenuPage/FoodMartSingleMenuWithContentScrollPage";
import SingleProductWithContentScrollPage from "../main/zrootclient/buz-marketplace/shops/singleProductPage/SingleProductWithContentScrollPage";
import MarketplaceProductsByCatWithContentScrollPage from "../main/zrootclient/buz-marketplace/shops/marketplaceProductsByCat/MarketplaceProductsByCatWithContentScrollPage";
import MerchantShopPafeWithContentScrollPage from "../main/zrootclient/buz-marketplace/shops/merchanyShopPage/MerchantShopPafeWithContentScrollPage";
import RealestatePageWithSidebarsContentScrollComponent from "../main/zrootclient/buz-realestates/realestatePage/RealestatePageWithSidebarsContentScrollComponent";
import RealestateSinglePageWithSidebarsContentScroll from "../main/zrootclient/buz-realestates/realestateSinglePage/RealestateSinglePageWithSidebarsContentScroll";
import userRealEstatePagesConfig from "../main/zrootclient/buz-realestates/realEstatePagesConfig";
import ModernLandingPage from "../main/vendors-shop/home/home/ModernLandingPage";
import AboutUs from "../main/vendors-shop/home/home/AboutUs";
import ContactUs from "../main/vendors-shop/home/home/ContactUs";
import CareersListPage from "../main/vendors-shop/careers/CareersListPage";
import CareerPositionPage from "../main/vendors-shop/careers/CareerPositionPage";
import MyApplicationsPage from "../main/vendors-shop/careers/MyApplicationsPage";
import MarketplaceDealsWithSidebarsContentScrollComponent from "../main/zrootclient/buz-marketplace/shops/marketplace/MarketplaceDealsWithSidebarsContentScrollComponent";

/***Shared KYC (platform-wide, not civic-only) */
import KycManagePage from "../main/zrootclient/civic-shared/kyc/KycManagePage";

const routeConfigs = [
  /***
   * ##########################################################################
   * Authentication concern routes starts here
   * ############################################################################
   * */
  SignInConfig,
  SignUpConfig,
  SignAcceptInviteConfig,
  forgotPasswordConfig,
  resetPasswordConfig,
  SignOutConfig,
  /***
   * ##########################################################################
   * Authentication concern routes ends here
   * ############################################################################
   * */

  /****
   * #########################################################################################
   * Africanshops Dashboard Configs Starts Here
   * #########################################################################################
   * */
  financePagesConfig,
  AfricanshopsMessengerAppConfig,

  UserSettingsAppConfig,
  userProfileAppConfig,

  /****
   * ############################################################################################
   * Africanshops Dashboard Configs Ends Here
   * ############################################################################################
   * */

  /****
   * #########################################################################################
   * Africanshops BOOKINGS-ROUTES Configs starts Here
   * #########################################################################################
   * */
  userReservationPagesConfig,
  /****
   * #########################################################################################
   * Africanshops BOOKINGS-ROUTES Configs ends Here
   * #########################################################################################
   * */

  /****
   * #########################################################################################
   * Africanshops MARKET-PLACE_ROUTES Configs starts Here
   * #########################################################################################
   * */
  userMarketPlacePagesConfig,
  /****
   * #########################################################################################
   * Africanshops MARKET-PLACE-ROUTES Configs ends Here
   * #########################################################################################
   * */

  /****
   * #########################################################################################
   * Africanshops DISPUTES Configs starts Here
   * #########################################################################################
   * */
  userDisputesPagesConfig,
  /****
   * #########################################################################################
   * Africanshops DISPUTES Configs ends Here
   * #########################################################################################
   * */

  /****
   * #########################################################################################
   * Africanshops RESTAURANTS_CLUBS_&_SPOTS_ROUTES Configs starts Here
   * #########################################################################################
   * */
  userFoodMartPagesConfig,
  /****
   * #########################################################################################
   * Africanshops RESTAURANTS_CLUBS_&_SPOTS_ROUTES Configs ends Here
   * #########################################################################################
   * */

  /****
   * #########################################################################################
   * Africanshops REAL_ESTATE_ROUTES Configs starts Here
   * #########################################################################################
   * */
  userRealEstatePagesConfig,
  /****
   * #########################################################################################
   * Africanshops REAL_ESTATE_ROUTES Configs ENDS Here
   * #########################################################################################
   * */

  /****
   *#################################################################################################
   * Start of Un-Authenticated pages are listed below here
   * #######################################################################
   */
  blogAppConfig,
  /****
   *################################################################################################
   * End of Un-Authenticated pages are listed below here
   * ###############################################################################################
   */

  ...authRoleExamplesConfigs,
];
/**
 * The routes of the application.
 */
const routes = [
  ...FuseUtils.generateRoutesFromConfigs(routeConfigs, settingsConfig.defaultAuth),

  {
    path: "/account/kyc",
    settings: {
      layout: {
        config: {
          navbar: { display: false },
          toolbar: { display: true },
          footer: { display: false },
          leftSidePanel: { display: false },
          rightSidePanel: { display: false },
        },
      },
    },
    element: <KycManagePage />,
  },

  {
    path: "/",
    element: <ModernLandingPage />,
  },
  {
    path: "/about",
    settings: {
      layout: {
        config: {
          navbar: { display: false },
          toolbar: { display: true },
          footer: { display: false },
          leftSidePanel: { display: false },
          rightSidePanel: { display: false },
        },
      },
    },
    element: <AboutUs />,
  },
  {
    path: "/contact",
    settings: {
      layout: {
        config: {
          navbar: { display: false },
          toolbar: { display: true },
          footer: { display: false },
          leftSidePanel: { display: false },
          rightSidePanel: { display: false },
        },
      },
    },
    element: <ContactUs />,
  },
  {
    path: "/careers",
    settings: {
      layout: {
        config: {
          navbar: { display: false },
          toolbar: { display: true },
          footer: { display: true },
          leftSidePanel: { display: false },
          rightSidePanel: { display: false },
        },
      },
    },
    element: <CareersListPage />,
  },
  {
    path: "/careers/my-applications",
    settings: {
      layout: {
        config: {
          navbar: { display: false },
          toolbar: { display: true },
          footer: { display: true },
          leftSidePanel: { display: false },
          rightSidePanel: { display: false },
        },
      },
    },
    element: <MyApplicationsPage />,
  },
  {
    path: "/careers/:id",
    settings: {
      layout: {
        config: {
          navbar: { display: false },
          toolbar: { display: true },
          footer: { display: true },
          leftSidePanel: { display: false },
          rightSidePanel: { display: false },
        },
      },
    },
    element: <CareerPositionPage />,
  },

  {
    path: "loading",
    element: <FuseLoading />,
  },
  {
    path: "404",
    element: <Error404Page />,
  },
  {
    path: "*",
    element: <Navigate to="404" />,
  },

  /****
   * ##############################################################
   * BOOKINGS activities starts
   * ##############################################################
   */
  {
    path: "/bookings/listings",
    settings: {
      layout: {
        config: {
          navbar: { display: false },
          toolbar: { display: true },
          footer: { display: false },
          leftSidePanel: { display: false },
          rightSidePanel: { display: false },
        },
      },
    },
    element: <BookingsPageWithSidebarsContentScrollComponent />,
  },
  {
    path: "/bookings/listings/:bookingId/view",
    settings: {
      layout: {
        config: {
          navbar: { display: false },
          toolbar: { display: true },
          footer: { display: false },
          leftSidePanel: { display: false },
          rightSidePanel: { display: false },
        },
      },
    },
    element: <BookingsSinglePageWithSidebarsContentScroll />,
  },
  /****
   * ##############################################################
   * BOOKINGS activities ends
   * ##############################################################
   */

  /****
   * ##############################################################
   * REAL-ESTATE activities starts
   * ##############################################################
   */
  {
    path: "/realestate/listings",
    settings: {
      layout: {
        config: {
          navbar: { display: false },
          toolbar: { display: true },
          footer: { display: false },
          leftSidePanel: { display: false },
          rightSidePanel: { display: false },
        },
      },
    },
    element: <RealestatePageWithSidebarsContentScrollComponent />,
  },
  {
    path: "/realestate/listings/:slug/view",
    settings: {
      layout: {
        config: {
          navbar: { display: false },
          toolbar: { display: true },
          footer: { display: false },
          leftSidePanel: { display: false },
          rightSidePanel: { display: false },
        },
      },
    },
    element: <RealestateSinglePageWithSidebarsContentScroll />,
  },
  /****
   * ##############################################################
   * REAL-ESTATE activities ends
   * ##############################################################
   */

  /****
   * ##############################################################
   * Marketplace activities starts
   * ##############################################################
   */
  {
    path: "/marketplace/shop",
    settings: {
      layout: {
        config: {
          navbar: { display: false },
          toolbar: { display: true },
          footer: { display: false },
          leftSidePanel: { display: false },
          rightSidePanel: { display: false },
        },
      },
    },
    element: <MarketplaceWithSidebarsContentScrollComponent />,
  },
  {
    path: "/marketplace/product/:productSlug/view",
    settings: {
      layout: {
        config: {
          navbar: { display: false },
          toolbar: { display: true },
          footer: { display: false },
          leftSidePanel: { display: false },
          rightSidePanel: { display: false },
        },
      },
    },
    element: <SingleProductWithContentScrollPage />,
  },
  {
    path: "/marketplace/products/:id/by-category",
    settings: {
      layout: {
        config: {
          navbar: { display: false },
          toolbar: { display: true },
          footer: { display: false },
          leftSidePanel: { display: false },
          rightSidePanel: { display: false },
        },
      },
    },
    element: <MarketplaceProductsByCatWithContentScrollPage />,
  },
  {
    path: "/deals",
    settings: {
      layout: {
        config: {
          navbar: { display: false },
          toolbar: { display: true },
          footer: { display: false },
          leftSidePanel: { display: false },
          rightSidePanel: { display: false },
        },
      },
    },
    element: <MarketplaceDealsWithSidebarsContentScrollComponent />,
  },
  {
    path: "/marketplace/merchant/:shopId/portal",
    settings: {
      layout: {
        config: {
          navbar: { display: false },
          toolbar: { display: true },
          footer: { display: false },
          leftSidePanel: { display: false },
          rightSidePanel: { display: false },
        },
      },
    },
    element: <MerchantShopPafeWithContentScrollPage />,
  },
  /****
   * ##############################################################
   * Marketplace activities ends
   * ##############################################################
   */

  /****
   * ##############################################################
   * FOOD_MARTS activities starts
   * ##############################################################
   */
  {
    path: "/foodmarts/listings",
    settings: {
      layout: {
        config: {
          navbar: { display: false },
          toolbar: { display: true },
          footer: { display: false },
          leftSidePanel: { display: false },
          rightSidePanel: { display: false },
        },
      },
    },
    element: <FoodMartWithSidebarsContentScrollPage />,
  },
  {
    path: "/foodmarts/:martId/visit-mart/:id",
    settings: {
      layout: {
        config: {
          navbar: { display: false },
          toolbar: { display: true },
          footer: { display: false },
          leftSidePanel: { display: false },
          rightSidePanel: { display: false },
        },
      },
    },
    element: <VisitFoodMartWithContentScrollPage />,
  },
  {
    path: "/foodmarts/:rcsId/menu/:menuSlug/view",
    settings: {
      layout: {
        config: {
          navbar: { display: false },
          toolbar: { display: true },
          footer: { display: false },
          leftSidePanel: { display: false },
          rightSidePanel: { display: false },
        },
      },
    },
    element: <FoodMartSingleMenuWithContentScrollPage />,
  },
  /****
   * ##############################################################
   * FOOD_MARTS activities ends
   * ##############################################################
   */
];
export default routes;
