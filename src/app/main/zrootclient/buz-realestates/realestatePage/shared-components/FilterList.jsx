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
  InputAdornment,
  IconButton,
  Divider,
  Box,
} from "@mui/material";
import { Search, Clear, FilterList as FilterListIcon } from "@mui/icons-material";
import useSellerCountries from "app/configs/data/server-calls/countries/useCountries";
import { getDistrictsByLgaId, getLgasByStateId, getStateByCountryId } from "app/configs/data/client/RepositoryClient";
import { pickRegionCenter } from "src/app/main/zrootclient/shared-near/regionCenter";

const inputSx = {
  backgroundColor: "white",
  borderRadius: "8px",
  "& .MuiOutlinedInput-root": {
    "&:hover fieldset, &:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#f97316",
    },
    "&.Mui-focused fieldset, &.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#ea580c",
    },
  },
};

/**
 * FilterList Component
 * A filter panel for real-estate listings — only exposes fields the gateway's
 * `estate-properties/get-listings` route actually supports (title, RENT/SALE,
 * cascading country→state→LGA, price range, roomCount, sittingroomCount).
 * No amenities/bathroomCount/category filters — property-service has no
 * backend support for those, so they were removed rather than left as
 * decoration that silently does nothing.
 */
function FilterList({ onFilterChange, initialFilters = {} }) {
  const { data: COUNTRIES } = useSellerCountries();

  const onFilterChangeRef = useRef(onFilterChange);
  useEffect(() => {
    onFilterChangeRef.current = onFilterChange;
  }, [onFilterChange]);

  // Filter state
  const [keyword, setKeyword] = useState(initialFilters.keyword || "");
  const [propertyUseCase, setPropertyUseCase] = useState(initialFilters.propertyUseCase || "");
  const [country, setCountry] = useState(initialFilters.country || "");
  const [state, setState] = useState(initialFilters.state || "");
  const [lga, setLga] = useState(initialFilters.lga || "");
  const [district, setDistrict] = useState(initialFilters.district || "");
  const [priceRange, setPriceRange] = useState(initialFilters.priceRange || [0, 1000000000]);
  const [roomCount, setRoomCount] = useState(initialFilters.roomCount || "");
  const [sittingroomCount, setSittingroomCount] = useState(initialFilters.sittingroomCount || "");

  const [availableStates, setAvailableStates] = useState([]);
  const [availableLgas, setAvailableLgas] = useState([]);
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [statesLoading, setStatesLoading] = useState(false);
  const [lgasLoading, setLgasLoading] = useState(false);

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

  // Emit filter changes to parent with a debounce for the keyword field
  useEffect(() => {
    const timeoutId = setTimeout(
      () => {
        // The most specific chosen region that has a centre point; the page uses it to recentre near-me search.
        const regionCenter = pickRegionCenter(
          { district, lga, state, country },
          { districts: availableDistricts, lgas: availableLgas, states: availableStates, countries: COUNTRIES?.data?.countries || [] },
        );
        onFilterChangeRef.current?.({
          regionCenter,
          keyword,
          propertyUseCase,
          country,
          state,
          lga,
          priceRange,
          roomCount,
          sittingroomCount,
        });
      },
      keyword ? 500 : 0,
    );

    return () => clearTimeout(timeoutId);
  }, [keyword, propertyUseCase, country, state, lga, district, availableDistricts, availableLgas, availableStates, COUNTRIES, priceRange, roomCount, sittingroomCount]);

  async function findStatesByCountry(countryId) {
    setStatesLoading(true);
    const stateResponseData = await getStateByCountryId(countryId);
    if (stateResponseData) {
      setAvailableStates(stateResponseData?.data?.states || []);
      setState("");
      setLga("");
    }
    setStatesLoading(false);
  }

  async function getLgasFromState(sid) {
    setLgasLoading(true);
    const responseData = await getLgasByStateId(sid);
    if (responseData) {
      setAvailableLgas(responseData?.data?.lgas || []);
      setLga("");
    }
    setLgasLoading(false);
  }

  const handleClearFilters = () => {
    setKeyword("");
    setPropertyUseCase("");
    setCountry("");
    setState("");
    setLga("");
    setDistrict("");
    setPriceRange([0, 1000000000]);
    setRoomCount("");
    setSittingroomCount("");
  };

  const formatPrice = (value) => `NGN ${value.toLocaleString()}`;

  return (
    <div
      className="rounded-2xl shadow-lg p-6 max-w-md mx-auto lg:max-w-xs overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #fff5f0 50%, #ffedd5 100%)",
      }}
    >
      {/* Header with Gradient */}
      <div
        className="flex items-center gap-3 mb-6 p-4 rounded-xl -mx-6 -mt-6"
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
          placeholder="Search by title…"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          sx={inputSx}
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

        {/* Rent vs Sale */}
        <FormControl fullWidth size="small" sx={inputSx}>
          <InputLabel id="use-case-label">Listing Type</InputLabel>
          <Select
            labelId="use-case-label"
            value={propertyUseCase}
            label="Listing Type"
            onChange={(e) => setPropertyUseCase(e.target.value)}
          >
            <MenuItem value="">
              <em>All Listings</em>
            </MenuItem>
            <MenuItem value="RENT">For Rent</MenuItem>
            <MenuItem value="SALE">For Sale</MenuItem>
          </Select>
        </FormControl>

        {/* Location Section */}
        <Typography variant="subtitle2" className="font-medium text-gray-700 pt-2">
          Location
        </Typography>

        <FormControl fullWidth size="small" sx={inputSx}>
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

        <FormControl fullWidth size="small" disabled={!country} sx={inputSx}>
          <InputLabel id="state-label">State</InputLabel>
          <Select
            labelId="state-label"
            value={state}
            label="State"
            onChange={(e) => setState(e.target.value)}
          >
            <MenuItem value="">
              <em>{statesLoading ? "Loading…" : "All States"}</em>
            </MenuItem>
            {availableStates?.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small" disabled={!state} sx={inputSx}>
          <InputLabel id="lga-label">LGA</InputLabel>
          <Select
            labelId="lga-label"
            value={lga}
            label="LGA"
            onChange={(e) => setLga(e.target.value)}
          >
            <MenuItem value="">
              <em>{lgasLoading ? "Loading…" : "All LGAs"}</em>
            </MenuItem>
            {availableLgas?.map((l) => (
              <MenuItem key={l.id} value={l.id}>
                {l.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small" disabled={!lga} sx={inputSx}>
          <InputLabel id="district-label">District</InputLabel>
          <Select labelId="district-label" value={district} label="District" onChange={(e) => setDistrict(e.target.value)}>
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
              max={1000000000}
              step={100000}
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
        <FormControl fullWidth size="small" sx={inputSx}>
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
            {[1, 2, 3, 4, 5, 6].map((count) => (
              <MenuItem key={count} value={count}>
                {count}+ {count === 1 ? "Bedroom" : "Bedrooms"}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Sitting Room Count */}
        <FormControl fullWidth size="small" sx={inputSx}>
          <InputLabel id="sittingroom-count-label">Sitting Rooms</InputLabel>
          <Select
            labelId="sittingroom-count-label"
            value={sittingroomCount}
            label="Sitting Rooms"
            onChange={(e) => setSittingroomCount(e.target.value)}
          >
            <MenuItem value="">
              <em>Any</em>
            </MenuItem>
            {[1, 2, 3, 4].map((count) => (
              <MenuItem key={count} value={count}>
                {count}+ {count === 1 ? "Sitting Room" : "Sitting Rooms"}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Clear Filters Button */}
        <Button
          fullWidth
          variant="outlined"
          onClick={handleClearFilters}
          sx={{
            marginTop: "24px",
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
