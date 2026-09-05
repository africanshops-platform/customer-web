// import useCountries from '@/hooks/useCountries'
import React from "react";
import Select from "react-select";
import useCountries from "../../hooks/useCountries";
import useSellerCountries from "app/configs/data/server-calls/countries/useCountries";

const UserLgaSelect = ({ value, onChange, blgas }) => {
  return (
    <div>
      <label style={{ fontSize: "12px", fontWeight: "800" }}>*LGA/County scan</label>
      <Select
        placeholder="What LGA/County?"
        isClearable
        options={blgas}
        value={value}
        onChange={(value) => onChange(value)}
        formatOptionLabel={(option) => (
          <div className="flex flex-row items-center gap-3">
            <div>
              {option?.name}
              {/* <span className='text-neutral-800 ml-1'>
                                {option.region}
                            </span> */}
            </div>
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
        // Fix for options rendering clipped inside overflow-hidden containers —
        // react-select's menu is inline/absolute by default, so portal it to
        // <body> instead of letting a scrollable/clipped ancestor cut it down
        // to a sliver.
        menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
      />
    </div>
  );
};

export default UserLgaSelect;
