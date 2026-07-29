import FuseLoading from "@fuse/core/FuseLoading";
import { motion } from "framer-motion";
import {
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
} from "@mui/material";
import ClienttErrorPage from "src/app/main/zrootclient/components/ClienttErrorPage";
import { format, parseISO } from "date-fns";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useUpdateOfferBid,
  useWithdrawOffer,
} from "app/configs/data/server-calls/auth/userapp/a_estates/useOffersRepo";

function updateSubmitLabel(isSubmitting, respondingToCounter) {
  if (isSubmitting) return "Submitting...";
  return respondingToCounter ? "Submit Response" : "Update Offer";
}

/**
 * Demo Content - Estate Offers List with Pagination
 */
function DemoContent(props) {
  const { isLoading, isError, offers, pagination, currentPage, onPageChange, isPreviousData } =
    props;

  const navigate = useNavigate();
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [acceptedOfferDialogOpen, setAcceptedOfferDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [offerToWithdraw, setOfferToWithdraw] = useState(null);
  const [acceptedOfferDetails, setAcceptedOfferDetails] = useState(null);
  const [newOfferAmount, setNewOfferAmount] = useState("");
  const [respondingToCounter, setRespondingToCounter] = useState(false);

  console.log("Real_Estate Offers", offers);

  // Mutations
  const updateOfferMutation = useUpdateOfferBid();
  const withdrawOfferMutation = useWithdrawOffer();

  const handleUpgradeOffer = (offer) => {
    setSelectedOffer(offer);
    setNewOfferAmount(offer?.offerAmount || "");
    setRespondingToCounter(false);
    setUpgradeDialogOpen(true);
  };

  const handleRespondToCounter = (offer) => {
    setSelectedOffer(offer);
    setNewOfferAmount(offer?.counterOfferAmount ?? offer?.offerAmount ?? "");
    setRespondingToCounter(true);
    setUpgradeDialogOpen(true);
  };

  const handleSubmitUpgrade = () => {
    console.log("Submitting upgraded offer:", selectedOffer, newOfferAmount);
    if (selectedOffer && newOfferAmount) {
      updateOfferMutation.mutate(
        {
          offerId: selectedOffer.id,
          formData: {
            offerAmount: parseInt(newOfferAmount),
          },
        },
        {
          onSuccess: () => {
            setUpgradeDialogOpen(false);
            setSelectedOffer(null);
            setNewOfferAmount("");
            setRespondingToCounter(false);
          },
        },
      );
    }
  };

  const handleWithdrawOffer = (offer) => {
    setOfferToWithdraw(offer);
    setWithdrawDialogOpen(true);
  };

  const confirmWithdrawOffer = () => {
    if (offerToWithdraw) {
      withdrawOfferMutation.mutate(offerToWithdraw.id, {
        onSuccess: () => {
          setWithdrawDialogOpen(false);
          setOfferToWithdraw(null);
        },
      });
    }
  };

  const handleViewAcceptedOffer = (offer) => {
    // Calculate fees (these should ideally come from the backend)
    const propertyPrice = offer?.property?.price || offer?.offerAmount;
    const agencyFee = propertyPrice * 0.05; // 5% agency fee
    const legalFee = propertyPrice * 0.02; // 2% legal fee
    const totalCost = parseFloat(propertyPrice) + agencyFee + legalFee;

    setAcceptedOfferDetails({
      ...offer,
      propertyPrice,
      agencyFee,
      legalFee,
      totalCost,
    });
    setAcceptedOfferDialogOpen(true);
  };

  const proceedToAcquisition = () => {
    if (acceptedOfferDetails) {
      navigate(`/realestate/property-acquisition/${acceptedOfferDetails.id}`, {
        state: { offerDetails: acceptedOfferDetails },
      });
    }
  };

  if (isLoading) {
    return <FuseLoading />;
  }

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="flex flex-col flex-1 items-center justify-center h-full"
      >
        <ClienttErrorPage message="Error occurred while retrieving estate offers" />
      </motion.div>
    );
  }

  if (!offers || offers?.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="flex flex-col flex-1 items-center justify-center h-full"
      >
        <div className="text-center">
          <i className="fas fa-tag text-gray-300 text-6xl mb-4" />
          <Typography color="text.secondary" variant="h5">
            No offers found!
          </Typography>
          <Typography color="text.secondary" variant="body2" className="mt-2">
            Start making offers on properties you're interested in.
          </Typography>
        </div>
      </motion.div>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "warning";
      case "accepted":
        return "success";
      case "rejected":
        return "error";
      case "withdrawn":
        return "default";
      case "countered":
        return "info";
      default:
        return "default";
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), "MMM dd, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount || 0);
  };

  const totalPages = pagination?.totalPages || 1;

  return (
    <div className="flex-auto">
      <div className="h-7xl min-h-7xl max-h-7xl">
        <main className="w-full p-4 overflow-y-scroll">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold">My Property Offers ({pagination?.total || 0})</h1>
            <Typography variant="caption" className="text-gray-600">
              Page {currentPage} of {totalPages}
            </Typography>
          </div>

          <div className="space-y-4">
            {offers?.map((offer) => (
              <Card
                key={offer?.id}
                className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border-l-4"
                style={{
                  borderLeftColor:
                    offer?.status?.toLowerCase() === "accepted"
                      ? "#22c55e"
                      : offer?.status?.toLowerCase() === "rejected"
                        ? "#ef4444"
                        : "#f59e0b",
                }}
              >
                <CardContent>
                  {/* Header Section */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <i className="fas fa-building text-green-500 text-lg" />
                        <Typography variant="h6" className="font-bold text-gray-800">
                          Property Offer
                        </Typography>
                      </div>
                      <div className="flex items-center gap-2">
                        <Chip
                          label={offer?.status || "Pending"}
                          color={getStatusColor(offer?.status)}
                          size="small"
                          className="font-semibold"
                        />
                        {offer?.isCounter && (
                          <Chip
                            label="Counter Offer"
                            color="info"
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Typography variant="caption" color="text.secondary" className="block">
                        Property ID
                      </Typography>
                      <Typography variant="body2" className="font-bold text-gray-800">
                        #{offer?.propertyId || "N/A"}
                      </Typography>
                    </div>
                  </div>

                  {/* Offer Amount Section - Highlighted */}
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg mb-4 border border-green-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Typography
                          variant="caption"
                          className="text-green-800 font-semibold block"
                        >
                          Your Offer Amount
                        </Typography>
                        <Typography variant="h5" className="font-bold text-green-900">
                          {formatCurrency(offer?.offerAmount)}
                        </Typography>
                      </div>
                      {offer?.property.price && (
                        <div className="text-right">
                          <Typography
                            variant="caption"
                            className="text-gray-600 font-semibold block"
                          >
                            Listed Price
                          </Typography>
                          <Typography variant="h6" className="font-semibold text-gray-700">
                            {formatCurrency(offer?.property.price)}
                          </Typography>
                          <Typography variant="caption" className="text-gray-500">
                            {((offer?.offerAmount / offer?.property.price) * 100).toFixed(1)}% of
                            asking
                          </Typography>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact & Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        className="font-semibold block"
                      >
                        Buyer Name
                      </Typography>
                      <div className="flex items-center gap-2">
                        <i className="fas fa-user text-green-500" />
                        <Typography variant="body2">{offer?.buyerName || "N/A"}</Typography>
                      </div>
                    </div>

                    <div>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        className="font-semibold block"
                      >
                        Contact Phone
                      </Typography>
                      <div className="flex items-center gap-2">
                        <i className="fas fa-phone text-green-500" />
                        <Typography variant="body2">{offer?.buyerPhone || "N/A"}</Typography>
                      </div>
                    </div>

                    <div>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        className="font-semibold block"
                      >
                        Contact Email
                      </Typography>
                      <div className="flex items-center gap-2">
                        <i className="fas fa-envelope text-green-500" />
                        <Typography variant="body2" className="truncate">
                          {offer?.buyerEmail || "N/A"}
                        </Typography>
                      </div>
                    </div>

                    <div>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        className="font-semibold block"
                      >
                        Submitted On
                      </Typography>
                      <div className="flex items-center gap-2">
                        <i className="fas fa-calendar-plus text-green-500" />
                        <Typography variant="body2">
                          {offer?.createdAt ? formatDate(offer.createdAt) : "N/A"}
                        </Typography>
                      </div>
                    </div>

                    <div>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        className="font-semibold block"
                      >
                        Last Updated
                      </Typography>
                      <div className="flex items-center gap-2">
                        <i className="fas fa-clock text-green-500" />
                        <Typography variant="body2">
                          {offer?.updatedAt ? formatDate(offer.updatedAt) : "N/A"}
                        </Typography>
                      </div>
                    </div>

                    <div>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        className="font-semibold block"
                      >
                        Offer ID
                      </Typography>
                      <div className="flex items-center gap-2">
                        <i className="fas fa-hashtag text-green-500" />
                        <Typography variant="body2" className="font-mono">
                          {offer?.id?.slice(0, 8) || "N/A"}
                        </Typography>
                      </div>
                    </div>
                  </div>

                  {/* Message Section */}
                  {offer?.message && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <Typography
                        variant="caption"
                        className="text-blue-800 font-semibold block mb-1"
                      >
                        <i className="fas fa-comment text-blue-600 mr-1" />
                        Your Message
                      </Typography>
                      <Typography variant="body2" className="text-gray-700">
                        {offer.message}
                      </Typography>
                    </div>
                  )}

                  {/* Countered Offer Banner */}
                  {offer?.status?.toLowerCase() === "countered" && (
                    <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <Typography
                        variant="caption"
                        className="text-amber-800 font-semibold block mb-1"
                      >
                        <i className="fas fa-exchange-alt text-amber-600 mr-1" />
                        {offer?.counterOfferAmount
                          ? `Seller countered at ${formatCurrency(offer.counterOfferAmount)}`
                          : "Seller sent a counter offer"}
                      </Typography>
                      {offer?.counterOfferMessage && (
                        <Typography variant="body2" className="text-gray-700">
                          "{offer.counterOfferMessage}"
                        </Typography>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                    {offer?.status?.toLowerCase() === "countered" && (
                      <>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<i className="fas fa-reply" />}
                          onClick={() => handleRespondToCounter(offer)}
                          disabled={updateOfferMutation.isLoading}
                          sx={{
                            backgroundColor: "#ea580c",
                            "&:hover": { backgroundColor: "#c2410c" },
                          }}
                        >
                          Respond to Counter
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<i className="fas fa-times-circle" />}
                          onClick={() => handleWithdrawOffer(offer)}
                          disabled={withdrawOfferMutation.isLoading}
                        >
                          Withdraw Offer
                        </Button>
                      </>
                    )}
                    {offer?.status?.toLowerCase() === "pending" && (
                      <>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<i className="fas fa-arrow-up" />}
                          onClick={() => handleUpgradeOffer(offer)}
                          disabled={updateOfferMutation.isLoading}
                        >
                          Upgrade Offer
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<i className="fas fa-times-circle" />}
                          onClick={() => handleWithdrawOffer(offer)}
                          disabled={withdrawOfferMutation.isLoading}
                        >
                          Withdraw Offer
                        </Button>
                      </>
                    )}
                    {offer?.status?.toLowerCase() === "accepted" && (
                      <div className="flex flex-wrap gap-2 w-full">
                        <Chip
                          icon={<i className="fas fa-check-circle" />}
                          label="Offer Accepted"
                          color="success"
                          className="font-semibold"
                        />
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<i className="fas fa-arrow-right" />}
                          onClick={() => handleViewAcceptedOffer(offer)}
                          sx={{
                            background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                            "&:hover": {
                              background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                            },
                          }}
                        >
                          Proceed to Purchase
                        </Button>
                      </div>
                    )}
                    {offer?.status?.toLowerCase() === "rejected" && (
                      <Chip
                        icon={<i className="fas fa-exclamation-circle" />}
                        label="Offer Rejected"
                        color="error"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination Component */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(_, page) => onPageChange(page)}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
                disabled={isPreviousData}
              />
            </div>
          )}
        </main>
      </div>

      {/* Upgrade Offer Dialog */}
      <Dialog
        open={upgradeDialogOpen}
        onClose={() => setUpgradeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="bg-green-500 text-white">
          <div className="flex items-center gap-2">
            <i className={`fas ${respondingToCounter ? "fa-reply" : "fa-arrow-up"}`} />
            {respondingToCounter ? "Respond to Counter Offer" : "Upgrade Your Offer"}
          </div>
        </DialogTitle>
        <DialogContent className="mt-4">
          <div className="space-y-4 py-4">
            {/* Counter Offer Context */}
            {respondingToCounter && selectedOffer?.counterOfferAmount && (
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <Typography variant="caption" className="text-amber-800 mb-1 block">
                  <i className="fas fa-exchange-alt text-amber-600 mr-1" />
                  Seller countered at
                </Typography>
                <Typography variant="h6" className="font-bold text-amber-900">
                  {formatCurrency(selectedOffer.counterOfferAmount)}
                </Typography>
                {selectedOffer?.counterOfferMessage && (
                  <Typography variant="caption" className="text-amber-700 mt-1 block">
                    "{selectedOffer.counterOfferMessage}"
                  </Typography>
                )}
              </div>
            )}
            {/* Property Price Display */}
            {selectedOffer?.propertyPrice && (
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <Typography variant="caption" className="text-blue-800 mb-1 block">
                  <i className="fas fa-home text-blue-600 mr-1" />
                  Property Listed Price
                </Typography>
                <Typography variant="h5" className="font-bold text-blue-900">
                  {formatCurrency(selectedOffer?.propertyPrice)}
                </Typography>
                <Typography variant="caption" className="text-blue-700 mt-1 block">
                  Property ID: #{selectedOffer?.propertyId || "N/A"}
                </Typography>
              </div>
            )}

            {/* Current Offer Amount */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <Typography variant="caption" className="text-gray-600 mb-1 block">
                Your Current Offer Amount
              </Typography>
              <Typography variant="h6" className="font-bold text-gray-900">
                {formatCurrency(selectedOffer?.offerAmount)}
              </Typography>
              {selectedOffer?.propertyPrice && (
                <Typography variant="caption" className="text-gray-500 mt-1 block">
                  {((selectedOffer?.offerAmount / selectedOffer?.propertyPrice) * 100).toFixed(1)}%
                  of listed price
                </Typography>
              )}
            </div>

            {/* New Offer Input */}
            <TextField
              label="Your Offer Amount (₦)"
              type="number"
              fullWidth
              value={newOfferAmount}
              onChange={(e) => setNewOfferAmount(e.target.value)}
              placeholder="Enter your offer amount"
              variant="outlined"
              required
              helperText={
                respondingToCounter
                  ? "Accept the countered amount, or enter a different amount to send back"
                  : "Enter a higher amount to upgrade your offer"
              }
            />

            {/* New Offer Preview */}
            {newOfferAmount && parseFloat(newOfferAmount) > 0 && selectedOffer?.propertyPrice && (
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <Typography variant="caption" className="text-green-800 block mb-1">
                  New Offer Preview
                </Typography>
                <div className="flex justify-between items-center">
                  <Typography variant="body2" className="font-bold text-green-900">
                    {formatCurrency(parseFloat(newOfferAmount))}
                  </Typography>
                  <Typography variant="caption" className="text-green-700">
                    {((parseFloat(newOfferAmount) / selectedOffer?.propertyPrice) * 100).toFixed(1)}
                    % of listed price
                  </Typography>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
        <DialogActions className="p-4">
          <Button
            onClick={() => {
              setUpgradeDialogOpen(false);
              setRespondingToCounter(false);
            }}
            sx={{ textTransform: "none", fontSize: "0.95rem" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitUpgrade}
            variant="contained"
            disabled={
              !newOfferAmount ||
              parseFloat(newOfferAmount) <= 0 ||
              (!respondingToCounter && parseFloat(newOfferAmount) <= selectedOffer?.offerAmount) ||
              updateOfferMutation.isLoading
            }
            sx={{
              backgroundColor: "#22c55e",
              "&:hover": { backgroundColor: "#16a34a" },
              textTransform: "none",
              fontSize: "0.95rem",
            }}
          >
            {updateSubmitLabel(updateOfferMutation.isLoading, respondingToCounter)}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Accepted Offer Details Dialog */}
      <Dialog
        open={acceptedOfferDialogOpen}
        onClose={() => setAcceptedOfferDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "20px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
            color: "white",
            padding: "28px",
          }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <i className="fas fa-check-circle text-white text-2xl" />
            </div>
            <div>
              <Typography variant="h5" className="font-bold text-white mb-1">
                Congratulations!
              </Typography>
              <Typography variant="body2" className="text-green-50">
                Your offer has been accepted
              </Typography>
            </div>
          </div>
        </DialogTitle>

        <DialogContent sx={{ padding: "32px 28px" }}>
          <div className="space-y-5">
            {/* Success Message */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-500 p-5 rounded-r-xl">
              <div className="flex items-start gap-3">
                <i className="fas fa-party-horn text-green-600 text-xl mt-1" />
                <div>
                  <Typography variant="body1" className="text-gray-800 font-bold mb-2">
                    Your offer has been accepted by the seller!
                  </Typography>
                  <Typography variant="body2" className="text-gray-700">
                    Review the complete cost breakdown below and proceed to finalize your property
                    acquisition.
                  </Typography>
                </div>
              </div>
            </div>

            {/* Property & Offer Details */}
            {acceptedOfferDetails && (
              <>
                <Card className="border-2 border-green-200 shadow-md">
                  <CardContent className="p-5">
                    <Typography
                      variant="caption"
                      className="text-green-800 font-bold block mb-4 uppercase tracking-wider"
                    >
                      <i className="fas fa-building text-green-600 mr-2" />
                      Property & Offer Information
                    </Typography>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Property ID */}
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <i className="fas fa-hashtag text-orange-600" />
                          <Typography variant="body2" className="text-gray-700 font-medium">
                            Property ID
                          </Typography>
                        </div>
                        <Typography variant="body2" className="font-mono font-bold text-gray-900">
                          #{acceptedOfferDetails?.propertyId || "N/A"}
                        </Typography>
                      </div>

                      {/* Your Offer */}
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <i className="fas fa-tag text-orange-600" />
                          <Typography variant="body2" className="text-gray-700 font-medium">
                            Your Accepted Offer
                          </Typography>
                        </div>
                        <Typography variant="body2" className="font-bold text-green-700">
                          {formatCurrency(acceptedOfferDetails?.offerAmount)}
                        </Typography>
                      </div>

                      {/* Buyer Name */}
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <i className="fas fa-user text-orange-600" />
                          <Typography variant="body2" className="text-gray-700 font-medium">
                            Buyer Name
                          </Typography>
                        </div>
                        <Typography variant="body2" className="font-bold text-gray-900">
                          {acceptedOfferDetails?.buyerName || "N/A"}
                        </Typography>
                      </div>

                      {/* Contact */}
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <i className="fas fa-phone text-orange-600" />
                          <Typography variant="body2" className="text-gray-700 font-medium">
                            Contact Phone
                          </Typography>
                        </div>
                        <Typography variant="body2" className="font-bold text-gray-900">
                          {acceptedOfferDetails?.buyerPhone || "N/A"}
                        </Typography>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Cost Breakdown */}
                <Card className="border-2 border-orange-200 shadow-lg">
                  <CardContent className="p-5">
                    <Typography
                      variant="caption"
                      className="text-orange-800 font-bold block mb-4 uppercase tracking-wider"
                    >
                      <i className="fas fa-calculator text-orange-600 mr-2" />
                      Complete Cost Breakdown
                    </Typography>

                    <div className="space-y-3">
                      {/* Property Price */}
                      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                        <div>
                          <Typography variant="body2" className="text-blue-900 font-semibold mb-1">
                            Property Price
                          </Typography>
                          <Typography variant="caption" className="text-blue-700">
                            Agreed purchase amount
                          </Typography>
                        </div>
                        <Typography variant="h6" className="font-bold text-blue-900">
                          {formatCurrency(acceptedOfferDetails?.propertyPrice)}
                        </Typography>
                      </div>

                      <Divider />

                      {/* Agency Fee */}
                      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                        <div>
                          <Typography
                            variant="body2"
                            className="text-purple-900 font-semibold mb-1"
                          >
                            Agency Fee (5%)
                          </Typography>
                          <Typography variant="caption" className="text-purple-700">
                            Platform service charge
                          </Typography>
                        </div>
                        <Typography variant="h6" className="font-bold text-purple-900">
                          {formatCurrency(acceptedOfferDetails?.agencyFee)}
                        </Typography>
                      </div>

                      {/* Legal Fee */}
                      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg">
                        <div>
                          <Typography
                            variant="body2"
                            className="text-indigo-900 font-semibold mb-1"
                          >
                            Legal Fee (2%)
                          </Typography>
                          <Typography variant="caption" className="text-indigo-700">
                            Documentation & processing
                          </Typography>
                        </div>
                        <Typography variant="h6" className="font-bold text-indigo-900">
                          {formatCurrency(acceptedOfferDetails?.legalFee)}
                        </Typography>
                      </div>

                      <Divider sx={{ borderStyle: "dashed", borderWidth: 2 }} />

                      {/* Total Cost */}
                      <div className="flex justify-between items-center p-5 bg-gradient-to-r from-orange-100 via-orange-200 to-red-100 rounded-xl border-2 border-orange-400 shadow-md">
                        <div>
                          <Typography variant="h6" className="text-orange-900 font-bold mb-1">
                            Total Amount Due
                          </Typography>
                          <Typography variant="caption" className="text-orange-800">
                            Complete payment required
                          </Typography>
                        </div>
                        <Typography variant="h4" className="font-black text-orange-900">
                          {formatCurrency(acceptedOfferDetails?.totalCost)}
                        </Typography>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Notice */}
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 p-5 rounded-xl">
                  <div className="flex items-start gap-3">
                    <i className="fas fa-shield-alt text-yellow-600 text-2xl mt-1" />
                    <div>
                      <Typography variant="body2" className="text-yellow-900 font-bold mb-2">
                        <i className="fas fa-lock text-yellow-600 mr-1" />
                        Secure Payment Notice
                      </Typography>
                      <Typography variant="body2" className="text-yellow-800 mb-2">
                        All payments are processed securely through the company's official account.
                        Funds will be held in escrow and remitted to the merchant only after:
                      </Typography>
                      <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
                        <li>Payment verification by our finance team</li>
                        <li>Completion of all required documentation</li>
                        <li>Final approval from legal department</li>
                      </ul>
                      <Typography
                        variant="caption"
                        className="text-yellow-700 block mt-3 font-semibold"
                      >
                        <i className="fas fa-info-circle mr-1" />
                        Never make payments directly to individual sellers
                      </Typography>
                    </div>
                  </div>
                </div>

                {/* Next Steps */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-300 p-4 rounded-lg">
                  <Typography variant="caption" className="text-green-900 font-bold block mb-3">
                    <i className="fas fa-list-check text-green-600 mr-2" />
                    NEXT STEPS
                  </Typography>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Typography variant="caption" className="text-white font-bold">
                          1
                        </Typography>
                      </div>
                      <Typography variant="body2" className="text-green-800">
                        Click "Proceed to Payment" to continue to the acquisition portal
                      </Typography>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Typography variant="caption" className="text-white font-bold">
                          2
                        </Typography>
                      </div>
                      <Typography variant="body2" className="text-green-800">
                        Submit payment to the company's official account
                      </Typography>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Typography variant="caption" className="text-white font-bold">
                          3
                        </Typography>
                      </div>
                      <Typography variant="body2" className="text-green-800">
                        Upload required documents for property transfer
                      </Typography>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Typography variant="caption" className="text-white font-bold">
                          4
                        </Typography>
                      </div>
                      <Typography variant="body2" className="text-green-800">
                        Await verification and approval from our teams
                      </Typography>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>

        <DialogActions
          sx={{
            padding: "20px 28px",
            background: "#f9fafb",
            borderTop: "1px solid #e5e7eb",
            gap: 2,
          }}
        >
          <Button
            onClick={() => setAcceptedOfferDialogOpen(false)}
            variant="outlined"
            sx={{
              textTransform: "none",
              fontSize: "1rem",
              borderColor: "#d1d5db",
              color: "#374151",
              paddingX: 4,
              paddingY: 1.5,
              "&:hover": {
                borderColor: "#9ca3af",
                background: "#f3f4f6",
              },
            }}
          >
            Close
          </Button>
          <Button
            onClick={proceedToAcquisition}
            variant="contained"
            startIcon={<i className="fas fa-arrow-right" />}
            sx={{
              background: "linear-gradient(135deg, #ea580c 0%, #dc2626 100%)",
              color: "white",
              textTransform: "none",
              fontSize: "1rem",
              paddingX: 4,
              paddingY: 1.5,
              boxShadow: "0 4px 12px rgba(234, 88, 12, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #c2410c 0%, #b91c1c 100%)",
                boxShadow: "0 6px 16px rgba(234, 88, 12, 0.4)",
              },
            }}
          >
            Proceed to Payment & Documentation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Withdraw Offer Confirmation Dialog */}
      <Dialog
        open={withdrawDialogOpen}
        onClose={() => setWithdrawDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
            color: "white",
            padding: "24px",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <i className="fas fa-exclamation-triangle text-white text-xl" />
            </div>
            <div>
              <Typography variant="h6" className="font-bold text-white">
                Withdraw Offer?
              </Typography>
              <Typography variant="caption" className="text-red-100">
                This action cannot be undone
              </Typography>
            </div>
          </div>
        </DialogTitle>

        <DialogContent sx={{ padding: "32px 24px" }}>
          <div className="space-y-4">
            {/* Warning Message */}
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <div className="flex items-start gap-3">
                <i className="fas fa-info-circle text-red-600 mt-1" />
                <div>
                  <Typography variant="body2" className="text-gray-800 font-semibold mb-1">
                    Are you sure you want to withdraw this offer?
                  </Typography>
                  <Typography variant="caption" className="text-gray-600">
                    Once withdrawn, you will need to submit a new offer if you wish to bid on this
                    property again.
                  </Typography>
                </div>
              </div>
            </div>

            {/* Offer Details Summary */}
            {offerToWithdraw && (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                <Typography variant="caption" className="text-gray-600 font-semibold block mb-3">
                  OFFER DETAILS
                </Typography>

                <div className="space-y-3">
                  {/* Offer Amount */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-tag text-orange-600" />
                      <Typography variant="body2" className="text-gray-700">
                        Your Offer Amount
                      </Typography>
                    </div>
                    <Typography variant="body2" className="font-bold text-gray-900">
                      {formatCurrency(offerToWithdraw?.offerAmount)}
                    </Typography>
                  </div>

                  {/* Property ID */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-building text-orange-600" />
                      <Typography variant="body2" className="text-gray-700">
                        Property ID
                      </Typography>
                    </div>
                    <Typography variant="body2" className="font-mono text-gray-900">
                      #{offerToWithdraw?.propertyId || "N/A"}
                    </Typography>
                  </div>

                  {/* Submitted Date */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-calendar text-orange-600" />
                      <Typography variant="body2" className="text-gray-700">
                        Submitted On
                      </Typography>
                    </div>
                    <Typography variant="body2" className="text-gray-900">
                      {offerToWithdraw?.createdAt ? formatDate(offerToWithdraw.createdAt) : "N/A"}
                    </Typography>
                  </div>

                  {/* Status */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-info-circle text-orange-600" />
                      <Typography variant="body2" className="text-gray-700">
                        Current Status
                      </Typography>
                    </div>
                    <Chip
                      label={offerToWithdraw?.status || "Pending"}
                      color={getStatusColor(offerToWithdraw?.status)}
                      size="small"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Impact Notice */}
            <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <i className="fas fa-lightbulb text-yellow-600 mt-0.5" />
              <Typography variant="caption" className="text-yellow-800">
                <strong>Note:</strong> Withdrawing this offer will remove it from the seller's
                consideration. You can submit a new offer later if you change your mind.
              </Typography>
            </div>
          </div>
        </DialogContent>

        <DialogActions
          sx={{
            padding: "16px 24px",
            background: "#f9fafb",
            borderTop: "1px solid #e5e7eb",
            gap: 2,
          }}
        >
          <Button
            onClick={() => setWithdrawDialogOpen(false)}
            variant="outlined"
            sx={{
              textTransform: "none",
              fontSize: "0.95rem",
              borderColor: "#d1d5db",
              color: "#374151",
              "&:hover": {
                borderColor: "#9ca3af",
                background: "#f3f4f6",
              },
              paddingX: 3,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmWithdrawOffer}
            variant="contained"
            disabled={withdrawOfferMutation.isLoading}
            startIcon={
              withdrawOfferMutation.isLoading ? null : <i className="fas fa-times-circle" />
            }
            sx={{
              background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
              color: "white",
              textTransform: "none",
              fontSize: "0.95rem",
              paddingX: 3,
              boxShadow: "0 4px 6px rgba(220, 38, 38, 0.2)",
              "&:hover": {
                background: "linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)",
                boxShadow: "0 6px 8px rgba(220, 38, 38, 0.3)",
              },
              "&:disabled": {
                background: "#9ca3af",
                color: "#fff",
              },
            }}
          >
            {withdrawOfferMutation.isLoading ? (
              <span className="flex items-center gap-2">
                <i className="fas fa-spinner fa-spin" />
                Withdrawing...
              </span>
            ) : (
              "Yes, Withdraw Offer"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default DemoContent;
