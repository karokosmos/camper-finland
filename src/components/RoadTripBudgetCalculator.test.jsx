import { render, screen, within, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, afterEach } from "vitest";

import RoadTripBudgetCalculator, {
  FUEL_PRICES,
  CAMP_PRICES,
} from "./RoadTripBudgetCalculator";

afterEach(() => {
  cleanup();
});

const selectFuel = async (user, value) => {
  await user.selectOptions(screen.getByLabelText("Fuel type"), value);
};

const selectCamping = async (user, value) => {
  await user.selectOptions(screen.getByLabelText("Camping type"), value);
};

const enterValue = async (user, id, value) => {
  const input = document.getElementById(id);

  if (!input) {
    throw new Error(`Could not find input with id="${id}"`);
  }

  await user.clear(input);
  await user.type(input, String(value));
};

const displayedTotal = (value) =>
  new RegExp(`≈\\s*${Math.ceil(value)}\\s*€`);

describe("RoadTripBudgetCalculator", () => {
  it("starts with no calculated costs", () => {
    render(<RoadTripBudgetCalculator />);

    expect(screen.getByText(/≈\s*0\s*€/)).toBeInTheDocument();

    expect(
      screen.getByText("0 adults · 0 nights on campgrounds"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Select a fuel type to see its price source."),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Select a camping type to see the campground price basis.",
      ),
    ).toBeInTheDocument();
  });

  it("calculates fuel cost using the selected fuel price", async () => {
    const user = userEvent.setup();

    render(<RoadTripBudgetCalculator />);

    const fuelType = "diesel";
    const consumption = 7;
    const distance = 1200;

    await selectFuel(user, fuelType);
    await enterValue(user, "consumption", consumption);
    await enterValue(user, "distance", distance);

    const fuel = FUEL_PRICES[fuelType];

    const fuelUnits = (distance / 100) * consumption;
    const expectedFuelCost = fuelUnits * fuel.price;

    expect(
      screen.getByText(displayedTotal(expectedFuelCost)),
    ).toBeInTheDocument();

    expect(
      screen.getByText(`Fuel - ${fuel.label}`),
    ).toBeInTheDocument();
  });

  it("uses the correct unit for biogas", async () => {
    const user = userEvent.setup();

    render(<RoadTripBudgetCalculator />);

    const fuelType = "biogas";
    const consumption = 10;
    const distance = 100;

    await selectFuel(user, fuelType);

    expect(
      screen.getByLabelText("Avg. consumption (kg/100 km)"),
    ).toBeInTheDocument();

    await enterValue(user, "consumption", consumption);
    await enterValue(user, "distance", distance);

    const fuel = FUEL_PRICES[fuelType];

    const fuelUnits = (distance / 100) * consumption;
    const expectedFuelCost = fuelUnits * fuel.price;

    expect(
      screen.getByText(displayedTotal(expectedFuelCost)),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Fuel — biogas (CBG): 2026 price of 2,3 €/kg (biogas price on Gasum stations)."),
    ).toBeInTheDocument();
  });

  it("calculates tent camping from pitch, adults, kids and nights", async () => {
    const user = userEvent.setup();

    render(<RoadTripBudgetCalculator />);

    const campingType = "tent";
    const adults = 2;
    const kids = 1;
    const nights = 4;

    await selectCamping(user, campingType);
    await enterValue(user, "adults", adults);
    await enterValue(user, "kids", kids);
    await enterValue(user, "campground-nights", nights);

    const camp = CAMP_PRICES[campingType];

    const perNight =
      camp.pitch +
      camp.adult * adults +
      camp.child * kids;

    const expectedCost = perNight * nights;

    expect(
      screen.getByText(displayedTotal(expectedCost)),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Campgrounds - tent camping"),
    ).toBeInTheDocument();

    expect(
      screen.queryByLabelText("Electricity hookup needed"),
    ).not.toBeInTheDocument();
  });

  it("calculates vehicle camping without electricity", async () => {
    const user = userEvent.setup();

    render(<RoadTripBudgetCalculator />);

    const campingType = "vehicle";
    const adults = 2;
    const kids = 1;
    const nights = 4;

    await selectCamping(user, campingType);
    await enterValue(user, "adults", adults);
    await enterValue(user, "kids", kids);
    await enterValue(user, "campground-nights", nights);

    const camp = CAMP_PRICES[campingType];

    const perNight =
      camp.pitch +
      camp.adult * adults +
      camp.child * kids;

    const expectedCost = perNight * nights;

    expect(
      screen.getByText(displayedTotal(expectedCost)),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Campgrounds - vehicle camping"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        new RegExp(`electricity ${camp.elec.toFixed(2).replace(".", ",")} €`),
      ),
    ).toBeInTheDocument();
  });

  it("adds the electricity price for vehicle camping when selected", async () => {
    const user = userEvent.setup();

    render(<RoadTripBudgetCalculator />);

    const campingType = "vehicle";
    const adults = 2;
    const kids = 1;
    const nights = 4;

    await selectCamping(user, campingType);
    await enterValue(user, "adults", adults);
    await enterValue(user, "kids", kids);
    await enterValue(user, "campground-nights", nights);

    const electricity = screen.getByLabelText(
      "Electricity hookup needed",
    );

    const camp = CAMP_PRICES[campingType];

    const withoutElectricity =
      camp.pitch +
      camp.adult * adults +
      camp.child * kids;

    expect(
      screen.getByText(
        displayedTotal(withoutElectricity * nights),
      ),
    ).toBeInTheDocument();

    await user.click(electricity);

    const withElectricity =
      withoutElectricity + camp.elec;

    expect(
      screen.getByText(
        displayedTotal(withElectricity * nights),
      ),
    ).toBeInTheDocument();
  });

  it("combines fuel and campground costs", async () => {
    const user = userEvent.setup();

    render(<RoadTripBudgetCalculator />);

    const fuelType = "diesel";
    const campingType = "vehicle";

    const consumption = 7;
    const distance = 1200;
    const adults = 2;
    const kids = 1;
    const nights = 4;

    await selectFuel(user, fuelType);
    await enterValue(user, "consumption", consumption);
    await enterValue(user, "distance", distance);

    await selectCamping(user, campingType);
    await enterValue(user, "adults", adults);
    await enterValue(user, "kids", kids);
    await enterValue(user, "campground-nights", nights);

    await user.click(
      screen.getByLabelText("Electricity hookup needed"),
    );

    const fuel = FUEL_PRICES[fuelType];
    const camp = CAMP_PRICES[campingType];

    const fuelCost =
      (distance / 100) *
      consumption *
      fuel.price;

    const campgroundPerNight =
      camp.pitch +
      camp.adult * adults +
      camp.child * kids +
      camp.elec;

    const campgroundCost =
      campgroundPerNight * nights;

    const expectedTotal =
      fuelCost + campgroundCost;

    expect(
      screen.getByText(displayedTotal(expectedTotal)),
    ).toBeInTheDocument();

    expect(
      screen.getByText(`Fuel - ${fuel.label}`),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Campgrounds - vehicle camping"),
    ).toBeInTheDocument();
  });

  it("does not add camping costs when no camping type is selected", async () => {
    const user = userEvent.setup();

    render(<RoadTripBudgetCalculator />);

    const fuelType = "petrol95";
    const consumption = 6;
    const distance = 500;

    await selectFuel(user, fuelType);
    await enterValue(user, "consumption", consumption);
    await enterValue(user, "distance", distance);

    const fuel = FUEL_PRICES[fuelType];

    const expectedFuelCost =
      (distance / 100) *
      consumption *
      fuel.price;

    expect(
      screen.getByText(displayedTotal(expectedFuelCost)),
    ).toBeInTheDocument();

    expect(
      screen.queryByText(/Campgrounds -/),
    ).not.toBeInTheDocument();
  });

  it("does not add electricity to tent camping", async () => {
    const user = userEvent.setup();

    render(<RoadTripBudgetCalculator />);

    await selectCamping(user, "tent");

    expect(
      screen.queryByLabelText("Electricity hookup needed"),
    ).not.toBeInTheDocument();
  });

  it("clamps negative numeric values to zero", async () => {
    const user = userEvent.setup();

    render(<RoadTripBudgetCalculator />);

    await selectFuel(user, "diesel");

    await enterValue(user, "consumption", -7);
    await enterValue(user, "distance", -1200);
    await enterValue(user, "adults", -2);
    await enterValue(user, "kids", -1);
    await enterValue(user, "campground-nights", -4);

    expect(
      screen.getByText(/≈\s*0\s*€/),
    ).toBeInTheDocument();
  });

  it("updates the total when inputs change", async () => {
    const user = userEvent.setup();

    render(<RoadTripBudgetCalculator />);

    const fuelType = "diesel";
    const fuel = FUEL_PRICES[fuelType];

    await selectFuel(user, fuelType);

    await enterValue(user, "consumption", 5);
    await enterValue(user, "distance", 100);

    const firstTotal =
      (100 / 100) * 5 * fuel.price;

    expect(
      screen.getByText(displayedTotal(firstTotal)),
    ).toBeInTheDocument();

    await enterValue(user, "distance", 200);

    const secondTotal =
      (200 / 100) * 5 * fuel.price;

    expect(
      screen.getByText(displayedTotal(secondTotal)),
    ).toBeInTheDocument();
  });

  it("uses singular labels for one adult, one kid and one night", async () => {
    const user = userEvent.setup();

    render(<RoadTripBudgetCalculator />);

    await selectCamping(user, "tent");

    await enterValue(user, "adults", 1);
    await enterValue(user, "kids", 1);
    await enterValue(user, "campground-nights", 1);

    expect(
      screen.getByText("1 adult + 1 kid · 1 night on campgrounds"),
    ).toBeInTheDocument();
  });

  it("uses plural labels for multiple adults, kids and nights", async () => {
    const user = userEvent.setup();

    render(<RoadTripBudgetCalculator />);

    await selectCamping(user, "tent");

    await enterValue(user, "adults", 2);
    await enterValue(user, "kids", 2);
    await enterValue(user, "campground-nights", 3);

    expect(
      screen.getByText("2 adults + 2 kids · 3 nights on campgrounds"),
    ).toBeInTheDocument();
  });
});