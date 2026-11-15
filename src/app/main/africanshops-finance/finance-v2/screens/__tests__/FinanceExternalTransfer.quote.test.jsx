import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import FinanceExternalTransferContent from "../FinanceExternalTransferContent";

// jsdom has no crypto.randomUUID (the screen uses it for its idempotency key)
if (!globalThis.crypto?.randomUUID) Object.defineProperty(globalThis, "crypto", { value: { ...(globalThis.crypto || {}), randomUUID: () => "test-uuid" }, configurable: true });

const mockInitiate = jest.fn();
const mockQuoteHook = jest.fn();
let mockBalance = "5000000"; // 50,000.00 naira in kobo
jest.mock("react-router-dom", () => ({ ...jest.requireActual("react-router-dom"), useOutletContext: () => ({ account: { accountNumber: "1234567890" }, balance: { availableBalance: mockBalance }, refetchFinanceData: jest.fn() }) }));
jest.mock("../../FinanceThemeContext", () => ({ useFinanceTheme: () => ({ tokens: new Proxy({}, { get: () => "#000" }) }) }));
jest.mock("../../hooks/useFintechApi", () => ({
	useExternalTransferInitiate: () => ({ mutate: (...a) => mockInitiate(...a), isLoading: false }),
	useExternalTransferConfirm: () => ({ mutate: jest.fn(), isLoading: false }),
	useBanksList: () => ({ data: [{ code: "057", name: "Zenith Bank" }], isLoading: false }),
	useDeleteBeneficiary: () => ({ mutate: jest.fn() }),
	useFintechKycStatus: () => ({ data: null }),
	usePayoutQuote: (...a) => mockQuoteHook(...a),
}));
jest.mock("../../hooks/useFinanceSwitches", () => ({ useFinanceSwitches: () => ({ statuses: {} }), switchNotice: () => null }));
jest.mock("../../financeFormat", () => ({ nairaFull: (k) => `₦${(Number(k) / 100).toFixed(2)}` }));
jest.mock("framer-motion", () => ({ motion: new Proxy({}, { get: () => ({ children }) => <div>{children}</div> }), AnimatePresence: ({ children }) => <>{children}</> }));
jest.mock("../shared/BeneficiaryPicker", () => ({ onSelect }) => (
	<button type="button" onClick={() => onSelect({ id: "b1", beneficiaryAccountName: "Grace Adekunle", beneficiaryBankCode: "057", beneficiaryAccountNumber: "1234567890" })}>pick-beneficiary</button>
));
jest.mock("../shared/TransactionPinField", () => ({ value, onChange }) => <input data-testid="pin" value={value} onChange={(e) => onChange(e.target.value)} />);
jest.mock("../shared/PartialKycAllowanceBanner", () => ({ __esModule: true, default: () => null, exceedsMonthlyAllowance: () => false }));
jest.mock("../shared/ForgotPinDialog", () => () => null);
jest.mock("../shared/OtpTimer", () => () => null);

const quote = (over = {}) => ({
	operation: "PAYOUT", kind: "EXTERNAL_TRANSFER", wantedKobo: 2000000, grossKobo: 2009000, chargeKobo: 9000, requiresOtp: false,
	lines: [
		{ code: "AMOUNT", label: "They receive", kind: "AMOUNT", amountKobo: 2000000, explain: "" },
		{ code: "TRANSFER_FEE", label: "Transaction fee", kind: "CHARGE", amountKobo: 4000, explain: "Covers sending your money to the bank." },
		{ code: "PAYOUT_STAMP_DUTY", label: "Stamp duty", kind: "LEVY", amountKobo: 5000, explain: "Government levy on transfers of N10,000 or more." },
	],
	...over,
});
const renderIt = () => render(<MemoryRouter><FinanceExternalTransferContent /></MemoryRouter>);
const goToConfirm = async (amount = "20000") => {
	fireEvent.change(screen.getByPlaceholderText(/0/), { target: { value: amount } });
	fireEvent.click(screen.getByText("pick-beneficiary"));
	await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Continue" })); });
};

