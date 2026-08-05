import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";
import AvatarGroup from "@mui/material/AvatarGroup";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { useState } from "react";
import CardContent from "@mui/material/CardContent";
import Alert from "@mui/material/Alert";
import JwtLoginTab from "./tabs/JwtSignInTab";

const tabs = [
  {
    id: "jwt",
    title: "JWT",
    logo: "assets/images/logo/jwt.svg",
    logoClass: "h-40 p-4 bg-black rounded-12",
  },
];

/**
 * The sign in page.
 */
function SignInPage() {
  const [selectedTabId] = useState(tabs[0].id);

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center sm:flex-row sm:justify-center md:items-start md:justify-start">
      <Paper
        className="h-full w-full px-16 py-8 ltr:border-r-1 rtl:border-l-1 sm:h-auto sm:w-auto sm:rounded-2xl sm:p-48 sm:shadow md:flex md:h-full md:w-1/2 md:items-center md:justify-end md:rounded-none md:p-64 md:shadow-none"
        sx={{
          background: "linear-gradient(135deg, #ffffff 0%, #fafaf9 50%, #ffffff 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle Decorative Elements */}
        <Box
          sx={{
            position: "absolute",
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(234, 88, 12, 0.05) 100%)",
            filter: "blur(40px)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -30,
            left: -30,
            width: 150,
            height: 150,
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, rgba(249, 115, 22, 0.06) 0%, rgba(234, 88, 12, 0.03) 100%)",
            filter: "blur(30px)",
          }}
        />

        <CardContent className="mx-auto w-full max-w-320 sm:mx-0 sm:w-320 relative z-10">
          {/* Logo with Gradient Container */}
          <div className="flex items-center gap-12 mb-32">
            <div
              className="w-56 h-56 rounded-xl flex items-center justify-center shadow-lg"
              style={{
                background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
              }}
            >
              <img className="w-32" src="assets/images/afslogo/afslogo.png" alt="logo" />
            </div>
            <div>
              <Typography className="text-sm font-semibold text-gray-500">
                Welcome back to
              </Typography>
              <Typography
                className="text-lg font-bold"
                sx={{
                  background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                AfricanShops
              </Typography>
            </div>
          </div>

          {/* Header Section */}
          <div className="mb-32">
            <Typography className="text-4xl font-extrabold leading-tight tracking-tight text-gray-800 mb-8">
              Sign in
            </Typography>
            <Typography className="text-base text-gray-600 leading-relaxed">
              Access your account to shop, book, and order across Africa
            </Typography>
          </div>

          {/* Sign Up Link with Enhanced Styling */}
          <div
            className="mb-24 p-16 rounded-xl border-2 border-dashed"
            style={{
              borderColor: "rgba(234, 88, 12, 0.2)",
              backgroundColor: "rgba(249, 115, 22, 0.03)",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <svg
                  className="w-20 h-20"
                  style={{ color: "#ea580c" }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
                <Typography className="text-sm font-medium text-gray-700">
                  Don't have an account?
                </Typography>
              </div>
              <Link
                className="font-bold text-sm px-16 py-8 rounded-lg transition-all hover:shadow-md"
                to="/sign-up"
                style={{
                  background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                  color: "white",
                }}
              >
                Sign up
              </Link>
            </div>
          </div>

          {/* Enhanced Alert/Info Box */}
          <Alert
            icon={
              <svg
                className="w-20 h-20"
                style={{ color: "#ea580c" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            }
            severity="info"
            className="mb-24"
            sx={{
              backgroundColor: "rgba(234, 88, 12, 0.08)",
              border: "1px solid rgba(234, 88, 12, 0.2)",
              borderRadius: "12px",
              "& .MuiAlert-message": {
                color: "#4b5563",
                fontSize: "0.875rem",
                lineHeight: "1.5",
              },
            }}
          >
            You're signing in to{" "}
            <strong style={{ color: "#ea580c" }}>AfricanShops</strong>. By
            continuing, you agree to our terms of service and privacy policy.
          </Alert>

          {/* Login Form */}
          {selectedTabId === "jwt" && <JwtLoginTab />}

          {/* Additional Trust Indicators */}
          <div className="mt-32 pt-24 border-t border-gray-200">
            <div className="flex items-center justify-center gap-24 text-xs text-gray-500">
              <div className="flex items-center gap-6">
                <svg
                  className="w-16 h-16 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <span className="font-medium">256-bit SSL</span>
              </div>
              <div className="w-1 h-12 bg-gray-300" />
              <div className="flex items-center gap-6">
                <svg
                  className="w-16 h-16 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <span className="font-medium">GDPR Compliant</span>
              </div>
              <div className="w-1 h-12 bg-gray-300" />
              <div className="flex items-center gap-6">
                <svg
                  className="w-16 h-16 text-orange-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span className="font-medium">99.9% Uptime</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Paper>
      <Box
        className="relative hidden h-full flex-auto items-center justify-center overflow-hidden p-64 md:flex lg:px-112"
        sx={{
          background: "linear-gradient(180deg, #fafaf9 0%, #f5f5f4 50%, #fef3e2 100%)",
        }}
      >
        {/* Decorative Background Elements */}
        <svg
          className="pointer-events-none absolute inset-0 opacity-10"
          viewBox="0 0 960 540"
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMax slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>
          <g fill="none" stroke="url(#orangeGradient)" strokeWidth="2">
            <circle r="300" cx="150" cy="100" opacity="0.3" />
            <circle r="250" cx="800" cy="450" opacity="0.3" />
            <circle r="180" cx="480" cy="270" opacity="0.2" />
          </g>
        </svg>

        {/* Floating Grid Pattern */}
        <Box
          component="svg"
          className="absolute inset-0 opacity-5"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern
              id="loginGrid"
              x="0"
              y="0"
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r="1" fill="#ea580c" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#loginGrid)" />
        </Box>

        {/* Main Content Container */}
        <div className="relative z-10 w-full max-w-2xl">
          {/* Central Illustration - Login Dashboard Preview */}
          <div className="relative mb-48">
            {/* Floating Dashboard Card with Shadow */}
            <div
              className="relative mx-auto w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300"
              style={{
                background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
              }}
            >
              {/* Dashboard Header */}
              <div className="p-24 bg-white/95 backdrop-blur-sm">
                <div className="flex items-center gap-12 mb-16">
                  <div className="w-40 h-40 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                    <svg
                      className="w-24 h-24 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="h-12 bg-gray-300 rounded w-3/4 mb-6" />
                    <div className="h-8 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-8">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-12"
                    >
                      <div className="h-8 bg-orange-200 rounded w-3/4 mb-6" />
                      <div className="h-16 bg-orange-300 rounded w-full" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Dashboard Chart Preview */}
              <div className="p-24 pt-16 bg-white/90">
                <div className="h-120 rounded-xl overflow-hidden relative">
                  <svg className="w-full h-full" viewBox="0 0 300 120" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#ea580c" stopOpacity="0.1" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,100 L30,85 L60,75 L90,90 L120,60 L150,70 L180,45 L210,55 L240,30 L270,40 L300,25 L300,120 L0,120 Z"
                      fill="url(#chartGradient)"
                    />
                    <path
                      d="M0,100 L30,85 L60,75 L90,90 L120,60 L150,70 L180,45 L210,55 L240,30 L270,40 L300,25"
                      fill="none"
                      stroke="#ea580c"
                      strokeWidth="3"
                    />
                  </svg>
                </div>
              </div>

              {/* Gradient Footer Bar */}
              <div
                className="h-12"
                style={{
                  background: "linear-gradient(90deg, #f97316 0%, #ea580c 50%, #f97316 100%)",
                }}
              />
            </div>

            {/* Floating Security Icons */}
            <div className="absolute -right-24 top-24 w-64 h-64 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-xl animate-pulse">
              <svg
                className="w-32 h-32 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>

            <div className="absolute -left-24 bottom-24 w-56 h-56 rounded-full bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center shadow-lg">
              <svg
                className="w-28 h-28 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
          </div>

          {/* Headline */}
          <div className="text-center mb-32">
            <div className="text-6xl font-extrabold leading-tight mb-12">
              <span
                style={{
                  background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Secure Access
              </span>
            </div>
            <div className="text-5xl font-bold text-gray-800 leading-tight">
              to Your AfricanShops Account
            </div>
          </div>

          {/* Description */}
          <div className="text-center mb-40">
            <div className="text-lg leading-relaxed text-gray-600 max-w-xl mx-auto">
              Sign in with enterprise-grade security to shop authentic products, book stays,
              order food, and explore real estate — all in one place, built for how Africa
              trades.
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-16 mb-40">
            {[
              {
                icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
                text: "Bank-Level Security",
              },
              { icon: "M13 10V3L4 14h7v7l9-11h-7z", text: "Lightning Fast" },
              {
                icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
                text: "Real-Time Order Tracking",
              },
              {
                icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z",
                text: "Mobile Optimized",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-12 bg-white/60 backdrop-blur-sm rounded-xl p-16 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="w-40 h-40 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-20 h-20 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={feature.icon}
                    />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-700">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-16 bg-white/70 backdrop-blur-sm rounded-2xl p-20 shadow-lg">
            <AvatarGroup
              max={4}
              sx={{
                "& .MuiAvatar-root": {
                  borderColor: "white",
                  width: 48,
                  height: 48,
                  border: "3px solid white",
                },
              }}
            >
              <Avatar src="assets/images/avatars/female-18.jpg" />
              <Avatar src="assets/images/avatars/female-11.jpg" />
              <Avatar src="assets/images/avatars/male-09.jpg" />
              <Avatar src="assets/images/avatars/male-16.jpg" />
            </AvatarGroup>

            <div className="flex flex-col">
              <div className="text-2xl font-bold" style={{ color: "#ea580c" }}>
                5,000+ Happy Customers
              </div>
              <div className="text-sm text-gray-600 font-medium">
                Join Africa's fastest-growing e-commerce platform
              </div>
            </div>
          </div>
        </div>
      </Box>
    </div>
  );
}

export default SignInPage;
