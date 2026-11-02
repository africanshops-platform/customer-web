/**
 * SellerInformation Component
 * Seller card for the FoodMart menu page. It shows only what the platform really records about the seller
 * (name, description, address, rating with its review count, member-since). Followers, sales counts, speed scores
 * and "Top Rated" style badges are not shown until the platform measures them.
 */
function SellerInformation({
  sellerName,
  sellerDescription,
  address,
  rating,
  numReviews,
  memberSince,
  onFollowClick = () => {},
  onChatClick = () => {},
}) {
  const hasReviews = Number(numReviews) > 0 && Number(rating) > 0;

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border-2 border-gray-100 overflow-hidden">
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-3">{sellerName}</h3>
          {sellerDescription && <p className="text-gray-500 text-sm">{sellerDescription}</p>}
        </div>

        <div className="space-y-3 mb-6">
          {address && (
            <p className="flex items-start gap-2 text-sm text-gray-700">
              <i className="fas fa-map-marker-alt text-orange-500 mt-0.5"></i>
              <span>{address}</span>
            </p>
          )}
          {hasReviews && (
            <p className="flex items-center gap-2 text-sm text-gray-700">
              <i className="fas fa-star text-yellow-500"></i>
              <span className="font-semibold">{Number(rating)}</span>
              <span className="text-gray-500">
                ({numReviews} {Number(numReviews) === 1 ? "review" : "reviews"})
              </span>
            </p>
          )}
          {memberSince && <p className="text-xs text-gray-400">Member since {memberSince}</p>}
        </div>

        {/* Follow Button */}
        <button
          onClick={onFollowClick}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-[1.02] shadow-md hover:shadow-lg text-base mb-4"
        >
          <i className="fas fa-user-plus mr-2"></i>
          FOLLOW SELLER
        </button>

        {/* Contact Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onChatClick}
            className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-lg border-2 border-gray-300 transition-colors text-sm"
          >
            <i className="fas fa-comments text-orange-500"></i>
            Chat Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default SellerInformation;
