import { isItemAvailable } from '../itemAvailability';

describe('isItemAvailable', () => {
  it('a published item is available, and so is one whose flags are not in the payload', () => {
    expect(isItemAvailable({ isPublished: true })).toBe(true);
    expect(isItemAvailable({})).toBe(true);
    expect(isItemAvailable(undefined)).toBe(true);
  });

  it('an unpublished, blocked, suspended or unavailable item is not', () => {
    expect(isItemAvailable({ isPublished: false })).toBe(false);
    expect(isItemAvailable({ isPublished: true, isBlocked: true })).toBe(false);
    expect(isItemAvailable({ isPublished: true, isSuspended: true })).toBe(false);
    expect(isItemAvailable({ isPublished: true, isAvailable: false })).toBe(false);
  });
});
