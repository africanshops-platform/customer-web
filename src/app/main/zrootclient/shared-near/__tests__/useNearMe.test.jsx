import { act, renderHook } from "@testing-library/react";
import useNearMe, { NEAR_ME_OFF_KEY } from "../useNearMe";

const mockRefresh = jest.fn();
jest.mock("../useUserLocation", () => ({
	__esModule: true,
	default: () => ({ status: "idle", position: null, refresh: mockRefresh })
}));

describe("useNearMe", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		window.sessionStorage.clear();
	});

	it("starts off with no near-me params and a 10 km radius", () => {
		const { result } = renderHook(() => useNearMe(undefined, { autoStart: false }));
		expect(result.current.near).toBeNull();
		expect(result.current.nearParams).toBeNull();
		expect(result.current.radiusKm).toBe(10);
	});

	it("turns near-me on with the visitor's position and resets the page", async () => {
		mockRefresh.mockResolvedValue({ lat: 9, lng: 7 });
		const onReset = jest.fn();
		const { result } = renderHook(() => useNearMe(onReset, { autoStart: false }));
		await act(async () => {
			await result.current.useMyLocation();
		});
		expect(result.current.near).toEqual({ point: { lat: 9, lng: 7 }, label: "your location", source: "me" });
		expect(result.current.nearParams).toEqual({ lat: 9, lng: 7, radiusKm: 10 });
		expect(onReset).toHaveBeenCalledTimes(1);
	});

	it("stays off when the position is denied", async () => {
		mockRefresh.mockResolvedValue(null);
		const onReset = jest.fn();
		const { result } = renderHook(() => useNearMe(onReset, { autoStart: false }));
		await act(async () => {
			await result.current.useMyLocation();
		});
		expect(result.current.near).toBeNull();
		expect(onReset).not.toHaveBeenCalled();
	});

	it("picks a place with its own radius, changes the radius, and clears", () => {
		const onReset = jest.fn();
		const { result } = renderHook(() => useNearMe(onReset, { autoStart: false }));
		act(() => result.current.pickPlace({ point: { lat: 8.9, lng: 7.4 }, label: "Lokogoma", radiusKm: 5 }));
		expect(result.current.nearParams).toEqual({ lat: 8.9, lng: 7.4, radiusKm: 5 });
		act(() => result.current.changeRadius(25));
		expect(result.current.nearParams.radiusKm).toBe(25);
		act(() => result.current.clear());
		expect(result.current.near).toBeNull();
		expect(onReset).toHaveBeenCalledTimes(3);
	});

	it("recentres on a chosen region only while near-me is on", () => {
		const { result } = renderHook(() => useNearMe(undefined, { autoStart: false }));
		act(() => result.current.applyRegion({ point: { lat: 1, lng: 2 }, label: "X", level: "lga" }));
		expect(result.current.near).toBeNull(); // off: a region choice alone must not switch it on
		act(() => result.current.pickPlace({ point: { lat: 9, lng: 7 }, label: "A", radiusKm: 5 }));
		act(() => result.current.applyRegion({ point: { lat: 1, lng: 2 }, label: "X", level: "lga" }));
		expect(result.current.near).toEqual({ point: { lat: 1, lng: 2 }, label: "X", source: "place" });
	});

	describe("auto-start", () => {
		it("asks for the position on mount and turns near-me on when granted", async () => {
			mockRefresh.mockResolvedValue({ lat: 9.0765, lng: 7.3986 });
			const { result } = renderHook(() => useNearMe());
			await act(async () => {});
			expect(mockRefresh).toHaveBeenCalledTimes(1);
			expect(result.current.near).toMatchObject({ source: "me", point: { lat: 9.0765, lng: 7.3986 } });
		});

		it("stays off when the position is denied", async () => {
			mockRefresh.mockResolvedValue(null);
			const { result } = renderHook(() => useNearMe());
			await act(async () => {});
			expect(result.current.near).toBeNull();
		});

		it("does not auto-start after the visitor turned near-me off this session", async () => {
			window.sessionStorage.setItem(NEAR_ME_OFF_KEY, "1");
			renderHook(() => useNearMe());
			await act(async () => {});
			expect(mockRefresh).not.toHaveBeenCalled();
		});

		it("remembers an off choice and forgets it when the visitor turns near-me on again", async () => {
			mockRefresh.mockResolvedValue({ lat: 1, lng: 2 });
			const { result } = renderHook(() => useNearMe(undefined, { autoStart: false }));
			act(() => result.current.clear());
			expect(window.sessionStorage.getItem(NEAR_ME_OFF_KEY)).toBe("1");
			await act(async () => {
				await result.current.useMyLocation();
			});
			expect(window.sessionStorage.getItem(NEAR_ME_OFF_KEY)).toBeNull();
		});

		it("only starts once, however often the page re-renders", async () => {
			mockRefresh.mockResolvedValue({ lat: 1, lng: 2 });
			const { rerender } = renderHook(() => useNearMe());
			await act(async () => {});
			rerender();
			rerender();
			expect(mockRefresh).toHaveBeenCalledTimes(1);
		});

		it("can be switched off for a page that wants an explicit opt-in", async () => {
			renderHook(() => useNearMe(undefined, { autoStart: false }));
			await act(async () => {});
			expect(mockRefresh).not.toHaveBeenCalled();
		});
	});
});
