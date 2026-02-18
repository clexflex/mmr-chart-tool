import { deriveValueAtYear, roundToTwo } from "@/lib/market/deriveMarketSizes";
import { parseIndentedHierarchy } from "@/lib/segments/parseIndentedHierarchy";
import type { SegmentationTableViewModel, UnifiedMarketInput } from "@/lib/template1/types";

export function buildSegmentationTableViewModel(input: UnifiedMarketInput): SegmentationTableViewModel {
  const baseYear = input.reportCoverage.baseYear;
  const baseValue = resolveBaseYearValue(input, baseYear);

  const segmentRows = input.segmentRows
    .filter((row) => {
      const isRegion = looksLikeRegion(row.title);
      if (isRegion) {
        return input.includeRegionInTable;
      }
      return row.includeInTable;
    })
    .map((row) => ({
      title: row.title,
      nodes: parseIndentedHierarchy(row.linesRaw),
    }))
    .filter((row) => row.nodes.length > 0 && row.title.trim().length > 0);

  return {
    marketTitle: input.marketTitle,
    baseYear,
    forecastPeriod: input.reportCoverage.forecastPeriod,
    historicalDataText: input.reportCoverage.historicalDataText,
    marketSizeBase: `${formatNumber(baseValue)} ${input.unit}`,
    marketSizeTarget: `${formatNumber(input.derived.marketSize2032)} ${input.unit}`,
    cagrText: `${formatNumber(input.knownYearInput.cagrPercent)}%`,
    segmentRows,
    styleMode: input.tableStyleMode,
  };
}

function resolveBaseYearValue(input: UnifiedMarketInput, baseYear: number): number {
  if (baseYear === 2025) {
    return input.derived.marketSize2025;
  }

  return roundToTwo(deriveValueAtYear(input.knownYearInput, baseYear));
}

function looksLikeRegion(title: string): boolean {
  return /(region|country|geograph|state|area)/i.test(title);
}

function formatNumber(value: number): string {
  return Number(value.toFixed(2)).toString();
}
