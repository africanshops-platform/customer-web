import Button from "@mui/material/Button";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { Link } from "react-router-dom";
import { changeLanguage, selectCurrentLanguage, selectLanguages } from "app/store/i18nSlice";
import { useAppDispatch, useAppSelector } from "app/store/hooks";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import NavLinkAdapter from "@fuse/core/NavLinkAdapter";

/**
 * The language switcher.
 */
function LanHubSwitcher() {
  const currentLanguage = useAppSelector(selectCurrentLanguage);
  const languages = useAppSelector(selectLanguages);
  const [menu, setMenu] = useState(null);
  const dispatch = useAppDispatch();
  const langMenuClick = (event) => {
    setMenu(event.currentTarget);
  };
  const langMenuClose = () => {
    setMenu(null);
  };

  function handleLanguageChange(lng) {
    dispatch(changeLanguage(lng.id));
    langMenuClose();
  }

  return (
    <>
      <Button className="h-40 w-64" onClick={langMenuClick}>
        {/* <img
          className="mx-4 min-w-20"
          src={`assets/images/flags/${currentLanguage.flag}.svg`}
          alt={currentLanguage.title}
        /> */}

        <Typography className="mx-4 font-semibold text-sm uppercase" color="text.secondary">
          services
        </Typography>
      </Button>

      <Popover
        open={Boolean(menu)}
        anchorEl={menu}
        onClose={langMenuClose}
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
        <MenuItem component={NavLinkAdapter} to="/bookings/listings">
          <ListItemIcon className="min-w-40">
            <FuseSvgIcon>heroicons-outline:book-open</FuseSvgIcon>
          </ListItemIcon>
          <ListItemText primary={`Hotesl & Suites`} />
        </MenuItem>

        <MenuItem component={NavLinkAdapter} to="/realestate/listings">
          <ListItemIcon className="min-w-40">
            <FuseSvgIcon>heroicons-outline:briefcase</FuseSvgIcon>
          </ListItemIcon>
          <ListItemText primary={`Real Estate`} />
        </MenuItem>
        <MenuItem component={NavLinkAdapter} to="/marketplace/shop">
          <ListItemIcon className="min-w-40">
            <FuseSvgIcon>heroicons-outline:home</FuseSvgIcon>
          </ListItemIcon>
          <ListItemText primary={`marketplace`} />
        </MenuItem>

        <MenuItem component={NavLinkAdapter} to="/foodmarts/listings">
          <ListItemIcon className="min-w-40">
            <FuseSvgIcon>heroicons-outline:briefcase</FuseSvgIcon>
          </ListItemIcon>
          <ListItemText primary={`Restaurants Clubs & Spots`} />
        </MenuItem>

        {/* Added Phase E6c (2026-09-24) — was only reachable via the landing
            page's service tab strip; founder flagged it missing from here,
            the same dropdown Hotels/Real Estate/Marketplace/Dining live in. */}
        <MenuItem component={NavLinkAdapter} to="/engineering/find-shops">
          <ListItemIcon className="min-w-40">
            <FuseSvgIcon>heroicons-outline:cog</FuseSvgIcon>
          </ListItemIcon>
          <ListItemText primary={`Engineering Services`} />
        </MenuItem>
      </Popover>
    </>
  );
}

export default LanHubSwitcher;
