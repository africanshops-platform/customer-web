import { render, screen } from "@testing-library/react";
import StoreHero from "../StoreHero";
import StoreProducts from "../StoreProducts";

jest.mock("@fuse/core/NavLinkAdapter", () => ({
  __esModule: true,
  default: ({ to, children, ...rest }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}));
jest.mock("src/app/main/vendors-shop/PosUtils", () => ({ formatCurrency: (n) => `N${n}` }));
jest.mock("src/app/shared-components/loading", () => ({
  SectionSkeleton: () => <div data-testid="skeleton" />,
}));
jest.mock("../../marketplace/shared-components/ProductPaginationBar", () => ({
  __esModule: true,
  default: () => <div data-testid="pager" />,
}));

const baseShop = {
  shopName: "Ogbete Main Market Traders",
  marketName: "Enugu East Market",
  memberSince: 2026,
};

describe("StoreHero", () => {
  it("shows the Verified badge only when the shop really is verified", () => {
    const { rerender } = render(
      <StoreHero shopData={{ ...baseShop, isVerified: false }} listingsTotal={20} />,
    );
    expect(screen.queryByText("Verified")).toBeNull();
    rerender(<StoreHero shopData={{ ...baseShop, isVerified: true }} listingsTotal={20} />);
    expect(screen.getByText("Verified")).toBeTruthy();
  });

  it("shows the real name, market, member-since and listing count, and invents no followers or posts", () => {
    const { container } = render(<StoreHero shopData={baseShop} listingsTotal={20} />);
    expect(screen.getByText("Ogbete Main Market Traders")).toBeTruthy();
    expect(container.textContent).toContain("Enugu East Market");
    expect(container.textContent).toContain("Member since 2026");
    expect(container.textContent).toContain("20");
    expect(container.textContent).not.toMatch(/Followers|Posts/);
  });
});

describe("StoreProducts", () => {
  const props = {
    onRetry: jest.fn(),
    total: 0,
    page: 1,
    limit: 12,
    onPageChange: jest.fn(),
    onLimitChange: jest.fn(),
  };

  it("shows a skeleton while loading", () => {
    render(<StoreProducts {...props} products={[]} isLoading isError={false} />);
    expect(screen.getByTestId("skeleton")).toBeTruthy();
  });

  it("shows an illustrated empty state for a shop with no listings", () => {
    render(<StoreProducts {...props} products={[]} isLoading={false} isError={false} />);
    expect(screen.getByTestId("store-products-empty")).toBeTruthy();
  });

  it("shows a retry state when the listings fail to load", () => {
    render(<StoreProducts {...props} products={[]} isLoading={false} isError />);
    expect(screen.getByTestId("store-products-error")).toBeTruthy();
    expect(screen.getByText("Try again")).toBeTruthy();
  });

  it("links each listing to its product page and shows only real prices and discounts", () => {
    const products = [
      {
        id: "1",
        slug: "kitchen-knife-set-1",
        name: "Kitchen Knife Set",
        price: 6414,
        listprice: 7055,
        imageLinks: [],
      },
      {
        id: "2",
        slug: "cooler-box-1",
        name: "Cooler Box 25L",
        price: 12141,
        listprice: 0,
        imageLinks: [],
      },
    ];
    const { container } = render(
      <StoreProducts {...props} products={products} total={2} isLoading={false} isError={false} />,
    );
    const cards = screen.getAllByTestId("store-product-card");
    expect(cards).toHaveLength(2);
    expect(cards[0].getAttribute("href")).toBe("/marketplace/product/kitchen-knife-set-1/view");
    expect(container.textContent).toContain("9% OFF");
    expect(container.textContent.match(/% OFF/g)).toHaveLength(1);
  });
});
