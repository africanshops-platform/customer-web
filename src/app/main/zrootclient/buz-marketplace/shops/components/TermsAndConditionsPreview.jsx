import { useMemo, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Skeleton } from "@mui/material";
import { Close } from "@mui/icons-material";
import SimpleMarkdown from "src/app/shared-components/SimpleMarkdown";
import { useLegalDocument } from "src/app/aaqueryhooks/legalDocumentQueries";
import { LEGAL_DOCUMENT_KEYS } from "src/app/constants/legalDocumentKeys";
import { previewLines } from "./termsPreview";

/**
 * The live Terms & Conditions (published by the platform in the corporate CMS) on the checkout: the first
 * five lines, with "Read more" opening the full document in a modal so buyers can read it properly.
 */
function TermsAndConditionsPreview() {
  const { data: doc, isLoading, isError } = useLegalDocument(LEGAL_DOCUMENT_KEYS.TERMS_AND_CONDITIONS);
  const [open, setOpen] = useState(false);
  const { lines, hasMore } = useMemo(() => previewLines(doc?.content, 5), [doc?.content]);

  if (isLoading) {
    return (
      <div data-testid="terms-loading">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="text" width={i === 4 ? "60%" : "100%"} />
        ))}
      </div>
    );
  }

  if (isError || !doc || !lines.length) {
    return (
      <p className="text-sm text-gray-600 leading-relaxed" data-testid="terms-unavailable">
        The Terms &amp; Conditions couldn&apos;t be loaded right now. By placing an order you agree to
        AfricanShops&apos; Terms &amp; Conditions — please try again in a moment to read them in full.
      </p>
    );
  }

  const updated = doc.publishedAt || doc.updatedAt;

  return (
    <div data-testid="terms-preview">
      <div className="relative">
        {lines.map((line, i) => (
          <p key={i} className="text-sm text-gray-700 mb-2 leading-relaxed">
            {line}
          </p>
        ))}
        {hasMore && (
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-10 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, rgba(249,250,251,0), rgba(249,250,251,1))" }}
          />
        )}
      </div>
      <Button
        onClick={() => setOpen(true)}
        data-testid="terms-read-more"
        sx={{ textTransform: "none", fontWeight: 700, color: "#ea580c", p: 0, mt: 0.5, minWidth: 0 }}
      >
        Read more
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md" scroll="paper" className="checkout-comfort">
        <DialogTitle sx={{ pr: 6 }}>
          {doc.title}
          <div className="text-xs font-normal text-gray-500 mt-1">
            {doc.version ? `Version ${doc.version}` : ""}
            {doc.version && updated ? " · " : ""}
            {updated
              ? `Last updated ${new Date(updated).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}`
              : ""}
          </div>
          <IconButton aria-label="close" onClick={() => setOpen(false)} sx={{ position: "absolute", right: 8, top: 8 }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers data-testid="terms-full">
          <SimpleMarkdown content={doc.content} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} sx={{ textTransform: "none", fontWeight: 600 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default TermsAndConditionsPreview;
