export type SmrOutputKind = "snapshot" | "donut" | "pie3d" | "pie2d" | "column";

export type SmrKnownYearInput = {
  knownYear: number;
  knownMarketSize: number;
  cagrPercent: number;
};

export type SmrDerivedMarketSizes = {
  marketSize2025: number;
  marketSize2032: number;
  is2025Overridden: boolean;
  is2032Overridden: boolean;
};

export type SmrSegmentRowInput = {
  id: string;
  title: string;
  includeInTable: boolean;
  linesRaw: string;
};

export type SmrChartMapping = {
  snapshotBarSegmentId: string;
  snapshotPieSegmentId: string;
  donutSegmentId: string;
  pie3dSegmentId: string;
  pie2dSegmentId: string;
  columnSegmentId: string;
};

export type SmrInput = {
  marketTitle: string;
  dominantRegion: string;
  unit: string;
  knownYearInput: SmrKnownYearInput;
  derived: SmrDerivedMarketSizes;
  forecastPeriod: string;
  keyPlayersRaw: string;
  segmentRows: SmrSegmentRowInput[];
  mapping: SmrChartMapping;
  previewWidth: number;
  previewHeight: number;
  useSolidBackground: boolean;
  backgroundColor: string;
  activeOutput: SmrOutputKind;
};

export type SmrSeriesPoint = {
  label: string;
  value: number;
};

export type SmrChartCardViewModel = {
  marketTitle: string;
  chartTitle: string;
  unitShort: string;
  series: SmrSeriesPoint[];
  sourceTitle: string;
  truncated: boolean;
};

export type SmrSnapshotViewModel = {
  marketTitle: string;
  unitShort: string;
  barTitle: string;
  pieTitle: string;
  barSeries: SmrSeriesPoint[];
  pieSeries: SmrSeriesPoint[];
  keyPlayerColumns: [string[], string[]];
  ribbons: Array<{ id: string; text: string }>;
  truncatedBar: boolean;
  truncatedPie: boolean;
};

export type SmrViewModels = {
  snapshot: SmrSnapshotViewModel;
  donut: SmrChartCardViewModel;
  pie3d: SmrChartCardViewModel;
  pie2d: SmrChartCardViewModel;
  column: SmrChartCardViewModel;
  notes: string[];
};
