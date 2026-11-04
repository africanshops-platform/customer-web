import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StoreHero from "../StoreHero";
import StoreProducts from "../StoreProducts";

jest.mock("src/app/main/vendors-shop/PosUtils", () => ({ formatCurrency: (n) => `N${n}` }));

const baseShop = {
  shopName: "Ogbete Main Market Traders",
  marketName: "Enugu East Market",
  memberSince: 2026,
};
const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

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
    expect(container.textContent).not.toMatch(/Followers|Posts|Follow\b/);
  });
});

describe("StoreProducts", () => {
  const base = {
    products: [],
    isLoading: false,
    isError: false,
    onRetry: jest.fn(),
    total: 0,
    hasMore: false,
    onLoadMore: jest.fn(),
    loadingMore: false,
    onAdd: jest.fn(),
    addingId: null,
  };

  it("shows skeleton cards while loading", () => {
    wrap(<StoreProducts {...base} isLoading />);
    expect(screen.getByTestId("store-products-loading")).toBeTruthy();
  });

  it("shows an illustrated empty state for a shop with no listings", () => {
    wrap(<StoreProducts {...base} />);
    expect(screen.getByTestId("store-products-empty")).toBeTruthy();
  });

  it("shows a retry state when the listings fail to load", () => {
    const onRetry = jest.fn();
    wrap(<StoreProducts {...base} isError onRetry={onRetry} />);
    fireEvent.click(screen.getByText("Try again"));
    expect(onRetry).toHaveBeenCalled();
  });

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

  it("shows Showing N of M, links each listing to its product page and shows only real discounts", () => {
    const { container } = wrap(<StoreProducts {...base} products={products} total={20} hasMore />);
    expect(screen.getAllByTestId("store-product-card")).toHaveLength(2);
    expect(container.querySelector("a").getAttribute("href")).toBe(
      "/marketplace/product/kitchen-knife-set-1/view",
    );
    expect(container.textContent).toContain("Showing 2 of 20");
    expect(container.textContent).toContain("-9%");
    expect(container.textContent.match(/-\d+%/g)).toHaveLength(1);
  });

  it("adds the right product to the cart and loads more listings on request", () => {
    const onAdd = jest.fn();
    const onLoadMore = jest.fn();
    wrap(
      <StoreProducts
        {...base}
        products={products}
        total={20}
        hasMore
        onAdd={onAdd}
        onLoadMore={onLoadMore}
      />,
    );
    fireEvent.click(screen.getAllByText("Add to cart")[1]);
    expect(onAdd).toHaveBeenCalledWith(products[1]);
    fireEvent.click(screen.getByText("Load more listings"));
    expect(onLoadMore).toHaveBeenCalled();
  });

  it("hides Load more when everything is showing", () => {
    wrap(<StoreProducts {...base} products={products} total={2} hasMore={false} />);
    expect(screen.queryByText("Load more listings")).toBeNull();
  });
});
