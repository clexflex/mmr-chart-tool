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

export type ExportOptions = {
  fileName: string;
  pixelRatio: number;
  quality: number;
  format: "image/webp";
};

export type DensityMode = "compact" | "spacious";
