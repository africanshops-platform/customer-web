import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DemoSidebar from "../shared-components/DemoSidebar";

// The strings the sidebar used to invent for EVERY venue (tracker customer-13).
const FAKE = [
  "info@restaurant.com",
  "www.restaurant.com",
  "+234 123 456 7890",
  "123 Main Street, Lagos, Nigeria",
  "Restaurant Name",
  "Restaurant & Bar",
  "1,250",
  "340",
  "234 reviews",
  "Since 2020",
  "Mon - Sun",
  "Continental",
  "Live Music",
  "Experience the finest dining",
];

const REAL = {
  title: "Garki Suya Club",
  operationMode: "CLUB",
  foodMartCategory: "Club",
  description: "A real Nigerian club.",
  address: "Garki Suya Club Complex",
  phoneNumber: "+2347300337426",
  rating: 4,
  numReviews: 3,
  busniessOpenPeriod: "1970-01-01T08:00:00.000Z",
  busniessClosePeriod: "1970-01-01T23:00:00.000Z",
  createdAt: "2026-08-16T17:14:09.141Z",
  latitude: "9.0765",
  longitude: "7.3986",
};

describe("DemoSidebar", () => {
  it("shows the venue's real details", () => {
    render(<DemoSidebar martMenu={REAL} />);
    expect(screen.getByText("Garki Suya Club")).toBeInTheDocument();
    expect(screen.getByTestId("venue-kind")).toHaveTextContent("Club / Lounge");
    expect(screen.getByText("A real Nigerian club.")).toBeInTheDocument();
    expect(screen.getByText("Garki Suya Club Complex")).toBeInTheDocument();
    expect(screen.getByText("+2347300337426")).toBeInTheDocument();
    expect(screen.getByTestId("venue-hours")).toBeInTheDocument();
    expect(screen.getByTestId("venue-rating")).toHaveTextContent("4");
    expect(screen.getByTestId("venue-rating")).toHaveTextContent("(3 reviews)");
  });

  it.each([
    ["a real record", REAL],
    ["a sparse record", { title: "Bare Venue" }],
    ["no record at all", undefined],
  ])("never shows any of the old invented placeholder values (%s)", (_label, record) => {
    const { container } = render(<DemoSidebar martMenu={record} />);
    FAKE.forEach((text) => expect(container.textContent).not.toContain(text));
  });

  it("a sparse venue shows only what it has: no rating, hours, contact, description or action buttons", () => {
    render(<DemoSidebar martMenu={{ title: "Bare Venue", operationMode: "SPOT" }} />);
    expect(screen.getByText("Bare Venue")).toBeInTheDocument();
    expect(screen.getByTestId("venue-kind")).toHaveTextContent("Spot");
    expect(screen.getByTestId("venue-rating")).toHaveTextContent("No reviews yet");
    expect(screen.queryByTestId("venue-hours")).not.toBeInTheDocument();
    expect(screen.queryByText("CONTACT")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /call/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /directions/i })).not.toBeInTheDocument();
  });

  it("has no Follow button, follower counts or verified badge (nothing real behind them)", () => {
    render(<DemoSidebar martMenu={REAL} />);
    expect(screen.queryByRole("button", { name: /follow/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/followers/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId("VerifiedIcon")).not.toBeInTheDocument();
  });

  it("offers Call and Directions links only when the data exists, and they go to the right place", () => {
    render(<DemoSidebar martMenu={REAL} />);
    expect(screen.getByRole("link", { name: /call/i })).toHaveAttribute("href", "tel:+2347300337426");
    expect(screen.getByRole("link", { name: /directions/i })).toHaveAttribute(
      "href",
      "https://www.google.com/maps/dir/?api=1&destination=9.0765,7.3986",
    );
  });

  it("Share copies the page link and confirms it", async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, "clipboard", { value: { writeText }, configurable: true });
    Object.defineProperty(window.navigator, "share", { value: undefined, configurable: true });
    render(<DemoSidebar martMenu={REAL} />);

    fireEvent.click(screen.getByRole("button", { name: "Share this venue" }));

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Link copied"));
    expect(writeText).toHaveBeenCalledWith(window.location.href);
  });
});
