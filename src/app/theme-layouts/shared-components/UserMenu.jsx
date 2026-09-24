import _ from "@lodash";
import clsx from "clsx";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";

import useAuth from "src/app/auth/useAuth";
import { darken } from "@mui/material/styles";
import Divider from "@mui/material/Divider";

/**
 * The user menu.
 */

function UserMenu({ user }) {
  const { signOut } = useAuth();
  const [userMenu, setUserMenu] = useState(null);
  const userMenuClick = (event) => {
    setUserMenu(event.currentTarget);
  };
  const userMenuClose = () => {
    setUserMenu(null);
  };

  return (
    <>
      <Button
        className="min-h-40 min-w-40 p-0 md:px-16 md:py-6"
        onClick={userMenuClick}
        color="inherit"
      >
        <div className="mx-4 hidden flex-col items-end md:flex">
          <Typography component="span" className="flex font-semibold">
            {user.name ? user.name : user.data.displayName}
          </Typography>
          <Typography
            className=" rounded-full font-semibold py-4 px-4  text-11 capitalize"
            color="text.secondary"
          >
            {user.role?.toString()}
            {(!user.role || (Array.isArray(user.role) && user.role.length === 0)) && "Guest"}
          </Typography>
        </div>

        {user.data.photoURL ? (
          <Avatar
            sx={{
              background: (theme) => theme.palette.background.default,
              color: (theme) => theme.palette.text.secondary,
            }}
            className="md:mx-4"
            alt="user photo"
            src={user.data.photoURL}
          />
        ) : (
          <Avatar
            sx={{
              background: (theme) => darken(theme.palette.background.default, 0.05),
              color: (theme) => theme.palette.text.secondary,
            }}
            className="md:mx-4"
          >
            {user?.name ? user?.name?.[0] : user?.data?.displayName?.[0]}
          </Avatar>
        )}
      </Button>

      <Popover
        open={Boolean(userMenu)}
        anchorEl={userMenu}
        onClose={userMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        classes={{
          paper: "py-8",
        }}
      >
        {!user.role || user.role.length === 0 ? (
          <>
            <MenuItem component={Link} to="/sign-in" role="button">
              <ListItemIcon className="min-w-40">
                <FuseSvgIcon>heroicons-outline:lock-closed</FuseSvgIcon>
              </ListItemIcon>
              <ListItemText primary="Sign In" />
            </MenuItem>
            <MenuItem component={Link} to="/sign-up" role="button">
              <ListItemIcon className="min-w-40">
                <FuseSvgIcon>heroicons-outline:user-add </FuseSvgIcon>
              </ListItemIcon>
              <ListItemText primary="Sign up" />
            </MenuItem>
          </>
        ) : (
          <>
            <MenuItem component={Link} to="/user/profile" onClick={userMenuClose} role="button">
              <ListItemIcon className="min-w-40">
                <FuseSvgIcon>heroicons-outline:user-circle</FuseSvgIcon>
              </ListItemIcon>
              <ListItemText primary="My Profile" />
            </MenuItem>
            <MenuItem
              component={Link}
              to="/merchants/mailbox"
              onClick={userMenuClose}
              role="button"
            >
              <ListItemIcon className="min-w-40">
                <FuseSvgIcon>heroicons-outline:mail-open</FuseSvgIcon>
              </ListItemIcon>
              <ListItemText primary="Inbox" />
            </MenuItem>
            {/* /realestate/my-inspection-schedules */}
            <MenuItem
              component={Link}
              to="/realestate/my-inspection-schedules"
              onClick={userMenuClose}
              role="button"
            >
              <ListItemIcon className="min-w-40">
                <FuseSvgIcon>heroicons-outline:map</FuseSvgIcon>
              </ListItemIcon>
              <ListItemText primary="Estate Resources" />
            </MenuItem>
            <MenuItem
              component={Link}
              to="/bookings/my-reservations"
              onClick={userMenuClose}
              role="button"
            >
              <ListItemIcon className="min-w-40">
                <FuseSvgIcon>heroicons-outline:map</FuseSvgIcon>
              </ListItemIcon>
              <ListItemText primary="My Trips" />
            </MenuItem>

            {/* Added Phase E6c (2026-09-24) — Engineering Services machines hub */}
            <MenuItem
              component={Link}
              to="/engineering/my-machines"
              onClick={userMenuClose}
              role="button"
            >
              <ListItemIcon className="min-w-40">
                <FuseSvgIcon>heroicons-outline:cog</FuseSvgIcon>
              </ListItemIcon>
              <ListItemText primary="My Machines" />
            </MenuItem>

            {/* Added Phase E6d (2026-09-24) — Engineering Services bookings list/detail */}
            <MenuItem
              component={Link}
              to="/engineering/my-bookings"
              onClick={userMenuClose}
              role="button"
            >
              <ListItemIcon className="min-w-40">
                <FuseSvgIcon>heroicons-outline:calendar</FuseSvgIcon>
              </ListItemIcon>
              <ListItemText primary="My Service Bookings" />
            </MenuItem>

            <MenuItem
              component={Link}
              to="/marketplace/user/orders"
              onClick={userMenuClose}
              role="button"
            >
              <ListItemIcon className="min-w-40">
                <FuseSvgIcon>heroicons-outline:shopping-bag</FuseSvgIcon>
              </ListItemIcon>
              <ListItemText primary="Orders" />
            </MenuItem>

            <MenuItem
              component={Link}
              to="/foodmarts/user/food-orders"
              onClick={userMenuClose}
              role="button"
            >
              <ListItemIcon className="min-w-40">
                <FuseSvgIcon>heroicons-outline:shopping-cart</FuseSvgIcon>
              </ListItemIcon>
              <ListItemText primary="Food Orders" />
            </MenuItem>

            <Divider variant="middle" />

            {/* ── Finance Section ── */}
            <div className="px-16 pt-8 pb-4">
              <Typography className="text-10 font-semibold uppercase tracking-widest" color="text.disabled">
                Finance
              </Typography>
            </div>

            <MenuItem
              component={Link}
              to="/africanshops/finance-v2/overview"
              onClick={userMenuClose}
              role="button"
            >
              <ListItemIcon className="min-w-40">
                <FuseSvgIcon>heroicons-outline:home</FuseSvgIcon>
              </ListItemIcon>
              <ListItemText primary="Finance Overview" />
            </MenuItem>

            <MenuItem
              component={Link}
              to="/africanshops/finance-v2/transactions"
              onClick={userMenuClose}
              role="button"
            >
              <ListItemIcon className="min-w-40">
                <FuseSvgIcon>heroicons-outline:clipboard-document-list</FuseSvgIcon>
              </ListItemIcon>
              <ListItemText primary="Transactions" />
            </MenuItem>

            <MenuItem
              component={Link}
              to="/africanshops/finance-v2/transfer"
              onClick={userMenuClose}
              role="button"
            >
              <ListItemIcon className="min-w-40">
                <FuseSvgIcon>heroicons-outline:arrows-right-left</FuseSvgIcon>
              </ListItemIcon>
              <ListItemText primary="Transfer Money" />
            </MenuItem>

            <MenuItem
              component={Link}
              to="/africanshops/finance-v2/transfer-external"
              onClick={userMenuClose}
              role="button"
            >
              <ListItemIcon className="min-w-40">
                <FuseSvgIcon>heroicons-outline:paper-airplane</FuseSvgIcon>
              </ListItemIcon>
              <ListItemText primary="Send to Bank" />
            </MenuItem>

            <MenuItem
              component={Link}
              to="/africanshops/finance-v2/withdrawal"
              onClick={userMenuClose}
              role="button"
            >
              <ListItemIcon className="min-w-40">
                <FuseSvgIcon>heroicons-outline:arrow-up-tray</FuseSvgIcon>
              </ListItemIcon>
              <ListItemText primary="Withdraw" />
            </MenuItem>

            <MenuItem
              component={Link}
              to="/africanshops/finance-v2/savings"
              onClick={userMenuClose}
              role="button"
            >
              <ListItemIcon className="min-w-40">
                <FuseSvgIcon>heroicons-outline:banknotes</FuseSvgIcon>
              </ListItemIcon>
              <ListItemText primary="Savings" />
            </MenuItem>

            <MenuItem
              component={Link}
              to="/africanshops/finance-v2/wallets"
              onClick={userMenuClose}
              role="button"
            >
              <ListItemIcon className="min-w-40">
                <FuseSvgIcon>heroicons-outline:wallet</FuseSvgIcon>
              </ListItemIcon>
              <ListItemText primary="Multi-Currency Wallets" />
            </MenuItem>

            <MenuItem
              component={Link}
              to="/africanshops/finance-v2/cards"
              onClick={userMenuClose}
              role="button"
            >
              <ListItemIcon className="min-w-40">
                <FuseSvgIcon>heroicons-outline:credit-card</FuseSvgIcon>
              </ListItemIcon>
              <ListItemText primary="Virtual Card" />
            </MenuItem>

            <Divider variant="middle" />


            <MenuItem
              component={Link}
              to="/africanshops/settings"
              onClick={userMenuClose}
              role="button"
            >
              <ListItemIcon className="min-w-40">
                <FuseSvgIcon>heroicons-outline:cog</FuseSvgIcon>
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </MenuItem>

            <MenuItem
              component={Link}
              to="/account/kyc"
              onClick={userMenuClose}
              role="button"
            >
              <ListItemIcon className="min-w-40">
                <FuseSvgIcon>heroicons-outline:identification</FuseSvgIcon>
              </ListItemIcon>
              <ListItemText primary="Identity & KYC" />
            </MenuItem>

            <Divider variant="middle" />
            <MenuItem
              onClick={() => {
                signOut();
              }}
            >
              <ListItemIcon className="min-w-40">
                <FuseSvgIcon>heroicons-outline:logout</FuseSvgIcon>
              </ListItemIcon>
              <ListItemText primary="Sign out" />
            </MenuItem>
          </>
        )}
      </Popover>
    </>
  );
}

export default UserMenu;
