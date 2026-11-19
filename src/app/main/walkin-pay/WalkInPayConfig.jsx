import WalkInPayPage from "./WalkInPayPage";

/** Public pay link of a walk-in parcel waybill. No account needed: the sender proves their phone with a one-time code. */
const WalkInPayConfig = {
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
  auth: null,
  routes: [
    {
      path: "pay/parcel/:waybillNo",
      element: <WalkInPayPage />,
    },
  ],
};

export default WalkInPayConfig;
