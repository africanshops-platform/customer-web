import { act, fireEvent, render, screen } from "@testing-library/react";
import BankTransferPanel from "../BankTransferPanel";

const mockQuote = jest.fn();
jest.mock("../../../FinanceThemeContext", () => ({ useFinanceTheme: () => ({ tokens: new Proxy({}, { get: () => "#000" }) }) }));
jest.mock("../../../hooks/useFintechApi", () => ({ useFeeQuote: (op, kobo) => mockQuote(op, kobo) }));
jest.mock("../../../financeFormat", () => ({ nairaFull: (k) => `₦${(Number(k) / 100).toFixed(2)}` }));

const quoteFor = (wanted, gross) => ({
	wantedKobo: wanted,
	grossKobo: gross,
	chargeKobo: gross - wanted,
	lines: [
		{ code: "AMOUNT", label: "Amount", kind: "AMOUNT", amountKobo: wanted, explain: "" },
		{ code: "TRANSFER_FEE", label: "Processing charge", kind: "CHARGE", amountKobo: gross - wanted, explain: "Covers the bank's fee." },
	],
});

describe("BankTransferPanel (F18)", () => {
	beforeEach(() => {
		jest.useFakeTimers();
		mockQuote.mockReturnValue({ data: null, isFetching: false, error: null });
	});
	afterEach(() => jest.useRealTimers());

	it("asks for the amount in kobo and shows Send exactly with the figure to copy", () => {
		mockQuote.mockReturnValue({ data: quoteFor(1000000, 1010607), isFetching: false, error: null });
		render(<BankTransferPanel amount="10000" onAmountChange={jest.fn()} />);
		expect(mockQuote).toHaveBeenCalledWith("FUND_TRANSFER", 1000000);
		expect(screen.getByText("Send exactly")).toBeInTheDocument();
		expect(screen.getByTestId("payment-summary-total")).toHaveTextContent("₦10106.07");
		expect(screen.getByText("10106.07")).toBeInTheDocument();
	});

	it("shows the account details only when given", () => {
		const dva = { accountNumber: "9988776655", bankName: "Wema", accountName: "A B" };
		const { rerender } = render(<BankTransferPanel amount="" onAmountChange={jest.fn()} dva={dva} />);
		expect(screen.getByText("9988776655")).toBeInTheDocument();
		rerender(<BankTransferPanel amount="" onAmountChange={jest.fn()} />);
		expect(screen.queryByText("9988776655")).toBeNull();
	});

	it("a quote for an older amount is not shown while the new one loads", () => {
		mockQuote.mockReturnValue({ data: quoteFor(500000, 505556), isFetching: true, error: null });
		render(<BankTransferPanel amount="10000" onAmountChange={jest.fn()} />);
		expect(screen.queryByTestId("payment-summary")).toBeNull();
		expect(screen.queryByTestId("i-have-sent")).toBeNull();
	});

	it("a quote failure explains that any amount still works", () => {
		mockQuote.mockReturnValue({ data: null, isFetching: false, error: { response: { data: { message: "Unavailable" } } } });
		render(<BankTransferPanel amount="10000" onAmountChange={jest.fn()} />);
		expect(screen.getByTestId("transfer-quote-error")).toHaveTextContent(/Unavailable.*charge is worked out on what arrives/);
	});

	it("I've sent it -> waiting, refetches the balance, and says what arrived when the balance rises", () => {
		mockQuote.mockReturnValue({ data: quoteFor(1000000, 1010607), isFetching: false, error: null });
		const refetch = jest.fn();
		const onReceived = jest.fn();
		const { rerender } = render(<BankTransferPanel amount="10000" onAmountChange={jest.fn()} balanceKobo="10000000" refetch={refetch} onReceived={onReceived} />);
		fireEvent.click(screen.getByTestId("i-have-sent"));
		expect(screen.getByTestId("deposit-waiting")).toBeInTheDocument();

		act(() => { jest.advanceTimersByTime(6000); });
		expect(refetch).toHaveBeenCalledTimes(1);
		rerender(<BankTransferPanel amount="10000" onAmountChange={jest.fn()} balanceKobo="10000000" refetch={refetch} onReceived={onReceived} />);
		expect(screen.getByTestId("deposit-waiting")).toBeInTheDocument();

		rerender(<BankTransferPanel amount="10000" onAmountChange={jest.fn()} balanceKobo="11000000" refetch={refetch} onReceived={onReceived} />);
		expect(screen.getByTestId("deposit-received")).toHaveTextContent("₦10000.00 has arrived");
		expect(onReceived).toHaveBeenCalledTimes(1);
	});

	it("stop watching goes back to the calculator", () => {
		mockQuote.mockReturnValue({ data: quoteFor(1000000, 1010607), isFetching: false, error: null });
		render(<BankTransferPanel amount="10000" onAmountChange={jest.fn()} balanceKobo="1" refetch={jest.fn()} />);
		fireEvent.click(screen.getByTestId("i-have-sent"));
		fireEvent.click(screen.getByTestId("stop-waiting"));
		expect(screen.getByTestId("i-have-sent")).toBeInTheDocument();
	});

	it("gives up after 15 minutes and says the money is still added when it arrives", () => {
		mockQuote.mockReturnValue({ data: quoteFor(1000000, 1010607), isFetching: false, error: null });
		render(<BankTransferPanel amount="10000" onAmountChange={jest.fn()} balanceKobo="1" refetch={jest.fn()} />);
		fireEvent.click(screen.getByTestId("i-have-sent"));
		act(() => { jest.advanceTimersByTime(15 * 60 * 1000 + 12000); });
		expect(screen.getByTestId("deposit-stopped")).toBeInTheDocument();
	});
});
