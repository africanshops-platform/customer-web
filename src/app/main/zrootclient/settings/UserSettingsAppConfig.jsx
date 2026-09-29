import { lazy } from "react";
import { Navigate } from "react-router-dom";

const SettingsApp = lazy(() => import("./SettingsApp"));
const AccountTab = lazy(() => import("./tabs/AccountTab"));
const SecurityTab = lazy(() => import("./tabs/SecurityTab"));
const ReferralLinksTab = lazy(() => import("./tabs/ReferralLinksTab"));
// const PlanBillingTab = lazy(() => import("./tabs/PlanBillingTab"));
// const NotificationsTab = lazy(() => import("./tabs/NotificationsTab"));
// const TeamTab = lazy(() => import("./tabs/TeamTab"));
/**
 * The Settings app config.
 */

const UserSettingsAppConfig = {
  settings: {
    layout: {
      config: {},
    },
  },
  routes: [
    {
      path: "africanshops/settings",
      element: <SettingsApp />,
      children: [
        {
          path: "account",
          element: <AccountTab />,
        },

        {
          path: "security",
          element: <SecurityTab />,
        },

        {
          path: "referral-links",
          element: <ReferralLinksTab />,
        },

        {
          path: "",
          element: <Navigate to="account" />,
        },
      ],
    },
  ],
};
export default UserSettingsAppConfig;
