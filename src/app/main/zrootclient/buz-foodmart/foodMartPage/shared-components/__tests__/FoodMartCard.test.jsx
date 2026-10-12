import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import FoodMartCard from "../FoodMartCard";

const base = { id: "1", slug: "sonias-parfait", title: "Sonia's Parfait", operationMode: "RESTAURANT", address: "Cbn Estate Apo" };
const renderCard = (props = {}) =>
	render(
		<MemoryRouter>
			<FoodMartCard {...base} {...props} />
		</MemoryRouter>
	);

describe("FoodMartCard", () => {
	it("shows a distance badge only for near-me results", () => {
		const { unmount } = renderCard({ distanceKm: 15.5 });
		expect(screen.getByTestId("venue-distance")).toHaveTextContent("16 km away");
		unmount();
		renderCard();
		expect(screen.queryByTestId("venue-distance")).not.toBeInTheDocument();
	});

	it("says '< 1 km away' for a venue next door", () => {
		renderCard({ distanceKm: 0.3 });
		expect(screen.getByTestId("venue-distance")).toHaveTextContent("< 1 km away");
	});
});
