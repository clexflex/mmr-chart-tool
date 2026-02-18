import type { SegmentRowInput } from "@/lib/template1/types";

const CHART_LIMIT = 10;

export type ResolvedChartSeries = {
  labels: string[];
  truncated: boolean;
  sourceTitle: string;
  sourceFound: boolean;
};

export function resolveChartSeries(segmentRows: SegmentRowInput[], segmentId: string): ResolvedChartSeries {
  const row = segmentRows.find((item) => item.id === segmentId);
  if (!row) {
    return {
      labels: [],
      truncated: false,
      sourceTitle: "",
      sourceFound: false,
    };
  }

  const rawLines = row.linesRaw
    .split(/\r?\n/g)
    .map((item) => item.trim())
    .filter(Boolean);

  const topLevel = row.linesRaw
    .split(/\r?\n/g)
    .filter((line) => line.trim())
    .filter((line) => {
      const leading = line.match(/^[\t ]*/)?.[0] ?? "";
      const tabs = (leading.match(/\t/g) ?? []).length;
      const spaces = (leading.match(/ /g) ?? []).length;
      return tabs + Math.floor(spaces / 2) === 0;
    })
    .map((line) => line.trim())
    .filter(Boolean);

  const source = topLevel.length > 0 ? topLevel : rawLines;

  const unique: string[] = [];
  const seen = new Set<string>();
  for (const item of source) {
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
  }

  return {
    labels: unique.slice(0, CHART_LIMIT),
    truncated: unique.length > CHART_LIMIT,
    sourceTitle: row.title,
    sourceFound: true,
  };
}

export function chartSeriesLimit(): number {
  return CHART_LIMIT;
}
