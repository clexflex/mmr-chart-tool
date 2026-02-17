import { parseSegmentLabels } from "./parseInputs";
import type { SegmentPoint, SnapshotFormInput, Template1ViewModel, YearPoint } from "./types";

export type BuildViewModelResult = {
  viewModel: Template1ViewModel | null;
  errors: string[];
};

export function buildTemplate1ViewModel(input: SnapshotFormInput): BuildViewModelResult {
  const errors: string[] = [];

  const marketTitle = input.marketTitle.trim();
  const dominantRegion = input.dominantRegion.trim();
  const unit = input.unit.trim();
  const forecastPeriod = input.forecastPeriod.trim();
  const primarySegmentTitle = input.primarySegmentTitle.trim();
  const secondarySegmentTitle = input.secondarySegmentTitle.trim();

  if (!marketTitle) errors.push("Market title is required.");
  if (!dominantRegion) errors.push("Dominating region/country is required.");
  if (!unit) errors.push("Unit of market size is required.");
  if (!forecastPeriod) errors.push("Forecast period is required.");
  if (!primarySegmentTitle) errors.push("Primary segment title is required.");
  if (!secondarySegmentTitle) errors.push("Secondary segment title is required.");

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

  const parsedTypes = parseSegmentLabels(input.typeSegmentsRaw);
  const parsedRegions = parseSegmentLabels(input.regionSegmentsRaw);

  if (parsedTypes.items.length === 0) {
    errors.push("Add at least one Type segment.");
  }

  if (parsedRegions.items.length === 0) {
    errors.push("Add at least one Region segment.");
  }

  if (errors.length > 0) {
    return { viewModel: null, errors };
  }

  const typeSeries = createTypeSeries(parsedTypes.items, input.marketSize2025);
  const regionSeries = createRegionSeries(parsedRegions.items);
  const years = createYearSeries(input.marketSize2025, input.marketSize2032);
  const cagrText = formatNumber(input.cagrPercent);

  return {
    viewModel: {
      text: {
        headerDominance: `${dominantRegion} Market accounted largest share in the ${marketTitle} in 2025.`,
        headerCagrLead: `${cagrText}% CAGR`,
        headerCagrBody: `${marketTitle} to grow at a CAGR of ${cagrText}% during ${forecastPeriod}`,
        mainTitle: marketTitle,
        yearlyTitle: `${marketTitle} size in ${unit} (2020-2032)`,
        typeTitle: `${marketTitle}, by ${primarySegmentTitle} in 2025 (${unitLabelForType(unit)})`,
        regionTitle: `${marketTitle}, by ${secondarySegmentTitle} in 2025 (%)`,
      },
      years,
      typeSeries,
      regionSeries,
      meta: {
        truncatedTypes: parsedTypes.truncated,
        truncatedRegions: parsedRegions.truncated,
      },
    },
    errors: [],
  };
}

function createYearSeries(value2025: number, value2032: number): YearPoint[] {
  const years: YearPoint[] = [];
  const slope = (value2032 - value2025) / 7;

  for (let year = 2020; year <= 2032; year += 1) {
    const interpolated = value2025 + (year - 2025) * slope;
    years.push({
      year,
      value: Number(interpolated.toFixed(2)),
    });
  }

  const idx2025 = years.findIndex((item) => item.year === 2025);
  const idx2032 = years.findIndex((item) => item.year === 2032);
  years[idx2025].value = Number(value2025.toFixed(2));
  years[idx2032].value = Number(value2032.toFixed(2));

  return years;
}

function createTypeSeries(labels: string[], marketSize2025: number): SegmentPoint[] {
  const weights = descendingWeights(labels.length);
  const sum = weights.reduce((acc, current) => acc + current, 0);

  return labels.map((label, index) => ({
    label,
    value: Number(((marketSize2025 * weights[index]) / sum).toFixed(2)),
  }));
}

function createRegionSeries(labels: string[]): SegmentPoint[] {
  const weights = descendingWeights(labels.length);
  const sum = weights.reduce((acc, current) => acc + current, 0);

  const raw = weights.map((weight) => (weight / sum) * 100);
  const rounded = raw.map((value, index) => {
    if (index === raw.length - 1) return 0;
    return Number(value.toFixed(1));
  });

  const used = rounded.slice(0, -1).reduce((acc, value) => acc + value, 0);
  rounded[rounded.length - 1] = Number((100 - used).toFixed(1));

  return labels.map((label, index) => ({
    label,
    value: rounded[index],
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
