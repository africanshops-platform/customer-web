import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import FinanceFundAccountContent from "../FinanceFundAccountContent";

const mockInit = jest.fn();
let mockReadiness = { blocked: false, message: null };
jest.mock("react-router-dom", () => ({ ...jest.requireActual("react-router-dom"), useOutletContext: () => ({ account: { accountNumber: "7701502861" }, balance: {}, refetchFinanceData: jest.fn() }) }));
jest.mock("react-paystack", () => ({ usePaystackPayment: () => mockInit }));
jest.mock("app/store/hooks", () => ({ useAppSelector: () => ({ email: "a@b.com" }) }));
jest.mock("src/app/auth/user/store/userSlice", () => ({ selectUser: () => ({}) }));
jest.mock("../../FinanceThemeContext", () => ({ useFinanceTheme: () => ({ tokens: new Proxy({}, { get: () => "#000" }) }) }));
jest.mock("../../hooks/useFintechApi", () => ({
	useVerifyWalletFunding: () => ({ mutate: jest.fn(), isLoading: false, error: null }),
	useTransactionHistory: () => ({ data: [], refetch: jest.fn() }),
	useCreateFundingIntent: () => ({
		mutate: jest.fn().mockResolvedValue({ reference: "AFSHFUND1", intendedKobo: 100000, chargeKobo: 0, grossKobo: 100000, expiresAt: new Date(Date.now() + 3600000).toISOString(), lines: [{ code: "AMOUNT", label: "Amount", kind: "AMOUNT", amountKobo: 100000 }] }),
		isLoading: false,
	}),
	useFeeQuote: () => ({ data: null, isFetching: false, error: null }),
}));
jest.mock("../../hooks/useFinanceSwitches", () => ({ useWalletFundingReadiness: () => mockReadiness }));
jest.mock("../../financeFormat", () => ({ describeTx: () => ({ title: "" }), isCredit: () => false, nairaFull: (n) => String(n), shortDate: (d) => String(d) }));
jest.mock("framer-motion", () => ({ motion: new Proxy({}, { get: () => ({ children }) => <div>{children}</div> }) }));
jest.mock("../shared/BankTransferPanel", () => () => null);

const renderIt = () => render(<MemoryRouter><FinanceFundAccountContent /></MemoryRouter>);
const typeAmount = (v) => fireEvent.change(screen.getByPlaceholderText(/0/), { target: { value: v } });

describe("Fund account button follows the wallet-funding switch (board F17)", () => {
	beforeEach(() => { jest.clearAllMocks(); });

	it("funding open: Continue shows the summary, then Pay opens the Paystack popup", async () => {
		mockReadiness = { blocked: false, message: null };
		renderIt();
		typeAmount("1000");
		const cont = screen.getByRole("button", { name: "Continue" });
		expect(cont).toBeEnabled();
		fireEvent.click(cont);
		const pay = await screen.findByRole("button", { name: /^Pay / });
		expect(mockInit).not.toHaveBeenCalled();
		fireEvent.click(pay);
		expect(mockInit).toHaveBeenCalledTimes(1);
	});

	it("funding in maintenance: the button stays on screen, disabled, saying why; the popup never opens", () => {
		mockReadiness = { blocked: true, message: "Wallet funding is under maintenance. Please try again shortly." };
		renderIt();
		typeAmount("1000");
		const btn = screen.getByRole("button", { name: "Temporarily unavailable" });
		expect(btn).toBeDisabled();
		expect(screen.getByRole("status")).toHaveTextContent("under maintenance");
		fireEvent.click(btn);
		expect(mockInit).not.toHaveBeenCalled();
	});
});
