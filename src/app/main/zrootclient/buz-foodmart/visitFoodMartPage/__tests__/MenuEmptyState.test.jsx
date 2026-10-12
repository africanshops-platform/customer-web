import { render, screen } from "@testing-library/react";
import MenuEmptyState from "../shared-components/MenuEmptyState";
import { VENUE_THEMES } from "../venueThemes";

describe("MenuEmptyState", () => {
  it("shows an illustration and a friendly message instead of the bare 'No menu items available!' line", () => {
    const { container } = render(<MenuEmptyState operationMode="RESTAURANT" venueName="Kano Central Kitchen" />);
    expect(screen.getByTestId("menu-empty-illustration")).toBeInTheDocument();
    expect(screen.getByText("The kitchen is warming up")).toBeInTheDocument();
    expect(screen.getByText(/Kano Central Kitchen is putting the finishing touches on its menu\./)).toBeInTheDocument();
    expect(container.textContent).not.toContain("No menu items available");
  });

  it.each(["RESTAURANT", "CAFE", "CLUB", "SPOT"])("tints the illustration with the %s venue's accent", (mode) => {
    const { container } = render(<MenuEmptyState operationMode={mode} venueName="X" />);
    expect(container.innerHTML.toLowerCase()).toContain(VENUE_THEMES[mode].accent.toLowerCase());
    expect(screen.getByText(new RegExp(VENUE_THEMES[mode].icon))).toBeInTheDocument();
  });

  it("falls back to a generic line when the venue name is missing or blank", () => {
    render(<MenuEmptyState operationMode="CAFE" venueName="   " />);
    expect(screen.getByText(/This venue is putting the finishing touches on its menu\./)).toBeInTheDocument();
  });

  it("falls back to the restaurant look for an unknown or missing mode", () => {
    render(<MenuEmptyState />);
    expect(screen.getByTestId("menu-empty-state")).toHaveAttribute("data-venue", "RESTAURANT");
  });

  it("gives the illustration an accessible name", () => {
    render(<MenuEmptyState operationMode="SPOT" venueName="Spot" />);
    expect(screen.getByRole("img", { name: /covered dish with steam rising/i })).toBeInTheDocument();
  });
});
