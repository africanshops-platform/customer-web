import { useMemo, useState } from "react";
import {
  Avatar,
  Button,
  CircularProgress,
  Rating,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  Chip,
  LinearProgress,
} from "@mui/material";
import {
  Description,
  RateReview,
  VerifiedUser,
  Star,
} from "@mui/icons-material";
import { useAppSelector } from "app/store/hooks";
import useProductCats from "app/configs/data/server-calls/product-categories/useProductCategories";
import { selectUser } from "src/app/auth/user/store/userSlice";
import { motion } from "framer-motion";
import {
  useCreateProductReview,
  useGetProductReviews,
} from "app/configs/data/server-calls/auth/userapp/a_marketplace/useProductsRepo";

function ratingBarColor(stars) {
  if (stars >= 4) return "#10b981";
  if (stars === 3) return "#f59e0b";
  return "#ef4444";
}

/**
 * ProductDetailsWithReviews Component
 * Displays product details and real, purchase-gated reviews in a tabbed interface.
 */
const ProductDetailsWithReviews = ({ productData }) => {
  const user = useAppSelector(selectUser);
  const isAuthenticated = Boolean(user?.email);

  // The public product API returns the category as an id only. Resolve it to the category's name from the cached
  // categories list (the same one the marketplace sidebar uses); a value that is not an id is already a name.
  const { data: categoriesData } = useProductCats();
  const rawCategory = productData?.category;
  const categoryName = /^[a-f0-9]{24}$/i.test(String(rawCategory ?? ""))
    ? categoriesData?.data?.categories?.find((c) => c.id === rawCategory)?.name
    : rawCategory;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [active, setActive] = useState(1);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);

  const productId = productData?.id || productData?._id;
  const { data: reviewsResponse, isLoading: reviewsLoading } = useGetProductReviews(productId);
  const createReview = useCreateProductReview();

  const reviews = reviewsResponse?.data?.reviews ?? [];
  const reviewCount = reviewsResponse?.data?.count ?? 0;
  const averageRating = reviewsResponse?.data?.averageRating ?? 0;

  const ratingStats = useMemo(() => {
    return [5, 4, 3, 2, 1].map((stars) => {
      const count = reviews.filter((r) => r.rating === stars).length;
      const percentage = reviewCount > 0 ? Math.round((count / reviewCount) * 100) : 0;
      return { stars, count, percentage };
    });
  }, [reviews, reviewCount]);

  function handleSubmitComment() {
    if (!comment.trim() || rating === 0 || !productId) return;
    createReview.mutate(
      { productId, rating, content: comment.trim() },
      {
        onSuccess: () => {
          setComment("");
          setRating(0);
        },
      },
    );
  }

  return (
    <div className="p-0">
      {/* Tab Headers - Modern Design */}
      <div className="bg-gradient-to-r from-gray-50 to-white border-b-2 border-gray-200">
        <div className="flex gap-2 p-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActive(1)}
            className={`flex-1 cursor-pointer rounded-xl p-4 transition-all duration-300 ${
              active === 1
                ? "bg-gradient-to-r from-orange-600 to-red-600 shadow-lg"
                : "bg-white hover:bg-gray-50 border-2 border-gray-200"
            }`}
          >
            <div className="flex items-center justify-center gap-3">
              <Description
                sx={{
                  fontSize: isMobile ? "1.5rem" : "1.75rem",
                  color: active === 1 ? "white" : "#ea580c",
                }}
              />
              <Typography
                variant={isMobile ? "subtitle1" : "h6"}
                className={`font-bold ${active === 1 ? "text-white" : "text-gray-900"}`}
              >
                Product Details
              </Typography>
            </div>
            {active === 1 && (
              <motion.div
                layoutId="activeTab"
                className="h-1 bg-white rounded-full mt-2"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActive(2)}
            className={`flex-1 cursor-pointer rounded-xl p-4 transition-all duration-300 ${
              active === 2
                ? "bg-gradient-to-r from-orange-600 to-red-600 shadow-lg"
                : "bg-white hover:bg-gray-50 border-2 border-gray-200"
            }`}
          >
            <div className="flex items-center justify-center gap-3">
              <RateReview
                sx={{
                  fontSize: isMobile ? "1.5rem" : "1.75rem",
                  color: active === 2 ? "white" : "#ea580c",
                }}
              />
              <Typography
                variant={isMobile ? "subtitle1" : "h6"}
                className={`font-bold ${active === 2 ? "text-white" : "text-gray-900"}`}
              >
                Reviews ({reviewCount})
              </Typography>
            </div>
            {active === 2 && (
              <motion.div
                layoutId="activeTab"
                className="h-1 bg-white rounded-full mt-2"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </motion.div>
        </div>
      </div>

      {/* Product Details Tab */}
      {active === 1 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white"
        >
          <div className={`${isMobile ? "p-6" : "p-10"}`}>
            {/* Description Section */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Description sx={{ color: "#ea580c", fontSize: "1.75rem" }} />
                <Typography variant={isMobile ? "h6" : "h5"} className="font-bold text-gray-900">
                  Product Description
                </Typography>
              </div>
              <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border-l-4 border-orange-600">
                <Typography
                  variant={isMobile ? "body2" : "body1"}
                  className="text-gray-700 leading-relaxed"
                  sx={{ fontSize: isMobile ? "0.95rem" : "1.125rem", lineHeight: 1.8 }}
                >
                  {productData?.description || "Product description not available."}
                </Typography>
              </div>
            </div>

            {/* Specifications Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <VerifiedUser sx={{ color: "#10b981", fontSize: "1.75rem" }} />
                <Typography variant={isMobile ? "h6" : "h5"} className="font-bold text-gray-900">
                  Product Specifications
                </Typography>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryName && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-orange-300 hover:shadow-md transition-all duration-300"
                  >
                    <Typography
                      variant={isMobile ? "caption" : "body2"}
                      className="text-gray-500 font-semibold mb-1 uppercase tracking-wide"
                    >
                      Category
                    </Typography>
                    <Typography
                      variant={isMobile ? "body1" : "h6"}
                      className="text-gray-900 font-bold"
                    >
                      {categoryName}
                    </Typography>
                  </motion.div>
                )}

                {productData?.unitweight?.unitname && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-orange-300 hover:shadow-md transition-all duration-300"
                  >
                    <Typography
                      variant={isMobile ? "caption" : "body2"}
                      className="text-gray-500 font-semibold mb-1 uppercase tracking-wide"
                    >
                      Unit Weight
                    </Typography>
                    <Typography
                      variant={isMobile ? "body1" : "h6"}
                      className="text-gray-900 font-bold"
                    >
                      {productData?.unitweight?.unitname}
                    </Typography>
                  </motion.div>
                )}

                {productData?.quantity && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl hover:border-green-400 hover:shadow-md transition-all duration-300"
                  >
                    <Typography
                      variant={isMobile ? "caption" : "body2"}
                      className="text-green-700 font-semibold mb-1 uppercase tracking-wide"
                    >
                      Available Stock
                    </Typography>
                    <Typography
                      variant={isMobile ? "body1" : "h6"}
                      className="text-green-900 font-black"
                    >
                      {productData?.quantity} {productData?.unitPerQuantity}
                    </Typography>
                  </motion.div>
                )}

                {productData?.shop && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all duration-300"
                  >
                    <Typography
                      variant={isMobile ? "caption" : "body2"}
                      className="text-blue-700 font-semibold mb-1 uppercase tracking-wide"
                    >
                      Seller
                    </Typography>
                    <Typography
                      variant={isMobile ? "body1" : "h6"}
                      className="text-blue-900 font-bold"
                    >
                      {productData?.shop?.shopname || "Official Store"}
                    </Typography>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}

      {/* Reviews Tab -- visible to everyone, purchase-gated write (2026-09-27, customer-9) */}
      {active === 2 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white"
        >
          {reviewsLoading ? (
            <div className="flex justify-center p-12">
              <CircularProgress sx={{ color: "#ea580c" }} />
            </div>
          ) : (
            <>
              {/* Rating Overview Section */}
              <div className="p-8 bg-gradient-to-br from-orange-50 via-white to-orange-50 border-b-2 border-gray-200">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  {/* Overall Rating */}
                  <div className="flex flex-col items-center md:items-start gap-3">
                    <Typography variant="h6" className="text-gray-700 font-semibold">
                      Overall Rating
                    </Typography>
                    <div className="flex items-baseline gap-2">
                      <Typography
                        variant="h2"
                        className="font-black text-orange-600"
                        sx={{ fontSize: isMobile ? "3rem" : "4rem" }}
                      >
                        {averageRating.toFixed(1)}
                      </Typography>
                      <Typography variant="h6" className="text-gray-500">
                        out of 5
                      </Typography>
                    </div>
                    <Rating
                      value={averageRating}
                      precision={0.5}
                      readOnly
                      size="large"
                      sx={{
                        "& .MuiRating-iconFilled": { color: "#f59e0b" },
                        fontSize: isMobile ? "1.75rem" : "2rem",
                      }}
                    />
                    <Typography variant="body2" className="text-gray-600">
                      Based on {reviewCount} review{reviewCount === 1 ? "" : "s"}
                    </Typography>
                  </div>

                  {/* Rating Breakdown */}
                  <div className="flex-1 w-full max-w-md">
                    <Typography variant="h6" className="text-gray-700 font-semibold mb-4">
                      Rating Breakdown
                    </Typography>
                    <div className="space-y-2">
                      {ratingStats.map((stat) => (
                        <div key={stat.stars} className="flex items-center gap-3">
                          <div className="flex items-center gap-1 w-16">
                            <Typography variant="body2" className="font-semibold text-gray-700">
                              {stat.stars}
                            </Typography>
                            <Star sx={{ fontSize: "1rem", color: "#f59e0b" }} />
                          </div>
                          <div className="flex-1">
                            <LinearProgress
                              variant="determinate"
                              value={stat.percentage}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: "#f3f4f6",
                                "& .MuiLinearProgress-bar": {
                                  backgroundColor: ratingBarColor(stat.stars),
                                  borderRadius: 4,
                                },
                              }}
                            />
                          </div>
                          <Typography variant="body2" className="text-gray-600 w-12 text-right">
                            {stat.count}
                          </Typography>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {isAuthenticated ? (
                <div
                  className={`${isMobile ? "p-6" : "p-8"} bg-gradient-to-br from-gray-50 to-white border-b-2 border-gray-200`}
                >
                  <div className="flex items-center gap-2 mb-6">
                    <RateReview sx={{ color: "#ea580c", fontSize: "1.75rem" }} />
                    <Typography variant={isMobile ? "h6" : "h5"} className="font-bold text-gray-900">
                      Write a Review
                    </Typography>
                  </div>
                  <Typography variant="body2" className="text-gray-500 mb-4">
                    Only customers who have purchased this product can leave a review.
                  </Typography>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl p-6 shadow-md border-2 border-gray-200"
                  >
                    <div className="mb-6">
                      <Typography variant="body1" className="text-gray-700 font-semibold mb-3">
                        Rate this product
                      </Typography>
                      <div className="flex items-center gap-4">
                        <Rating
                          value={rating}
                          onChange={(_, newValue) => setRating(newValue)}
                          size="large"
                          sx={{
                            "& .MuiRating-iconFilled": { color: "#f59e0b" },
                            "& .MuiRating-iconHover": { color: "#f59e0b" },
                            fontSize: isMobile ? "2rem" : "2.5rem",
                          }}
                        />
                        {rating > 0 && (
                          <Chip
                            label={`${rating} star${rating > 1 ? "s" : ""}`}
                            sx={{ backgroundColor: "#ffedd5", color: "#c2410c", fontWeight: 700 }}
                          />
                        )}
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Avatar
                        sx={{
                          width: isMobile ? 40 : 48,
                          height: isMobile ? 40 : 48,
                          fontSize: isMobile ? "1.25rem" : "1.5rem",
                          backgroundColor: "#ea580c",
                        }}
                      >
                        {(user?.displayName || user?.email)?.[0]?.toUpperCase() || "U"}
                      </Avatar>
                      <div className="flex-1">
                        <TextField
                          fullWidth
                          multiline
                          rows={isMobile ? 3 : 4}
                          placeholder="Share your thoughts about this product... What did you like? What could be improved?"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          variant="outlined"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "#fafaf9",
                              fontSize: isMobile ? "0.95rem" : "1.05rem",
                              borderRadius: "12px",
                              "&:hover fieldset": { borderColor: "#ea580c" },
                              "&.Mui-focused fieldset": { borderColor: "#ea580c", borderWidth: "2px" },
                            },
                          }}
                        />
                        <div className="flex items-center justify-end mt-4">
                          <Button
                            variant="contained"
                            size="large"
                            onClick={handleSubmitComment}
                            disabled={!comment.trim() || rating === 0 || createReview.isLoading}
                            sx={{
                              background: "linear-gradient(to right, #ea580c, #dc2626)",
                              "&:hover": { background: "linear-gradient(to right, #c2410c, #b91c1c)" },
                              textTransform: "none",
                              fontSize: isMobile ? "0.95rem" : "1.05rem",
                              fontWeight: 700,
                              padding: isMobile ? "10px 24px" : "12px 32px",
                              borderRadius: "12px",
                              boxShadow: "0 4px 15px rgba(234, 88, 12, 0.3)",
                            }}
                          >
                            {createReview.isLoading ? "Posting..." : "Post Review"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ) : (
                <div className={`${isMobile ? "p-4" : "p-8"} border-b`}>
                  <Typography
                    variant={isMobile ? "body2" : "body1"}
                    className="text-orange-600 font-semibold px-2"
                  >
                    Please sign in to leave a review.
                  </Typography>
                </div>
              )}

              {/* Reviews List */}
              <div className={`${isMobile ? "p-6" : "p-8"}`}>
                <div className="flex items-center gap-2 mb-8">
                  <RateReview sx={{ color: "#ea580c", fontSize: "1.75rem" }} />
                  <Typography variant={isMobile ? "h6" : "h5"} className="font-bold text-gray-900">
                    Customer Reviews ({reviewCount})
                  </Typography>
                </div>

                {reviewCount === 0 ? (
                  <Typography variant="body1" className="text-gray-500 text-center py-6">
                    No reviews yet for this product!
                  </Typography>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review, index) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-orange-300 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex gap-4">
                          <Avatar
                            sx={{
                              width: isMobile ? 48 : 56,
                              height: isMobile ? 48 : 56,
                              border: "3px solid #ffedd5",
                              backgroundColor: "#ea580c",
                            }}
                          >
                            {(review.authorName || "V")[0].toUpperCase()}
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Typography
                                variant={isMobile ? "subtitle1" : "h6"}
                                className="font-bold text-gray-900"
                              >
                                {review.authorName || "Verified Buyer"}
                              </Typography>
                              <Chip
                                icon={<VerifiedUser fontSize="small" />}
                                label="Verified Purchase"
                                size="small"
                                sx={{ backgroundColor: "#dcfce7", color: "#15803d", fontWeight: 700 }}
                              />
                            </div>
                            <Rating
                              value={review.rating}
                              readOnly
                              size={isMobile ? "small" : "medium"}
                              sx={{ "& .MuiRating-iconFilled": { color: "#f59e0b" }, marginBottom: "12px" }}
                            />
                            <Typography
                              variant={isMobile ? "body2" : "body1"}
                              className="text-gray-700 leading-relaxed"
                              sx={{ fontSize: isMobile ? "0.95rem" : "1.05rem" }}
                            >
                              {review.content}
                            </Typography>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
      ) : null}
    </div>
  );
};

export default ProductDetailsWithReviews;
