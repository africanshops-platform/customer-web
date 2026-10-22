import { fireEvent, render, screen } from "@testing-library/react";
import NearMeBar from "../NearMeBar";

const base = {
	near: null,
	radiusKm: 10,
	status: "idle",
	total: 0,
	isLoading: false,
	onUseMyLocation: jest.fn(),
	onPickPlace: jest.fn(),
	onRadius: jest.fn(),
	onClear: jest.fn()
};

describe("NearMeBar", () => {
	beforeEach(() => jest.clearAllMocks());

	it("offers My location and Search a place, and nothing else, while near-me is off", () => {
		render(<NearMeBar {...base} />);
		expect(screen.getByText("Use my location")).toBeInTheDocument();
		expect(screen.getByText("Search a place")).toBeInTheDocument();
		expect(screen.queryByText("5 km")).not.toBeInTheDocument();
	});

	it("asks the page to locate the visitor when My location is pressed", () => {
		render(<NearMeBar {...base} />);
		fireEvent.click(screen.getByText("Use my location"));
		expect(base.onUseMyLocation).toHaveBeenCalledTimes(1);
	});

	it("shows the radius choices, the count and the origin once near-me is on, and reports a radius change", () => {
		render(<NearMeBar {...base} near={{ point: { lat: 9, lng: 7 }, label: "your location", source: "me" }} total={12} />);
		expect(screen.getByText("Near me")).toBeInTheDocument();
		["5 km", "10 km", "25 km", "50 km"].forEach((t) => expect(screen.getByText(t)).toBeInTheDocument());
		expect(screen.getByText("12 within 10 km of you")).toBeInTheDocument();
		fireEvent.click(screen.getByText("25 km"));
		expect(base.onRadius).toHaveBeenCalledWith(25);
	});

	it("names a chosen place and turns near-me off from the close button", () => {
		render(<NearMeBar {...base} near={{ point: { lat: 9, lng: 7 }, label: "Lokogoma, Abuja", source: "place" }} total={3} />);
		expect(screen.getAllByText("Lokogoma, Abuja").length).toBeGreaterThan(0);
		expect(screen.getByText("3 within 10 km of Lokogoma, Abuja")).toBeInTheDocument();
		fireEvent.click(screen.getByLabelText("Turn off near me"));
		expect(base.onClear).toHaveBeenCalledTimes(1);
	});

	it("says so when the browser location is denied, instead of failing silently", () => {
		render(<NearMeBar {...base} status="denied" />);
		expect(screen.getByText(/Location is off in your browser/)).toBeInTheDocument();
	});

	it("shows a searching state while results load", () => {
		render(<NearMeBar {...base} near={{ point: { lat: 9, lng: 7 }, label: "x", source: "me" }} isLoading />);
		expect(screen.getByText("Searching…")).toBeInTheDocument();
	});
});
