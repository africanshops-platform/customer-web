import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAppSelector } from "app/store/hooks";
import { selectUser } from "src/app/auth/user/store/userSlice";
import { useStoreFeed } from "src/app/aaqueryhooks/feedQueries";
import { getFeedGuidelinesStatusApi } from "app/configs/data/client/RepositoryAuthClient";
import PostCard from "./PostCard";
import StatusStrip from "./StatusStrip";
import ReportFlow from "./ReportFlow";

const postArt = (
  <svg viewBox="0 0 150 110" fill="none" aria-hidden="true">
    <rect x="30" y="14" width="90" height="84" rx="12" fill="var(--brand-soft)" />
    <circle cx="52" cy="38" r="9" fill="var(--brand)" />
    <rect x="68" y="32" width="38" height="6" rx="3" fill="var(--line)" />
    <rect x="68" y="44" width="26" height="6" rx="3" fill="var(--line)" />
    <rect x="42" y="62" width="66" height="26" rx="8" fill="var(--brand)" opacity=".85" />
    <path
      d="M62 78l8-8 8 8 6-6 8 8"
      stroke="#fff"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * The right-hand side: the shop's 24 hour statuses (when it has any), the guidelines note, then its real posts.
 */
function StoreUpdatesPanel({ shopId, shopName }) {
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useStoreFeed(shopId);
  const [reporting, setReporting] = useState(null);
  const [step, setStep] = useState(null);

  const posts = data?.pages.flatMap((p) => p?.data?.posts ?? []) ?? [];

  const startReport = useCallback(
    async (post) => {
      if (!user?.email) {
        navigate("/sign-in");
        return;
      }
      setReporting(post);
      try {
        const res = await getFeedGuidelinesStatusApi();
        setStep(res?.data?.accepted ? "report" : "guidelines");
      } catch {
        setStep("guidelines");
      }
    },
    [user, navigate],
  );

  const share = useCallback(async () => {
    const url = `${window.location.origin}/marketplace/store/${shopId}/view`;
    try {
      if (navigator.share) await navigator.share({ title: "AfricanShops", url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {
      /* the person closed the share sheet */
    }
  }, [shopId]);

  const closeReport = () => {
    setReporting(null);
    setStep(null);
  };

  return (
    <div className="sp sp-feed" data-testid="store-feed">
      <StatusStrip shopId={shopId} shopName={shopName} />

      <div className="sp-rules" role="note">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--brand)"
          strokeWidth="2"
          style={{ flex: "none", marginTop: 1 }}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5M12 16.5v.5" />
        </svg>
        <span>
          Posts here are about business, learning and growth. Up to 5 photos or videos per post,
          videos up to 10 minutes. Report anything that does not belong.
        </span>
      </div>

      {isLoading && (
        <div data-testid="store-feed-loading" style={{ display: "grid", gap: 14 }}>
          {[0, 1].map((i) => (
            <article className="sp-panel sp-post" key={i}>
              <div className="sp-sk" style={{ height: 38, width: "60%" }} />
              <div className="sp-sk" style={{ height: 14, marginTop: 12 }} />
              <div className="sp-sk" style={{ aspectRatio: "16 / 10", marginTop: 12 }} />
            </article>
          ))}
        </div>
      )}

      {isError && !isLoading && (
        <article className="sp-panel sp-empty" data-testid="store-feed-error">
          {postArt}
          <h3>We could not load the posts</h3>
          <p>Check your connection and try again.</p>
          <button
            type="button"
            className="sp-btn"
            style={{ marginTop: 12 }}
            onClick={() => refetch()}
          >
            Try again
          </button>
        </article>
      )}

      {!isLoading && !isError && posts.length === 0 && (
        <article className="sp-panel sp-empty" data-testid="store-feed-empty">
          {postArt}
          <h3>No posts yet</h3>
          <p>When this shop shares tips, events and offers, they will show up here.</p>
        </article>
      )}

      {posts.map((post) => (
        <PostCard key={post.id} post={post} onReport={startReport} onShare={share} />
      ))}

      {hasNextPage && (
        <button
          type="button"
          className="sp-btn sp-more"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? "Loading…" : "Show more posts"}
        </button>
      )}

      <ReportFlow post={reporting} step={step} onStep={setStep} onClose={closeReport} />
    </div>
  );
}

export default StoreUpdatesPanel;
