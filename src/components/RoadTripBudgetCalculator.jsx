import { useState } from "react";

const FUEL_PRICES = {
  diesel: { capitalizedLabel: "Diesel", label: "diesel", unit: "l", price: 2.07 },
  petrol95: { capitalizedLabel: "Petrol 95 E10", label: "petrol 95 E10", unit: "l", price: 1.96 },
  petrol98: { capitalizedLabel: "Petrol 98 E5", label: "petrol 98 E5", unit: "l", price: 2.07 },
  biogas: { capitalizedLabel: "Biogas (CBG)", label: "biogas (CBG)", unit: "kg", price: 2.20 },
};

const CAMP_PRICES = {
  "tent": {
    "pitch": 17.75, "pitchN": 22,
    "adult": 6.00, "adultN": 22,
    "child": 3.00, "childN": 22,
    "elec": 6.50, "elecN": 9,
    "sitesN": 22
  },
  "vehicle": {
    "pitch": 21.50, "pitchN": 22,
    "adult": 6.00, "adultN": 22,
    "child": 3.00, "childN": 22,
    "elec": 6.75, "elecN": 22,
    "sitesN": 22
  }
}

const inputClass =
  "w-full rounded-lg bg-white px-3 py-2 text-sm focus:border-[#1F3D34] focus:outline-none focus:ring-2 focus:ring-[#1F3D34]/20";

const eur = (n) => new Intl.NumberFormat("fi-FI", { style: "currency", currency: "EUR" }).format(n || 0);
const num1 = (n) => new Intl.NumberFormat("fi-FI", { maximumFractionDigits: 1 }).format(n || 0);
const num2 = (n) => new Intl.NumberFormat("fi-FI", { maximumFractionDigits: 2 }).format(n || 0);

