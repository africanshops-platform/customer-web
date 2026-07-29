import { useRef, useState } from "react";
import {
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  MenuItem,
  FormControlLabel,
  Checkbox,
  IconButton,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useAppSelector } from "app/store/hooks";
// import { selectFuseCurrentLayoutConfig } from '@fuse/core/FuseSettings/fuseSettingsSlice';
import { selectUser } from "src/app/auth/user/store/userSlice";
import NavLinkAdapter from "@fuse/core/NavLinkAdapter";
import { useCreateInspectionSchedule } from "app/configs/data/server-calls/auth/userapp/a_estates/useInspectionScheduleRepo";
import {
  useCreatePropertyOffer,
  useUploadOfferAttachment,
} from "app/configs/data/server-calls/auth/userapp/a_estates/useOffersRepo";

const FINANCING_TYPES = ["Cash", "Mortgage", "Installment"];

// Mirrors the gateway's REALESTATE_OFFER_MIN_BALANCE_MESSAGE
// (apps/africanshops-gateway/src/app/realestate-offers/realestate-offers.service.ts) —
// used to detect the financial-engagement-gate rejection and show a "top up"
// CTA instead of just a generic error toast.
const WALLET_GATE_KEYWORD = "minimum wallet balance";
const FUND_WALLET_ROUTE = "/africanshops/finance-v2/fund-account";

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * PropertyInteractionCard Component
 * Provides user interaction options for properties: Schedule Inspection, Make Offer, Chat with Agent
 */
