import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import FinanceFundAccountContent from "../FinanceFundAccountContent";

const mockInit = jest.fn();
const mockCreate = jest.fn();
const mockVerify = jest.fn();
let mockAccount = { accountNumber: "1234567890", kycStatus: "verified", dvaProvisioned: false };
jest.mock("react-router-dom", () => ({ ...jest.requireActual("react-router-dom"), useOutletContext: () => ({ account: mockAccount, balance: { availableBalance: "0" }, refetchFinanceData: jest.fn() }) }));
jest.mock("react-paystack", () => ({ usePaystackPayment: () => mockInit }));
jest.mock("app/store/hooks", () => ({ useAppSelector: () => ({ email: "a@b.com" }) }));
jest.mock("src/app/auth/user/store/userSlice", () => ({ selectUser: () => ({}) }));
jest.mock("../../FinanceThemeContext", () => ({ useFinanceTheme: () => ({ tokens: new Proxy({}, { get: () => "#000" }) }) }));
jest.mock("../../hooks/useFintechApi", () => ({
	useVerifyWalletFunding: () => ({ mutate: (...a) => mockVerify(...a), isLoading: false, error: null }),
	useTransactionHistory: () => ({ data: [], refetch: jest.fn() }),
	useCreateFundingIntent: () => ({ mutate: (...a) => mockCreate(...a), isLoading: false }),
	useFeeQuote: () => ({ data: null, isFetching: false, error: null }),
}));
jest.mock("../../hooks/useFinanceSwitches", () => ({ useWalletFundingReadiness: () => ({ blocked: false, message: null }) }));
jest.mock("../../financeFormat", () => ({ describeTx: () => ({ title: "" }), isCredit: () => false, nairaFull: (k) => `₦${(Number(k) / 100).toFixed(2)}`, shortDate: (d) => String(d) }));
jest.mock("framer-motion", () => ({ motion: new Proxy({}, { get: () => ({ children }) => <div>{children}</div> }) }));
jest.mock("../shared/BankTransferPanel", () => () => <div data-testid="bank-panel" />);

