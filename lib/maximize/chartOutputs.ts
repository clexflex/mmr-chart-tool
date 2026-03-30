import { createShareSeries, createValueSeries, unitLabelForType } from "../templateShared/series";
import type { SmrChartCardViewModel } from "../smr/types";
import type { SegmentRowInput } from "../template1/types";

export type MaximizeChartOutputKind = "donut" | "pie3d" | "pie2d" | "column";

export type MaximizeChartOutputMapping = {
  donutSegmentId: string;
  pie3dSegmentId: string;
  pie2dSegmentId: string;
  columnSegmentId: string;
};

type MaximizeChartOutputInput = {
  marketTitle: string;
  unit: string;
  marketSize2025: number;
  segmentRows: SegmentRowInput[];
  mapping: MaximizeChartOutputMapping;
};

type ResolvedSource = {
  labels: string[];
  sourceTitle: string;
  truncated: boolean;
};

const PIE_LIMIT = 5;
const COLUMN_LIMIT = 4;

export function defaultMaximizeChartOutputMapping(
  regionId: string,
  primaryId: string,
  tertiaryId: string
): MaximizeChartOutputMapping {
  return {
    donutSegmentId: primaryId,
    pie3dSegmentId: regionId,
    pie2dSegmentId: tertiaryId,
    columnSegmentId: primaryId,
  };
}

export function buildMaximizeChartOutputViewModels(input: MaximizeChartOutputInput) {
  const unitShort = unitLabelForType(input.unit);
  const donut = resolveSource(input.segmentRows, input.mapping.donutSegmentId, PIE_LIMIT);
  const pie3d = resolveSource(input.segmentRows, input.mapping.pie3dSegmentId, PIE_LIMIT);
  const pie2d = resolveSource(input.segmentRows, input.mapping.pie2dSegmentId, PIE_LIMIT);
  const column = resolveSource(input.segmentRows, input.mapping.columnSegmentId, COLUMN_LIMIT);

  return {
    donut: buildPieCardViewModel(input.marketTitle, donut, "Donut", unitShort),
    pie3d: buildPieCardViewModel(input.marketTitle, pie3d, "Region Pie", unitShort),
    pie2d: buildPieCardViewModel(input.marketTitle, pie2d, "Flat Pie", unitShort),
    column: buildColumnCardViewModel(input.marketTitle, column, unitShort, input.marketSize2025),
    notes: collectNotes([
      ["Donut chart", donut],
      ["Region Pie chart", pie3d],
      ["Flat Pie chart", pie2d],
      ["Column chart", column],
    ]),
  };
}

function buildPieCardViewModel(
  marketTitle: string,
  source: ResolvedSource,
  label: string,
  unitShort: string
): SmrChartCardViewModel {
  const resolvedMarketTitle = marketTitle.trim() || "Global Market";
  return {
    marketTitle: resolvedMarketTitle,
    chartTitle: `${resolvedMarketTitle} Share, by ${source.sourceTitle || "Segment"} in 2025 (%)`,
    unitShort,
    series: createShareSeries(source.labels),
    sourceTitle: source.sourceTitle || label,
    truncated: source.truncated,
  };
}

function buildColumnCardViewModel(
  marketTitle: string,
  source: ResolvedSource,
  unitShort: string,
  marketSize2025: number
): SmrChartCardViewModel {
  const resolvedMarketTitle = marketTitle.trim() || "Global Market";
  return {
    marketTitle: resolvedMarketTitle,
    chartTitle: `${resolvedMarketTitle} by ${source.sourceTitle || "Segment"} in 2025 (${unitShort})`,
    unitShort,
    series: createValueSeries(source.labels, Math.max(marketSize2025, source.labels.length || 1)),
    sourceTitle: source.sourceTitle,
    truncated: source.truncated,
  };
}

function resolveSource(segmentRows: SegmentRowInput[], segmentId: string, limit: number): ResolvedSource {
  const row = segmentRows.find((entry) => entry.id === segmentId);
  if (!row) {
    return {
      labels: fallbackLabels(limit),
      sourceTitle: "Segment",
      truncated: false,
    };
  }

  const lines = row.linesRaw
    .split(/\r?\n/g)
    .filter((line) => line.trim())
    .map((line) => ({
      trimmed: line.trim(),
      depth: readDepth(line),
    }));

  const topLevel = lines.filter((line) => line.depth === 0).map((line) => line.trimmed);
  const base = topLevel.length > 0 ? topLevel : lines.map((line) => line.trimmed);
  const unique = dedupePreserveOrder(base);
  const labels = unique.slice(0, limit);

  return {
    labels: labels.length > 0 ? labels : fallbackLabels(limit),
    sourceTitle: row.title.trim() || "Segment",
    truncated: unique.length > limit,
  };
}

function readDepth(line: string): number {
  const leading = line.match(/^[\t ]*/)?.[0] ?? "";
  const tabs = (leading.match(/\t/g) ?? []).length;
  const spaces = (leading.match(/ /g) ?? []).length;
  return tabs + Math.floor(spaces / 2);
}

function dedupePreserveOrder(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }

  return result;
}

function fallbackLabels(limit: number): string[] {
  return Array.from({ length: limit }, (_, index) => `Segment${index + 1}`);
}

function collectNotes(entries: Array<[string, ResolvedSource]>) {
  return entries
    .filter(([, source]) => source.truncated)
    .map(([label, source]) => `${label} is rendering the top ${source.labels.length} items from ${source.sourceTitle}.`);
}
