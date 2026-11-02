import { useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { toast } from "react-toastify";
import SimpleMarkdown from "src/app/shared-components/SimpleMarkdown";
import { useLegalDocument } from "src/app/aaqueryhooks/legalDocumentQueries";
import { LEGAL_DOCUMENT_KEYS } from "src/app/constants/legalDocumentKeys";
import {
  acceptFeedGuidelinesApi,
  reportFeedPostApi,
} from "app/configs/data/client/RepositoryAuthClient";
import { REPORT_REASONS } from "./feedTime";

const FALLBACK_RULES = [
  "Share things about your business, what you sell and what you are learning.",
  "Be honest and be kind. No harassment, hate or false claims.",
  "No adverts for other platforms and no requests to trade outside AfricanShops.",
  "Anything that breaks these rules can be hidden or removed, and repeat offenders lose posting.",
];

/**
 * Reporting a post: the community guidelines first (once, and again whenever they change), then the reason.
 * `step` is "guidelines" or "report"; the parent decides which one to open with after checking the person's status.
 */
function ReportFlow({ post, step, onStep, onClose }) {
  const [reason, setReason] = useState("OFF_TOPIC");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const { data: doc } = useLegalDocument(LEGAL_DOCUMENT_KEYS.COMMUNITY_GUIDELINES);

  if (!post || !step) return null;

  const accept = async () => {
    setBusy(true);
    try {
      await acceptFeedGuidelinesApi();
      onStep("report");
    } catch (err) {
      toast.error(err?.response?.data?.message || "We could not save that. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    setBusy(true);
    try {
      const res = await reportFeedPostApi({
        postId: post.id,
        reason,
        note: note.trim() || undefined,
      });
      toast.success(res?.data?.message || "Thanks. We will review this post.");
      onClose();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "We could not send your report. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onClose={busy ? undefined : onClose} fullWidth maxWidth="sm" scroll="paper">
      <div className="sp">
        {step === "guidelines" ? (
          <>
            <DialogTitle sx={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>
              Community guidelines
            </DialogTitle>
            <DialogContent dividers data-testid="feed-guidelines">
              {doc?.data?.content ? (
                <SimpleMarkdown content={doc.data.content} />
              ) : (
                <ul className="sp-rules-list">
                  {FALLBACK_RULES.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <button type="button" className="sp-btn" onClick={onClose} disabled={busy}>
                Not now
              </button>
              <button type="button" className="sp-btn sp-primary" onClick={accept} disabled={busy}>
                {busy ? "Saving…" : "I agree and continue"}
              </button>
            </DialogActions>
          </>
        ) : (
          <>
            <DialogTitle sx={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>
              Report this post
            </DialogTitle>
            <DialogContent dividers data-testid="feed-report">
              <fieldset className="sp-reasons">
                <legend>What is wrong with it?</legend>
                {REPORT_REASONS.map((r) => (
                  <label key={r.value} htmlFor={`feed-report-${r.value}`}>
                    <input
                      id={`feed-report-${r.value}`}
                      type="radio"
                      name="feed-report-reason"
                      value={r.value}
                      checked={reason === r.value}
                      onChange={() => setReason(r.value)}
                    />
                    {r.label}
                  </label>
                ))}
              </fieldset>
              <label className="sp-note" htmlFor="feed-report-note">
                Tell us more (optional)
                <textarea
                  id="feed-report-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={500}
                  rows={3}
                />
              </label>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <button type="button" className="sp-btn" onClick={onClose} disabled={busy}>
                Cancel
              </button>
              <button type="button" className="sp-btn sp-primary" onClick={submit} disabled={busy}>
                {busy ? "Sending…" : "Send report"}
              </button>
            </DialogActions>
          </>
        )}
      </div>
    </Dialog>
  );
}

export default ReportFlow;
