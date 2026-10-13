import { render, screen } from "@testing-library/react";
import OffPlatformNotice from "../OffPlatformNotice";
import { PLATFORM_ORDER_PHONE, PLATFORM_ORDER_TEL, PLATFORM_TRADE_WARNING } from "../platformContact";

describe("platformContact", () => {
	it("builds the tel link from the one platform number", () => {
		expect(PLATFORM_ORDER_TEL).toBe(`tel:${PLATFORM_ORDER_PHONE}`);
		expect(PLATFORM_ORDER_PHONE).toMatch(/^\d{11}$/);
	});

	it("states that off-platform trades are not covered", () => {
		expect(PLATFORM_TRADE_WARNING).toMatch(/not be held liable/i);
		expect(PLATFORM_TRADE_WARNING).toMatch(/does not go through the platform/i);
	});
});

describe("OffPlatformNotice", () => {
	it("renders the warning as a note", () => {
		render(<OffPlatformNotice />);
		expect(screen.getByRole("note")).toHaveTextContent(PLATFORM_TRADE_WARNING);
	});
});
