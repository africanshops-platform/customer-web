import { useAppSelector } from "app/store/hooks";
import { motion } from "framer-motion";
import { selectUser } from "src/app/auth/user/store/userSlice";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import NavLinkAdapter from "@fuse/core/NavLinkAdapter";
import {
  Person,
  ShoppingBag,
  Restaurant,
  BeachAccess,
  ChevronRight,
  ReportProblemOutlined,
} from "@mui/icons-material";

/**
 * UserAccountLeads Component
 * Beautiful user account navigation with orange gradient branding
 */
const UserAccountLeads = () => {
  const user = useAppSelector(selectUser);

  const menuItems = [
    {
      id: "account",
      label: "My Account",
      icon: Person,
      to: "#",
    },
    {
      id: "orders",
      label: "Orders",
      icon: ShoppingBag,
      to: "/marketplace/user/orders",
    },
    {
      id: "food-orders",
      label: "Food Orders",
      icon: Restaurant,
      to: "/foodmarts/user/food-orders",
    },
    {
      id: "trips",
      label: "Trips",
      icon: BeachAccess,
      to: "/bookings/my-reservations",
    },
    {
      id: "disputes",
      label: "My Disputes",
      icon: ReportProblemOutlined,
      to: "/disputes/user/my-disputes",
    },
  ];

  return (
    <motion.aside initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
      {/* User Profile Card */}
      <div
        className="rounded-2xl p-6 mb-6 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
        }}
      >
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute w-40 h-40 rounded-full -top-10 -right-10"
            style={{ background: "rgba(255, 255, 255, 0.3)" }}
          />
          <div
            className="absolute w-32 h-32 rounded-full -bottom-8 -left-8"
            style={{ background: "rgba(255, 255, 255, 0.2)" }}
          />
        </div>

        {/* User Info */}
        <div className="relative z-10 flex items-center gap-4">
          {user.data.photoURL ? (
            <Avatar
              alt="user photo"
              src={user.data.photoURL}
              sx={{
                width: 56,
                height: 56,
                border: "3px solid rgba(255, 255, 255, 0.3)",
              }}
            />
          ) : (
            <Avatar
              sx={{
                width: 56,
                height: 56,
                background: "rgba(255, 255, 255, 0.2)",
                color: "white",
                fontSize: "1.5rem",
                fontWeight: "bold",
                border: "3px solid rgba(255, 255, 255, 0.3)",
              }}
            >
              {user?.name?.[0] || user?.data?.displayName?.[0] || "U"}
            </Avatar>
          )}
          <div className="flex-1">
            <Typography variant="h6" className="font-bold text-white mb-1 leading-tight">
              {user.name || user.data.displayName || "Guest User"}
            </Typography>
            <Typography variant="caption" className="text-white/80">
              {user.data.email || ""}
            </Typography>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="space-y-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Typography
                component={item.to === "#" ? "div" : NavLinkAdapter}
                to={item.to !== "#" ? item.to : undefined}
                className="flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer group transition-all bg-white hover:bg-orange-50 border border-transparent hover:border-orange-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-orange-50 group-hover:bg-orange-100 transition-colors">
                    <Icon
                      sx={{
                        fontSize: "1.25rem",
                        color: "#ea580c",
                      }}
                    />
                  </div>
                  <span className="font-medium text-gray-700 group-hover:text-gray-900">
                    {item.label}
                  </span>
                </div>
                <ChevronRight
                  sx={{
                    fontSize: "1.25rem",
                    color: "#d1d5db",
                  }}
                  className="group-hover:text-orange-500 group-hover:translate-x-1 transition-all"
                />
              </Typography>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 grid grid-cols-3 gap-3"
      >
        <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-3 text-center">
          <Typography
            variant="h6"
            className="font-bold mb-1"
            style={{
              background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            0
          </Typography>
          <Typography variant="caption" className="text-gray-600 text-xs">
            Orders
          </Typography>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-3 text-center">
          <Typography
            variant="h6"
            className="font-bold mb-1"
            style={{
              background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            0
          </Typography>
          <Typography variant="caption" className="text-gray-600 text-xs">
            Trips
          </Typography>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-3 text-center">
          <Typography
            variant="h6"
            className="font-bold mb-1"
            style={{
              background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            0
          </Typography>
          <Typography variant="caption" className="text-gray-600 text-xs">
            Reviews
          </Typography>
        </div>
      </motion.div>
    </motion.aside>
  );
};

export default UserAccountLeads;
