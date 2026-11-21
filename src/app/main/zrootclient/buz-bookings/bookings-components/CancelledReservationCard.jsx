import NavLinkAdapter from "@fuse/core/NavLinkAdapter";
import { Button, Typography } from "@mui/material";
import { useRequestRefundForUserCancelledReservation } from "app/configs/data/server-calls/auth/userapp/a_bookings/use-reservations";
import { formatCurrency } from "src/app/main/vendors-shop/PosUtils";

import { formatStayDay } from "src/app/utils/stayDates";
const CancelledReservationCard = ({ placedReservation }) => {
  const requestReservation = useRequestRefundForUserCancelledReservation();

  const requestRefund = (cancelledResercationId) => {
    if (window.confirm("Requesting a refund?")) {
      requestReservation.mutate(cancelledResercationId);
    }
  };

  return (
    <>
      <div className="flex space-x-4">
        {/* <img
          src={placedReservation?.cancelledBookedReservation?.bookingPropertyId?.imageSrcs[0]?.url}
          alt="6-ways Adjustable Ergonomic Baby Carrier"
          className="w-80 h-140 object-cover"
        /> */}

        <div className="flex-1">
          <h3 className="font-bold">
            {placedReservation?.cancelledBookedReservation?.paymentResult?.transaction}
          </h3>
          <p className="text-[12px]">
            Booking Fee: ₦{" "}
            {formatCurrency(placedReservation?.cancelledBookedReservation?.totalPrice)}
          </p>
          {placedReservation?.cancelledBookedReservation?.isPaid && (
            <span className="bg-green-500 text-white text-sm px-2 py-1 rounded">
              RESERVATION CONFIRMED
            </span>
          )}
          {!placedReservation?.cancelledBookedReservation?.isPaid && (
            <span className="bg-red-500 text-white text-sm px-2 py-1 rounded">
              RESERVATION UN-CONFIRMED
            </span>
          )}
          <p className="text-md font-mono font-bold">
            Your Check In:{" "}
            {formatStayDay(placedReservation?.cancelledBookedReservation?.startDate)}
          </p>
          <p className="text-md font-mono font-bold">
            Your Check Out:{" "}
            {formatStayDay(placedReservation?.cancelledBookedReservation?.endDate)}
          </p>
        </div>
        {placedReservation?.cancelledBookedReservation?.isPaid &&
          !placedReservation?.isRefundRequested && (
            <Button
              className=" text-black boreder-none"
              onClick={() => requestRefund(placedReservation?._id)}
            >
              <span className="bg-gray-300 hover:bg-gray-600 text-sm p-4 rounded-4">
                Request Refund
              </span>
            </Button>
          )}

        {placedReservation?.cancelledBookedReservation?.isPaid &&
          placedReservation?.isRefundRequested && (
            <Typography className=" text-black boreder-none">
              <span className="bg-orange-300 hover:bg-orange-600 text-sm p-4 rounded-4">
                Refund Approval Pending
              </span>
            </Typography>
          )}
      </div>
    </>
  );
};
export default CancelledReservationCard;
