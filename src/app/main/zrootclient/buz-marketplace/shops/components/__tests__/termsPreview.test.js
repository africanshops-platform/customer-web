import { previewLines, stripMarkdown } from "../termsPreview";

describe("terms preview", () => {
  it("strips headings, bullets, bold and links", () => {
    expect(stripMarkdown("## 1. Your account")).toBe("1. Your account");
    expect(stripMarkdown("- You must be **18** or older")).toBe("You must be 18 or older");
    expect(stripMarkdown("See our [Privacy Policy](/privacy) for details")).toBe("See our Privacy Policy for details");
    expect(stripMarkdown("3) Numbered clause")).toBe("3) Numbered clause"); // clause numbers are part of legal text
  });

  it("returns the first five non-empty lines and says there is more", () => {
    const md = ["# Terms", "", "Line one", "", "Line two", "- Line three", "Line four", "Line five", "Line six"].join("\n");
    const r = previewLines(md, 5);
    expect(r.lines).toEqual(["Terms", "Line one", "Line two", "Line three", "Line four"]);
    expect(r.hasMore).toBe(true);
  });

  it("skips blockquote lines (drafting notes) in the excerpt", () => {
    const r = previewLines(["> Drafting note: not yet reviewed", "# Terms", "Real first line"].join("\n"), 5);
    expect(r.lines).toEqual(["Terms", "Real first line"]);
  });

  it("a short document has no 'more'", () => {
    expect(previewLines("Only one line").hasMore).toBe(false);
    expect(previewLines("").lines).toEqual([]);
    expect(previewLines(undefined).hasMore).toBe(false);
  });
});
