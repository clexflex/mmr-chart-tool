import type { DerivedMarketSizes, KnownYearInput } from "@/lib/template1/types";

const TARGET_2025 = 2025;
const TARGET_2032 = 2032;

export function deriveMarketSizes(input: KnownYearInput): DerivedMarketSizes {
  return {
    marketSize2025: roundToTwo(deriveValueAtYear(input, TARGET_2025)),
    marketSize2032: roundToTwo(deriveValueAtYear(input, TARGET_2032)),
    is2025Overridden: false,
    is2032Overridden: false,
  };
}

export function deriveValueAtYear(input: KnownYearInput, targetYear: number): number {
  const growthFactor = 1 + input.cagrPercent / 100;
  const yearDelta = targetYear - input.knownYear;
  return input.knownMarketSize * growthFactor ** yearDelta;
}

export function resetDerivedOverrides(input: KnownYearInput): DerivedMarketSizes {
  return deriveMarketSizes(input);
}

export function roundToTwo(value: number): number {
  return Number(value.toFixed(2));
}
