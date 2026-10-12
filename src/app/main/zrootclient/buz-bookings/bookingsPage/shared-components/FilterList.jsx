import { useState, useEffect, useRef } from "react";
import {
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Slider,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  InputAdornment,
  IconButton,
  Collapse,
  Divider,
  Box,
} from "@mui/material";
import {
  Search,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Clear,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import useSellerCountries from "app/configs/data/server-calls/countries/useCountries";
import { getDistrictsByLgaId, getLgasByStateId, getStateByCountryId } from "app/configs/data/client/RepositoryClient";
import { geoCenter } from "src/app/main/zrootclient/shared-near/nearby";

const PROPERTY_TYPES = [
  "Apartment",
  "House",
  "Villa",
  "Condo",
  "Townhouse",
  "Hotel",
  "Resort",
  "Guesthouse",
];

const AMENITIES = [
  { id: "wifi", label: "WiFi", icon: "📶" },
  { id: "air-conditioning", label: "Air Conditioning", icon: "❄️" },
  { id: "dishwasher", label: "Dishwasher", icon: "🍽️" },
  { id: "bedlinens", label: "Bed Linens", icon: "🛏️" },
  { id: "microwave", label: "Microwave", icon: "🔲" },
  { id: "tv-cable", label: "TV Cable", icon: "📺" },
  { id: "lawn", label: "Lawn", icon: "🌿" },
  { id: "refrigerator", label: "Refrigerator", icon: "🧊" },
  { id: "laundry", label: "Laundry", icon: "🧺" },
  { id: "window-coverings", label: "Window Coverings", icon: "🪟" },
  { id: "dryer", label: "Dryer", icon: "🌬️" },
  { id: "washer", label: "Washer", icon: "🧼" },
  { id: "outdoor-shower", label: "Outdoor Shower", icon: "🚿" },
  { id: "swimming-pool", label: "Swimming Pool", icon: "🏊" },
  { id: "sauna", label: "Sauna", icon: "🧖" },
];

/**
 * FilterList Component
 * A comprehensive filter panel for property listings with cascading location filters,
 * price range, room counts, and amenities
 */
function FilterList({ onFilterChange, initialFilters = {} }) {
  const { data: COUNTRIES } = useSellerCountries();

  // Use ref to store the latest onFilterChange callback
  const onFilterChangeRef = useRef(onFilterChange);

  // Update ref when onFilterChange changes
  useEffect(() => {
    onFilterChangeRef.current = onFilterChange;
  }, [onFilterChange]);

  // Filter state
  const [keyword, setKeyword] = useState(initialFilters.keyword || "");
  const [propertyType, setPropertyType] = useState(initialFilters.propertyType || "");
  const [country, setCountry] = useState(initialFilters.country || "");
  const [state, setState] = useState(initialFilters.state || "");
  const [lga, setLga] = useState(initialFilters.lga || "");
  const [district, setDistrict] = useState(initialFilters.district || "");
  const [priceRange, setPriceRange] = useState(initialFilters.priceRange || [0, 1000000]);
  const [roomCount, setRoomCount] = useState(initialFilters.roomCount || "");
  const [bathroomCount, setBathroomCount] = useState(initialFilters.bathroomCount || "");
  const [selectedAmenities, setSelectedAmenities] = useState(initialFilters.amenities || []);

  // UI state
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  const [availableStates, setAvailableStates] = useState([]);
  const [availableLgas, setAvailableLgas] = useState([]);
  const [availableDistricts, setAvailableDistricts] = useState([]);

  // Update available locations based on selections
  useEffect(() => {
    if (country) {
      findStatesByCountry(country);
    } else {
      setAvailableStates([]);
    }
  }, [country]);

  useEffect(() => {
    if (state) {
      getLgasFromState(state);
    } else {
      setAvailableLgas([]);
    }
  }, [state]);

  // Districts of the chosen LGA (founder 2026-10-13: Country > State > LGA > District is the location filter for near-me).
  useEffect(() => {
    let cancelled = false;
    setDistrict("");
    if (!lga) {
      setAvailableDistricts([]);
      return undefined;
    }
    getDistrictsByLgaId(lga)
      .then((res) => {
        if (!cancelled) setAvailableDistricts(res?.data?.districts || []);
      })
      .catch(() => {
        if (!cancelled) setAvailableDistricts([]);
      });
    return () => {
      cancelled = true;
    };
  }, [lga]);

  // Emit filter changes to parent component with debounce for keyword
  useEffect(() => {
    // Debounce keyword search to prevent excessive API calls
    const timeoutId = setTimeout(
      () => {
        if (onFilterChangeRef.current) {
          // The most specific chosen region that has a centre point; the page uses it to recentre near-me search.
          const picks = [
            ["district", availableDistricts.find((d) => d.id === district)],
            ["lga", availableLgas.find((l) => l.id === lga)],
            ["state", availableStates.find((st) => st.id === state)],
            ["country", (COUNTRIES?.data?.countries || []).find((c) => c.id === country)],
          ];
          let regionCenter = null;
          for (const [level, item] of picks) {
            const point = geoCenter(item);
            if (item && point) {
              regionCenter = { point, level, label: item.name };
              break;
            }
          }
          const filters = {
            regionCenter,
            keyword,
            propertyType,
            country,
            state,
            lga,
            district,
            priceRange,
            roomCount,
            bathroomCount,
            amenities: selectedAmenities,
          };
          onFilterChangeRef.current(filters);
        }
      },
      keyword ? 500 : 0,
    ); // 500ms debounce for keyword, immediate for others

    return () => clearTimeout(timeoutId);
  }, [
    keyword,
    propertyType,
    country,
    state,
    lga,
    district,
    availableDistricts,
    availableLgas,
    availableStates,
    COUNTRIES,
    priceRange,
    roomCount,
    bathroomCount,
    selectedAmenities,
  ]);

  //**Get STates from Country_ID data */
  const [statesloading, setStatesLoading] = useState(false);
  async function findStatesByCountry(countryId) {
    setStatesLoading(true);
    const stateResponseData = await getStateByCountryId(countryId);
    if (stateResponseData) {
      setAvailableStates(stateResponseData?.data?.states || []);
      setState("");
      setLga("");
      setDistrict("");
      setStatesLoading(false);
      setTimeout(
        function () {
          setStatesLoading(false);
        }.bind(this),
        250,
      );
    }
  }

  //**Get L.G.As from state_ID data */
  const [loading, setLoading] = useState(false);
  async function getLgasFromState(sid) {
    setLoading(true);
    const responseData = await getLgasByStateId(sid);

    if (responseData) {
      setAvailableLgas(responseData?.data?.lgas || []);
      setLga("");
      setDistrict("");
      setLoading(false);
      setTimeout(
        function () {
          setLoading(false);
        }.bind(this),
        250,
      );
    }
  }

  // Handle amenity toggle
  const handleAmenityToggle = (amenityId) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId) ? prev.filter((id) => id !== amenityId) : [...prev, amenityId],
    );
  };

  // Clear all filters
  const handleClearFilters = () => {
    setKeyword("");
    setPropertyType("");
    setCountry("");
    setState("");
    setLga("");
    setDistrict("");
    setPriceRange([0, 1000000]);
    setRoomCount("");
    setBathroomCount("");
    setSelectedAmenities([]);
  };

  // Format price display
  const formatPrice = (value) => {
    return `NGN ${value.toLocaleString()}`;
  };

  return (
    <div
      className="rounded-2xl shadow-lg p-6 max-w-md mx-auto lg:max-w-xs overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #fff5f0 50%, #ffedd5 100%)",
      }}
    >
      {/* Header with Gradient */}
      <div
        className="flex items-center gap-3 mb-6 p-4 rounded-xl -mx-6 -mt-6 mb-6"
        style={{
          background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
          boxShadow: "0 4px 15px rgba(249, 115, 22, 0.3)",
        }}
      >
        <FilterListIcon sx={{ color: "white", fontSize: "1.75rem" }} />
        <Typography variant="h6" sx={{ fontWeight: 700, color: "white", fontSize: "1.25rem" }}>
          Filter Properties
        </Typography>
      </div>

      <div
        className="space-y-4 overflow-y-auto overflow-x-hidden"
        style={{ maxHeight: "calc(100% - 80px)" }}
      >
        {/* Keyword Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search by keyword..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          sx={{
            backgroundColor: "white",
            borderRadius: "8px",
            "& .MuiOutlinedInput-root": {
              "&:hover fieldset": {
                borderColor: "#f97316",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#ea580c",
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search className="text-orange-500" fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: keyword && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setKeyword("")}>
                  <Clear fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Location Section */}
        <Typography variant="subtitle2" className="font-medium text-gray-700 pt-2">
          Location
        </Typography>

        {/* Country */}
        <FormControl
          fullWidth
          size="small"
          sx={{
            backgroundColor: "white",
            borderRadius: "8px",
            "& .MuiOutlinedInput-root": {
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#f97316",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#ea580c",
              },
            },
          }}
        >
          <InputLabel id="country-label">Country</InputLabel>
          <Select
            labelId="country-label"
            value={country}
            label="Country"
            onChange={(e) => setCountry(e.target.value)}
          >
            <MenuItem value="">
              <em>All Countries</em>
            </MenuItem>
            {COUNTRIES?.data?.countries?.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* State */}
        <FormControl
          fullWidth
          size="small"
          disabled={!country}
          sx={{
            backgroundColor: "white",
            borderRadius: "8px",
            "& .MuiOutlinedInput-root": {
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#f97316",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#ea580c",
              },
            },
          }}
        >
          <InputLabel id="state-label">State</InputLabel>
          <Select
            labelId="state-label"
            value={state}
            label="State"
            onChange={(e) => setState(e.target.value)}
          >
            <MenuItem value="">
              <em>All States</em>
            </MenuItem>
            {statesloading && <p className="text-[12px]">loading...</p>}
            {availableStates?.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* LGA */}
        <FormControl
          fullWidth
          size="small"
          disabled={!state}
          sx={{
            backgroundColor: "white",
            borderRadius: "8px",
            "& .MuiOutlinedInput-root": {
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#f97316",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#ea580c",
              },
            },
          }}
        >
          <InputLabel id="lga-label">LGA</InputLabel>
          <Select
            labelId="lga-label"
            value={lga}
            label="LGA"
            onChange={(e) => setLga(e.target.value)}
          >
            <MenuItem value="">
              <em>All LGAs</em>
            </MenuItem>
            {loading && <p className="text-[12px]">loading...</p>}
            {availableLgas?.map((l) => (
              <MenuItem key={l.id} value={l.id}>
                {l.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* District */}
        <FormControl
          fullWidth
          size="small"
          disabled={!lga}
          sx={{
            backgroundColor: "white",
            borderRadius: "8px",
            "& .MuiOutlinedInput-root": {
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#f97316" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#ea580c" },
            },
          }}
        >
          <InputLabel id="district-label">District</InputLabel>
          <Select
            labelId="district-label"
            value={district}
            label="District"
            onChange={(e) => setDistrict(e.target.value)}
          >
            <MenuItem value="">
              <em>All Districts</em>
            </MenuItem>
            {availableDistricts.map((d) => (
              <MenuItem key={d.id} value={d.id}>
                {d.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Divider className="my-4" />

        {/* Property Type */}
        <FormControl
          fullWidth
          size="small"
          sx={{
            backgroundColor: "white",
            borderRadius: "8px",
            "& .MuiOutlinedInput-root": {
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#f97316",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#ea580c",
              },
            },
          }}
        >
          <InputLabel id="property-type-label">Property Type</InputLabel>
          <Select
            labelId="property-type-label"
            value={propertyType}
            label="Property Type"
            onChange={(e) => setPropertyType(e.target.value)}
          >
            <MenuItem value="">
              <em>All Types</em>
            </MenuItem>
            {PROPERTY_TYPES.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Price Range */}
        <div className="pt-2">
          <Typography variant="subtitle2" className="font-medium text-gray-700 mb-2">
            Price Range
          </Typography>
          <Box className="px-2">
            <Slider
              value={priceRange}
              onChange={(e, newValue) => setPriceRange(newValue)}
              valueLabelDisplay="auto"
              valueLabelFormat={formatPrice}
              min={0}
              max={1000000}
              step={100}
              sx={{
                color: "#ea580c",
                "& .MuiSlider-thumb": {
                  "&:hover, &.Mui-focusVisible": {
                    boxShadow: "0 0 0 8px rgba(234, 88, 12, 0.16)",
                  },
                },
              }}
            />
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>{formatPrice(priceRange[0])}</span>
              <span>{formatPrice(priceRange[1])}</span>
            </div>
          </Box>
        </div>

        {/* Room Count */}
        <FormControl
          fullWidth
          size="small"
          sx={{
            backgroundColor: "white",
            borderRadius: "8px",
            "& .MuiOutlinedInput-root": {
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#f97316",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#ea580c",
              },
            },
          }}
        >
          <InputLabel id="room-count-label">Bedrooms</InputLabel>
          <Select
            labelId="room-count-label"
            value={roomCount}
            label="Bedrooms"
            onChange={(e) => setRoomCount(e.target.value)}
          >
            <MenuItem value="">
              <em>Any</em>
            </MenuItem>
            {[1, 2, 3, 4, 5, "6+"].map((count) => (
              <MenuItem key={count} value={count}>
                {count} {count === "6+" ? "Bedrooms" : count === 1 ? "Bedroom" : "Bedrooms"}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Bathroom Count */}
        <FormControl
          fullWidth
          size="small"
          sx={{
            backgroundColor: "white",
            borderRadius: "8px",
            "& .MuiOutlinedInput-root": {
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#f97316",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#ea580c",
              },
            },
          }}
        >
          <InputLabel id="bathroom-count-label">Bathrooms</InputLabel>
          <Select
            labelId="bathroom-count-label"
            value={bathroomCount}
            label="Bathrooms"
            onChange={(e) => setBathroomCount(e.target.value)}
          >
            <MenuItem value="">
              <em>Any</em>
            </MenuItem>
            {[1, 2, 3, 4, "5+"].map((count) => (
              <MenuItem key={count} value={count}>
                {count} {count === "5+" ? "Bathrooms" : count === 1 ? "Bathroom" : "Bathrooms"}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Divider className="my-4" />

        {/* Advanced Features */}
        <div>
          <button
            onClick={() => setShowAdvancedFeatures(!showAdvancedFeatures)}
            className="flex items-center justify-between w-full text-left text-orange-600 hover:text-orange-700 font-medium py-2"
          >
            <span className="text-sm">Advanced Features</span>
            {showAdvancedFeatures ? (
              <KeyboardArrowUp fontSize="small" />
            ) : (
              <KeyboardArrowDown fontSize="small" />
            )}
          </button>

          <Collapse in={showAdvancedFeatures}>
            <FormGroup className="max-h-64 overflow-y-auto mt-2 space-y-1">
              {AMENITIES.map((amenity) => (
                <FormControlLabel
                  key={amenity.id}
                  control={
                    <Checkbox
                      checked={selectedAmenities.includes(amenity.id)}
                      onChange={() => handleAmenityToggle(amenity.id)}
                      size="small"
                      sx={{
                        color: "#9ca3af",
                        "&.Mui-checked": {
                          color: "#ea580c",
                        },
                      }}
                    />
                  }
                  label={
                    <span className="text-sm text-gray-700">
                      {amenity.icon} {amenity.label}
                    </span>
                  }
                />
              ))}
            </FormGroup>
          </Collapse>
        </div>

        {/* Clear Filters Button */}
        <Button
          fullWidth
          variant="outlined"
          onClick={handleClearFilters}
          className="mt-6 border-orange-600 text-orange-600 hover:bg-orange-50 hover:border-orange-700"
          sx={{
            borderColor: "#ea580c",
            color: "#ea580c",
            "&:hover": {
              borderColor: "#c2410c",
              backgroundColor: "#ffedd5",
            },
          }}
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );
}

export default FilterList;
