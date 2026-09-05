import React from "react";
import Select from "react-select";
import useCountries from "../../hooks/useCountries";
import useSellerCountries from "app/configs/data/server-calls/countries/useCountries";

const CountrySelect = ({ value, onChange }) => {
  // const { getAll } = useCountries();
  const { data: countries } = useSellerCountries();
  console.log("countries", countries);
  return (
    <div>
      <label style={{ fontSize: "12px", fontWeight: "800" }}>*Country Origin</label>
      <Select
        placeholder="Where on the globe are you?"
        isClearable
        options={countries?.data?.countries}
        value={value}
        onChange={(value) => onChange(value)}
        formatOptionLabel={(option) => (
          <div className="flex flex-row items-center gap-3">
            <image src={option?.flag} className="height-[10px] width-[14px]" />

            <div>{option?.name}</div>
          </div>
        )}
        theme={(theme) => ({
          ...theme,
          borderRadius: 6,
          colors: {
            ...theme.colors,
            primary: "black",
            primary25: "#ffe4e6",
          },
        })}
        // The signup card wraps this in an overflow-hidden Paper. react-select's
        // menu renders inline (absolutely positioned relative to the nearest
        // positioned ancestor) by default, so without portaling it out to
        // <body> the options list gets clipped down to a sliver of the card's
        // edge instead of floating over the page.
        menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
      />
    </div>
  );
};

export default CountrySelect;
