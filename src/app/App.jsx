import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import FuseLayout from "@fuse/core/FuseLayout";
import FuseTheme from "@fuse/core/FuseTheme";
import { SnackbarProvider } from "notistack";
import rtlPlugin from "stylis-plugin-rtl";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { selectCurrentLanguageDirection } from "app/store/i18nSlice";
import themeLayouts from "app/theme-layouts/themeLayouts";
import { selectMainTheme } from "@fuse/core/FuseSettings/fuseSettingsSlice";
import MockAdapterProvider from "src/@mock-api_old/MockAdapterProvider";
import { useAppSelector } from "app/store/hooks";
import { useSelector } from "react-redux";
import { QueryClient, QueryClientProvider } from "react-query";
import withAppProviders from "./withAppProviders";
import AuthenticationProvider from "./auth/AuthenticationProvider";
import StepUpDialog from "./configs/data/stepUp/StepUpDialog";

// import axios from 'axios';
/**
 * Axios HTTP Request defaults
 */
// axios.defaults.baseURL = "";
// axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
// axios.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded';
const emotionCacheOptions = {
  rtl: {
    key: "muirtl",
    stylisPlugins: [rtlPlugin],
    insertionPoint: document.getElementById("emotion-insertion-point"),
  },
  ltr: {
    key: "muiltr",
    stylisPlugins: [],
    insertionPoint: document.getElementById("emotion-insertion-point"),
  },
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
    },
  },
});
/**
 * The main App component.
 */
function App() {
  /**
   * The language direction from the Redux store.
   */
  const langDirection = useAppSelector(selectCurrentLanguageDirection);
  /**
   * The main theme from the Redux store.
   */
  const mainTheme = useSelector(selectMainTheme);
  return (
    <QueryClientProvider client={queryClient}>
      <MockAdapterProvider>
        <CacheProvider value={createCache(emotionCacheOptions[langDirection])}>
          <FuseTheme theme={mainTheme} root>
            <AuthenticationProvider>
              <SnackbarProvider
                maxSnack={5}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                classes={{
                  containerRoot: "bottom-0 right-0 mb-52 md:mb-68 mr-8 lg:mr-80 z-99",
                }}
              >
                <FuseLayout layouts={themeLayouts} />
                <StepUpDialog />
              </SnackbarProvider>
            </AuthenticationProvider>
          </FuseTheme>
        </CacheProvider>
      </MockAdapterProvider>

      <ToastContainer
        className="z-1000"
        position="bottom-center"
        // position="top-left"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </QueryClientProvider>
  );
}

export default withAppProviders(App);
