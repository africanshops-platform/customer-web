import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TransferLimitsCard from "../TransferLimitsCard";

let mockLimits = null;
const mockSet = jest.fn();
jest.mock("../../../hooks/useFintechApi", () => ({
	useTransferLimits: () => ({ data: mockLimits, isLoading: false, refetch: jest.fn() }),
	useSetTransferLimits: () => ({ mutate: (...a) => mockSet(...a), isLoading: false, error: null }),
	useConfirmTransferLimitIncrease: () => ({ mutate: jest.fn(), isLoading: false, error: null })
}));
jest.mock("../../../financeUiTokens", () => ({ F: { small: 12, label: 14, body: 14 }, fieldSx: () => ({}) }));
jest.mock("../TransactionPinField", () => () => <div />);
jest.mock("@fuse/core/FuseSvgIcon", () => () => <i />);

const tokens = new Proxy({}, { get: () => "#000" });
const renderCard = () => render(<MemoryRouter><TransferLimitsCard account={{ accountNumber: "7701502861" }} tokens={tokens} card={{}} /></MemoryRouter>);

const UNVERIFIED = {
	verified: false, perTransactionLimitKobo: null, dailyTransferLimitKobo: null, defaultDailyLimitKobo: 10_000_000, maxDailyLimitKobo: 10_000_000,
	dailyLimitStepsKobo: [1_000_000, 2_500_000, 5_000_000, 10_000_000], pendingChange: null,
	monthlyAllowance: { capKobo: 10_000_000, usedKobo: 3_500_000, remainingKobo: 6_500_000 }
};
const VERIFIED = {
	verified: true, perTransactionLimitKobo: null, dailyTransferLimitKobo: 50_000_000, defaultDailyLimitKobo: 50_000_000, maxDailyLimitKobo: 500_000_000,
	dailyLimitStepsKobo: [50_000_000, 100_000_000, 200_000_000, 300_000_000, 400_000_000, 500_000_000], pendingChange: null, monthlyAllowance: null
};

describe("TransferLimitsCard: one slider for every account (board F23)", () => {
	beforeEach(() => { jest.clearAllMocks(); });

	it("an unverified account gets the slider (up to its allowance), the monthly allowance with what is used, and a link to verify", () => {
		mockLimits = UNVERIFIED;
		renderCard();
		expect(screen.getByRole("slider")).toHaveAttribute("aria-valuemax", "3"); // four steps
		expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "3"); // sits at its allowance (no limit of its own)
		expect(screen.getByTestId("monthly-allowance")).toHaveTextContent("₦65,000 left");
		expect(screen.getByTestId("monthly-allowance")).toHaveTextContent("₦35,000 of ₦100,000 used in the last 30 days");
		expect(screen.getByRole("link", { name: /Verify your identity to lift this limit/ })).toHaveAttribute("href", "/africanshops/finance-v2/kyc");
		expect(screen.getByText(/in any 30 days/)).toBeInTheDocument();
		expect(screen.queryByPlaceholderText("No limit")).toBeInTheDocument(); // only the per-transaction field; the daily free-text box is gone
		expect(screen.getAllByPlaceholderText("No limit")).toHaveLength(1);
	});

	it("a verified account keeps its six-step slider and sees no monthly allowance", () => {
		mockLimits = VERIFIED;
		renderCard();
		expect(screen.getByRole("slider")).toHaveAttribute("aria-valuemax", "5");
		expect(screen.queryByTestId("monthly-allowance")).toBeNull();
		expect(screen.getByText(/The highest daily limit is ₦5,000,000/)).toBeInTheDocument();
	});

	it("moving an unverified slider below its allowance saves that step; the button says Save, not Request increase", () => {
		mockLimits = UNVERIFIED;
		renderCard();
		fireEvent.change(screen.getByRole("slider"), { target: { value: 2 } }); // 100k -> 50k
		fireEvent.click(screen.getByRole("button", { name: "Save Limits" }));
		expect(mockSet).toHaveBeenCalledWith("7701502861", expect.objectContaining({ dailyTransferLimitKobo: 5_000_000 }));
	});

	it("raising a limit it set earlier is labelled Request increase (it will need the emailed code)", () => {
		mockLimits = { ...UNVERIFIED, dailyTransferLimitKobo: 1_000_000 };
		renderCard();
		fireEvent.change(screen.getByRole("slider"), { target: { value: 1 } }); // 10k -> 25k
		expect(screen.getByRole("button", { name: "Request increase" })).toBeInTheDocument();
	});

	it("an older backend with no steps falls back to the free-text daily box", () => {
		mockLimits = { ...UNVERIFIED, dailyLimitStepsKobo: [], monthlyAllowance: undefined };
		renderCard();
		expect(screen.queryByRole("slider")).toBeNull();
		expect(screen.getAllByPlaceholderText("No limit")).toHaveLength(2);
		expect(screen.getByText(/Verify your identity to raise your daily limit/)).toBeInTheDocument();
	});

	it("when the ledger read failed the allowance is shown without the used amount", () => {
		mockLimits = { ...UNVERIFIED, monthlyAllowance: { capKobo: 10_000_000, usedKobo: null, remainingKobo: null } };
		renderCard();
		expect(screen.getByTestId("monthly-allowance")).toHaveTextContent("₦100,000");
		expect(screen.getByTestId("monthly-allowance")).not.toHaveTextContent("used in the last 30 days");
	});
});