function PropertyInteractionCard({ propertyData, realtorInfo }) {
  const user = useAppSelector(selectUser);
  const isAuthenticated = user?.id && user?.role?.length > 0;

  const [inspectionDialogOpen, setInspectionDialogOpen] = useState(false);
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);

  // Form states
  const [inspectionDate, setInspectionDate] = useState("");
  const [inspectionTime, setInspectionTime] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [inspectionNotes, setInspectionNotes] = useState("");
  const [offerAmount, setOfferAmount] = useState("");
  const [offerPhone, setOfferPhone] = useState("");
  const [offerMessage, setOfferMessage] = useState("");
  const [financingType, setFinancingType] = useState("Cash");
  const [isPreApproved, setIsPreApproved] = useState(false);
  const [proposedMoveInDate, setProposedMoveInDate] = useState("");
  const [proposedClosingDate, setProposedClosingDate] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [specialConditions, setSpecialConditions] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [offerStep, setOfferStep] = useState("form"); // 'form' | 'review'
  const [offerSubmitError, setOfferSubmitError] = useState(null);
  const fileInputRef = useRef(null);

  // Mutations
  const createInspectionMutation = useCreateInspectionSchedule();
  const createOfferMutation = useCreatePropertyOffer();
  const uploadAttachmentMutation = useUploadOfferAttachment();

  const resetOfferForm = () => {
    setOfferAmount("");
    setOfferPhone("");
    setOfferMessage("");
    setFinancingType("Cash");
    setIsPreApproved(false);
    setProposedMoveInDate("");
    setProposedClosingDate("");
    setDepositAmount("");
    setSpecialConditions("");
    setAttachments([]);
    setOfferStep("form");
    setOfferSubmitError(null);
  };

  const handleCloseOfferDialog = () => {
    setOfferDialogOpen(false);
    resetOfferForm();
  };

  const handleAttachmentSelect = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    try {
      const dataUrl = await readFileAsDataUrl(file);
      const result = await uploadAttachmentMutation.mutateAsync(dataUrl);
      const url = result?.data?.url;
      if (url) setAttachments((prev) => [...prev, { url, name: file.name }]);
    } catch (err) {
      // useUploadOfferAttachment already toasts the error
      console.error("Attachment upload failed:", err);
    }
  };

  const handleRemoveAttachment = (url) => {
    setAttachments((prev) => prev.filter((a) => a.url !== url));
  };

  const handleScheduleInspection = () => {
    // Prepare inspection schedule data with all required fields
    const inspectionData = {
      propertyId: propertyData?.id,
      scheduledDate: inspectionDate,
      scheduledTimeSlot: inspectionTime, // Changed from timeSlot to scheduledTimeSlot to match API
      userName:
        user?.data?.name ||
        user?.name ||
        `${user?.data?.firstName || ""} ${user?.data?.lastName || ""}`.trim(),
      userEmail: user?.data?.email || user?.email,
      userPhone, // Use the phone number from the form input
      notes: inspectionNotes,
    };

    // Call mutation to create inspection schedule
    createInspectionMutation.mutate(inspectionData, {
      onSuccess: () => {
        // Close dialog and reset form on success
        setInspectionDialogOpen(false);
        setInspectionDate("");
        setInspectionTime("");
        setUserPhone("");
        setInspectionNotes("");
      },
    });
  };

  const handleMakeOffer = () => {
    setOfferSubmitError(null);
    // Prepare offer data with all required fields
    const offerData = {
      propertyId: propertyData?.id,
      offerAmount: parseFloat(offerAmount),
      buyerName:
        user?.data?.name ||
        user?.name ||
        `${user?.data?.firstName || ""} ${user?.data?.lastName || ""}`.trim(),
      buyerEmail: user?.data?.email || user?.email,
      buyerPhone: offerPhone,
      financingType,
      isPreApproved,
      ...(proposedMoveInDate ? { proposedMoveInDate } : {}),
      ...(proposedClosingDate ? { proposedClosingDate } : {}),
      ...(offerMessage ? { message: offerMessage } : {}),
      ...(depositAmount ? { depositAmount: parseFloat(depositAmount) } : {}),
      ...(specialConditions ? { specialConditions } : {}),
      ...(attachments.length > 0 ? { attachments } : {}),
    };

    // Call mutation to create offer
    createOfferMutation.mutate(offerData, {
      onSuccess: () => {
        // Close dialog and reset form on success
        setOfferDialogOpen(false);
        resetOfferForm();
      },
      onError: (error) => {
        // The hook itself already toasts this error; this keeps the dialog
        // open (so the user doesn't lose their filled-out form/attachments)
        // and shows an inline, actionable message on the review step.
        const errorData = error?.response?.data;
        const message = Array.isArray(errorData?.message)
          ? errorData.message.join(" ")
          : errorData?.message || error?.message || "Failed to submit offer";
        setOfferSubmitError(message);
      },
    });
  };

  const handleChatNow = () => {
    // TODO: Implement chat functionality
    console.log("Open Chat with realtor:", realtorInfo?.id);
  };

  return (
    <>
      <div
        className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border-2 border-gray-100 overflow-hidden"
        style={{ height: "50vh", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="bg-white p-1.5 rounded-lg shadow-md">
              <i className="fas fa-handshake text-orange-600 text-lg" />
            </div>
            <Typography className="text-white font-bold text-lg tracking-wide">
              PROPERTY ACTIONS
            </Typography>
          </div>
        </div>

        {/* Content */}
        <div
          className="p-4 flex-1 overflow-y-auto"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#d1d5db transparent",
          }}
        >
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white rounded-lg p-3 text-center border border-gray-200 shadow-sm">
              <div className="flex items-center justify-center mb-1">
                <i className="fas fa-eye text-blue-500 text-xl" />
              </div>
              <p className="text-xl font-bold text-gray-900">{propertyData?.views || 243}</p>
              <p className="text-sm text-gray-600 font-medium">Views</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center border border-gray-200 shadow-sm">
              <div className="flex items-center justify-center mb-1">
                <i className="fas fa-heart text-red-500 text-xl" />
              </div>
              <p className="text-xl font-bold text-gray-900">{propertyData?.favorites || 18}</p>
              <p className="text-sm text-gray-600 font-medium">Favorites</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Schedule Inspection */}
            <Button
              fullWidth
              variant="contained"
              onClick={() => setInspectionDialogOpen(true)}
              sx={{
                backgroundColor: "#ea580c",
                "&:hover": {
                  backgroundColor: "#c2410c",
                },
                textTransform: "none",
                fontSize: "0.95rem",
                fontWeight: 600,
                py: 1.75,
                borderRadius: "8px",
                display: "flex",
                gap: 1.5,
              }}
            >
              <i className="fas fa-calendar-check text-base" />
              Schedule Inspection
            </Button>

            {/* Make an Offer */}
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setOfferDialogOpen(true)}
              sx={{
                borderColor: "#ea580c",
                color: "#ea580c",
                "&:hover": {
                  borderColor: "#c2410c",
                  backgroundColor: "#fff7ed",
                },
                textTransform: "none",
                fontSize: "0.95rem",
                fontWeight: 600,
                py: 1.75,
                borderRadius: "8px",
                borderWidth: 2,
                display: "flex",
                gap: 1.5,
              }}
            >
              <i className="fas fa-tag text-base" />
              Make an Offer
            </Button>

            {/* Chat with Agent */}
            <Button
              fullWidth
              variant="outlined"
              onClick={handleChatNow}
              sx={{
                borderColor: "#d1d5db",
                color: "#374151",
                "&:hover": {
                  borderColor: "#9ca3af",
                  backgroundColor: "#f9fafb",
                },
                textTransform: "none",
                fontSize: "0.95rem",
                fontWeight: 600,
                py: 1.75,
                borderRadius: "8px",
                borderWidth: 2,
                display: "flex",
                gap: 1.5,
              }}
            >
              <i className="fas fa-comments text-orange-500 text-base" />
              Chat with Agent
            </Button>
          </div>

          {/* Property Status Info */}
          <div className="mt-3 bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-start gap-2">
              <i className="fas fa-info-circle text-blue-600 text-base mt-0.5" />
              <div>
                <Typography className="text-sm font-semibold text-blue-900 mb-0.5">
                  Property Status
                </Typography>
                <Typography className="text-sm text-blue-700">
                  Available for{" "}
                  <span className="font-bold">{propertyData?.listingType || "Sale"}</span>. Schedule
                  inspection to view.
                </Typography>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-sm font-semibold px-3 py-1.5 rounded-full border border-green-200">
              <i className="fas fa-shield-check text-sm" />
              Verified
            </span>
            <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-sm font-semibold px-3 py-1.5 rounded-full border border-purple-200">
              <i className="fas fa-clock text-sm" />
              Quick Response
            </span>
          </div>

          {/* Contact Info */}
          <div className="mt-3 pt-3 border-t">
            <Typography className="text-sm font-semibold text-gray-900 mb-2">Need Help?</Typography>
            <div className="space-y-1.5">
              <a
                href={`tel:${realtorInfo?.phone || "+234-XXX-XXX-XXXX"}`}
                className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors"
              >
                <i className="fas fa-phone text-orange-500 text-sm" />
                <span className="text-sm">{realtorInfo?.phone || "+234-XXX-XXX-XXXX"}</span>
              </a>
              <a
                href={`mailto:${realtorInfo?.email || "info@realestate.com"}`}
                className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors"
              >
                <i className="fas fa-envelope text-orange-500 text-sm" />
                <span className="text-sm">{realtorInfo?.email || "info@realestate.com"}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Inspection Dialog */}
      <Dialog
        open={inspectionDialogOpen}
        onClose={() => setInspectionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="bg-orange-500 text-white">
          <div className="flex items-center gap-2">
            <i className="fas fa-calendar-check" />
            Schedule Property Inspection
          </div>
        </DialogTitle>
        <DialogContent className="mt-4">
          {!isAuthenticated ? (
            <div className="py-6 text-center">
              <i className="fas fa-lock text-orange-500 text-5xl mb-4" />
              <Typography variant="h6" className="font-semibold mb-3 text-gray-900">
                Login Required
              </Typography>
              <Typography className="text-gray-600 mb-6">
                You need to be logged in to schedule a property inspection. Please sign in or create
                an account to continue.
              </Typography>
              <Button
                component={NavLinkAdapter}
                to="/sign-in"
                variant="contained"
                fullWidth
                sx={{
                  backgroundColor: "#ea580c",
                  "&:hover": { backgroundColor: "#c2410c" },
                  textTransform: "none",
                  fontSize: "1rem",
                  py: 1.5,
                }}
              >
                Sign In to Continue
              </Button>
            </div>
          ) : (
            <div className="py-8 space-y-4">
              <TextField
                label="Preferred Date"
                type="date"
                fullWidth
                value={inspectionDate}
                onChange={(e) => setInspectionDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                required
              />
              <TextField
                label="Preferred Time"
                type="time"
                fullWidth
                value={inspectionTime}
                onChange={(e) => setInspectionTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                required
              />
              <TextField
                label="Contact Phone Number"
                type="tel"
                fullWidth
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                placeholder="Enter your preferred contact number"
                variant="outlined"
                required
                helperText="We'll use this number to confirm your inspection appointment"
              />
              <TextField
                label="Additional Notes (Optional)"
                multiline
                rows={3}
                fullWidth
                value={inspectionNotes}
                onChange={(e) => setInspectionNotes(e.target.value)}
                placeholder="Any specific requirements or questions..."
                variant="outlined"
              />
              <Typography className="text-sm text-gray-600">
                The realtor will confirm your inspection appointment within 24 hours.
              </Typography>
            </div>
          )}
        </DialogContent>
        <DialogActions className="p-4">
          <Button
            onClick={() => setInspectionDialogOpen(false)}
            sx={{ textTransform: "none", fontSize: "0.95rem" }}
          >
            Cancel
          </Button>
          {isAuthenticated && (
            <Button
              onClick={handleScheduleInspection}
              variant="contained"
              disabled={
                !inspectionDate ||
                !inspectionTime ||
                !userPhone ||
                createInspectionMutation.isLoading
              }
              sx={{
                backgroundColor: "#ea580c",
                "&:hover": { backgroundColor: "#c2410c" },
                textTransform: "none",
                fontSize: "0.95rem",
              }}
            >
              {createInspectionMutation.isLoading ? (
                <>
                  <CircularProgress size={20} sx={{ color: "white", mr: 1 }} />
                  Scheduling...
                </>
              ) : (
                "Schedule Now"
              )}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Make Offer Dialog */}
      <Dialog open={offerDialogOpen} onClose={handleCloseOfferDialog} maxWidth="sm" fullWidth>
        <DialogTitle className="bg-orange-500 text-white">
          <div className="flex items-center gap-2">
            <i className="fas fa-tag" />
            {offerStep === "review" ? "Review Your Offer" : "Make an Offer"}
          </div>
        </DialogTitle>
        <DialogContent className="mt-4">
          {!isAuthenticated && (
            <div className="py-6 text-center">
              <i className="fas fa-lock text-orange-500 text-5xl mb-4" />
              <Typography variant="h6" className="font-semibold mb-3 text-gray-900">
                Login Required
              </Typography>
              <Typography className="text-gray-600 mb-6">
                You need to be logged in to make an offer on this property. Please sign in or create
                an account to continue.
              </Typography>
              <Button
                component={NavLinkAdapter}
                to="/sign-in"
                variant="contained"
                fullWidth
                sx={{
                  backgroundColor: "#ea580c",
                  "&:hover": { backgroundColor: "#c2410c" },
                  textTransform: "none",
                  fontSize: "1rem",
                  py: 1.5,
                }}
              >
                Sign In to Continue
              </Button>
            </div>
          )}
          {isAuthenticated && offerStep === "review" && (
            <div className="py-4 space-y-1">
              {offerSubmitError && (
                <div className="mb-3 bg-red-50 p-3 rounded-lg border border-red-200">
                  <Typography className="text-sm text-red-800 font-medium">
                    {offerSubmitError}
                  </Typography>
                  {offerSubmitError.toLowerCase().includes(WALLET_GATE_KEYWORD) && (
                    <Button
                      component={NavLinkAdapter}
                      to={FUND_WALLET_ROUTE}
                      size="small"
                      variant="contained"
                      sx={{
                        mt: 1,
                        backgroundColor: "#ea580c",
                        "&:hover": { backgroundColor: "#c2410c" },
                        textTransform: "none",
                      }}
                    >
                      Top Up Wallet
                    </Button>
                  )}
                </div>
              )}
              <ReviewRow label="Offer amount" value={`₦${Number(offerAmount || 0).toLocaleString()}`} />
              <ReviewRow label="Financing" value={financingType} />
              {financingType !== "Cash" && <ReviewRow label="Pre-approved" value={isPreApproved ? "Yes" : "No"} />}
              {proposedMoveInDate && <ReviewRow label="Move-in date" value={proposedMoveInDate} />}
              {proposedClosingDate && <ReviewRow label="Closing date" value={proposedClosingDate} />}
              {depositAmount && (
                <ReviewRow label="Deposit" value={`₦${Number(depositAmount).toLocaleString()}`} />
              )}
              <ReviewRow label="Contact phone" value={offerPhone} />
              {offerMessage && <ReviewRow label="Message" value={offerMessage} />}
              {specialConditions && <ReviewRow label="Conditions" value={specialConditions} />}
              {attachments.length > 0 && (
                <ReviewRow label="Attachments" value={`${attachments.length} file${attachments.length === 1 ? "" : "s"}`} />
              )}
              <Typography className="text-sm text-gray-600 mt-4">
                Check the details above, then confirm to send this offer to the realtor.
              </Typography>
            </div>
          )}
          {isAuthenticated && offerStep === "form" && (
            <div className="py-4 space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 flex items-start gap-2">
                <i className="fas fa-info-circle text-blue-600 text-base mt-0.5" />
                <Typography className="text-sm text-blue-800">
                  Making an offer requires a minimum wallet balance of ₦500,000. If your balance is
                  below that, you'll need to{" "}
                  <NavLinkAdapter to={FUND_WALLET_ROUTE} className="font-semibold underline">
                    top up your wallet
                  </NavLinkAdapter>{" "}
                  before submitting.
                </Typography>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Typography className="text-sm text-gray-600 mb-1">Listed Price</Typography>
                <Typography className="text-2xl font-bold text-gray-900">
                  ₦{propertyData?.price?.toLocaleString() || "XX,XXX,XXX"}
                </Typography>
              </div>
              <TextField
                label="Your Offer Amount (₦)"
                type="number"
                fullWidth
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                placeholder="Enter your offer amount"
                variant="outlined"
                required
              />
              <TextField
                label="Contact Phone Number"
                type="tel"
                fullWidth
                value={offerPhone}
                onChange={(e) => setOfferPhone(e.target.value)}
                placeholder="Enter your preferred contact number"
                variant="outlined"
                required
                helperText="We'll use this number to contact you regarding your offer"
              />
              <TextField
                select
                label="Financing Type"
                fullWidth
                value={financingType}
                onChange={(e) => setFinancingType(e.target.value)}
                variant="outlined"
              >
                {FINANCING_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
              {financingType !== "Cash" && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isPreApproved}
                      onChange={(e) => setIsPreApproved(e.target.checked)}
                      sx={{ color: "#ea580c", "&.Mui-checked": { color: "#ea580c" } }}
                    />
                  }
                  label="I'm pre-approved for financing"
                />
              )}
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="Move-in date (optional)"
                  type="date"
                  fullWidth
                  value={proposedMoveInDate}
                  onChange={(e) => setProposedMoveInDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                />
                <TextField
                  label="Closing date (optional)"
                  type="date"
                  fullWidth
                  value={proposedClosingDate}
                  onChange={(e) => setProposedClosingDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                />
              </div>
              <TextField
                label="Deposit amount (₦, optional)"
                type="number"
                fullWidth
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                variant="outlined"
              />
              <TextField
                label="Message to Seller (Optional)"
                multiline
                rows={3}
                fullWidth
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                placeholder="Explain your offer or add any additional terms..."
                variant="outlined"
              />
              <TextField
                label="Special conditions (optional)"
                multiline
                rows={2}
                fullWidth
                value={specialConditions}
                onChange={(e) => setSpecialConditions(e.target.value)}
                placeholder="e.g. subject to home inspection"
                variant="outlined"
              />

              <div>
                <Typography className="text-sm font-medium text-gray-700 mb-1">
                  Supporting documents (optional)
                </Typography>
                <Typography className="text-xs text-gray-400 mb-2">
                  Proof of funds, pre-approval letter, or ID — helps the realtor respond faster
                </Typography>
                <div className="flex flex-wrap gap-2">
                  {attachments.map((a) => (
                    <div
                      key={a.url}
                      className="relative flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-1 text-xs"
                    >
                      <span className="max-w-[100px] truncate">{a.name || "file"}</span>
                      <IconButton size="small" onClick={() => handleRemoveAttachment(a.url)}>
                        <Close sx={{ fontSize: 14 }} />
                      </IconButton>
                    </div>
                  ))}
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadAttachmentMutation.isLoading}
                    sx={{ borderColor: "#ea580c", color: "#ea580c", textTransform: "none" }}
                  >
                    {uploadAttachmentMutation.isLoading ? (
                      <CircularProgress size={16} sx={{ color: "#ea580c" }} />
                    ) : (
                      "+ Add file"
                    )}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    hidden
                    onChange={handleAttachmentSelect}
                  />
                </div>
              </div>

              <Typography className="text-sm text-gray-600">
                Your offer will be sent to the realtor for review. They will respond within 48
                hours.
              </Typography>
            </div>
          )}
        </DialogContent>
        <DialogActions className="p-4">
          {offerStep === "review" ? (
            <>
              <Button
                onClick={() => {
                  setOfferStep("form");
                  setOfferSubmitError(null);
                }}
                sx={{ textTransform: "none", fontSize: "0.95rem" }}
              >
                Edit
              </Button>
              <Button
                onClick={handleMakeOffer}
                variant="contained"
                disabled={createOfferMutation.isLoading}
                sx={{
                  backgroundColor: "#ea580c",
                  "&:hover": { backgroundColor: "#c2410c" },
                  textTransform: "none",
                  fontSize: "0.95rem",
                }}
              >
                {createOfferMutation.isLoading ? (
                  <>
                    <CircularProgress size={20} sx={{ color: "white", mr: 1 }} />
                    Submitting...
                  </>
                ) : (
                  "Confirm & Submit"
                )}
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleCloseOfferDialog} sx={{ textTransform: "none", fontSize: "0.95rem" }}>
                Cancel
              </Button>
              {isAuthenticated && (
                <Button
                  onClick={() => setOfferStep("review")}
                  variant="contained"
                  disabled={!offerAmount || !offerPhone || uploadAttachmentMutation.isLoading}
                  sx={{
                    backgroundColor: "#ea580c",
                    "&:hover": { backgroundColor: "#c2410c" },
                    textTransform: "none",
                    fontSize: "0.95rem",
                  }}
                >
                  {uploadAttachmentMutation.isLoading ? (
                    <>
                      <CircularProgress size={20} sx={{ color: "white", mr: 1 }} />
                      Uploading...
                    </>
                  ) : (
                    "Continue to Review"
                  )}
                </Button>
              )}
            </>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-gray-100 gap-4">
      <Typography className="text-sm text-gray-500 flex-shrink-0">{label}</Typography>
      <Typography className="text-sm font-medium text-gray-900 text-right">{value}</Typography>
    </div>
  );
}

export default PropertyInteractionCard;