describe("Send to Bank with the server's Payment summary (F18)", () => {
	beforeEach(() => { jest.clearAllMocks(); mockBalance = "5000000"; mockQuoteHook.mockReturnValue({ data: quote(), isFetching: false, error: null }); });

	it("asks the server for the quote in kobo for an EXTERNAL_TRANSFER, as soon as the amount is typed", async () => {
		renderIt();
		fireEvent.change(screen.getByPlaceholderText(/0/), { target: { value: "20000" } });
		expect(mockQuoteHook).toHaveBeenLastCalledWith("EXTERNAL_TRANSFER", 2000000);
	});

	it("the confirm step shows the server's lines, ONE Transaction fee that is never itemized, the stamp duty, the total and the balance after", async () => {
		renderIt();
		await goToConfirm();
		expect(screen.getByTestId("payout-summary")).toBeInTheDocument();
		expect(screen.getByTestId("payout-summary")).toHaveTextContent("They receive");
		expect(screen.getByText("Transaction fee")).toBeInTheDocument();
		expect(screen.getByText("Stamp duty")).toBeInTheDocument();
		expect(screen.getByTestId("payout-summary-total")).toHaveTextContent("₦20090.00");
		expect(screen.getByTestId("balance-after")).toHaveTextContent("₦29910.00");
		// trade secret (founder 15 Nov): tapping "What is this?" explains the fee but never lists or names its parts
		fireEvent.click(screen.getByTestId("explain-TRANSFER_FEE"));
		expect(screen.getByTestId("explain-text-TRANSFER_FEE")).toHaveTextContent("Covers sending your money to the bank.");
		expect(screen.queryByTestId("parts-TRANSFER_FEE")).not.toBeInTheDocument();
		expect(document.body.textContent).not.toMatch(/AfricanShops fee|Platform fee|Bank transfer charge/i);
	});

	it("Confirm shows the total and stays disabled until a 6-digit PIN is typed; it sends the typed amount, not the total", async () => {
		mockInitiate.mockResolvedValue({ requiresOtp: false, btxId: "b", totalDebitKobo: 2009000 });
		renderIt();
		await goToConfirm();
		expect(screen.getByRole("button", { name: "Confirm · ₦20090.00" })).toBeDisabled();
		fireEvent.change(screen.getByTestId("pin"), { target: { value: "123456" } });
		// re-query: the mocked motion wrapper remounts the step on every render
		const btn = screen.getByRole("button", { name: "Confirm · ₦20090.00" });
		expect(btn).toBeEnabled();
		await act(async () => { fireEvent.click(btn); });
		expect(mockInitiate).toHaveBeenCalledWith(expect.objectContaining({ amountKobo: 2000000, beneficiaryId: "b1", transactionPin: "123456" }));
	});

	it("the code step shows ONE Transaction fee from the server's feeKobo and never a Platform fee or Paystack fee (trade secret, F18n)", async () => {
		mockInitiate.mockResolvedValue({ requiresOtp: true, btxId: "b", amountKobo: 2000000, feeKobo: 3500, totalDebitKobo: 2003500, expiresAt: new Date(Date.now() + 600000).toISOString() });
		renderIt();
		await goToConfirm();
		fireEvent.change(screen.getByTestId("pin"), { target: { value: "123456" } });
		await act(async () => { fireEvent.click(screen.getByRole("button", { name: /^Confirm/ })); });
		expect(screen.getByText("Transaction fee")).toBeInTheDocument();
		expect(document.body.textContent).toContain("₦35.00");
		expect(document.body.textContent).toContain("₦20,035.00");
		expect(document.body.textContent).not.toMatch(/Platform fee|Paystack fee|AfricanShops fee/i);
	});

	it("says up front that an emailed code will be needed when the server says so", async () => {
		mockQuoteHook.mockReturnValue({ data: quote({ requiresOtp: true }), isFetching: false, error: null });
		renderIt();
		await goToConfirm();
		expect(screen.getByTestId("otp-notice")).toHaveTextContent(/6-digit code/);
	});

	it("blocks Confirm and explains when the total with fees is more than the wallet has", async () => {
		mockBalance = "2005000"; // 20,050.00: covers 20,000 but not 20,090
		renderIt();
		await goToConfirm();
		expect(screen.getByTestId("over-balance")).toBeInTheDocument();
		fireEvent.change(screen.getByTestId("pin"), { target: { value: "123456" } });
		expect(screen.getByRole("button", { name: /^Confirm/ })).toBeDisabled();
	});

	it("while the quote has not arrived Confirm is disabled and a waiting line is shown; a failed quote says so", async () => {
		mockQuoteHook.mockReturnValue({ data: null, isFetching: true, error: null });
		const { unmount } = renderIt();
		await goToConfirm();
		expect(screen.getByText(/Working out the fees/)).toBeInTheDocument();
		fireEvent.change(screen.getByTestId("pin"), { target: { value: "123456" } });
		expect(screen.getByRole("button", { name: "Confirm Transfer" })).toBeDisabled();
		unmount();
		mockQuoteHook.mockReturnValue({ data: null, isFetching: false, error: new Error("x") });
		renderIt();
		await goToConfirm();
		expect(screen.getByText(/could not load the fees/i)).toBeInTheDocument();
	});
});
