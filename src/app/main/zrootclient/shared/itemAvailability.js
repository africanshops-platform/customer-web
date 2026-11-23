// A product or menu item can only be bought while the merchant has it PUBLISHED (and the platform has not blocked or suspended it, and a menu
// item has not been marked unavailable): the server-priced cart refuses anything else. Listings still show such items, so they are greyed out
// with a clear note instead of looking buyable and failing later.
export const isItemAvailable = (item) =>
  !item || (item.isPublished !== false && !item.isBlocked && !item.isSuspended && item.isAvailable !== false);

export const NOT_AVAILABLE_LABEL = 'Not available';
export const NOT_AVAILABLE_NOTE = 'This item is not available right now.';

/** Style for the picture and text of an unavailable item: grey and faded, still readable. */
export const unavailableLook = { filter: 'grayscale(1)', opacity: 0.55 };
