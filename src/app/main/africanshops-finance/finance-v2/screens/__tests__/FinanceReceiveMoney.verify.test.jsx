import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import FinanceReceiveMoneyContent from "../FinanceReceiveMoneyContent";

let mockAccount = {};
jest.mock("react-router-dom", () => ({ ...jest.requireActual("react-router-dom"), useOutletContext: () => ({ account: mockAccount, refetchFinanceData: jest.fn() }) }));
jest.mock("../../FinanceThemeContext", () => ({ useFinanceTheme: () => ({ tokens: new Proxy({}, { get: () => "#000" }) }) }));
jest.mock("../../hooks/useFintechApi", () => ({ useProvisionMyDva: () => ({ mutate: jest.fn(), isLoading: false, error: null }), useTransactionHistory: () => ({ data: [] }) }));
jest.mock("../../financeFormat", () => ({ describeTx: () => ({ title: "" }), isCredit: () => false, nairaFull: (n) => String(n), shortDate: (d) => String(d) }));
jest.mock("framer-motion", () => ({ motion: new Proxy({}, { get: () => ({ children, ...rest }) => <div {...Object.fromEntries(Object.entries(rest).filter(([k]) => k === "data-testid"))}>{children}</div> }) }));

const renderIt = () => render(<MemoryRouter><FinanceReceiveMoneyContent /></MemoryRouter>);

describe("Receive Money for verified and unverified accounts (founder rule 2026-11-10)", () => {
	it("an unverified account is told to verify first, with a link to the KYC screen and no setup button", () => {
		mockAccount = { accountNumber: "7701502861", kycStatus: "pending", dvaProvisioned: false };
		renderIt();
		expect(screen.getByTestId("verify-first")).toBeInTheDocument();
		expect(screen.getByText("Verify your identity to get a receive-money account")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Verify my identity" })).toHaveAttribute("href", "/africanshops/finance-v2/kyc");
		expect(screen.queryByRole("button", { name: /Set Up My Receive-Money Account/ })).toBeNull();
	});

	it("a verified account without one yet still gets the setup button", () => {
		mockAccount = { accountNumber: "7701502861", kycStatus: "verified", dvaProvisioned: false };
		renderIt();
		expect(screen.queryByTestId("verify-first")).toBeNull();
		expect(screen.getByRole("button", { name: /Set Up My Receive-Money Account/ })).toBeInTheDocument();
	});

	it("an account that already has one sees it, verified or not (nothing is revoked)", () => {
		mockAccount = { accountNumber: "7701502861", kycStatus: "pending", dvaProvisioned: true, dvaAccountNumber: "9819162567", dvaBankName: "Wema Bank" };
		renderIt();
		expect(screen.queryByTestId("verify-first")).toBeNull();
		expect(screen.getByText("9819162567")).toBeInTheDocument();
	});
});