export default function RoadTripBudgetCalculator() {
  const [fuelType, setFuelType] = useState("diesel");
  const [consumption, setConsumption] = useState("");
  const [distance, setDistance] = useState("");
  const [campingType, setCampingType] = useState("vehicle");
  const [needsElectricity, setNeedsElectricity] = useState(false);
  const [adults, setAdults] = useState("");
  const [kids, setKids] = useState("");
  const [nightsCampground, setNightsCampground] = useState("");

  const consumptionNum = Math.max(0, Number(consumption) || 0);
  const distanceNum = Math.max(0, Number(distance) || 0);
  const adultsNum = Math.max(0, Number(adults) || 0);
  const kidsNum = Math.max(0, Number(kids) || 0);
  const nightsNum = Math.max(0, Number(nightsCampground) || 0);

  const fuel = FUEL_PRICES[fuelType];
  const camp = CAMP_PRICES[campingType];

  const fuelUnits = (distanceNum / 100) * consumptionNum;
  const fuelCost = fuelUnits * fuel.price;

  const perNightBase = camp.pitch + camp.adult * adultsNum + camp.child * kidsNum;
  const perNightElectricity = campingType === "vehicle" && needsElectricity ? camp.elec : 0;
  const perNightTotal = perNightBase + perNightElectricity;
  const campgroundCost = perNightTotal * nightsNum;

  const total = fuelCost + campgroundCost;

  const campLabel = campingType === "vehicle" ? "vehicle camping" : "tent camping";
  const elecPart = campingType === "vehicle" && needsElectricity ? ` + electricity ${num2(camp.elec)} €` : "";

  const breakdown = [
    {
      label: `Fuel - ${fuel.label}`,
      formula: `${num1(distanceNum)} km ÷ 100 × ${num1(consumptionNum)} ${fuel.unit}/100km = ${num1(fuelUnits)} ${fuel.unit} × ${num2(fuel.price)} €/${fuel.unit}`,
      value: eur(fuelCost),
    },
    {
      label: `Campgrounds - ${campLabel}`,
      formula: `(pitch ${num2(camp.pitch)} € + ${adultsNum} adult × ${num2(camp.adult)} € + ${kidsNum} kid × ${num2(camp.child)} €${elecPart}) × ${nightsNum} night(s)`,
      value: eur(campgroundCost),
    },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-4 justify-items-center">
      <form
        onSubmit={(e) => e.preventDefault()}
        className="w-full rounded-2xl p-6 md:p-8 max-w-md bg-[#9FC6B0] text-neutral-900 font-medium"
      >
        <p className="pb-0 mb-0 mt-2 font-bold">Budget calculator</p>
        <p className="mb-6 mt-0 pt-0 text-sm font-light">Calculate estimated fuel and campground costs</p>
        <div>
          <div className="mb-4">
            <label htmlFor="fuelType" className="mb-3 text-sm">
              Fuel type
            </label>
            <select
              id="fuelType"
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value)}
              className={inputClass}
            >
              <option value="diesel">{FUEL_PRICES["diesel"].capitalizedLabel}</option>
              <option value="petrol95">{FUEL_PRICES["petrol95"].capitalizedLabel}</option>
              <option value="petrol98">{FUEL_PRICES["petrol98"].capitalizedLabel}</option>
              <option value="biogas">{FUEL_PRICES["biogas"].capitalizedLabel}</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="consumption" className="mb-3 text-sm">
              Avg. consumption ({fuel.unit}/100&nbsp;km)
            </label>
            <input
              id="consumption"
              type="number"
              min="0"
              step="0.1"
              placeholder="e.g. 7.0"
              value={consumption}
              onChange={(e) => setConsumption(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="distance" className="mb-3 text-sm">
              Trip distance (km)
            </label>
            <input
              id="distance"
              type="number"
              min="0"
              step="10"
              placeholder="e.g. 1200"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="campingType" className="mb-3 text-sm">
              Camping type
            </label>
            <select
              id="campingType"
              value={campingType}
              onChange={(e) => setCampingType(e.target.value)}
              className={inputClass}
            >
              <option value="vehicle">Caravan / motorhome / camper van</option>
              <option value="tent">Tent</option>
            </select>
          </div>

          {campingType === "vehicle" && (
            <div className="mb-4">
              <label htmlFor="needsElectricity" className="flex items-center gap-3 rounded-lg px-2 cursor-pointer">
                <input
                  id="needsElectricity"
                  type="checkbox"
                  checked={needsElectricity}
                  onChange={(e) => setNeedsElectricity(e.target.checked)}
                  className="sr-only"
                />
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${needsElectricity ? "border-[#1F3D34] bg-[#1F3D34]" : "border-neutral-400 bg-white"
                    }`}
                >
                  <svg
                    className={`h-3 w-3 text-white transition-opacity ${needsElectricity ? "opacity-100" : "opacity-0"}`}
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M2 6L4.5 8.5L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="text-sm">Electricity hookup needed</span>
              </label>
            </div>
          )}
          <div className="mb-4">
            <label htmlFor="adults" className="mb-3 text-sm">
              Number of adults
            </label>
            <input
              id="adults"
              type="number"
              min="0"
              step="1"
              placeholder="e.g. 2"
              value={adults}
              onChange={(e) => setAdults(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="kids" className="mb-3 text-sm">
              Number of kids
            </label>
            <input
              id="kids"
              type="number"
              min="0"
              step="1"
              placeholder="e.g. 0"
              value={kids}
              onChange={(e) => setKids(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2 mt-4">
            <label htmlFor="campground-nights" className="mb-1 block text-sm">
              Nights on campgrounds
            </label>
            <input
              id="campground-nights"
              type="number"
              min="0"
              step="1"
              placeholder="e.g. 4"
              value={nightsCampground}
              onChange={(e) => setNightsCampground(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </form>

      <div>
        <aside className="w-full rounded-2xl border border-[#1F3D34] bg-[#14261F] p-6 text-[#F6F1E7] shadow-sm md:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-[#9FC6B0]">Estimated budget</p>
          <p className="mt-2 text-4xl font-semibold md:text-5xl">≈ {Math.ceil(total)} €</p>
          <p className="mt-1 text-sm text-[#C9DED2]">
            {adultsNum} adult{adultsNum === 1 ? "" : "s"}
            {kidsNum > 0 ? ` + ${kidsNum} kid${kidsNum === 1 ? "" : "s"}` : ""} · {nightsNum} night
            {nightsNum === 1 ? "" : "s"} on campgrounds
          </p>

          <div className="mt-8 space-y-4">
            {breakdown.map((item) => (
              <div key={item.label} className="relative">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm text-[#F6F1E7]">{item.label}</span>
                  <span className="text-sm font-semibold tabular-nums text-[#F6F1E7]">
                    {item.value}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] leading-snug text-[#9FC6B0] max-w-3/4">{item.formula}</p>
              </div>
            ))}
          </div>
        </aside>

        <div className="w-full rounded-2xl border border-neutral-200 bg-white p-5 text-xs leading-relaxed text-neutral-500 md:p-6 mt-4">
          <p className="mb-2 text-neutral-700">Data this estimate is based on</p>
          <p className="mb-1">
            {fuelType === "biogas" ? (
              `Fuel — ${fuel.label}: 2026 price of ${num2(fuel.price)} €/${fuel.unit} (biogas price on Gasum stations).`
            ) : (
              `Fuel — ${fuel.label}: 2026 average price of ${num2(fuel.price)} €/${fuel.unit} (based on data collected by Tilastokeskus).`
            )}
          </p>
          <p className="mb-1">
            Campgrounds — {campLabel.toLowerCase()}: pitch {num2(camp.pitch)} €, adult{" "}
            {num2(camp.adult)} €, child {num2(camp.child)} €
            {campingType === "vehicle" ? `, electricity ${num2(camp.elec)} €` : ""}.
            Fixed medians from {camp.sitesN} campsites' 2026 price lists (with summer season prices).
          </p>
          <p>This is a planning estimate — actual prices vary by site, season, etc.</p>
        </div>
      </div>
    </div>
  );
}