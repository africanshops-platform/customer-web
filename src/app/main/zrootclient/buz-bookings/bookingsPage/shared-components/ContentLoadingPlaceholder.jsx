import { CircularProgress, Skeleton, Typography } from "@mui/material";
import { motion } from "framer-motion";

/**
 * ContentLoadingPlaceholder Component
 * Beautiful loading state with AfricanShops logo, circular progress, and card skeletons
 */
function ContentLoadingPlaceholder() {
  return (
    <div
      className="flex-auto p-24 sm:p-40"
      style={{
        background: "linear-gradient(180deg, #fafaf9 0%, #f5f5f4 50%, #fef3e2 100%)",
        minHeight: "100vh",
      }}
    >
      <div className="flex flex-col">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton
            variant="text"
            width="40%"
            height={60}
            sx={{
              backgroundColor: "rgba(234, 88, 12, 0.1)",
              borderRadius: "8px",
            }}
          />
          <Skeleton
            variant="text"
            width="60%"
            height={30}
            sx={{
              backgroundColor: "rgba(234, 88, 12, 0.08)",
              borderRadius: "8px",
              marginTop: "8px",
            }}
          />
        </div>

        {/* Main Content Area with Logo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 bg-white/40 backdrop-blur-sm rounded-3xl shadow-lg mb-8 relative">
          {/* Centered Logo with Circular Progress */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatType: "reverse",
                repeatDelay: 0.5,
              }}
              className="flex flex-col items-center gap-6"
            >
              {/* Logo with Circular Progress */}
              <div className="relative">
                {/* Circular Progress */}
                <CircularProgress
                  size={140}
                  thickness={3}
                  sx={{
                    color: "#ea580c",
                    position: "absolute",
                    top: -20,
                    left: -20,
                  }}
                />

                {/* AfricanShops Logo */}
                <div
                  className="w-[100px] h-[100px] rounded-full flex items-center justify-center shadow-2xl"
                  style={{
                    background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                  }}
                >
                  <img
                    src="/assets/images/afslogo/afslogo.png"
                    alt="AfricanShops"
                    className="w-16 h-16"
                    onError={(e) => {
                      // Fallback if logo doesn't exist
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML = `
                        <div style="color: white; font-size: 2rem; font-weight: 900;">AS</div>
                      `;
                    }}
                  />
                </div>
              </div>

              {/* Loading Text */}
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: "#ea580c",
                    textAlign: "center",
                  }}
                >
                  Loading Properties...
                </Typography>
                <Typography
                  sx={{
                    fontSize: "1rem",
                    color: "#6b7280",
                    textAlign: "center",
                    marginTop: "8px",
                  }}
                >
                  Finding the best accommodations for you
                </Typography>
              </motion.div>
            </motion.div>
          </div>

          {/* Faded Card Skeletons */}
          {[1, 2, 3, 4].map((index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              {/* Image Skeleton */}
              <Skeleton
                variant="rectangular"
                height={256}
                sx={{
                  backgroundColor: "rgba(234, 88, 12, 0.1)",
                }}
              />

              {/* Content Skeleton */}
              <div className="p-10 space-y-4">
                <Skeleton
                  variant="text"
                  width="60%"
                  height={24}
                  sx={{
                    backgroundColor: "rgba(234, 88, 12, 0.08)",
                    borderRadius: "8px",
                  }}
                />
                <Skeleton
                  variant="text"
                  width="90%"
                  height={32}
                  sx={{
                    backgroundColor: "rgba(234, 88, 12, 0.1)",
                    borderRadius: "8px",
                  }}
                />
                <Skeleton
                  variant="text"
                  width="70%"
                  height={24}
                  sx={{
                    backgroundColor: "rgba(234, 88, 12, 0.08)",
                    borderRadius: "8px",
                  }}
                />
                <div className="flex justify-between pt-4">
                  <Skeleton
                    variant="text"
                    width="40%"
                    height={28}
                    sx={{
                      backgroundColor: "rgba(234, 88, 12, 0.12)",
                      borderRadius: "8px",
                    }}
                  />
                  <Skeleton
                    variant="text"
                    width="30%"
                    height={28}
                    sx={{
                      backgroundColor: "rgba(234, 88, 12, 0.08)",
                      borderRadius: "8px",
                    }}
                  />
                </div>
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={48}
                  sx={{
                    backgroundColor: "rgba(234, 88, 12, 0.15)",
                    borderRadius: "12px",
                    marginTop: "16px",
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className="flex justify-center gap-4">
          <Skeleton
            variant="rectangular"
            width={300}
            height={40}
            sx={{
              backgroundColor: "rgba(234, 88, 12, 0.1)",
              borderRadius: "8px",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default ContentLoadingPlaceholder;
