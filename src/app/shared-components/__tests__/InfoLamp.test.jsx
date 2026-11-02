import { render, screen } from "@testing-library/react";
import InfoLamp from "../InfoLamp";

describe("InfoLamp (checkout heads-up)", () => {
  it("is an accessible, informational lamp and never a control that blocks checkout", () => {
    const { container } = render(<InfoLamp />);
    expect(screen.getByRole("img", { name: "Good to know" })).toBeTruthy();
    expect(container.querySelector("input, button, [role='checkbox']")).toBeNull();
  });

  it("takes a custom label", () => {
    render(<InfoLamp label="About these terms" />);
    expect(screen.getByRole("img", { name: "About these terms" })).toBeTruthy();
  });
});
