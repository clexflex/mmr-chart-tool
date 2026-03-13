import { createShareSeries, createValueSeries, unitLabelForType } from "@/lib/templateShared/series";
import type {
  SmrChartCardViewModel,
  SmrChartMapping,
  SmrInput,
  SmrSegmentRowInput,
  SmrSeriesPoint,
  SmrSnapshotViewModel,
  SmrViewModels,
} from "@/lib/smr/types";

const SNAPSHOT_BAR_LIMIT = 4;
const SNAPSHOT_PIE_LIMIT = 5;
const PIE_LIMIT = 5;
const COLUMN_LIMIT = 4;
const KEY_PLAYER_LIMIT = 20;
const SNAPSHOT_TOTAL_FACTOR = 0.9;

type ResolvedSource = {
  labels: string[];
  sourceTitle: string;
  truncated: boolean;
};

export function buildSmrViewModels(input: SmrInput): SmrViewModels {
  const unitShort = unitLabelForType(input.unit);
  const snapshotBar = resolveSource(input.segmentRows, input.mapping.snapshotBarSegmentId, SNAPSHOT_BAR_LIMIT);
  const snapshotPie = resolveSource(input.segmentRows, input.mapping.snapshotPieSegmentId, SNAPSHOT_PIE_LIMIT);
  const donut = resolveSource(input.segmentRows, input.mapping.donutSegmentId, PIE_LIMIT);
  const pie3d = resolveSource(input.segmentRows, input.mapping.pie3dSegmentId, PIE_LIMIT);
  const pie2d = resolveSource(input.segmentRows, input.mapping.pie2dSegmentId, PIE_LIMIT);
  const column = resolveSource(input.segmentRows, input.mapping.columnSegmentId, COLUMN_LIMIT);

  const notes = collectNotes([
    ["Full snapshot bar chart", snapshotBar],
    ["Full snapshot pie chart", snapshotPie],
    ["Donut chart", donut],
    ["3D pie chart", pie3d],
    ["Flat pie chart", pie2d],
    ["Column chart", column],
  ]);

  return {
    snapshot: buildSnapshotViewModel(input, snapshotBar, snapshotPie, unitShort),
    donut: buildPieCardViewModel(input.marketTitle, donut, "donut", unitShort),
    pie3d: buildPieCardViewModel(input.marketTitle, pie3d, "pie3d", unitShort),
    pie2d: buildPieCardViewModel(input.marketTitle, pie2d, "pie2d", unitShort),
    column: buildColumnCardViewModel(input.marketTitle, column, unitShort, input.derived.marketSize2025),
    notes,
  };
}

function buildSnapshotViewModel(
  input: SmrInput,
  barSource: ResolvedSource,
  pieSource: ResolvedSource,
  unitShort: string
): SmrSnapshotViewModel {
  const marketTitle = input.marketTitle.trim() || "Global Market";
  const compactTitle = compactMarketTitle(marketTitle);
  const barSeries = buildValueSeries(barSource.labels, input.derived.marketSize2025);
  const pieSeries = createShareSeries(pieSource.labels);
  const keyPlayers = parseKeyPlayers(input.keyPlayersRaw).slice(0, KEY_PLAYER_LIMIT);
  const splitIndex = Math.ceil(keyPlayers.length / 2);

  return {
    marketTitle,
    unitShort,
    barTitle: `${compactTitle} Size (${input.unit}) by ${barSource.sourceTitle || "Segment"}, in 2025`,
    pieTitle: `${compactTitle} Share by ${pieSource.sourceTitle || "Region"} in 2025 %`,
    barSeries,
    pieSeries,
    keyPlayerColumns: [keyPlayers.slice(0, splitIndex), keyPlayers.slice(splitIndex)],
    ribbons: [
      { id: "size-2025", text: `Market Size in 2025: ${formatMetric(input.derived.marketSize2025, input.unit)}` },
      { id: "size-2032", text: `Market Size in 2032: ${formatMetric(input.derived.marketSize2032, input.unit)}` },
      { id: "cagr", text: `CAGR % (${input.forecastPeriod}): ${formatPercent(input.knownYearInput.cagrPercent)}` },
      { id: "region", text: `Highest Share by Region: ${input.dominantRegion.trim() || "North America"}` },
    ],
    truncatedBar: barSource.truncated,
    truncatedPie: pieSource.truncated,
  };
}

function buildPieCardViewModel(
  marketTitle: string,
  source: ResolvedSource,
  kind: "donut" | "pie3d" | "pie2d",
  unitShort: string
): SmrChartCardViewModel {
  const resolvedMarketTitle = marketTitle.trim() || "Global Market";
  return {
    marketTitle: resolvedMarketTitle,
    chartTitle: `${resolvedMarketTitle} Share, by ${source.sourceTitle || "Segment"} in 2025 (%)`,
    unitShort,
    series: createShareSeries(source.labels),
    sourceTitle: source.sourceTitle,
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
    series: buildValueSeries(source.labels, marketSize2025),
    sourceTitle: source.sourceTitle,
    truncated: source.truncated,
  };
}

function buildValueSeries(labels: string[], marketSize2025: number): SmrSeriesPoint[] {
  const total = Math.max(marketSize2025 * SNAPSHOT_TOTAL_FACTOR, labels.length || 1);
  return createValueSeries(labels, total);
}

function resolveSource(segmentRows: SmrSegmentRowInput[], segmentId: string, limit: number): ResolvedSource {
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
      raw: line,
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

function parseKeyPlayers(raw: string): string[] {
  return dedupePreserveOrder(
    raw
      .split(/[\n,]/g)
      .map((value) => value.trim())
      .filter(Boolean)
  );
}

function collectNotes(entries: Array<[string, ResolvedSource]>): string[] {
  return entries
    .filter(([, source]) => source.truncated)
    .map(([label, source]) => `${label} is rendering the top ${source.labels.length} items from ${source.sourceTitle}.`);
}

function formatMetric(value: number, unit: string): string {
  return `${trimTrailingZeros(value)} ${unit}`;
}

function formatPercent(value: number): string {
  return `${trimTrailingZeros(value)}%`;
}

function trimTrailingZeros(value: number): string {
  return Number(value.toFixed(2)).toString();
}

function compactMarketTitle(marketTitle: string) {
  return marketTitle.length > 28 ? "Market" : marketTitle;
}

export function buildSmrFileName(marketTitle: string, kind: string): string {
  const base = (marketTitle.trim() || "Market Snapshot")
    .replace(/[<>:"/\\|?*]+/g, "")
    .replace(/\s+/g, " ");

  const suffixMap: Record<string, string> = {
    snapshot: "SMR Snapshot",
    donut: "SMR Donut",
    pie3d: "SMR 3D Pie",
    pie2d: "SMR Flat Pie",
    column: "SMR Column",
  };
  const suffix = suffixMap[kind] ?? `SMR ${kind}`;
  return `${base} ${suffix}.webp`;
}

export function defaultSmrMapping(regionId: string, primaryId: string, secondaryId: string, tertiaryId: string): SmrChartMapping {
  return {
    snapshotBarSegmentId: primaryId,
    snapshotPieSegmentId: regionId,
    donutSegmentId: secondaryId,
    pie3dSegmentId: regionId,
    pie2dSegmentId: secondaryId,
    columnSegmentId: tertiaryId,
  };
}
