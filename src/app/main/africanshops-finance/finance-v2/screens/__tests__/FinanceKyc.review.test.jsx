import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import FinanceKycContent from "../FinanceKycContent";

let mockSubmission = null;
const mockRefetch = jest.fn();
jest.mock("react-router-dom", () => ({ ...jest.requireActual("react-router-dom"), useOutletContext: () => ({ account: { accountNumber: "7330088607" } }) }));
jest.mock("../../FinanceThemeContext", () => ({ useFinanceTheme: () => ({ tokens: new Proxy({}, { get: () => "#000" }) }) }));
jest.mock("framer-motion", () => ({ motion: new Proxy({}, { get: () => ({ children }) => <div>{children}</div> }) }));
jest.mock("react-toastify", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock("app/configs/data/server-calls/auth/userapp/a_kyc/useKycRepo", () => ({ uploadDocumentImage: jest.fn() }));
jest.mock("../../hooks/useFintechApi", () => ({
	useFintechKycStatus: () => ({ data: mockSubmission, isLoading: false, refetch: mockRefetch }),
	useSubmitNationalId: () => ({ mutate: jest.fn(), isLoading: false }),
	useSubmitIdentity: () => ({ mutate: jest.fn(), isLoading: false }),
	useSubmitUtilityBill: () => ({ mutate: jest.fn(), isLoading: false }),
}));

const renderIt = () => render(<MemoryRouter><FinanceKycContent /></MemoryRouter>);

describe("KYC page: what the reviewer said (Q11)", () => {
	beforeEach(() => { jest.clearAllMocks(); });

	it("a document sent back for more information says so, with the reviewer's message, and offers the upload again", () => {
		mockSubmission = { overallStatus: "rejected", nationalIdStatus: "rejected", nationalIdReviewKind: "INFO_REQUESTED", nationalIdRejectionReason: "Please upload the back of the card too", identityStatus: "pending", utilityBillStatus: "pending" };
		renderIt();
		expect(screen.getByText("MORE INFO NEEDED")).toBeInTheDocument();
		const msg = screen.getByTestId("review-message");
		expect(msg).toHaveTextContent("We need more from you: Please upload the back of the card too");
		expect(msg).toHaveTextContent("upload it again");
		expect(screen.getByLabelText("ID number")).toBeInTheDocument(); // the form is back
	});

	it("a plain rejection keeps its wording", () => {
		mockSubmission = { overallStatus: "rejected", nationalIdStatus: "rejected", nationalIdReviewKind: "REJECTED", nationalIdRejectionReason: "The photo is blurry", identityStatus: "pending", utilityBillStatus: "pending" };
		renderIt();
		expect(screen.getByText("REJECTED")).toBeInTheDocument();
		expect(screen.getByTestId("review-message")).toHaveTextContent("Rejected: The photo is blurry — please resubmit below.");
	});

	it("an older answer with no kind still reads as a rejection", () => {
		mockSubmission = { overallStatus: "rejected", utilityBillStatus: "rejected", utilityBillRejectionReason: "Too old", nationalIdStatus: "pending", identityStatus: "pending" };
		renderIt();
		expect(screen.getByTestId("review-message")).toHaveTextContent("Rejected: Too old");
	});
});
