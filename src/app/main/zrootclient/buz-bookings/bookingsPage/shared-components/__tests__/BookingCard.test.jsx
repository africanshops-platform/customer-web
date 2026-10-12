import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BookingCard from "../BookingCard";

const renderCard = (props = {}) =>
	render(
		<MemoryRouter>
			<BookingCard id="1" slug="reens" title="Reens Apartment" address="R32B, Northwal Drive" price={30000} bookingPeriod="NIGHT" images={[]} {...props} />
		</MemoryRouter>
	);

describe("BookingCard", () => {
	it("shows 'No reviews yet' instead of an invented rating when there are no real reviews", () => {
		renderCard({ rating: 0, reviewCount: 0 });
		expect(screen.getByText("No reviews yet")).toBeInTheDocument();
		expect(screen.queryByText("(00)")).not.toBeInTheDocument();
	});

	it("shows the stars and the real count when there are reviews", () => {
		renderCard({ rating: 4, reviewCount: 7 });
		expect(screen.queryByText("No reviews yet")).not.toBeInTheDocument();
		expect(screen.getByText("(07)")).toBeInTheDocument();
	});

	it("shows a distance badge only for near-me results", () => {
		const { rerender } = renderCard({ distanceKm: 2.46 });
		expect(screen.getByTestId("booking-distance")).toHaveTextContent("2.5 km away");
		rerender(
			<MemoryRouter>
				<BookingCard id="1" slug="reens" title="Reens Apartment" address="x" price={30000} images={[]} />
			</MemoryRouter>
		);
		expect(screen.queryByTestId("booking-distance")).not.toBeInTheDocument();
	});

	it("writes the booking period in lower case", () => {
		renderCard({ bookingPeriod: "NIGHT" });
		expect(screen.getByText("/night")).toBeInTheDocument();
	});
});
