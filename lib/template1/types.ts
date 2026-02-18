export type ChartTemplateKind = "template1" | "template2" | "template3" | "template4";

export type TableStyleMode = "legacy" | "modern";

export type DensityMode = "compact" | "spacious";

export type KnownYearInput = {
  knownYear: number;
  knownMarketSize: number;
  cagrPercent: number;
};

export type DerivedMarketSizes = {
  marketSize2025: number;
  marketSize2032: number;
  is2025Overridden: boolean;
  is2032Overridden: boolean;
};

export type SegmentRowInput = {
  id: string;
  title: string;
  includeInTable: boolean;
  linesRaw: string;
};

export type ParsedSegmentNode = {
  label: string;
  depth: number;
};

export type SnapshotChartMapping = {
  template1: { typeSegmentId: string; regionSegmentId: string };
  template2: { topStackSegmentId: string; pieSegmentId: string; horizontalSegmentId: string };
  template3: { topStackSegmentId: string; pieSegmentId: string; verticalSegmentId: string };
  template4: { topStackSegmentId: string; verticalSegmentId: string };
};

export type ReportCoverageInput = {
  baseYear: number;
  historicalDataText: string;
  forecastPeriod: string;
};

export type UnifiedMarketInput = {
  marketTitle: string;
  dominantRegion: string;
  unit: string;
  knownYearInput: KnownYearInput;
  derived: DerivedMarketSizes;
  reportCoverage: ReportCoverageInput;
  segmentRows: SegmentRowInput[];
  mapping: SnapshotChartMapping;
  includeRegionInTable: boolean;
  tableStyleMode: TableStyleMode;
  previewWidth: number;
  previewHeight: number;
  density: DensityMode;
  templateKind: ChartTemplateKind;
};

export type SegmentationTableViewModel = {
  marketTitle: string;
  baseYear: number;
  forecastPeriod: string;
  historicalDataText: string;
  marketSizeBase: string;
  marketSizeTarget: string;
  cagrText: string;
  segmentRows: { title: string; nodes: ParsedSegmentNode[] }[];
  styleMode: TableStyleMode;
};

export type SnapshotFormInput = {
  marketTitle: string;
  cagrPercent: number;
  dominantRegion: string;
  marketSize2025: number;
  marketSize2032: number;
  unit: string;
  forecastPeriod: string;
  primarySegmentTitle: string;
  secondarySegmentTitle: string;
  tertiarySegmentTitle: string;
  typeSegmentsRaw: string;
  regionSegmentsRaw: string;
  tertiarySegmentsRaw: string;
};

export type SegmentPoint = {
  label: string;
  value: number;
};

export type YearPoint = {
  year: number;
  value: number;
};

export type Template1ViewModel = {
  text: {
    headerDominance: string;
    headerCagrLead: string;
    headerCagrBody: string;
    mainTitle: string;
    yearlyTitle: string;
    typeTitle: string;
    regionTitle: string;
  };
  years: YearPoint[];
  typeSeries: SegmentPoint[];
  regionSeries: SegmentPoint[];
  meta: {
    truncatedTypes: boolean;
    truncatedRegions: boolean;
  };
};

export type Template3ViewModel = {
  text: {
    headerDominance: string;
    headerCagrLead: string;
    headerCagrBody: string;
    mainTitle: string;
    topSegmentTitle: string;
    pieTitle: string;
    verticalTitle: string;
  };
  topStackSeries: SegmentPoint[];
  pieSeries: SegmentPoint[];
  verticalSeries: SegmentPoint[];
  marketSize: {
    value2025: number;
    value2032: number;
    unit: string;
  };
  meta: {
    truncatedPrimary: boolean;
    truncatedSecondary: boolean;
    truncatedTertiary: boolean;
  };
};

export type Template2ViewModel = {
  text: {
    headerDominance: string;
    headerCagrLead: string;
    headerCagrBody: string;
    mainTitle: string;
    topSegmentTitle: string;
    pieTitle: string;
    horizontalTitle: string;
  };
  topStackSeries: SegmentPoint[];
  pieSeries: SegmentPoint[];
  horizontalSeries: SegmentPoint[];
  marketSize: {
    value2025: number;
    value2032: number;
    unit: string;
  };
  meta: {
    truncatedPrimary: boolean;
    truncatedSecondary: boolean;
    truncatedTertiary: boolean;
  };
};

export type Template4ViewModel = {
  text: {
    headerDominance: string;
    headerCagrLead: string;
    headerCagrBody: string;
    mainTitle: string;
    topSegmentTitle: string;
    verticalTitle: string;
  };
  topStackSeries: SegmentPoint[];
  verticalSeries: SegmentPoint[];
  marketSize: {
    value2025: number;
    value2032: number;
    unit: string;
  };
  meta: {
    truncatedPrimary: boolean;
    truncatedSecondary: boolean;
  };
};

export type ExportOptions = {
  fileName: string;
  pixelRatio: number;
  quality: number;
  format: "image/webp";
  maxFileSizeKb?: number;
};
