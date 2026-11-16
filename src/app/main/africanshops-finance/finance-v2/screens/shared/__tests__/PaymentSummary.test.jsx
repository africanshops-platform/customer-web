import { fireEvent, render, screen } from "@testing-library/react";
import PaymentSummary from "../PaymentSummary";

jest.mock("../../../FinanceThemeContext", () => ({ useFinanceTheme: () => ({ tokens: new Proxy({}, { get: () => "#000" }) }) }));
jest.mock("../../../financeFormat", () => ({ nairaFull: (k) => `₦${(Number(k) / 100).toFixed(2)}` }));

const charged = [
	{ code: "AMOUNT", label: "Amount", kind: "AMOUNT", amountKobo: 1000000, explain: "" },
	{ code: "CARD_PROCESSING_FEE", label: "Processing charge", kind: "CHARGE", amountKobo: 25889, explain: "Covers the card network's fee." },
];

describe("PaymentSummary", () => {
	it("shows the amount, each charge and the total as the server sent them", () => {
		render(<PaymentSummary lines={charged} totalLabel="You pay" totalKobo={1025889} />);
		expect(screen.getByText("Wallet receives")).toBeInTheDocument();
		expect(screen.getByText("₦10000.00")).toBeInTheDocument();
		expect(screen.getByText("₦258.89")).toBeInTheDocument();
		expect(screen.getByTestId("payment-summary-total")).toHaveTextContent("₦10258.89");
	});

	it("What is this? shows and hides the policy's own explanation", () => {
		render(<PaymentSummary lines={charged} totalLabel="You pay" totalKobo={1025889} />);
		expect(screen.queryByText("Covers the card network's fee.")).toBeNull();
		fireEvent.click(screen.getByTestId("explain-CARD_PROCESSING_FEE"));
		expect(screen.getByText("Covers the card network's fee.")).toBeInTheDocument();
		fireEvent.click(screen.getByTestId("explain-CARD_PROCESSING_FEE"));
		expect(screen.queryByText("Covers the card network's fee.")).toBeNull();
	});

	it("no charge line from the server: an explicit Free row and the total equals the amount", () => {
		render(<PaymentSummary lines={[charged[0]]} totalLabel="You pay" totalKobo={1000000} />);
		expect(screen.getByText("Processing charge")).toBeInTheDocument();
		expect(screen.getByText("Free")).toBeInTheDocument();
		expect(screen.getByTestId("payment-summary-total")).toHaveTextContent("₦10000.00");
	});
});
