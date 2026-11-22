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


const typeNote = (v) => fireEvent.change(screen.getByTestId("transfer-description"), { target: { value: v } });
const pay = async () => {
	fireEvent.change(screen.getByTestId("pin"), { target: { value: "123456" } });
	await act(async () => { fireEvent.click(screen.getByRole("button", { name: /^Confirm/ })); });
};

describe("Send to Bank: the sender's optional description (Q10)", () => {
	beforeEach(() => { jest.clearAllMocks(); mockBalance = "5000000"; mockQuoteHook.mockReturnValue({ data: quote(), isFetching: false, error: null }); });

	it("is optional: leaving it empty still continues, and the request carries no narration", async () => {
		mockInitiate.mockResolvedValue({ requiresOtp: false, btxId: "b", totalDebitKobo: 2009000 });
		renderIt();
		await goToConfirm();
		await pay();
		expect(mockInitiate).toHaveBeenCalledTimes(1);
		expect(mockInitiate.mock.calls[0][0]).not.toHaveProperty("narration");
	});

	it("caps the box at 100 characters and shows a live count", () => {
		renderIt();
		const box = screen.getByTestId("transfer-description");
		expect(box).toHaveAttribute("maxLength", "100");
		expect(screen.getByTestId("transfer-description-count")).toHaveTextContent("0/100");
		typeNote("Rent for November");
		expect(screen.getByTestId("transfer-description-count")).toHaveTextContent("17/100");
	});

	it("shows the note on the Confirm step and sends it trimmed with the transfer", async () => {
		mockInitiate.mockResolvedValue({ requiresOtp: false, btxId: "b", totalDebitKobo: 2009000, narration: "Rent for November" });
		renderIt();
		typeNote("  Rent for November  ");
		await goToConfirm();
		expect(screen.getByTestId("confirm-description")).toHaveTextContent("Rent for November");
		await pay();
		expect(mockInitiate).toHaveBeenCalledWith(expect.objectContaining({ amountKobo: 2000000, beneficiaryId: "b1", narration: "Rent for November" }));
	});

	it("shows the note on the success screen from the server's answer", async () => {
		mockInitiate.mockResolvedValue({ requiresOtp: false, btxId: "b", totalDebitKobo: 2009000, narration: "Rent for November", transferCode: "TRF_x" });
		renderIt();
		typeNote("Rent for November");
		await goToConfirm();
		await pay();
		expect(screen.getByTestId("success-description")).toHaveTextContent("Rent for November");
	});

	it("a note made only of spaces counts as no note", async () => {
		mockInitiate.mockResolvedValue({ requiresOtp: false, btxId: "b", totalDebitKobo: 2009000 });
		renderIt();
		typeNote("     ");
		await goToConfirm();
		expect(screen.queryByTestId("confirm-description")).not.toBeInTheDocument();
		await pay();
		expect(mockInitiate.mock.calls[0][0]).not.toHaveProperty("narration");
	});
});
