import { fireEvent, render, screen, within } from "@testing-library/react";
import TermsAndConditionsPreview from "../TermsAndConditionsPreview";

let mockState;
jest.mock("src/app/aaqueryhooks/legalDocumentQueries", () => ({ useLegalDocument: () => mockState }));

const longDoc = {
  title: "AfricanShops Terms and Conditions",
  version: 2,
  publishedAt: "2026-10-01T00:00:00Z",
  content: ["# Terms", "", ...Array.from({ length: 12 }, (_, i) => `Clause ${i + 1} of the agreement.`)].join("\n"),
};

describe("TermsAndConditionsPreview (live terms on checkout)", () => {
  it("shows only the first five lines, with a Read more link", () => {
    mockState = { data: longDoc, isLoading: false, isError: false };
    render(<TermsAndConditionsPreview />);
    const preview = screen.getByTestId("terms-preview");
    expect(preview.querySelectorAll("p")).toHaveLength(5);
    expect(within(preview).getByText("Clause 4 of the agreement.")).toBeTruthy();
    expect(within(preview).queryByText("Clause 5 of the agreement.")).toBeNull(); // the 6th line overall is hidden
    expect(screen.getByTestId("terms-read-more")).toBeTruthy();
  });

  it("Read more opens a modal with the full document", () => {
    mockState = { data: longDoc, isLoading: false, isError: false };
    render(<TermsAndConditionsPreview />);
    expect(screen.queryByTestId("terms-full")).toBeNull();
    fireEvent.click(screen.getByTestId("terms-read-more"));
    const full = screen.getByTestId("terms-full");
    expect(within(full).getByText("Clause 12 of the agreement.")).toBeTruthy();
    expect(screen.getByText("AfricanShops Terms and Conditions")).toBeTruthy();
    expect(screen.getByText(/Version 2/)).toBeTruthy();
  });

  it("shows loading placeholders, then an honest fallback if the terms aren't published", () => {
    mockState = { data: undefined, isLoading: true, isError: false };
    const { rerender } = render(<TermsAndConditionsPreview />);
    expect(screen.getByTestId("terms-loading")).toBeTruthy();
    mockState = { data: undefined, isLoading: false, isError: true };
    rerender(<TermsAndConditionsPreview />);
    expect(screen.getByTestId("terms-unavailable")).toBeTruthy();
    expect(screen.queryByTestId("terms-read-more")).toBeNull();
  });
});