const quote = (over = {}) => ({
	reference: "AFSHFUND1234567890170000000001234",
	intendedKobo: 1000000,
	chargeKobo: 25889,
	grossKobo: 1025889,
	expiresAt: new Date(Date.now() + 3600000).toISOString(),
	lines: [
		{ code: "AMOUNT", label: "Amount", kind: "AMOUNT", amountKobo: 1000000, explain: "" },
		{ code: "CARD_PROCESSING_FEE", label: "Processing charge", kind: "CHARGE", amountKobo: 25889, explain: "Covers the card network's fee." },
	],
	...over,
});
const renderIt = () => render(<MemoryRouter><FinanceFundAccountContent /></MemoryRouter>);
const typeAmount = (v) => fireEvent.change(screen.getByPlaceholderText(/0/), { target: { value: v } });
const clickContinue = async () => { await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Continue" })); }); };

describe("Fund account card flow with a funding intent (F18)", () => {
	beforeEach(() => { jest.clearAllMocks(); mockAccount = { accountNumber: "1234567890", kycStatus: "verified", dvaProvisioned: false }; });

	it("asks the server for the intent in kobo and shows the server's quote", async () => {
		mockCreate.mockResolvedValue(quote());
		renderIt();
		typeAmount("10000");
		await clickContinue();
		expect(mockCreate).toHaveBeenCalledWith("1234567890", 1000000);
		expect(screen.getByTestId("payment-summary-total")).toHaveTextContent("₦10258.89");
		expect(screen.getByRole("button", { name: "Pay ₦10258.89" })).toBeInTheDocument();
		expect(mockInit).not.toHaveBeenCalled();
	});

	it("Pay opens the popup with the SERVER's reference and gross, on the card channel", async () => {
		mockCreate.mockResolvedValue(quote());
		renderIt();
		typeAmount("10000");
		await clickContinue();
		fireEvent.click(screen.getByRole("button", { name: /^Pay / }));
		expect(mockInit.mock.calls[0][0].config).toMatchObject({ reference: "AFSHFUND1234567890170000000001234", amount: 1025889, channels: ["card"] });
	});

	it.each([409, 429, 503, 403])("an intent failure (%i) blocks the popup and shows the server's sentence", async (status) => {
		mockCreate.mockRejectedValue({ response: { status, data: { message: "Too many top-ups started in the last hour." } } });
		renderIt();
		typeAmount("10000");
		await clickContinue();
		expect(screen.getByTestId("intent-error")).toHaveTextContent("Too many top-ups started in the last hour.");
		expect(mockInit).not.toHaveBeenCalled();
	});

	it("an older backend (404): falls back to the previous flow with the typed amount and a browser-made reference", async () => {
		mockCreate.mockRejectedValue({ response: { status: 404 } });
		renderIt();
		typeAmount("2500");
		await clickContinue();
		const cfg = mockInit.mock.calls[0][0].config;
		expect(cfg.amount).toBe(250000);
		expect(cfg.channels).toBeUndefined();
		expect(cfg.reference).toMatch(/^AFSHFUND1234567890\d+$/);
	});

	it("changing the amount drops the old quote", async () => {
		mockCreate.mockResolvedValue(quote());
		renderIt();
		typeAmount("10000");
		await clickContinue();
		typeAmount("20000");
		expect(screen.queryByTestId("payment-summary")).toBeNull();
		expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument();
	});

	it("an expired quote is not paid: the screen asks for a fresh one", async () => {
		mockCreate.mockResolvedValue(quote({ expiresAt: new Date(Date.now() - 1000).toISOString() }));
		renderIt();
		typeAmount("10000");
		await clickContinue();
		fireEvent.click(screen.getByRole("button", { name: /^Pay / }));
		expect(mockInit).not.toHaveBeenCalled();
		expect(screen.getByTestId("intent-error")).toHaveTextContent(/expired/);
	});

	it("after payment it verifies by the server's reference and says what was added", async () => {
		mockCreate.mockResolvedValue(quote());
		mockVerify.mockResolvedValue({ success: true, amountKobo: 1000000 });
		renderIt();
		typeAmount("10000");
		await clickContinue();
		fireEvent.click(screen.getByRole("button", { name: /^Pay / }));
		await act(async () => { await mockInit.mock.calls[0][0].onSuccess({ reference: "AFSHFUND1234567890170000000001234" }); });
		expect(mockVerify).toHaveBeenCalledWith("1234567890", "AFSHFUND1234567890170000000001234");
		expect(screen.getByText(/₦10000\.00 has been added to your wallet/)).toBeInTheDocument();
	});

	it("a payment settled on a different amount says it was adjusted", async () => {
		mockCreate.mockResolvedValue(quote());
		mockVerify.mockResolvedValue({ success: true, amountKobo: 1100000, adjusted: { quotedGrossKobo: 1025889, paidKobo: 1125889 } });
		renderIt();
		typeAmount("10000");
		await clickContinue();
		fireEvent.click(screen.getByRole("button", { name: /^Pay / }));
		await act(async () => { await mockInit.mock.calls[0][0].onSuccess({ reference: "x" }); });
		expect(screen.getByText(/You paid ₦11258\.89 instead of ₦10258\.89/)).toBeInTheDocument();
	});
});

describe("Fund screen opens on bank transfer (F18 section 13)", () => {
	it("an account with a receive-money account opens on the bank panel; card is one click away", () => {
		mockAccount = { accountNumber: "1234567890", kycStatus: "verified", dvaProvisioned: true, dvaAccountNumber: "9988776655" };
		renderIt();
		expect(screen.getByTestId("bank-panel")).toBeInTheDocument();
		fireEvent.click(screen.getByTestId("pick-card"));
		expect(screen.queryByTestId("bank-panel")).toBeNull();
		typeAmount("1000");
		expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument();
	});

	it("an unverified account funds by card with a nudge to verify", () => {
		mockAccount = { accountNumber: "1234567890", kycStatus: "pending", dvaProvisioned: false };
		renderIt();
		expect(screen.queryByTestId("bank-panel")).toBeNull();
		expect(screen.getByText("Verify your identity to fund for less")).toBeInTheDocument();
		expect(screen.getByTestId("fund-for-less")).toHaveAttribute("href", "/africanshops/finance-v2/kyc");
	});

	it("a verified account without a receive-money account is nudged to set it up", () => {
		mockAccount = { accountNumber: "1234567890", kycStatus: "verified", dvaProvisioned: false };
		renderIt();
		expect(screen.getByText("Set up bank transfer to fund for less")).toBeInTheDocument();
		expect(screen.getByTestId("fund-for-less")).toHaveAttribute("href", "/africanshops/finance-v2/receive-money");
	});
});
