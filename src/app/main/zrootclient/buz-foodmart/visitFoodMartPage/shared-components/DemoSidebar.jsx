import { useState } from "react";
import { Typography, Button, Chip, Divider, IconButton, Avatar } from "@mui/material";
import {
  LocationOn,
  AccessTime,
  Star,
  Share,
  Restaurant,
  Directions,
} from "@mui/icons-material";
import { buildVenueProfile, shareVenue } from "../venueProfile";

/**
 * Venue profile sidebar. Shows ONLY what the venue's own record contains (see venueProfile.js): no placeholder rating,
 * follower counts, contact details or opening hours. Missing fields are simply not shown.
 */
function DemoSidebar(props) {
  const { martMenu } = props;
  const [shareNote, setShareNote] = useState(null);
  const profile = buildVenueProfile(martMenu);

  const handleShare = async () => {
    const result = await shareVenue({ title: profile.name || "Restaurant", url: window.location.href });
    setShareNote(result === "copied" ? "Link copied" : null);
  };

  return (
    <div
      className="flex flex-col h-screen px-6 py-6 overflow-y-auto"
      style={{
        background:
          "linear-gradient(160deg, #7c2d12 0%, #9a3412 18%, #c2410c 38%, #ea580c 55%, #f97316 70%, #fed7aa 85%, #fff7ed 100%)",
      }}
    >
      <div className="flex flex-col flex-1 bg-white rounded-2xl shadow-xl overflow-visible mt-14 min-h-0">
        {/* Header Section with Cover */}
        <div className="relative h-32 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-t-2xl flex-shrink-0">
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
            <Avatar
              src={profile.logo || undefined}
              alt={profile.name || ""}
              sx={{
                width: 120,
                height: 120,
                border: "4px solid white",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            />
          </div>
        </div>

        {/* Profile Info Section */}
        <div className="flex flex-col flex-1 gap-4 pt-20 px-6 pb-6 min-h-0">
          {/* Identity */}
          <div className="text-center">
            {profile.name && (
              <Typography variant="h5" className="font-bold text-gray-900 mb-1">
                {profile.name}
              </Typography>
            )}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Chip
                icon={<Restaurant fontSize="small" />}
                label={profile.venueLabel}
                size="small"
                className="bg-orange-100 text-orange-700"
                data-testid="venue-kind"
              />
              {profile.extraCategory && (
                <Chip label={profile.extraCategory} size="small" variant="outlined" data-testid="venue-category" />
              )}
            </div>

            {/* Rating: only when real reviews exist */}
            <div className="flex items-center justify-center gap-3 mt-3" data-testid="venue-rating">
              {profile.rating ? (
                <div className="flex items-center gap-1">
                  <Star className="text-yellow-500" fontSize="small" />
                  <Typography variant="body2" className="font-semibold">
                    {profile.rating.value}
                  </Typography>
                  <Typography variant="caption" className="text-gray-500">
                    ({profile.rating.count} {profile.rating.count === 1 ? "review" : "reviews"})
                  </Typography>
                </div>
              ) : (
                <Typography variant="caption" className="text-gray-500">
                  No reviews yet
                </Typography>
              )}
              {profile.listedSince && (
                <Typography variant="caption" className="text-gray-500">
                  • On AfricanShops since {profile.listedSince}
                </Typography>
              )}
            </div>
          </div>

          {/* Actions (each one does something real) */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {profile.directions && (
              <Button
                variant="outlined"
                startIcon={<Directions />}
                href={profile.directions}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ borderColor: "#ea580c", color: "#ea580c" }}
              >
                Directions
              </Button>
            )}
            <IconButton
              onClick={handleShare}
              aria-label="Share this venue"
              sx={{ border: "1px solid #e5e7eb", "&:hover": { backgroundColor: "#f3f4f6" } }}
            >
              <Share />
            </IconButton>
            {shareNote && (
              <Typography variant="caption" className="text-green-700" role="status">
                {shareNote}
              </Typography>
            )}
          </div>

          {/* About */}
          {profile.description && (
            <div>
              <Divider className="mb-3" />
              <Typography variant="body2" className="text-gray-600 leading-relaxed">
                {profile.description}
              </Typography>
            </div>
          )}

          {/* Hours & contact: only what is on file */}
          {(profile.hours || profile.address) && (
            <div className="space-y-3">
              <Divider />
              {profile.hours && (
                <div className="flex items-start gap-3" data-testid="venue-hours">
                  <AccessTime className="text-orange-600 mt-1" fontSize="small" />
                  <div className="flex-1">
                    <Typography variant="body2" className="font-semibold text-gray-900">
                      Opening Hours
                    </Typography>
                    <Typography variant="body2" className="text-green-600 font-medium">
                      {profile.hours}
                    </Typography>
                  </div>
                </div>
              )}
              {profile.address && (
                <div className="space-y-2">
                  <Typography variant="caption" className="text-gray-500 font-semibold block">
                    CONTACT
                  </Typography>
                  {profile.address && (
                    <div className="flex items-start gap-3">
                      <LocationOn className="text-orange-600 mt-1" fontSize="small" />
                      <Typography variant="body2" className="text-gray-600 flex-1">
                        {profile.address}
                      </Typography>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DemoSidebar;
