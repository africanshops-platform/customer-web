import { render, screen } from "@testing-library/react";
import SellerInformation from "../SellerInformation";

describe("SellerInformation (real seller data only)", () => {
  it("shows the real name, address, rating with its review count and member-since", () => {
    render(
      <SellerInformation
        sellerName="Jabi Lakeview Spot"
        sellerDescription="Grills and small chops"
        address="Jabi Lake, Abuja"
        rating={4}
        numReviews={12}
        memberSince={2026}
      />,
    );
    expect(screen.getByText("Jabi Lakeview Spot")).toBeTruthy();
    expect(screen.getByText("Jabi Lake, Abuja")).toBeTruthy();
    expect(screen.getByText("(12 reviews)")).toBeTruthy();
    expect(screen.getByText("Member since 2026")).toBeTruthy();
  });

  it("never invents scores, followers, counts or badges", () => {
    const { container } = render(<SellerInformation sellerName="New Kitchen" />);
    const text = container.textContent;
    ["Apple", "Seller Score", "Followers", "Performance Metrics", "Top Rated", "Fast Shipping", "Verified"].forEach((t) =>
      expect(text).not.toContain(t),
    );
    expect(text).not.toMatch(/\d+%|\d\.\dK/);
  });

  it("hides the rating when nobody has reviewed yet", () => {
    render(<SellerInformation sellerName="New Kitchen" rating={0} numReviews={0} />);
    expect(screen.queryByText(/review/)).toBeNull();
  });
});
