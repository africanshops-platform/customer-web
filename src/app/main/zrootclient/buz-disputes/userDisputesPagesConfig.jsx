import { lazy } from "react";

const MyDisputesPage = lazy(() => import("./MyDisputesPage"));
const DisputeDetailPage = lazy(() => import("./DisputeDetailPage"));

/**
 * Self-service disputes (2026-08-12) — customer files a dispute on their
 * own delivered order (entry point lives on order detail, not here) and
 * tracks it here.
 */
const userDisputesPagesConfig = {
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

  routes: [
    {
      path: "disputes/user/my-disputes",
      element: <MyDisputesPage />,
    },
    {
      path: "disputes/user/my-disputes/:disputeId/view",
      element: <DisputeDetailPage />,
    },
  ],
};

export default userDisputesPagesConfig;
