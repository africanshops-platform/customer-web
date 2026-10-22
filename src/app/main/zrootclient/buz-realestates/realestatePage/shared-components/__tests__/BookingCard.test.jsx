import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BookingCard from "../BookingCard";

const base = { id: "1", slug: "waterfront-land", title: "Waterfront Land", price: 35850731, propertyUseCase: "SALE", images: [], propertyStateName: "Enugu" };
const renderCard = (props = {}) =>
	render(
		<MemoryRouter>
			<BookingCard {...base} {...props} />
		</MemoryRouter>
	);

describe("real estate BookingCard", () => {
	it("shows a distance badge only for near-me results", () => {
		const { unmount } = renderCard({ distanceKm: 7.7 });
		expect(screen.getByTestId("property-distance")).toHaveTextContent("7.7 km away");
		unmount();
		renderCard();
		expect(screen.queryByTestId("property-distance")).not.toBeInTheDocument();
	});

	it("says '< 1 km away' for a very close result", () => {
		renderCard({ distanceKm: 0.2 });
		expect(screen.getByTestId("property-distance")).toHaveTextContent("< 1 km away");
	});

	it("shows no rating until there are real reviews", () => {
		renderCard({ rating: 0, reviewCount: 0 });
		expect(screen.queryByText(/\(0\d\)/)).not.toBeInTheDocument();
	});
});
