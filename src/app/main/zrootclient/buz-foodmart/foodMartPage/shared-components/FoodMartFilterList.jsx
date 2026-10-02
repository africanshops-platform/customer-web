import { useState, useEffect, useRef } from "react";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Button,
  InputAdornment,
  IconButton,
  Divider,
} from "@mui/material";
import { Search, Clear, FilterList as FilterListIcon } from "@mui/icons-material";
import useSellerCountries from "app/configs/data/server-calls/countries/useCountries";
import { getLgasByStateId, getStateByCountryId } from "app/configs/data/client/RepositoryClient";

const FOODMART_CATEGORIES = [
  { value: "restaurant", label: "🍽️ Restaurant" },
  { value: "bar", label: "🍺 Bar" },
  { value: "club", label: "🎵 Club / Nightclub" },
  { value: "lounge", label: "🍹 Lounge" },
  { value: "cafe", label: "☕ Café" },
  { value: "bakery", label: "🥐 Bakery" },
  { value: "fastfood", label: "🍔 Fast Food" },
  { value: "spot", label: "📍 Spot" },
];

const OPERATION_MODES = [
  { value: "RESTAURANT", label: "Restaurant" },
  { value: "CAFE", label: "Café" },
  { value: "CLUB", label: "Club / Lounge" },
  { value: "SPOT", label: "Spot" },
];

const inputSx = {
  backgroundColor: "white",
  borderRadius: "8px",
  "& .MuiOutlinedInput-root": {
    "&:hover fieldset": { borderColor: "#f97316" },
    "&.Mui-focused fieldset": { borderColor: "#ea580c" },
  },
};

function FoodMartFilterList({ onFilterChange, initialFilters = {} }) {
  const { data: COUNTRIES } = useSellerCountries();
  const onFilterChangeRef = useRef(onFilterChange);

  useEffect(() => {
    onFilterChangeRef.current = onFilterChange;
  }, [onFilterChange]);

  const [keyword, setKeyword] = useState(initialFilters.keyword || "");
  const [title, setTitle] = useState(initialFilters.title || "");
  const [address, setAddress] = useState(initialFilters.address || "");
  const [category, setCategory] = useState(initialFilters.category || "");
  const [operationMode, setOperationMode] = useState(initialFilters.operationMode || "");
  const [country, setCountry] = useState(initialFilters.country || "");
  const [state, setState] = useState(initialFilters.state || "");
  const [lga, setLga] = useState(initialFilters.lga || "");

  const [availableStates, setAvailableStates] = useState([]);
  const [availableLgas, setAvailableLgas] = useState([]);
  const [statesLoading, setStatesLoading] = useState(false);
  const [lgasLoading, setLgasLoading] = useState(false);

  useEffect(() => {
    if (country) {
      fetchStatesByCountry(country);
    } else {
      setAvailableStates([]);
    }
  }, [country]);

  useEffect(() => {
    if (state) {
      fetchLgasByState(state);
    } else {
      setAvailableLgas([]);
    }
  }, [state]);

  useEffect(() => {
    const timeoutId = setTimeout(
      () => {
        if (onFilterChangeRef.current) {
          onFilterChangeRef.current({
            keyword,
            title,
            address,
            category,
            operationMode,
            country,
            state,
            lga,
          });
        }
      },
      keyword || title || address ? 500 : 0,
    );
    return () => clearTimeout(timeoutId);
  }, [keyword, title, address, category, operationMode, country, state, lga]);

  async function fetchStatesByCountry(countryId) {
    setStatesLoading(true);
    const res = await getStateByCountryId(countryId);
    if (res) {
      setAvailableStates(res?.data?.states || []);
      setState("");
      setLga("");
    }
    setStatesLoading(false);
  }

  async function fetchLgasByState(stateId) {
    setLgasLoading(true);
    const res = await getLgasByStateId(stateId);
    if (res) {
      setAvailableLgas(res?.data?.lgas || []);
      setLga("");
    }
    setLgasLoading(false);
  }

  const handleClearFilters = () => {
    setKeyword("");
    setTitle("");
    setAddress("");
    setCategory("");
    setOperationMode("");
    setCountry("");
    setState("");
    setLga("");
  };

  return (
    <div
      className="rounded-2xl shadow-lg p-6 max-w-md mx-auto lg:max-w-xs overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #fff7ed 50%, #ffedd5 100%)",
      }}
    >
      {/* Gradient Header */}
      <div
        className="flex items-center gap-3 mb-6 p-4 rounded-xl -mx-6 -mt-6"
        style={{
          background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
          boxShadow: "0 4px 15px rgba(249, 115, 22, 0.3)",
        }}
      >
        <FilterListIcon sx={{ color: "white", fontSize: "1.75rem" }} />
        <Typography variant="h6" sx={{ fontWeight: 700, color: "white", fontSize: "1.25rem" }}>
          Filter Restaurants
        </Typography>
      </div>

      <div className="space-y-4 overflow-y-auto overflow-x-hidden mt-4" style={{ maxHeight: "calc(100% - 80px)" }}>
        {/* Keyword Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search restaurants..."
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

        {/* Name Search */}
        <TextField
          fullWidth
          size="small"
          label="Restaurant Name"
          placeholder="Search by name..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={inputSx}
          InputProps={{
            endAdornment: title && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setTitle("")}>
                  <Clear fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Address Search */}
        <TextField
          fullWidth
          size="small"
          label="Address"
          placeholder="Search by address..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          sx={inputSx}
          InputProps={{
            endAdornment: address && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setAddress("")}>
                  <Clear fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Divider className="my-2" />

        {/* Category */}
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151", paddingTop: "4px" }}>
          Establishment Type
        </Typography>

        <FormControl fullWidth size="small" sx={inputSx}>
          <InputLabel id="category-label">Category</InputLabel>
          <Select
            labelId="category-label"
            value={category}
            label="Category"
            onChange={(e) => setCategory(e.target.value)}
          >
            <MenuItem value="">
              <em>All Categories</em>
            </MenuItem>
            {FOODMART_CATEGORIES.map((c) => (
              <MenuItem key={c.value} value={c.value}>
                {c.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Operation Mode */}
        <FormControl fullWidth size="small" sx={inputSx}>
          <InputLabel id="opmode-label">Operation Mode</InputLabel>
          <Select
            labelId="opmode-label"
            value={operationMode}
            label="Operation Mode"
            onChange={(e) => setOperationMode(e.target.value)}
          >
            <MenuItem value="">
              <em>All Modes</em>
            </MenuItem>
            {OPERATION_MODES.map((m) => (
              <MenuItem key={m.value} value={m.value}>
                {m.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Divider className="my-2" />

        {/* Location Section */}
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151", paddingTop: "4px" }}>
          Location
        </Typography>

        {/* Country */}
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

        {/* State */}
        <FormControl fullWidth size="small" disabled={!country} sx={inputSx}>
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
            {statesLoading && (
              <MenuItem disabled>
                <em>Loading...</em>
              </MenuItem>
            )}
            {availableStates?.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* LGA */}
        <FormControl fullWidth size="small" disabled={!state} sx={inputSx}>
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
            {lgasLoading && (
              <MenuItem disabled>
                <em>Loading...</em>
              </MenuItem>
            )}
            {availableLgas?.map((l) => (
              <MenuItem key={l.id} value={l.id}>
                {l.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Clear Button */}
        <Button
          fullWidth
          variant="outlined"
          onClick={handleClearFilters}
          sx={{
            borderColor: "#ea580c",
            color: "#ea580c",
            marginTop: "8px",
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

export default FoodMartFilterList;
