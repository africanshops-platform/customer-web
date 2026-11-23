import GuestOnly from '../../auth/services/jwt/GuestOnly';
// import SignUpPage from "./SignUpPage";
import authRoles from "../../auth/authRoles";
import RegisterUserPage from "./RegisterUserPage";

const SignUpConfig = {
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
      path: "sign-up",
      // element: <SignUpPage />
      element: (
        <GuestOnly to="/">
          <RegisterUserPage />
        </GuestOnly>
      ),
    },
  ],
};
export default SignUpConfig;
