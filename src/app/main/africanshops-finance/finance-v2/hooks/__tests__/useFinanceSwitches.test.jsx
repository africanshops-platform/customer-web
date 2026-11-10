import { act, renderHook, waitFor } from "@testing-library/react";
import { switchNotice, useFinanceSwitches, useWalletFundingReadiness } from "../useFinanceSwitches";

const mockGet = jest.fn();
jest.mock("app/configs/data/client/RepositoryAuthClient", () => ({ AuthApi: () => ({ get: (...a) => mockGet(...a) }) }));

const ALL_ACTIVE = { internalTransfer: "ACTIVE", externalTransfer: "ACTIVE", walletFunding: "ACTIVE", cardCheckout: "ACTIVE", civicPayments: "ACTIVE", merchantCashout: "ACTIVE", refunds: "ACTIVE", virtualCards: "ACTIVE" };

describe("switchNotice", () => {
	it("is null for an ACTIVE switch, an unknown key and a status not read yet", () => {
		expect(switchNotice(ALL_ACTIVE, "walletFunding")).toBeNull();
		expect(switchNotice(ALL_ACTIVE, "nope")).toBeNull();
		expect(switchNotice(null, "walletFunding")).toBeNull();
	});

	it("DISABLED says temporarily unavailable and MAINTENANCE says maintenance, naming the feature", () => {
		expect(switchNotice({ ...ALL_ACTIVE, externalTransfer: "DISABLED" }, "externalTransfer")).toEqual({
			status: "DISABLED",
			text: "Withdrawals and bank transfers is temporarily unavailable. Please try again later."
		});
		expect(switchNotice({ ...ALL_ACTIVE, internalTransfer: "MAINTENANCE" }, "internalTransfer").text).toContain("under maintenance");
	});
});

describe("useFinanceSwitches", () => {
	beforeEach(() => jest.clearAllMocks());

	it("reads the statuses from the gateway and refreshes when the tab regains focus", async () => {
		mockGet.mockResolvedValue({ data: { statuses: { ...ALL_ACTIVE, externalTransfer: "DISABLED" } } });
		const { result } = renderHook(() => useFinanceSwitches());
		await waitFor(() => expect(result.current.statuses?.externalTransfer).toBe("DISABLED"));
		expect(mockGet).toHaveBeenCalledWith("checkout-readiness/finance-switches");
		mockGet.mockResolvedValue({ data: { statuses: ALL_ACTIVE } });
		await act(async () => {
			window.dispatchEvent(new Event("focus"));
		});
		await waitFor(() => expect(result.current.statuses?.externalTransfer).toBe("ACTIVE"));
	});

	it("uses the merchant base path when given one", async () => {
		mockGet.mockResolvedValue({ data: { statuses: ALL_ACTIVE } });
		renderHook(() => useFinanceSwitches("checkout-readiness/pos"));
		await waitFor(() => expect(mockGet).toHaveBeenCalledWith("checkout-readiness/pos/finance-switches"));
	});

	it("never blocks a screen when the read fails", async () => {
		mockGet.mockRejectedValue(new Error("network"));
		const { result } = renderHook(() => useFinanceSwitches());
		await act(async () => {});
		expect(result.current.statuses).toBeNull();
		expect(switchNotice(result.current.statuses, "externalTransfer")).toBeNull();
	});
});

describe("useWalletFundingReadiness", () => {
	beforeEach(() => jest.clearAllMocks());

	it("blocks with the gateway's message when the switch is off", async () => {
		mockGet.mockResolvedValue({ data: { healthy: false, switchStatus: "MAINTENANCE", unavailableMessage: "Wallet funding is under maintenance. Please try again shortly." } });
		const { result } = renderHook(() => useWalletFundingReadiness());
		await waitFor(() => expect(result.current.blocked).toBe(true));
		expect(result.current.message).toContain("under maintenance");
	});

	it("blocks with a generic message on a plain service outage", async () => {
		mockGet.mockResolvedValue({ data: { healthy: false, downServices: ["zxfx-fintech-service"] } });
		const { result } = renderHook(() => useWalletFundingReadiness());
		await waitFor(() => expect(result.current.blocked).toBe(true));
		expect(result.current.message).toContain("temporarily unavailable");
	});

	it("is open when healthy, and open when the read fails", async () => {
		mockGet.mockResolvedValueOnce({ data: { healthy: true, switchStatus: "ACTIVE" } });
		const ok = renderHook(() => useWalletFundingReadiness());
		await act(async () => {});
		expect(ok.result.current.blocked).toBe(false);
		mockGet.mockRejectedValue(new Error("x"));
		const failed = renderHook(() => useWalletFundingReadiness());
		await act(async () => {});
		expect(failed.result.current.blocked).toBe(false);
	});
});
