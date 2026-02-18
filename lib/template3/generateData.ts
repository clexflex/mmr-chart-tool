import { parseSegmentLabels } from "@/lib/template1/parseInputs";
import type { SegmentPoint, SnapshotFormInput, Template3ViewModel } from "@/lib/template1/types";

export type BuildTemplate3ViewModelResult = {
  viewModel: Template3ViewModel | null;
  errors: string[];
};

export function buildTemplate3ViewModel(input: SnapshotFormInput): BuildTemplate3ViewModelResult {
  const errors: string[] = [];

  const marketTitle = input.marketTitle.trim();
  const dominantRegion = input.dominantRegion.trim();
  const unit = input.unit.trim();
  const forecastPeriod = input.forecastPeriod.trim();
  const primarySegmentTitle = input.primarySegmentTitle.trim();
  const secondarySegmentTitle = input.secondarySegmentTitle.trim();
  const tertiarySegmentTitle = input.tertiarySegmentTitle.trim();

  if (!marketTitle) errors.push("Market title is required.");
  if (!dominantRegion) errors.push("Dominating region/country is required.");
  if (!unit) errors.push("Unit of market size is required.");
  if (!forecastPeriod) errors.push("Forecast period is required.");
  if (!primarySegmentTitle) errors.push("Primary segment title is required.");
  if (!secondarySegmentTitle) errors.push("Secondary segment title is required.");
  if (!tertiarySegmentTitle) errors.push("Tertiary segment title is required.");

  if (!Number.isFinite(input.cagrPercent) || input.cagrPercent < 0) {
    errors.push("CAGR must be a non-negative number.");
  }

  if (!Number.isFinite(input.marketSize2025) || input.marketSize2025 <= 0) {
    errors.push("Market size for 2025 must be a positive number.");
  }

  if (!Number.isFinite(input.marketSize2032) || input.marketSize2032 <= 0) {
    errors.push("Market size for 2032 must be a positive number.");
  }

  if (input.marketSize2032 <= input.marketSize2025) {
    errors.push("Market size for 2032 must be greater than 2025 for this template.");
  }

  const parsedPrimary = parseSegmentLabels(input.typeSegmentsRaw);
  const parsedSecondary = parseSegmentLabels(input.regionSegmentsRaw);
  const parsedTertiary = parseSegmentLabels(input.tertiarySegmentsRaw);

  if (parsedPrimary.items.length === 0) {
    errors.push("Add at least one primary segment.");
  }

  if (parsedSecondary.items.length === 0) {
    errors.push("Add at least one secondary segment.");
  }

  if (parsedTertiary.items.length === 0) {
    errors.push("Add at least one tertiary segment.");
  }

  if (errors.length > 0) {
    return { viewModel: null, errors };
  }

  const cagrText = formatNumber(input.cagrPercent);

  return {
    viewModel: {
      text: {
        headerDominance: `${dominantRegion} Market accounted largest share in the ${marketTitle} in 2025.`,
        headerCagrLead: `${cagrText}% CAGR`,
        headerCagrBody: `${marketTitle} to grow at a CAGR of ${cagrText}% during ${forecastPeriod}`,
        mainTitle: marketTitle,
        topSegmentTitle: `${marketTitle} Share, by ${secondarySegmentTitle} in 2025 (%)`,
        pieTitle: `${marketTitle}, by ${tertiarySegmentTitle} in 2025 (%)`,
        verticalTitle: `${marketTitle}, by ${primarySegmentTitle} in 2025 (${unitLabelForType(unit)})`,
      },
      topStackSeries: createShareSeries(parsedSecondary.items),
      pieSeries: createShareSeries(parsedTertiary.items),
      verticalSeries: createValueSeries(parsedPrimary.items, input.marketSize2025),
      marketSize: {
        value2025: Number(input.marketSize2025.toFixed(2)),
        value2032: Number(input.marketSize2032.toFixed(2)),
        unit,
      },
      meta: {
        truncatedPrimary: parsedPrimary.truncated,
        truncatedSecondary: parsedSecondary.truncated,
        truncatedTertiary: parsedTertiary.truncated,
      },
    },
    errors: [],
  };
}

function createShareSeries(labels: string[]): SegmentPoint[] {
  const weights = descendingWeights(labels.length);
  const total = weights.reduce((acc, item) => acc + item, 0);

  const rounded = weights.map((weight, index) => {
    if (index === labels.length - 1) {
      return 0;
    }
    return Number(((weight / total) * 100).toFixed(1));
  });

  const used = rounded.slice(0, -1).reduce((acc, value) => acc + value, 0);
  rounded[rounded.length - 1] = Number((100 - used).toFixed(1));

  return labels.map((label, index) => ({
    label,
    value: rounded[index],
  }));
}

function createValueSeries(labels: string[], totalValue: number): SegmentPoint[] {
  const weights = descendingWeights(labels.length);
  const totalWeight = weights.reduce((acc, item) => acc + item, 0);

  return labels.map((label, index) => ({
    label,
    value: Number(((weights[index] / totalWeight) * totalValue).toFixed(2)),
  }));
}

function descendingWeights(length: number): number[] {
  return Array.from({ length }, (_, index) => length - index);
}

function formatNumber(value: number): string {
  return Number(value.toFixed(2)).toString();
}

function unitLabelForType(unit: string): string {
  if (/billion|bn/i.test(unit)) {
    return "Bn";
  }
  return unit;
}
