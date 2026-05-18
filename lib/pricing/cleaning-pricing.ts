export type CleaningType =
  | "STANDARD"
  | "DEEP"
  | "MOVE_IN_MOVE_OUT"
  | "RECURRING"
  | "AIRBNB_TURNOVER";

export type HomeSize = "1BHK" | "2BHK" | "3BHK" | "4BHK";

type PricingRule = {
  label: string;
  basePrices: Record<HomeSize, number>;
  standardSqft: Record<HomeSize, number>;
  extraSqftRate: number;
};

export const pricingConfig: Record<CleaningType, PricingRule> = {
  STANDARD: {
    label: "Standard Cleaning",
    basePrices: {
      "1BHK": 150,
      "2BHK": 220,
      "3BHK": 300,
      "4BHK": 380,
    },
    standardSqft: {
      "1BHK": 700,
      "2BHK": 1100,
      "3BHK": 1600,
      "4BHK": 2200,
    },
    extraSqftRate: 0.15,
  },

  DEEP: {
    label: "Deep Cleaning",
    basePrices: {
      "1BHK": 250,
      "2BHK": 350,
      "3BHK": 480,
      "4BHK": 620,
    },
    standardSqft: {
      "1BHK": 700,
      "2BHK": 1100,
      "3BHK": 1600,
      "4BHK": 2200,
    },
    extraSqftRate: 0.25,
  },

  MOVE_IN_MOVE_OUT: {
    label: "Move In / Move Out",
    basePrices: {
      "1BHK": 280,
      "2BHK": 400,
      "3BHK": 550,
      "4BHK": 700,
    },
    standardSqft: {
      "1BHK": 700,
      "2BHK": 1100,
      "3BHK": 1600,
      "4BHK": 2200,
    },
    extraSqftRate: 0.3,
  },

  RECURRING: {
    label: "Recurring Cleaning",
    basePrices: {
      "1BHK": 130,
      "2BHK": 190,
      "3BHK": 260,
      "4BHK": 330,
    },
    standardSqft: {
      "1BHK": 700,
      "2BHK": 1100,
      "3BHK": 1600,
      "4BHK": 2200,
    },
    extraSqftRate: 0.12,
  },

  AIRBNB_TURNOVER: {
    label: "Airbnb Turnover",
    basePrices: {
      "1BHK": 170,
      "2BHK": 240,
      "3BHK": 330,
      "4BHK": 430,
    },
    standardSqft: {
      "1BHK": 700,
      "2BHK": 1100,
      "3BHK": 1600,
      "4BHK": 2200,
    },
    extraSqftRate: 0.18,
  },
};

export function calculateCleaningPrice({
  cleaningType,
  homeSize,
  totalSqft,
}: {
  cleaningType: CleaningType;
  homeSize: HomeSize;
  totalSqft: number;
}) {
  const rule = pricingConfig[cleaningType];

  if (!rule) {
    throw new Error("Invalid cleaning type");
  }

  const basePrice = rule.basePrices[homeSize];
  const includedSqft = rule.standardSqft[homeSize];

  if (!basePrice || !includedSqft) {
    throw new Error("Invalid home size");
  }

  const safeTotalSqft = Number.isFinite(totalSqft) && totalSqft > 0 ? totalSqft : includedSqft;

  const extraSqft = Math.max(0, safeTotalSqft - includedSqft);
  const extraSqftCharge = Number((extraSqft * rule.extraSqftRate).toFixed(2));
  const total = Number((basePrice + extraSqftCharge).toFixed(2));

  return {
    serviceLabel: rule.label,
    homeSize,
    basePrice,
    includedSqft,
    totalSqft: safeTotalSqft,
    extraSqft,
    extraSqftRate: rule.extraSqftRate,
    extraSqftCharge,
    total,
    currency: "USD",
  };
}