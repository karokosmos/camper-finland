import { useState } from "react";

const FUEL_PRICES = {
  diesel: { label: "Diesel", unit: "l", price: 2.10 },
  petrol95: { label: "Petrol 95 E10", unit: "l", price: 2.10 },
  petrol98: { label: "Petrol 98 E5", unit: "l", price: 2.20 },
  biogas: { label: "Biogas (CBG)", unit: "kg", price: 2.20 },
};

const CAMP_PRICES = {
  tent: { pitch: 18.30, pitchN: 10, adult: 7.29, adultN: 7, child: 3.93, childN: 7, elec: 6.40, elecN: 5, sitesN: 10 },
  vehicle: { pitch: 20.95, pitchN: 10, adult: 6.67, adultN: 9, child: 3.50, childN: 9, elec: 7.25, elecN: 10, sitesN: 10 },
};

const inputClass =
  "w-full rounded-lg bg-white px-3 py-2 text-sm text-neutral-900 focus:border-[#1F3D34] focus:outline-none focus:ring-2 focus:ring-[#1F3D34]/20";

const eur = (n) => new Intl.NumberFormat("fi-FI", { style: "currency", currency: "EUR" }).format(n || 0);
const num1 = (n) => new Intl.NumberFormat("fi-FI", { maximumFractionDigits: 1 }).format(n || 0);
const num2 = (n) => new Intl.NumberFormat("fi-FI", { maximumFractionDigits: 2 }).format(n || 0);

