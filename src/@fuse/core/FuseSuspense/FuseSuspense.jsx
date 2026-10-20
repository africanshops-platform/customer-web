import PageSkeleton from "app/shared-components/loading/PageSkeleton";
import { Suspense } from "react";

/**
 * The FuseSuspense component is a wrapper around the React Suspense component.
 * It is used to display a whole-page skeleton (design-system-1, state B) while the wrapped components are being loaded.
 * The component is memoized to prevent unnecessary re-renders.
 * React Suspense defaults
 * For to Avoid Repetition
 */
function FuseSuspense(props) {
  const { children, loadingProps } = props;
  return <Suspense fallback={<PageSkeleton />}>{children}</Suspense>;
}

export default FuseSuspense;
