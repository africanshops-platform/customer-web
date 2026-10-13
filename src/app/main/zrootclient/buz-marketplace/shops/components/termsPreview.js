/**
 * The plain-text preview of a markdown legal document: its first few lines, with the markdown syntax
 * (#, -, *, **, links) taken out, so the checkout can show a short readable excerpt before the full text.
 */
export function stripMarkdown(line) {
  return String(line)
    .replace(/^\s{0,3}#{1,6}\s+/, "") // headings
    .replace(/^\s*[-*+]\s+/, "") // bullets
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // [text](url) -> text
    .replace(/(\*\*|__)(.*?)\1/g, "$2") // bold
    .replace(/(\*|_)(.*?)\1/g, "$2") // italics
    .replace(/`([^`]*)`/g, "$1")
    .trim();
}

/** { lines, hasMore } — the first `count` non-empty lines of the document, and whether there is more after them. */
export function previewLines(markdown, count = 5) {
  const all = String(markdown ?? "")
    .split("\n")
    .filter((line) => !/^\s*>/.test(line)) // blockquotes are editorial/drafting notes, never part of the excerpt
    .map(stripMarkdown)
    .filter(Boolean);
  return { lines: all.slice(0, count), hasMore: all.length > count };
}