export default function RoadTripBudgetCalculator() {
  const [fuelType, setFuelType] = useState("diesel");
  const [consumption, setConsumption] = useState("7.0");
  const [distance, setDistance] = useState("1200");
  const [campingType, setCampingType] = useState("tent");
  const [needsElectricity, setNeedsElectricity] = useState(false);
  const [adults, setAdults] = useState("2");
  const [kids, setKids] = useState("0");
  const [nightsCampground, setNightsCampground] = useState("4");

  const consumptionNum = Math.max(0, Number(consumption) || 0);
  const distanceNum = Math.max(0, Number(distance) || 0);
  const adultsNum = Math.max(0, Number(adults) || 0);
  const kidsNum = Math.max(0, Number(kids) || 0);
  const nightsNum = Math.max(0, Number(nightsCampground) || 0);

  const fuel = FUEL_PRICES[fuelType];
  const camp = CAMP_PRICES[campingType];

  // Fuel
  const fuelUnits = (distanceNum / 100) * consumptionNum;
  const fuelCost = fuelUnits * fuel.price;

  // Campground
  const perNightBase = camp.pitch + camp.adult * adultsNum + camp.child * kidsNum;
  const perNightElectricity = campingType === "rv" && needsElectricity ? camp.elec : 0;
  const perNightTotal = perNightBase + perNightElectricity;
  const campgroundCost = perNightTotal * nightsNum;

  const total = fuelCost + campgroundCost;

  const campLabel = campingType === "rv" ? "Vehicle camping" : "Tent camping";
  const elecPart = campingType === "rv" && needsElectricity ? ` + electricity ${num2(camp.elec)} €` : "";

  const breakdown = [
    {
      label: "Fuel",
      formula: `${num1(distanceNum)} km ÷ 100 × ${num1(consumptionNum)} ${fuel.unit}/100km = ${num1(fuelUnits)} ${fuel.unit} × ${num2(fuel.price)} €/${fuel.unit}`,
      value: eur(fuelCost),
    },
    {
      label: `${campLabel} — campgrounds`,
      formula: `(pitch ${num2(camp.pitch)} € + ${adultsNum} adult × ${num2(camp.adult)} € + ${kidsNum} kid × ${num2(camp.child)} €${elecPart}) × ${nightsNum} night(s)`,
      value: eur(campgroundCost),
    },
  ];

  return (
    <div className="flex gap-4">
      <form
        onSubmit={(e) => e.preventDefault()}
        className="w-full rounded-2xl p-6 md:p-8 max-w-md bg-[#9FC6B0]"
      >
        <p className="pb-0 mb-0 mt-2 font-medium text-neutral-800">Budget calculator</p>
        <p className="mb-6 mt-0 pt-0 text-sm font-light text-neutral-500">Calculate estimated fuel and campground costs</p>
        <div>
          <div className="mb-4">
            <label htmlFor="fuelType" className="mb-3 text-sm font-medium text-neutral-800">
              Fuel type
            </label>
            <select
              id="fuelType"
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value)}
              className={inputClass}
            >
              <option value="diesel">Diesel</option>
              <option value="petrol95">Petrol 95 E10</option>
              <option value="petrol98">Petrol 98 E5</option>
              <option value="biogas">Biogas (CBG)</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="consumption" className="mb-3 text-sm font-medium text-neutral-800">
              Avg. consumption ({fuel.unit}/100&nbsp;km)
            </label>
            <input
              id="consumption"
              type="number"
              min="0"
              step="0.1"
              value={consumption}
              onChange={(e) => setConsumption(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="distance" className="mb-3 text-sm font-medium text-neutral-800">
              Trip distance (km)
            </label>
            <input
              id="distance"
              type="number"
              min="0"
              step="10"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="campingType" className="mb-3 text-sm font-medium text-neutral-800">
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
            <div className="flex items-center gap-2">
              <input
                id="needsElectricity"
                type="checkbox"
                checked={needsElectricity}
                onChange={(e) => setNeedsElectricity(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 text-[#1F3D34] focus:ring-[#1F3D34]/30"
              />
              <label htmlFor="needsElectricity" className="text-sm text-neutral-700">
                Electricity hookup needed
              </label>
            </div>
          )}
          <div className="mb-4">
            <label htmlFor="adults" className="mb-3 text-sm font-medium text-neutral-800">
              Number of adults
            </label>
            <input
              id="adults"
              type="number"
              min="0"
              step="1"
              value={adults}
              onChange={(e) => setAdults(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="kids" className="mb-3 text-sm font-medium text-neutral-800">
              Number of kids
            </label>
            <input
              id="kids"
              type="number"
              min="0"
              step="1"
              value={kids}
              onChange={(e) => setKids(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2 mt-4">
            <label htmlFor="campground-nights" className="mb-1 block text-sm font-medium text-neutral-800">
              Nights on campgrounds
            </label>
            <input
              id="campground-nights"
              type="number"
              min="0"
              step="1"
              value={nightsCampground}
              onChange={(e) => setNightsCampground(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </form>

      <div>
        <aside className="w-full rounded-2xl border border-[#1F3D34] bg-[#14261F] p-6 text-[#F6F1E7] shadow-sm md:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#9FC6B0]">Estimated budget</p>
          <p className="mt-2 font-mono text-4xl font-semibold tabular-nums md:text-5xl">{eur(total)}</p>
          <p className="mt-1 text-sm text-[#C9DED2]">
            {adultsNum} adult{adultsNum === 1 ? "" : "s"}
            {kidsNum > 0 ? ` + ${kidsNum} kid${kidsNum === 1 ? "" : "s"}` : ""} · {nightsNum} night
            {nightsNum === 1 ? "" : "s"} on campgrounds
          </p>

          <div className="mt-8 space-y-4 border-l-2 border-dashed border-[#3E6B89]/60 pl-5">
            {breakdown.map((item) => (
              <div key={item.label} className="relative">
                <span className="absolute -left-[27px] top-1.5 h-2 w-2 rounded-full bg-[#3E6B89]" />
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium text-[#F6F1E7]">{item.label}</span>
                  <span className="font-mono text-sm font-semibold tabular-nums text-[#F6F1E7]">
                    {item.value}
                  </span>
                </div>
                <p className="mt-0.5 font-mono text-[11px] leading-snug text-[#9FC6B0]">{item.formula}</p>
              </div>
            ))}
          </div>
        </aside>

        <div className="w-full rounded-2xl border border-neutral-200 bg-white p-5 text-xs leading-relaxed text-neutral-500 md:p-6 mt-4">
          <p className="mb-2 font-medium text-neutral-700">Data this estimate is based on</p>
          <p className="mb-1">
            Fuel — {fuel.label}: fixed 2026 average price of {num2(fuel.price)} €/{fuel.unit}.
          </p>
          <p className="mb-1">
            Campgrounds — {campLabel.toLowerCase()}: pitch {num2(camp.pitch)} € (n={camp.pitchN}), adult{" "}
            {num2(camp.adult)} € (n={camp.adultN}), child {num2(camp.child)} € (n={camp.childN}), electricity{" "}
            {num2(camp.elec)} € (n={camp.elecN}) — fixed averages from {camp.sitesN} campsites' 2026 price lists.
          </p>
          <p>This is a planning estimate — actual prices vary by site, season and vehicle.</p>
        </div>
      </div>
    </div>
  );
}