export type SnapshotFormInput = {
  marketTitle: string;
  cagrPercent: number;
  dominantRegion: string;
  marketSize2025: number;
  marketSize2032: number;
  unit: string;
  forecastPeriod: string;
  typeSegmentsRaw: string;
  regionSegmentsRaw: string;
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

export type ExportOptions = {
  fileName: string;
  pixelRatio: 2;
  quality: 0.95;
  format: "image/webp";
};
