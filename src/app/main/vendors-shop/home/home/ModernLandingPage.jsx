import Typography from "@mui/material/Typography";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Card, CardContent, Chip } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import CategoryAndTradehub from "src/app/main/zrootclient/buz-marketplace/shops/components/CategoryAndTradehub";
import BookingsHub from "./bookingshub/BookingsHub";
import RestaurantAndSpotsHub from "./restaurantclubspotshub/RestaurantAndSpotsHub";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
// Material-UI Icons
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import InfoIcon from "@mui/icons-material/Info";
import PhoneIcon from "@mui/icons-material/Phone";
import StoreIcon from "@mui/icons-material/Store";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import HotelIcon from "@mui/icons-material/Hotel";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import ApartmentIcon from "@mui/icons-material/Apartment";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import GridViewIcon from "@mui/icons-material/GridView";
import VisibilityIcon from "@mui/icons-material/Visibility";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SchoolIcon from "@mui/icons-material/School";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import HandshakeIcon from "@mui/icons-material/Handshake";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import DownloadIcon from "@mui/icons-material/Download";
import HomeIcon from "@mui/icons-material/Home";
import BusinessIcon from "@mui/icons-material/Business";
import MapIcon from "@mui/icons-material/Map";
import BuildIcon from "@mui/icons-material/Build";
// import DescriptionIcon from "@mui/icons-material/Description";

/**
 * MODERN LANDING PAGE - Completely New Design
 * A fresh, contemporary approach with unique layout and interactions
 */

