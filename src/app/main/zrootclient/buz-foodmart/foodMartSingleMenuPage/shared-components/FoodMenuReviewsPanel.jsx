import { useState } from "react";
import { Avatar, Button, LinearProgress, Rating, TextField, Typography } from "@mui/material";
import { RateReview, VerifiedUser } from "@mui/icons-material";
import { useAppSelector } from "app/store/hooks";
import { selectUser } from "src/app/auth/user/store/userSlice";
import {
  useCanReviewFoodMenu,
  useCreateFoodMenuReview,
  useGetFoodMenuReviews,
} from "app/configs/data/server-calls/auth/userapp/a_foodmart/useFoodMartsRepo";

const timeAgo = (iso) => {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins || 1}m ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return d < 31 ? `${d}d ago` : new Date(iso).toLocaleDateString();
};

/**
 * Real diner reviews for one dish. Anyone can read them; only a signed-in customer who has ordered this dish
 * can write one (the server enforces it — the composer here is just the friendly version of that rule).
 */
function FoodMenuReviewsPanel({ menuId, isMobile }) {
  const user = useAppSelector(selectUser);
  const signedIn = Boolean(user?.email || user?.id);
  const { data: res, isLoading } = useGetFoodMenuReviews(menuId);
  const { data: gate } = useCanReviewFoodMenu(menuId, signedIn);
  const create = useCreateFoodMenuReview();
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");

  const reviews = res?.data?.reviews ?? [];
  const count = res?.data?.count ?? 0;
  const average = res?.data?.averageRating ?? 0;
  const canReview = gate?.data?.canReview === true;
  const mine = reviews.some((r) => r.user === user?.id);

  const breakdown = [5, 4, 3, 2, 1].map((stars) => {
    const n = reviews.filter((r) => r.rating === stars).length;
    return { stars, n, pct: count ? Math.round((n / count) * 100) : 0 };
  });

  const submit = () =>
    create.mutate({ menuId, rating, content: content.trim() }, { onSuccess: () => { setRating(0); setContent(""); } });

  return (
    <div className={isMobile ? "p-6" : "p-10"} data-testid="food-menu-reviews">
      <div className="mb-8 flex flex-wrap items-center gap-8">
        <div className="text-center">
          <p className="m-0 font-extrabold text-gray-900" style={{ fontSize: "4.8rem", lineHeight: 1 }}>{count ? average.toFixed(1) : "—"}</p>
          <Rating value={average} precision={0.1} readOnly sx={{ "& .MuiRating-iconFilled": { color: "#f59e0b" } }} />
          <p className="m-0 mt-1 text-base text-gray-600">{count} review{count === 1 ? "" : "s"}</p>
        </div>
        <div className="min-w-[220px] flex-1 space-y-2">
          {breakdown.map((b) => (
            <div key={b.stars} className="flex items-center gap-3">
              <span className="w-10 text-base text-gray-700">{b.stars} ★</span>
              <LinearProgress variant="determinate" value={b.pct} sx={{ flex: 1, height: 10, borderRadius: 5, bgcolor: "#fde8d3", "& .MuiLinearProgress-bar": { bgcolor: "#f59e0b" } }} />
              <span className="w-8 text-right text-base text-gray-600">{b.n}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Composer: only for customers who ordered this dish */}
      <div className="mb-10 rounded-2xl border-2 p-6" style={{ borderColor: "#fdba74", background: "linear-gradient(135deg,#fff7ed,#fff)" }}>
        <div className="mb-3 flex items-center gap-3">
          <RateReview sx={{ color: "#ea580c", fontSize: "2.2rem" }} />
          <Typography variant="h6" className="font-bold">Write a review</Typography>
        </div>
        {!signedIn && <p className="m-0 text-base text-gray-700">Sign in to review a dish you have ordered.</p>}
        {signedIn && mine && <p className="m-0 text-base text-gray-700">Thanks — you have already reviewed this dish.</p>}
        {signedIn && !mine && !canReview && (
          <p className="m-0 text-base text-gray-700" data-testid="review-requires-order">
            Only diners who have ordered this dish can review it. Order it, then come back and tell others how it was.
          </p>
        )}
        {signedIn && !mine && canReview && (
          <div className="space-y-4">
            <p className="m-0 flex items-center gap-2 text-base text-green-700"><VerifiedUser fontSize="small" /> You ordered this dish — your review will show as a verified diner.</p>
            <Rating value={rating} onChange={(_, v) => setRating(v || 0)} size="large" sx={{ "& .MuiRating-iconFilled": { color: "#f59e0b" } }} />
            <TextField
              fullWidth
              multiline
              minRows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="How was the taste, the portion, the wait?"
              inputProps={{ maxLength: 2000 }}
            />
            <Button
              variant="contained"
              disabled={rating === 0 || !content.trim() || create.isLoading}
              onClick={submit}
              sx={{ background: "linear-gradient(135deg,#f97316,#ea580c)", fontWeight: 700, textTransform: "none", fontSize: "1.4rem", px: 4 }}
            >
              {create.isLoading ? "Posting…" : "Post review"}
            </Button>
          </div>
        )}
      </div>

      <Typography variant="h6" className="mb-4 font-bold">Diner reviews ({count})</Typography>
      {isLoading ? (
        <p className="text-base text-gray-600">Loading reviews…</p>
      ) : count === 0 ? (
        <p className="text-base text-gray-600">No reviews yet for this dish.</p>
      ) : (
        <ul className="m-0 list-none space-y-4 p-0">
          {reviews.map((r) => (
            <li key={r.id} className="flex gap-4 rounded-2xl border-2 border-gray-100 bg-white p-5">
              <Avatar sx={{ bgcolor: "#ea580c", width: 48, height: 48 }}>{(r.authorName || "V")[0].toUpperCase()}</Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-lg font-bold text-gray-900">{r.authorName || "Verified diner"}</span>
                  <span className="inline-flex items-center gap-1 text-sm text-green-700"><VerifiedUser sx={{ fontSize: 16 }} /> Ordered this dish</span>
                  <span className="text-sm text-gray-500">· {timeAgo(r.createdAt)}</span>
                </div>
                <Rating value={r.rating} readOnly size="small" sx={{ "& .MuiRating-iconFilled": { color: "#f59e0b" } }} />
                <p className="m-0 mt-2 whitespace-pre-wrap break-words text-base text-gray-700">{r.content}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default FoodMenuReviewsPanel;
