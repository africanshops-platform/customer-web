import SignInGate from "./SignInGate";
import authRoles from "../../auth/authRoles";

const SignInConfig = {
  settings: {
    layout: {
      config: {
        navbar: {
          display: false,
        },
        toolbar: {
          display: true,
        },
        footer: {
          display: false,
        },
        leftSidePanel: {
          display: false,
        },
        rightSidePanel: {
          display: false,
        },
      },
    },
  },

  auth: authRoles.onlyGuest,
  routes: [
    {
      path: "sign-in",
      element: <SignInGate />,
    },
  ],
};
export default SignInConfig;