function ModernLandingPage() {
  const merchantUrl = import.meta.env.VITE_AFSHO_MERCHNATPORTAL_URL;
  const [activeService, setActiveService] = useState("marketplace");
  const navigate = useNavigate();

  console.log('Merchant Portal', merchantUrl)

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const scaleIn = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div
      className="flex flex-col w-full overflow-hidden"
      style={{
        // Option 1: Deep blue to purple to burgundy gradient
        // background: 'linear-gradient(135deg, #004d7a 0%, #1a1a4d 25%, #2d1b4e 50%, #4a1942 75%, #5d2a42 100%)',

        // Option 2: Vibrant blue to red gradient with hexagonal pattern effect
        // background: 'radial-gradient(ellipse at top left, #1e40af 0%, #6366f1 25%, #7c3aed 40%, #a21caf 55%, #be123c 75%, #dc2626 100%)',

        // Option 3: Deep blue gradient with brick pattern
        background: `
          linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px),
          linear-gradient(180deg, rgba(0,0,0,0.1) 1px, transparent 1px),
          linear-gradient(180deg, #001a33 0%, #003d66 30%, #004d80 60%, #0059a0 100%)
        `,
        backgroundSize: "120px 60px, 120px 60px, 100% 100%",
        backgroundPosition: "0 0, 0 30px, 0 0",
      }}
    >
      {/* ============================================
          SPLIT HERO SECTION - Left Content, Right Visual
          ============================================ */}
      <div className="relative min-h-screen flex items-center bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-500 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 md:px-16 py-12 sm:py-16 md:py-20 relative z-10">
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, x: -80 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Chip
                  label="Discover Africa — Its Markets, Stays, and Stories."
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.25)",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: { xs: "0.95rem", sm: "1.1rem", md: "1.25rem", lg: "1.875rem" },
                    padding: { xs: "4px 8px", sm: "6px 12px", md: "8px 16px" },
                    marginBottom: { xs: "12px", sm: "16px", md: "24px" },
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                  }}
                  size="medium"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Typography
                  component="h1"
                  sx={{
                    fontSize: { xs: "1.85rem", sm: "2.25rem", md: "3.5rem", lg: "4.5rem" },
                    fontWeight: 900,
                    marginBottom: { xs: "12px", sm: "16px", md: "24px" },
                    lineHeight: 1.1,
                    color: "white",
                  }}
                >
                  Where Africa Trades
                  <span style={{ display: "block", color: "#fde047" }}>Travels, and Thrives.</span>
                </Typography>
              </motion.div>

              {/* Where Africa Trades, Travels, */}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Typography
                  sx={{
                    padding: { xs: "8px 0", sm: "10px 8px", md: "12px 14px" },
                    fontSize: { xs: "0.975rem", sm: "1rem", md: "1.25rem", lg: "1.6rem" },
                    marginBottom: { xs: "20px", sm: "24px", md: "32px" },
                    color: "rgba(255, 255, 255, 0.95)",
                    lineHeight: { xs: 1.6, sm: 1.8, md: 2.4 },
                    fontWeight: 400,
                    letterSpacing: "0.015em",
                    maxWidth: "600px",
                  }}
                >
                  Shop authentic products, book premium stays,
                  <br /> discover amazing restaurants, and explore investment <br /> opportunities —{" "}
                  <span style={{ fontWeight: 500, color: "#fde047" }}>all in one ecosystem</span>.
                </Typography>
              </motion.div>

              <motion.div
                className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Button
                  component={Link}
                  to="/marketplace/shop"
                  variant="contained"
                  size="large"
                  startIcon={<ShoppingBagIcon />}
                  sx={{
                    backgroundColor: "white",
                    color: "#ea580c",
                    fontWeight: "bold",
                    fontSize: { xs: "0.875rem", sm: "1rem", md: "1.125rem" },
                    padding: { xs: "12px 24px", sm: "13px 32px", md: "14px 40px" },
                    borderRadius: "9999px",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                    textTransform: "none",
                    width: { xs: "100%", sm: "auto" },
                    "&:hover": {
                      backgroundColor: "#f3f4f6",
                    },
                  }}
                >
                  Start Shopping
                </Button>
                <Button
                  component={Link}
                  to="/about"
                  variant="outlined"
                  size="large"
                  startIcon={<InfoIcon />}
                  sx={{
                    borderColor: "white",
                    borderWidth: "2px",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: { xs: "0.875rem", sm: "1rem", md: "1.125rem" },
                    padding: { xs: "12px 24px", sm: "13px 32px", md: "14px 40px" },
                    borderRadius: "9999px",
                    backdropFilter: "blur(4px)",
                    textTransform: "none",
                    width: { xs: "100%", sm: "auto" },
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      borderColor: "white",
                      borderWidth: "2px",
                    },
                  }}
                >
                  Learn More
                </Button>
              </motion.div>

              {/* Stats */}
              <motion.div
                className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-8 mt-8 sm:mt-12 md:mt-16 p-3 sm:p-4 md:p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                {[
                  { num: "1K+", label: "Products" },
                  { num: "100+", label: "Merchants" },
                  { num: "5K+", label: "Happy Customers" },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <Typography
                      sx={{
                        fontSize: { xs: "1.25rem", sm: "1.75rem", md: "2.5rem" },
                        fontWeight: 900,
                        color: "#fde047",
                      }}
                    >
                      {stat.num}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: { xs: "0.625rem", sm: "0.875rem", md: "1.475rem" },
                        color: "rgba(255, 255, 255, 0.9)",
                        marginTop: "4px",
                      }}
                    >
                      {stat.label}
                    </Typography>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: Illustration-Style Feature Showcase */}
            <motion.div
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative mt-8 md:mt-0"
            >
              {/* Main Illustration Card */}
              <div
                className="relative bg-white/10 backdrop-blur-md rounded-[24px] sm:rounded-[32px] md:rounded-[40px] p-4 sm:p-6 md:p-8 border border-white/20"
                style={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
              >
                {/* Category Tags */}
                <div className="px-2 py-3 sm:px-6 sm:py-6 md:px-10 md:py-10 flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <span className="px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 bg-white/90 rounded-full text-xs sm:text-sm font-semibold text-gray-800">
                    Marketplace
                  </span>
                  <span className="px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 bg-white/90 rounded-full text-xs sm:text-sm font-semibold text-gray-800">
                    Travel
                  </span>
                  <span className="px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 bg-black/80 text-white rounded-full text-xs sm:text-sm font-semibold">
                    Featured
                  </span>
                </div>

                {/* Main Feature Title */}
                <Typography
                  sx={{
                    fontSize: { xs: "1.125rem", sm: "1.375rem", md: "1.875rem" },
                    fontWeight: 700,
                    color: "white",
                    marginBottom: { xs: "12px", sm: "14px", md: "16px" },
                    lineHeight: 1.3,
                  }}
                >
                  Seamless Shopping
                  <br />& Booking Experience
                </Typography>

                <Typography
                  sx={{
                    fontSize: { xs: "0.875rem", sm: "1rem", md: "1.4rem" },
                    color: "rgba(255, 255, 255, 0.8)",
                    marginBottom: { xs: "16px", sm: "20px", md: "24px" },
                  }}
                >
                  From marketplace to reservations.
                </Typography>

                {/* Main Image Slider Container */}
                <motion.div
                  animate={{ y: [0, -15, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 6,
                    ease: "easeInOut",
                  }}
                  className="relative rounded-2xl sm:rounded-3xl overflow-hidden"
                  style={{ height: "240px", maxHeight: "240px" }}
                  sx={{
                    height: { xs: "240px", sm: "300px", md: "400px" },
                  }}
                >
                  <Carousel
                    autoPlay={true}
                    infiniteLoop={true}
                    interval={4000}
                    showThumbs={false}
                    showStatus={false}
                    showIndicators={true}
                    transitionTime={800}
                  >
                    <div className="h-[240px] sm:h-[300px] md:h-[400px]">
                      <img
                        src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=85"
                        alt="Electronics"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 sm:p-4 md:p-6">
                        <Typography className="text-white font-bold text-sm sm:text-lg md:text-xl">
                          Premium Electronics
                        </Typography>
                        <Typography className="text-white/90 text-xs sm:text-sm">
                          Exclusive deals on top brands
                        </Typography>
                      </div>
                    </div>

                    <div className="h-[240px] sm:h-[300px] md:h-[400px]">
                      <img
                        src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=85"
                        alt="Hotels"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 sm:p-4 md:p-6">
                        <Typography className="text-white font-bold text-sm sm:text-lg md:text-xl">
                          Luxury Accommodations
                        </Typography>
                        <Typography className="text-white/90 text-xs sm:text-sm">
                          Book your perfect stay across Africa
                        </Typography>
                      </div>
                    </div>

                    <div className="h-[240px] sm:h-[300px] md:h-[400px]">
                      <img
                        src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=85"
                        alt="Dining"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 sm:p-4 md:p-6">
                        <Typography className="text-white font-bold text-sm sm:text-lg md:text-xl">
                          Fine Dining Experience
                        </Typography>
                        <Typography className="text-white/90 text-xs sm:text-sm">
                          Discover Africa's best restaurants
                        </Typography>
                      </div>
                    </div>

                    <div className="h-[240px] sm:h-[300px] md:h-[400px]">
                      <img
                        src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=85"
                        alt="Fashion"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 sm:p-4 md:p-6">
                        <Typography className="text-white font-bold text-sm sm:text-lg md:text-xl">
                          Fashion & Style
                        </Typography>
                        <Typography className="text-white/90 text-xs sm:text-sm">
                          Trending styles and new arrivals
                        </Typography>
                      </div>
                    </div>
                  </Carousel>

                  {/* Play Button Overlay */}
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-orange-600 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                    <div className="w-0 h-0 border-l-4 sm:border-l-6 md:border-l-8 border-l-white border-t-2 sm:border-t-3 md:border-t-4 border-t-transparent border-b-2 sm:border-b-3 md:border-b-4 border-b-transparent ml-0.5 sm:ml-0.5 md:ml-1"></div>
                  </div>
                </motion.div>

                {/* Bottom Stats */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/20">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 border-2 border-white"></div>
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white"></div>
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-green-400 to-teal-500 border-2 border-white"></div>
                    </div>
                    <div>
                      <Typography className="text-white font-bold text-lg sm:text-xl md:text-2xl">
                        5K+
                      </Typography>
                      <Typography className="text-white/70 text-[10px] sm:text-xs">
                        Happy Customers
                      </Typography>
                    </div>
                  </div>

                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: "white",
                      color: "#ea580c",
                      fontWeight: "bold",
                      padding: { xs: "8px 16px", sm: "9px 20px", md: "10px 24px" },
                      fontSize: { xs: "0.75rem", sm: "0.875rem", md: "1rem" },
                      borderRadius: "12px",
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: "#f3f4f6",
                      },
                    }}
                  >
                    Explore Now
                  </Button>
                </div>
              </div>

              {/* Floating Mini Card - Top Right - Hidden on mobile/tablet, shown on large screens */}
              <motion.div
                animate={{ y: [0, -10, 0], rotate: [0, 2, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 5,
                  ease: "easeInOut",
                }}
                className="hidden lg:block absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-2xl"
                style={{ width: "140px" }}
              >
                <img
                  src="https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200&auto=format&fit=crop&q=85"
                  alt="Real Estate"
                  className="w-full h-60 object-cover rounded-xl mb-2"
                />
                <Typography className="text-xs font-bold text-gray-900 cursor-pointer hover:underline">
                  Real Estate Hub
                </Typography>
                <Typography className="text-xs text-gray-600">Coming Soon</Typography>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-6 sm:bottom-8 md:bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <KeyboardArrowDownIcon
            sx={{
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
              color: "rgba(229, 231, 235, 0.8)",
              animation: "bounce 1s infinite",
            }}
          />
        </motion.div>
      </div>

      {/* ============================================
          FEATURED PROMOTIONAL SLIDER WITH SIDEBAR
          ============================================ */}
      <div className="bg-gray-100 py-20">
        <div className="container mx-auto px-8 md:px-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-12 gap-8"
          >
            {/* Left Sidebar - Categories */}
            <motion.div
              variants={fadeInUp}
              className="md:col-span-3 bg-white rounded-3xl shadow-xl p-6 h-full sticky top-24"
            >
              <div className="flex items-center mb-6">
                <GridViewIcon
                  sx={{
                    fontSize: "1.75rem",
                    color: "#f97316",
                    marginRight: "12px",
                  }}
                />
                <Typography variant="h5" sx={{ fontWeight: 900, color: "#1f2937" }}>
                  Categories
                </Typography>
              </div>
              <CategoryAndTradehub />
            </motion.div>

            {/* Center - Main Slider */}
            <motion.div variants={fadeInUp} className="md:col-span-6">
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden h-[500px]">
                <Carousel
                  autoPlay={true}
                  infiniteLoop={true}
                  interval={5000}
                  showThumbs={false}
                  showStatus={false}
                  transitionTime={700}
                >
                  <div className="relative h-[500px]">
                    <img
                      src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&auto=format&fit=crop&q=85"
                      alt="Promo 1"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-12">
                      <Chip
                        label="FLASH SALE"
                        className="bg-red-600 text-white font-bold mb-4 w-fit"
                      />
                      <Typography variant="h2" className="text-white font-black mb-4">
                        Mega Electronics Sale
                      </Typography>
                      <Typography className="text-white/90 text-xl mb-6">
                        Save up to 60% on top brands
                      </Typography>
                      <Button
                        variant="contained"
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold w-fit px-8 py-3 rounded-full"
                      >
                        Shop Now
                      </Button>
                    </div>
                  </div>

                  <div className="relative h-[500px]">
                    <img
                      src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&auto=format&fit=crop&q=85"
                      alt="Promo 2"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-12">
                      <Chip
                        label="NEW ARRIVALS"
                        className="bg-blue-600 text-white font-bold mb-4 w-fit"
                      />
                      <Typography variant="h2" className="text-white font-black mb-4">
                        Luxury Stays Await
                      </Typography>
                      <Typography className="text-white/90 text-xl mb-6">
                        Book premium hotels across Africa
                      </Typography>
                      <Button
                        variant="contained"
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold w-fit px-8 py-3 rounded-full"
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                </Carousel>
              </div>
            </motion.div>

            {/* Right Sidebar - Quick Actions */}
            <motion.div variants={fadeInUp} className="md:col-span-3 flex flex-col h-[500px]">
              <div className="h-full bg-gray-200 rounded-2xl p-4 flex flex-col justify-between">
                <div className="flex flex-col space-y-4">
                  <Link
                    to="/contact"
                    className="bg-white p-6 rounded-2xl shadow transition ease-in-out delay-150 hover:scale-105 cursor-pointer block"
                    style={{ textDecoration: "none" }}
                  >
                    <div className="flex flex-col items-center text-center ">
                      <PhoneIcon className="text-orange-600 mb-2" style={{ fontSize: "2.5rem" }} />
                      <Typography
                        className="font-bold text-gray-900 mb-2"
                        style={{ textDecoration: "none" }}
                      >
                        Call to Order
                      </Typography>
                      <Typography
                        className="text-2xl font-bold text-orange-600"
                        style={{ textDecoration: "none" }}
                      >
                        0708-7200-297
                      </Typography>
                    </div>
                  </Link>

                  <Link
                    to={`${merchantUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white p-6 rounded-2xl shadow transition ease-in-out delay-150 hover:scale-105 cursor-pointer block"
                    style={{ textDecoration: "none" }}
                  >
                    <div className="flex flex-col items-center text-center">
                      <StoreIcon className="text-blue-600 mb-2" style={{ fontSize: "2.5rem" }} />
                      <Typography
                        className="font-bold text-gray-900"
                        style={{ textDecoration: "none" }}
                      >
                        Become a Merchant
                      </Typography>
                      <Typography
                        className="text-sm text-gray-600 mt-1"
                        style={{ textDecoration: "none" }}
                      >
                        Start selling today
                      </Typography>
                    </div>
                  </Link>
                </div>

                <Link
                  to="/deals"
                  className="bg-white mt-10 h-full p-6 rounded-2xl shadow transition ease-in-out delay-150 hover:scale-105 cursor-pointer block"
                  style={{ textDecoration: "none" }}
                >
                  <div className="flex flex-col items-center text-center">
                    <LocalOfferIcon
                      className="text-green-600 mb-2"
                      style={{ fontSize: "2.5rem" }}
                    />
                    <Typography
                      className="font-bold text-gray-900"
                      style={{ textDecoration: "none" }}
                    >
                      Today's Deals
                    </Typography>
                    <Typography
                      className="text-sm text-gray-600 mt-1"
                      style={{ textDecoration: "none" }}
                    >
                      Limited time offers
                    </Typography>
                  </div>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ============================================
          INTERACTIVE SERVICE TABS
          ============================================ */}
      <div className="py-24 bg-white">
        <div className="container mx-auto px-8 md:px-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <Typography variant="h2" className="font-black text-gray-900 mb-4">
              Explore Our Services
            </Typography>
            <Typography className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need in one powerful ecosystem
            </Typography>
          </motion.div>

          {/* Service Tab Buttons */}
          <motion.div
            className="flex flex-wrap justify-center gap-4 mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              {
                id: "marketplace",
                icon: <ShoppingCartIcon />,
                label: "Marketplace",
                color: "orange",
              },
              {
                id: "hotels",
                icon: <HotelIcon />,
                label: "Hotels",
                color: "blue",
              },
              {
                id: "restaurants",
                icon: <RestaurantIcon />,
                label: "Dining",
                color: "green",
              },
              {
                id: "realestate",
                icon: <ApartmentIcon />,
                label: "Real Estate",
                color: "purple",
              },
              {
                id: "engineering",
                icon: <BuildIcon />,
                label: "Engineering Services",
                color: "teal",
              },
            ].map((service) => (
              <motion.div key={service.id} variants={scaleIn}>
                <Button
                  onClick={() => setActiveService(service.id)}
                  variant={activeService === service.id ? "contained" : "outlined"}
                  size="large"
                  startIcon={service.icon}
                  sx={{
                    backgroundColor:
                      activeService === service.id
                        ? service.color === "orange"
                          ? "#f97316"
                          : service.color === "blue"
                            ? "#3b82f6"
                            : service.color === "green"
                              ? "#10b981"
                              : service.color === "teal"
                                ? "#0f766e"
                                : "#a855f7"
                        : "transparent",
                    borderColor:
                      service.color === "orange"
                        ? "#f97316"
                        : service.color === "blue"
                          ? "#3b82f6"
                          : service.color === "green"
                            ? "#10b981"
                            : service.color === "teal"
                              ? "#0f766e"
                              : "#a855f7",
                    borderWidth: "2px",
                    color:
                      activeService === service.id
                        ? "white"
                        : service.color === "orange"
                          ? "#ea580c"
                          : service.color === "blue"
                            ? "#2563eb"
                            : service.color === "green"
                              ? "#059669"
                              : service.color === "teal"
                                ? "#0f766e"
                                : "#9333ea",
                    fontWeight: "bold",
                    fontSize: "1.125rem",
                    padding: "16px 32px",
                    borderRadius: "9999px",
                    textTransform: "none",
                    transition: "all 0.3s",
                    "&:hover": {
                      transform: "scale(1.05)",
                      borderWidth: "2px",
                    },
                  }}
                >
                  {service.label}
                </Button>
              </motion.div>
            ))}
          </motion.div>

          {/* Service Content */}
          <AnimatePresence mode="wait">
            {activeService === "marketplace" && (
              <motion.div
                key="marketplace"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-12"
              >
                <div className="text-center mb-12 flex flex-col items-center">
                  <ShoppingCartIcon
                    sx={{
                      fontSize: "3rem",
                      color: "#f97316",
                      marginBottom: "16px",
                    }}
                  />
                  <Typography variant="h3" className="font-black text-gray-900 mb-4">
                    African Marketplace
                  </Typography>
                  <Typography className="text-xl text-gray-700 max-w-2xl mx-auto">
                    Discover authentic African products from thousands of verified merchants
                  </Typography>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    "Electronics",
                    "Fashion",
                    "Home & Living",
                    "Health & Beauty",
                    "Sports",
                    "Books",
                    "Toys & Games",
                    "Groceries",
                  ].map((cat, i) => (
                    <Card
                      key={i}
                      className="rounded-2xl hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer"
                    >
                      <CardContent className="p-6 text-center">
                        <Typography className="font-bold">{cat}</Typography>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {activeService === "hotels" && (
              <motion.div
                key="hotels"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-12"
              >
                <div className="text-center mb-12 flex flex-col items-center">
                  <HotelIcon
                    sx={{
                      fontSize: "3rem",
                      color: "#3b82f6",
                      marginBottom: "16px",
                    }}
                  />
                  <Typography variant="h3" className="font-black text-gray-900 mb-4">
                    Hotels & Apartments
                  </Typography>
                  <Typography className="text-xl text-gray-700 max-w-2xl mx-auto">
                    Premium accommodations across Africa for business and leisure
                  </Typography>
                </div>
                <BookingsHub />
              </motion.div>
            )}

            {activeService === "restaurants" && (
              <motion.div
                key="restaurants"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-12"
              >
                <div className="text-center mb-12 flex flex-col items-center">
                  <RestaurantIcon
                    sx={{
                      fontSize: "3rem",
                      color: "#10b981",
                      marginBottom: "16px",
                    }}
                  />
                  <Typography variant="h3" className="font-black text-gray-900 mb-4">
                    Restaurants & Dining
                  </Typography>
                  <Typography className="text-xl text-gray-700 max-w-2xl mx-auto">
                    Experience Africa's vibrant culinary scene and nightlife
                  </Typography>
                </div>
                <RestaurantAndSpotsHub />
              </motion.div>
            )}

            {activeService === "realestate" && (
              <motion.div
                key="realestate"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-12"
              >
                <div className="text-center">
                  <div className="flex flex-col items-center mb-12">
                    <ApartmentIcon
                      sx={{
                        fontSize: "3rem",
                        color: "#a855f7",
                        marginBottom: "16px",
                      }}
                    />
                    <Typography variant="h3" className="font-black text-gray-900 mb-4">
                      Real Estate & Investments
                    </Typography>
                  </div>
                  <Typography className="text-xl text-gray-700 max-w-2xl mx-auto mb-12">
                    Coming Soon - Premium African property investments
                  </Typography>
                  <div className="grid md:grid-cols-3 gap-8">
                    {[
                      {
                        IconComponent: HomeIcon,
                        title: "Residential",
                        desc: "Homes & apartments",
                      },
                      {
                        IconComponent: BusinessIcon,
                        title: "Commercial",
                        desc: "Office spaces",
                      },
                      {
                        IconComponent: MapIcon,
                        title: "Land",
                        desc: "Development plots",
                      },
                    ].map((item, i) => (
                      <Card key={i} className="rounded-2xl p-8 text-center">
                        <item.IconComponent
                          sx={{
                            fontSize: "3.75rem",
                            color: "#a855f7",
                            marginBottom: "16px",
                          }}
                        />
                        <Typography variant="h5" className="font-bold mb-2">
                          {item.title}
                        </Typography>
                        <Typography className="text-gray-600">{item.desc}</Typography>
                      </Card>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeService === "engineering" && (
              <motion.div
                key="engineering"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="rounded-3xl p-12"
                style={{ background: "linear-gradient(to bottom right, #f0fdfa, #ecfeff)" }}
              >
                <div className="text-center mb-12 flex flex-col items-center">
                  <BuildIcon
                    sx={{
                      fontSize: "3rem",
                      color: "#0f766e",
                      marginBottom: "16px",
                    }}
                  />
                  <Typography variant="h3" className="font-black text-gray-900 mb-4">
                    Engineering Services
                  </Typography>
                  <Typography className="text-xl text-gray-700 max-w-2xl mx-auto mb-8">
                    Find a repair shop near you for your car, generator, or heavy diesel equipment —
                    register your machine and book a service when it's due.
                  </Typography>
                  <Button
                    onClick={() => navigate("/engineering/find-shops")}
                    variant="contained"
                    size="large"
                    startIcon={<GpsFixedIcon />}
                    sx={{
                      backgroundColor: "#0f766e",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "1.125rem",
                      padding: "16px 32px",
                      borderRadius: "9999px",
                      textTransform: "none",
                      "&:hover": { backgroundColor: "#0d9488" },
                    }}
                  >
                    Find Repair Shops Near Me
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: "Automobile", desc: "Cars & light vehicles" },
                    { label: "Generators", desc: "Home & industrial power" },
                    { label: "Diesel & Heavy Equipment", desc: "Commercial machinery" },
                  ].map((cat, i) => (
                    <Card
                      key={i}
                      className="rounded-2xl hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer"
                      onClick={() => navigate("/engineering/find-shops")}
                    >
                      <CardContent className="p-6 text-center">
                        <Typography className="font-bold">{cat.label}</Typography>
                        <Typography className="text-sm text-gray-500 mt-1">{cat.desc}</Typography>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ============================================
          WHITEPAPER / ABOUT SECTION - Modern Cards Layout
          ============================================ */}
      <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white py-32">
        <div className="container mx-auto px-8 md:px-16">
          {/* Header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-20"
          >
            <Chip
              label="Our Story"
              className="bg-orange-500 text-white font-bold mb-6"
              size="large"
            />
            <Typography variant="h2" className="font-black mb-6">
              Building Africa's Digital Future
            </Typography>
            <Typography className="text-xl text-gray-400 max-w-3xl mx-auto">
              Join us in transforming how Africa does business, travel, and trade
            </Typography>
          </motion.div>

          {/* Vision & Mission */}
          <div className="grid md:grid-cols-2 gap-12 mb-20">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <Card
                sx={{
                  background: "linear-gradient(to bottom right, #ea580c, #dc2626)",
                  color: "white",
                  borderRadius: "24px",
                  height: "100%",
                }}
              >
                <CardContent sx={{ padding: "48px" }}>
                  <VisibilityIcon
                    sx={{
                      fontSize: "4rem",
                      marginBottom: "24px",
                      color: "white",
                    }}
                  />
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 900,
                      marginBottom: "24px",
                      color: "white",
                    }}
                  >
                    Our Vision
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "1.125rem",
                      lineHeight: 1.75,
                      opacity: 0.9,
                      color: "white",
                    }}
                  >
                    To become Africa's leading integrated digital ecosystem, empowering millions of
                    businesses and consumers to thrive in the digital economy. We envision a
                    connected continent where commerce knows no boundaries.
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
            >
              <Card
                sx={{
                  background: "linear-gradient(to bottom right, #2563eb, #9333ea)",
                  color: "white",
                  borderRadius: "24px",
                  height: "100%",
                }}
              >
                <CardContent sx={{ padding: "48px" }}>
                  <GpsFixedIcon
                    sx={{
                      fontSize: "4rem",
                      marginBottom: "24px",
                      color: "white",
                    }}
                  />
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 900,
                      marginBottom: "24px",
                      color: "white",
                    }}
                  >
                    Our Mission
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "1.125rem",
                      lineHeight: 1.75,
                      opacity: 0.9,
                      color: "white",
                    }}
                  >
                    To provide world-class digital infrastructure that enables African businesses to
                    reach global markets, while helping consumers access quality products, services,
                    and experiences across the continent.
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Future Services */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mb-20"
          >
            <div className="flex flex-col items-center mb-12">
              <RocketLaunchIcon
                sx={{
                  fontSize: "3rem",
                  color: "#f97316",
                  marginBottom: "16px",
                }}
              />
              <Typography
                variant="h3"
                sx={{ fontWeight: 900, color: "black", textAlign: "center" }}
              >
                Coming Soon
              </Typography>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[
                { IconComponent: FavoriteIcon, label: "Healthcare" },
                {
                  IconComponent: AccountBalanceWalletIcon,
                  label: "Digital Wallet",
                },
                { IconComponent: SchoolIcon, label: "Education" },
                { IconComponent: LocalShippingIcon, label: "Logistics" },
                { IconComponent: HandshakeIcon, label: "B2B Trading" },
                { IconComponent: TrendingUpIcon, label: "Analytics" },
              ].map((service, i) => (
                <motion.div key={i} variants={scaleIn} transition={{ delay: i * 0.1 }}>
                  <Card className="bg-gray-800 border border-orange-500/20 rounded-2xl hover:border-orange-500 transition-all cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <service.IconComponent
                        sx={{
                          fontSize: "2.5rem",
                          color: "#f97316",
                          marginBottom: "12px",
                        }}
                      />
                      <Typography className="font-bold text-white">{service.label}</Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center"
          >
            <Card
              sx={{
                background: "linear-gradient(to right, #ea580c, #dc2626, #db2777)",
                borderRadius: "24px",
                display: "inline-block",
                maxWidth: "800px",
              }}
            >
              <CardContent sx={{ padding: "48px" }}>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 900, color: "white", marginBottom: "16px" }}
                >
                  Ready to Partner With Us?
                </Typography>
                <Typography
                  sx={{
                    color: "rgba(255, 255, 255, 0.9)",
                    marginBottom: "32px",
                    fontSize: "1.125rem",
                  }}
                >
                  Investors and partners are invited to join our journey
                </Typography>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<HandshakeIcon />}
                    sx={{
                      backgroundColor: "white",
                      color: "#ea580c",
                      fontWeight: "bold",
                      padding: "16px 40px",
                      borderRadius: "9999px",
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: "#f3f4f6",
                      },
                    }}
                  >
                    Partner With Us
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<DownloadIcon />}
                    sx={{
                      borderColor: "white",
                      borderWidth: "2px",
                      color: "white",
                      fontWeight: "bold",
                      padding: "16px 40px",
                      borderRadius: "9999px",
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        borderColor: "white",
                        borderWidth: "2px",
                      },
                    }}
                  >
                    Whitepaper
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default ModernLandingPage;
