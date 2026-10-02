import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { FormControl, InputLabel, MenuItem, Select, Typography } from "@mui/material";
import { getCountries } from "app/configs/data/client/clientToApiRoutes";
import {
  getStateByCountryId,
  getLgaByStateId,
  getMarketsByLgaId,
} from "app/configs/data/client/RepositoryClient";

/**
 * Cascading country → state → LGA → pickup-market selects: a saved address's delivery location.
 * Saved with the address so checkout can fill itself in and the shop pages can estimate shipping to
 * where the buyer really is. Controlled: value = { country, state, lga, market } (ids), all optional.
 */
function DeliveryLocationFields({ value, onChange }) {
  const v = value || {};
  const { data: countriesRes } = useQuery(["__dl_countries"], getCountries, { staleTime: 10 * 60 * 1000 });
  const { data: statesRes } = useQuery(["__dl_states", v.country], () => getStateByCountryId(v.country), {
    enabled: Boolean(v.country),
    staleTime: 10 * 60 * 1000,
  });
  const { data: lgasRes } = useQuery(["__dl_lgas", v.state], () => getLgaByStateId(v.state), {
    enabled: Boolean(v.state),
    staleTime: 10 * 60 * 1000,
  });
  const { data: marketsRes } = useQuery(["__dl_markets", v.lga], () => getMarketsByLgaId(v.lga), {
    enabled: Boolean(v.lga),
    staleTime: 10 * 60 * 1000,
  });
  const countries = countriesRes?.data?.countries ?? [];
  const states = statesRes?.data?.states ?? [];
  const lgas = lgasRes?.data?.lgas ?? [];
  const markets = marketsRes?.data?.markets ?? [];

  // changing a level clears everything below it
  const set = (key, id) => {
    const next = { ...v, [key]: id };
    if (key === "country") Object.assign(next, { state: "", lga: "", market: "" });
    if (key === "state") Object.assign(next, { lga: "", market: "" });
    if (key === "lga") Object.assign(next, { market: "" });
    onChange(next);
  };

  const field = (label, key, options, disabled) => (
    <FormControl fullWidth size="small" disabled={disabled}>
      <InputLabel>{label}</InputLabel>
      <Select
        label={label}
        value={options.some((o) => o.id === v[key]) ? v[key] : ""}
        onChange={(e) => set(key, e.target.value)}
        data-testid={`delivery-${key}`}
      >
        {options.map((o) => (
          <MenuItem key={o.id} value={o.id}>
            {o.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  return (
    <div className="space-y-3" data-testid="delivery-location-fields">
      <Typography variant="subtitle2" className="font-semibold text-gray-800">
        Delivery location <span className="font-normal text-gray-500">(optional — fills checkout for you and shows real shipping costs)</span>
      </Typography>
      <div className="grid grid-cols-2 gap-3">
        {field("Country", "country", countries, false)}
        {field("State / Province", "state", states, !v.country)}
        {field("L.G.A / County", "lga", lgas, !v.state)}
        {field("Market pickup point", "market", markets, !v.lga)}
      </div>
    </div>
  );
}

export default DeliveryLocationFields;
