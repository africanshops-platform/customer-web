import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Close, Add } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useGetUserAddresses } from "app/configs/data/server-calls/auth/userapp/a_bookings/use-addresses";
import AddressFormDialog from "./AddressFormDialog";
import EditDeliveryLocationDialog from "./EditDeliveryLocationDialog";

/**
 * MyAddresses Modal Component
 * Displays saved billing addresses and allows user to select one
 */
function MyAddresses({ open, onClose, onSelectAddress, onCreateNew }) {
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [locationAddress, setLocationAddress] = useState(null);

  // Fetch user addresses from API
  const { data: addresses = [], isLoading, isError } = useGetUserAddresses();

  // Auto-select default address when addresses load
  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const defaultAddress = addresses.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      }
    }
  }, [addresses]);

  const handleSelectAddress = () => {
    const selected = addresses.find((addr) => addr.id === selectedAddressId);
    if (selected && onSelectAddress) {
      onSelectAddress(selected);
      onClose();
    }
  };

  const handleAddressClick = (addressId) => {
    setSelectedAddressId(addressId);
  };

  const handleCreateNew = () => {
    setFormDialogOpen(true);
  };

  const handleFormDialogClose = () => {
    setFormDialogOpen(false);
  };

  const handleAddressCreated = (newAddress) => {
    // Address was created successfully
    // Auto-select it if it's the default or the only one
    if (newAddress) {
      setSelectedAddressId(newAddress.id);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{ m: 0, p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        <Typography variant="h6" component="span" className="font-semibold">
          My Addresses
        </Typography>
        <div className="flex items-center gap-2">
          {/* Add New Address Button - Show when there are existing addresses */}
          {!isLoading && !isError && addresses.length > 0 && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<Add />}
              onClick={handleCreateNew}
              sx={{
                textTransform: "none",
                borderColor: "#ea580c",
                color: "#ea580c",
                "&:hover": {
                  borderColor: "#c2410c",
                  backgroundColor: "rgba(234, 88, 12, 0.05)",
                },
              }}
            >
              Add New
            </Button>
          )}
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </div>
      </DialogTitle>

      <Divider />

      {/* Content */}
      <DialogContent sx={{ p: 0 }}>
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <CircularProgress sx={{ color: "#ea580c" }} />
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="p-4">
            <Alert severity="error">Failed to load addresses. Please try again later.</Alert>
          </div>
        )}

        {/* Empty State - No Addresses */}
        {!isLoading && !isError && addresses.length === 0 && (
          <div className="p-8 text-center">
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(234, 88, 12, 0.1) 100%)",
              }}
            >
              <svg
                className="w-8 h-8"
                style={{ color: "#ea580c" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <Typography variant="h6" className="font-semibold mb-2 text-gray-800">
              No Saved Addresses
            </Typography>
            <Typography variant="body2" className="text-gray-600 mb-4">
              You haven't added any addresses yet. Create one to continue with your booking.
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateNew}
              sx={{
                textTransform: "none",
                background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
                },
              }}
            >
              Create New Address
            </Button>
          </div>
        )}

        {/* Addresses List */}
        {!isLoading && !isError && addresses.length > 0 && (
          <RadioGroup
            value={selectedAddressId}
            onChange={(e) => setSelectedAddressId(e.target.value)}
          >
            {addresses.map((address, index) => (
              <div key={address.id}>
                <div
                  onClick={() => handleAddressClick(address.id)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedAddressId === address.id ? "bg-orange-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <FormControlLabel
                      value={address.id}
                      control={
                        <Radio
                          sx={{
                            color: "#9ca3af",
                            "&.Mui-checked": {
                              color: "#ea580c",
                            },
                          }}
                        />
                      }
                      label=""
                      sx={{ margin: 0 }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Typography variant="body1" className="font-semibold text-gray-900">
                          {address.name}
                        </Typography>
                        {address.isDefault && (
                          <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <Typography variant="body2" className="text-gray-700 mb-1">
                        {address.address}
                      </Typography>
                      <Typography variant="body2" className="text-gray-600">
                        Phone: {address.phone}
                      </Typography>
                      <span
                        className={`inline-block mt-1 text-xs px-2 py-0.5 rounded ${
                          address.lga || address.market ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                        }`}
                        data-testid="address-location-chip"
                      >
                        {address.market
                          ? "📍 Delivery location + pickup market saved"
                          : address.lga
                            ? "📍 Delivery location saved"
                            : "No delivery location yet"}
                      </span>
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocationAddress(address);
                        }}
                        data-testid="edit-address-location"
                        sx={{ textTransform: "none", ml: 1, color: "#ea580c", minWidth: 0, p: 0 }}
                      >
                        {address.lga || address.market ? "Change location" : "Add location"}
                      </Button>
                    </div>
                  </div>
                </div>
                {index < addresses.length - 1 && <Divider />}
              </div>
            ))}
          </RadioGroup>
        )}
      </DialogContent>

      <Divider />

      {/* Footer */}
      <div className="p-4 flex gap-2 justify-end">
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            textTransform: "none",
            borderColor: "#d1d5db",
            color: "#374151",
            "&:hover": {
              borderColor: "#9ca3af",
              backgroundColor: "#f9fafb",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSelectAddress}
          disabled={!selectedAddressId}
          sx={{
            textTransform: "none",
            backgroundColor: "#ea580c",
            "&:hover": {
              backgroundColor: "#c2410c",
            },
            "&:disabled": {
              backgroundColor: "#fed7aa",
              color: "#fff",
            },
          }}
        >
          Use This Address
        </Button>
      </div>

      {/* Address Form Dialog */}
      <EditDeliveryLocationDialog
        open={Boolean(locationAddress)}
        address={locationAddress}
        onClose={() => setLocationAddress(null)}
      />
      <AddressFormDialog
        open={formDialogOpen}
        onClose={handleFormDialogClose}
        onSuccess={handleAddressCreated}
      />
    </Dialog>
  );
}

export default MyAddresses;
