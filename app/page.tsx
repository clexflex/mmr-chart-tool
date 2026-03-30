"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { SegmentationTablePreview } from "@/components/segmentation-table/SegmentationTablePreview";
import { TableStyleToggle } from "@/components/segmentation-table/TableStyleToggle";
import { SegmentCatalogEditor } from "@/components/segments/SegmentCatalogEditor";
import { SegmentMappingControls } from "@/components/segments/SegmentMappingControls";
import { SmrColumnCard, SmrDonutCard, SmrPie2DCard, SmrPie3DCard } from "@/components/smr/SmrChartCards";
import { TocPreview } from "@/components/toc/TocPreview";
import { Template1Card } from "@/components/template1/Template1Card";
import { Template2Card } from "@/components/template2/Template2Card";
import { Template3Card } from "@/components/template3/Template3Card";
import { Template4Card } from "@/components/template4/Template4Card";
import { downloadElementAsWebp } from "@/lib/export/downloadWebp";
import {
  buildMaximizeChartOutputViewModels,
  defaultMaximizeChartOutputMapping,
  type MaximizeChartOutputKind,
  type MaximizeChartOutputMapping,
} from "@/lib/maximize/chartOutputs";
import { deriveMarketSizes, resetDerivedOverrides } from "@/lib/market/deriveMarketSizes";
import { resolveChartSeries } from "@/lib/snapshot/resolveChartSeries";
import { buildSegmentationTableViewModel } from "@/lib/table/buildSegmentationTableViewModel";
import { renderSegmentationTableHtml } from "@/lib/table/renderSegmentationTableHtml";
import { buildTocViewModel } from "@/lib/toc/buildTocViewModel";
import { renderTocHtml } from "@/lib/toc/renderTocHtml";
import { buildTemplate1ViewModel } from "@/lib/template1/generateData";
import { buildTemplate2ViewModel } from "@/lib/template2/generateData";
import { buildTemplate3ViewModel } from "@/lib/template3/generateData";
import { buildTemplate4ViewModel } from "@/lib/template4/generateData";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import type {
  ChartTemplateKind,
  DensityMode,
  DerivedMarketSizes,
  KnownYearInput,
  SegmentRowInput,
  SnapshotChartMapping,
  SnapshotFormInput,
  TableStyleMode,
  UnifiedMarketInput,
} from "@/lib/template1/types";

const SEGMENT_PRIMARY_ID = "segment-primary";
const SEGMENT_REGION_ID = "segment-region";
const SEGMENT_TERTIARY_ID = "segment-tertiary";

type Template1ChartHeights = {
  yearlyPlot: number;
  typeChart: number;
  regionChart: number;
};

type SplitChartHeights = {
  topSegment: number;
  bottomLeft: number;
  bottomRight: number;
};

type Template4ChartHeights = {
  topSegment: number;
  bottomMain: number;
};

const DEFAULT_TEMPLATE1_CHART_HEIGHTS: Template1ChartHeights = {
  yearlyPlot: 163,
  typeChart: 170,
  regionChart: 170,
};

const DEFAULT_SPLIT_CHART_HEIGHTS: SplitChartHeights = {
  topSegment: 120,
  bottomLeft: 170,
  bottomRight: 170,
};

const DEFAULT_TEMPLATE4_CHART_HEIGHTS: Template4ChartHeights = {
  topSegment: 120,
  bottomMain: 240,
};

const DEFAULT_KNOWN_YEAR_INPUT: KnownYearInput = {
  knownYear: 2025,
  knownMarketSize: 5,
  cagrPercent: 4.5,
};

const DEFAULT_SEGMENT_ROWS: SegmentRowInput[] = [
  {
    id: SEGMENT_REGION_ID,
    title: "Region",
    includeInTable: false,
    linesRaw: "Asia Pacific\nNorth America\nEurope\nMiddle East and Africa\nSouth America",
  },
  {
    id: SEGMENT_PRIMARY_ID,
    title: "Type",
    includeInTable: true,
    linesRaw: "Type1\nType2\nType3\nType4\nType5\nType6",
  },
  {
    id: SEGMENT_TERTIARY_ID,
    title: "Application",
    includeInTable: true,
    linesRaw: "Application1\nApplication2\nApplication3\nApplication4\nApplication5",
  },
];

const DEFAULT_KEY_PLAYERS_RAW = "Company1\nCompany2\nCompany3";

const DEFAULT_MAPPING: SnapshotChartMapping = {
  template1: {
    typeSegmentId: SEGMENT_PRIMARY_ID,
    regionSegmentId: SEGMENT_REGION_ID,
  },
  template2: {
    topStackSegmentId: SEGMENT_REGION_ID,
    pieSegmentId: SEGMENT_TERTIARY_ID,
    horizontalSegmentId: SEGMENT_PRIMARY_ID,
  },
  template3: {
    topStackSegmentId: SEGMENT_REGION_ID,
    pieSegmentId: SEGMENT_TERTIARY_ID,
    verticalSegmentId: SEGMENT_PRIMARY_ID,
  },
  template4: {
    topStackSegmentId: SEGMENT_REGION_ID,
    verticalSegmentId: SEGMENT_PRIMARY_ID,
  },
};

const MAXIMIZE_CHART_OUTPUT_LABELS: Record<MaximizeChartOutputKind, string> = {
  donut: "Donut",
  pie3d: "Region Pie",
  pie2d: "Flat Pie",
  column: "Column",
};

const DEFAULT_MAXIMIZE_CHART_OUTPUT_MAPPING = defaultMaximizeChartOutputMapping(
  SEGMENT_REGION_ID,
  SEGMENT_PRIMARY_ID,
  SEGMENT_TERTIARY_ID
);

const MAXIMIZE_CHART_PREVIEW_CANVAS: Record<MaximizeChartOutputKind, { width: number; height: number }> = {
  donut: { width: 620, height: 300 },
  pie3d: { width: 620, height: 300 },
  pie2d: { width: 620, height: 300 },
  column: { width: 620, height: 300 },
};

const MAXIMIZE_CHART_EXPORT_CANVAS: Record<MaximizeChartOutputKind, { width: number; height: number }> = {
  donut: { width: 1180, height: 344 },
  pie3d: { width: 1118, height: 315 },
  pie2d: { width: 1118, height: 315 },
  column: { width: 1214, height: 329 },
};

const MAXIMIZE_CHART_LAYOUTS = {
  donut: { chartSize: 296, plotHeight: 256 },
  pie3d: { chartSize: 282, plotHeight: 240 },
  pie2d: { chartSize: 282, plotHeight: 240 },
  column: { chartSize: 760, plotHeight: 238 },
} as const;

const MIN_PREVIEW_WIDTH = 600;
const MIN_PREVIEW_HEIGHT = 420;
const MAX_PREVIEW_SIZE = 900;
const MIN_SIDEBAR_WIDTH = 400;
const DEFAULT_SIDEBAR_WIDTH = 440;
const MAX_SIDEBAR_WIDTH = 620;
const SIDEBAR_WIDTH_STORAGE_KEY = "mmr.sidebarWidthPx.v2";
const MIN_CHART_HEIGHT = 110;
const MAX_CHART_HEIGHT = 320;
const TEMPLATE1_OVERHEAD = 168;
const TEMPLATE2_OVERHEAD = 198;
const TEMPLATE3_OVERHEAD = 198;
const TEMPLATE4_OVERHEAD = 186;

export default function Home() {
  const [templateKind, setTemplateKind] = useState<ChartTemplateKind>("template1");
  const [density, setDensity] = useState<DensityMode>("spacious");
  const [marketTitle, setMarketTitle] = useState("Global Market");
  const [dominantRegion, setDominantRegion] = useState("Asia Pacific");
  const [unit, setUnit] = useState("USD Billion");

  const [knownYearInput, setKnownYearInput] = useState<KnownYearInput>(DEFAULT_KNOWN_YEAR_INPUT);
  const [derived, setDerived] = useState<DerivedMarketSizes>(() => deriveMarketSizes(DEFAULT_KNOWN_YEAR_INPUT));

  const [forecastPeriod, setForecastPeriod] = useState("2026-2032");
  const [baseYear, setBaseYear] = useState(2025);
  const [historicalDataText, setHistoricalDataText] = useState("2020 to 2025");

  const [segmentRows, setSegmentRows] = useState<SegmentRowInput[]>(DEFAULT_SEGMENT_ROWS);
  const [mapping, setMapping] = useState<SnapshotChartMapping>(DEFAULT_MAPPING);
  const [keyPlayersRaw, setKeyPlayersRaw] = useState(DEFAULT_KEY_PLAYERS_RAW);
  const [chartOutputMapping, setChartOutputMapping] = useState<MaximizeChartOutputMapping>(
    DEFAULT_MAXIMIZE_CHART_OUTPUT_MAPPING
  );

  const [tableStyleMode, setTableStyleMode] = useState<TableStyleMode>("legacy");
  const [includeRegionInTable, setIncludeRegionInTable] = useState(false);

  const [previewWidth, setPreviewWidth] = useState(900);
  const [previewHeight, setPreviewHeight] = useState(580);
  const [sidebarWidthPx, setSidebarWidthPx] = useState(DEFAULT_SIDEBAR_WIDTH);

  const [template1ChartHeights, setTemplate1ChartHeights] =
    useState<Template1ChartHeights>(DEFAULT_TEMPLATE1_CHART_HEIGHTS);
  const [template2ChartHeights, setTemplate2ChartHeights] =
    useState<SplitChartHeights>(DEFAULT_SPLIT_CHART_HEIGHTS);
  const [template3ChartHeights, setTemplate3ChartHeights] =
    useState<SplitChartHeights>(DEFAULT_SPLIT_CHART_HEIGHTS);
  const [template4ChartHeights, setTemplate4ChartHeights] =
    useState<Template4ChartHeights>(DEFAULT_TEMPLATE4_CHART_HEIGHTS);

  const [useSolidBackground, setUseSolidBackground] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [isExporting, setIsExporting] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");
  const [tocCopyStatus, setTocCopyStatus] = useState<"idle" | "copied" | "failed">("idle");
  const [isSidebarResizing, setIsSidebarResizing] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);
  const donutExportRef = useRef<HTMLDivElement>(null);
  const pie3dExportRef = useRef<HTMLDivElement>(null);
  const pie2dExportRef = useRef<HTMLDivElement>(null);
  const columnExportRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const sidebarResizeRef = useRef<{ startX: number; startWidth: number } | null>(null);

  const unifiedInput: UnifiedMarketInput = useMemo(
    () => ({
      marketTitle,
      dominantRegion,
      unit,
      knownYearInput,
      derived,
      reportCoverage: {
        baseYear,
        historicalDataText,
        forecastPeriod,
      },
      segmentRows,
      mapping,
      includeRegionInTable,
      tableStyleMode,
      previewWidth,
      previewHeight,
      density,
      templateKind,
    }),
    [
      marketTitle,
      dominantRegion,
      unit,
      knownYearInput,
      derived,
      baseYear,
      historicalDataText,
      forecastPeriod,
      segmentRows,
      mapping,
      includeRegionInTable,
      tableStyleMode,
      previewWidth,
      previewHeight,
      density,
      templateKind,
    ]
  );

  const mappingValidationMessage = useMemo(
    () => validateMapping(templateKind, mapping, segmentRows),
    [templateKind, mapping, segmentRows]
  );

  const snapshotContext = useMemo(
    () => buildSnapshotContext(unifiedInput),
    [unifiedInput]
  );

  const snapshotResult = useMemo(() => {
    if (!snapshotContext.formInput) {
      return {
        viewModel: null,
        errors: snapshotContext.errors,
      };
    }

    const baseErrors = [...snapshotContext.errors];
    if (mappingValidationMessage) {
      baseErrors.push(mappingValidationMessage);
    }
    const derivedErrors = validateUnifiedInput(unifiedInput);
    const combined = [...baseErrors, ...derivedErrors];

    if (templateKind === "template1") {
      const result = buildTemplate1ViewModel(snapshotContext.formInput);
      return { viewModel: result.viewModel, errors: [...combined, ...result.errors] };
    }

    if (templateKind === "template2") {
      const result = buildTemplate2ViewModel(snapshotContext.formInput);
      return { viewModel: result.viewModel, errors: [...combined, ...result.errors] };
    }

    if (templateKind === "template3") {
      const result = buildTemplate3ViewModel(snapshotContext.formInput);
      return { viewModel: result.viewModel, errors: [...combined, ...result.errors] };
    }

    const result = buildTemplate4ViewModel(snapshotContext.formInput);
    return { viewModel: result.viewModel, errors: [...combined, ...result.errors] };
  }, [mappingValidationMessage, snapshotContext, templateKind, unifiedInput]);

  const chartOutputViewModels = useMemo(
    () =>
      buildMaximizeChartOutputViewModels({
        marketTitle,
        unit,
        marketSize2025: derived.marketSize2025,
        segmentRows,
        mapping: chartOutputMapping,
      }),
    [chartOutputMapping, derived.marketSize2025, marketTitle, segmentRows, unit]
  );

  const tableViewModel = useMemo(() => buildSegmentationTableViewModel(unifiedInput), [unifiedInput]);
  const tableHtml = useMemo(() => renderSegmentationTableHtml(tableViewModel), [tableViewModel]);
  const tocViewModel = useMemo(
    () =>
      buildTocViewModel({
        marketTitle,
        keyPlayersRaw,
        segmentRows,
        unit,
      }),
    [marketTitle, keyPlayersRaw, segmentRows, unit]
  );
  const tocHtml = useMemo(() => renderTocHtml(tocViewModel), [tocViewModel]);

  const template1Balanced = useMemo(
    () => autoBalanceTemplate1(previewHeight, template1ChartHeights),
    [previewHeight, template1ChartHeights]
  );
  const template2Balanced = useMemo(
    () => autoBalanceSplitTemplate(previewHeight, template2ChartHeights, TEMPLATE2_OVERHEAD),
    [previewHeight, template2ChartHeights]
  );
  const template3Balanced = useMemo(
    () => autoBalanceSplitTemplate(previewHeight, template3ChartHeights, TEMPLATE3_OVERHEAD),
    [previewHeight, template3ChartHeights]
  );
  const template4Balanced = useMemo(
    () => autoBalanceTemplate4(previewHeight, template4ChartHeights),
    [previewHeight, template4ChartHeights]
  );

  const activeBackgroundColor = useSolidBackground ? backgroundColor : "transparent";
  const activeErrors = snapshotResult.errors;
  const activeViewModel = snapshotResult.viewModel;

  const template1ViewModel =
    templateKind === "template1"
      ? (snapshotResult.viewModel as ReturnType<typeof buildTemplate1ViewModel>["viewModel"])
      : null;
  const template2ViewModel =
    templateKind === "template2"
      ? (snapshotResult.viewModel as ReturnType<typeof buildTemplate2ViewModel>["viewModel"])
      : null;
  const template3ViewModel =
    templateKind === "template3"
      ? (snapshotResult.viewModel as ReturnType<typeof buildTemplate3ViewModel>["viewModel"])
      : null;
  const template4ViewModel =
    templateKind === "template4"
      ? (snapshotResult.viewModel as ReturnType<typeof buildTemplate4ViewModel>["viewModel"])
      : null;

  const activeWasAutoBalanced =
    templateKind === "template1"
      ? template1Balanced.wasAutoBalanced
      : templateKind === "template2"
      ? template2Balanced.wasAutoBalanced
      : templateKind === "template3"
      ? template3Balanced.wasAutoBalanced
      : template4Balanced.wasAutoBalanced;

  const standaloneChartExportControls = (
    <details className="ms-advanced-settings" open>
      <summary>Standalone chart exports</summary>
      <div className="ms-preview-settings-row ms-preview-settings-row-3">
        <label className="ms-field">
          <span>Donut Segment</span>
          <Select
            value={chartOutputMapping.donutSegmentId}
            onValueChange={(value) =>
              setChartOutputMapping((current) => ({
                ...current,
                donutSegmentId: value,
              }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select segment row" />
            </SelectTrigger>
            <SelectContent>
              {segmentRows.map((row) => (
                <SelectItem key={row.id} value={row.id}>
                  {row.title || row.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <label className="ms-field">
          <span>Region Pie Segment</span>
          <Select
            value={chartOutputMapping.pie3dSegmentId}
            onValueChange={(value) =>
              setChartOutputMapping((current) => ({
                ...current,
                pie3dSegmentId: value,
              }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select segment row" />
            </SelectTrigger>
            <SelectContent>
              {segmentRows.map((row) => (
                <SelectItem key={row.id} value={row.id}>
                  {row.title || row.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <label className="ms-field">
          <span>Flat Pie Segment</span>
          <Select
            value={chartOutputMapping.pie2dSegmentId}
            onValueChange={(value) =>
              setChartOutputMapping((current) => ({
                ...current,
                pie2dSegmentId: value,
              }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select segment row" />
            </SelectTrigger>
            <SelectContent>
              {segmentRows.map((row) => (
                <SelectItem key={row.id} value={row.id}>
                  {row.title || row.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <label className="ms-field">
          <span>Column Segment</span>
          <Select
            value={chartOutputMapping.columnSegmentId}
            onValueChange={(value) =>
              setChartOutputMapping((current) => ({
                ...current,
                columnSegmentId: value,
              }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select segment row" />
            </SelectTrigger>
            <SelectContent>
              {segmentRows.map((row) => (
                <SelectItem key={row.id} value={row.id}>
                  {row.title || row.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      </div>

      {chartOutputViewModels.notes.length > 0 ? (
        <div className="smr-note-stack">
          {chartOutputViewModels.notes.map((note) => (
            <p key={note} className="ms-note">
              {note}
            </p>
          ))}
        </div>
      ) : null}
    </details>
  );

  const handleKnownYearInputChange = (field: keyof KnownYearInput, value: number) => {
    setKnownYearInput((current) => {
      const next = {
        ...current,
        [field]: Number.isFinite(value) ? value : Number.NaN,
      };

      const recalculated = deriveMarketSizes(next);
      setDerived((currentDerived) => ({
        marketSize2025: currentDerived.is2025Overridden ? currentDerived.marketSize2025 : recalculated.marketSize2025,
        marketSize2032: currentDerived.is2032Overridden ? currentDerived.marketSize2032 : recalculated.marketSize2032,
        is2025Overridden: currentDerived.is2025Overridden,
        is2032Overridden: currentDerived.is2032Overridden,
      }));

      return next;
    });
  };

  const handleDerivedValueChange = (field: "marketSize2025" | "marketSize2032", value: number) => {
    setDerived((current) => ({
      ...current,
      [field]: Number.isFinite(value) ? value : Number.NaN,
      is2025Overridden: field === "marketSize2025" ? true : current.is2025Overridden,
      is2032Overridden: field === "marketSize2032" ? true : current.is2032Overridden,
    }));
  };

  const handleRecalculate = () => {
    setDerived(resetDerivedOverrides(knownYearInput));
  };

  const handlePreviewDimension =
    (setter: React.Dispatch<React.SetStateAction<number>>, min: number, max: number) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const raw = Number(event.target.value);
      if (!Number.isFinite(raw)) return;
      setter(clamp(Math.round(raw), min, max));
    };

  const handleTemplate1ChartHeight =
    (field: keyof Template1ChartHeights) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const raw = Number(event.target.value);
      if (!Number.isFinite(raw)) return;
      setTemplate1ChartHeights((current) => ({
        ...current,
        [field]: clamp(Math.round(raw), MIN_CHART_HEIGHT, MAX_CHART_HEIGHT),
      }));
    };

  const handleTemplate2ChartHeight =
    (field: keyof SplitChartHeights) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const raw = Number(event.target.value);
      if (!Number.isFinite(raw)) return;
      setTemplate2ChartHeights((current) => ({
        ...current,
        [field]: clamp(Math.round(raw), MIN_CHART_HEIGHT, MAX_CHART_HEIGHT),
      }));
    };

  const handleTemplate3ChartHeight =
    (field: keyof SplitChartHeights) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const raw = Number(event.target.value);
      if (!Number.isFinite(raw)) return;
      setTemplate3ChartHeights((current) => ({
        ...current,
        [field]: clamp(Math.round(raw), MIN_CHART_HEIGHT, MAX_CHART_HEIGHT),
      }));
    };

  const handleTemplate4ChartHeight =
    (field: keyof Template4ChartHeights) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const raw = Number(event.target.value);
      if (!Number.isFinite(raw)) return;
      setTemplate4ChartHeights((current) => ({
        ...current,
        [field]: clamp(Math.round(raw), MIN_CHART_HEIGHT, MAX_CHART_HEIGHT),
      }));
    };

  const handleSidebarResizeStart = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    sidebarResizeRef.current = {
      startX: event.clientX,
      startWidth: sidebarWidthPx,
    };
    setIsSidebarResizing(true);
    event.preventDefault();
  };

  const handleSidebarResizeReset = () => {
    setSidebarWidthPx(DEFAULT_SIDEBAR_WIDTH);
  };

  const handleDownload = async () => {
    if (!activeViewModel || !previewRef.current || activeErrors.length > 0 || isExporting) {
      return;
    }

    setIsExporting(true);
    try {
      await downloadElementAsWebp(previewRef.current, {
        fileName: buildSnapshotFileName(marketTitle),
        pixelRatio: 1,
        quality: 0.78,
        maxFileSizeKb: 30,
        width: previewWidth,
        height: previewHeight,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleChartOutputDownload = async (kind: MaximizeChartOutputKind) => {
    const exportRef =
      kind === "donut"
        ? donutExportRef.current
        : kind === "pie3d"
        ? pie3dExportRef.current
        : kind === "pie2d"
        ? pie2dExportRef.current
        : columnExportRef.current;

    if (!exportRef || isExporting) {
      return;
    }

    setIsExporting(true);
    try {
      await downloadElementAsWebp(exportRef, {
        fileName: buildChartOutputFileName(marketTitle, kind),
        pixelRatio: 1,
        quality: 0.78,
        maxFileSizeKb: 80,
        width: MAXIMIZE_CHART_EXPORT_CANVAS[kind].width,
        height: MAXIMIZE_CHART_EXPORT_CANVAS[kind].height,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(tableHtml);
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus("idle"), 1500);
    } catch {
      setCopyStatus("failed");
      setTimeout(() => setCopyStatus("idle"), 1500);
    }
  };

  const handleCopyTocHtml = async () => {
    try {
      await navigator.clipboard.writeText(tocHtml);
      setTocCopyStatus("copied");
      setTimeout(() => setTocCopyStatus("idle"), 1500);
    } catch {
      setTocCopyStatus("failed");
      setTimeout(() => setTocCopyStatus("idle"), 1500);
    }
  };

  const handleClearAll = () => {
    setTemplateKind("template1");
    setDensity("spacious");
    setMarketTitle("Global Market");
    setDominantRegion("Asia Pacific");
    setUnit("USD Billion");
    setKnownYearInput(DEFAULT_KNOWN_YEAR_INPUT);
    setDerived(deriveMarketSizes(DEFAULT_KNOWN_YEAR_INPUT));
    setForecastPeriod("2026-2032");
    setBaseYear(2025);
    setHistoricalDataText("2020 to 2025");
    setSegmentRows(DEFAULT_SEGMENT_ROWS);
    setMapping(DEFAULT_MAPPING);
    setKeyPlayersRaw(DEFAULT_KEY_PLAYERS_RAW);
    setChartOutputMapping(DEFAULT_MAXIMIZE_CHART_OUTPUT_MAPPING);
    setTableStyleMode("legacy");
    setIncludeRegionInTable(false);
    setPreviewWidth(900);
    setPreviewHeight(580);
    setTemplate1ChartHeights(DEFAULT_TEMPLATE1_CHART_HEIGHTS);
    setTemplate2ChartHeights(DEFAULT_SPLIT_CHART_HEIGHTS);
    setTemplate3ChartHeights(DEFAULT_SPLIT_CHART_HEIGHTS);
    setTemplate4ChartHeights(DEFAULT_TEMPLATE4_CHART_HEIGHTS);
    setUseSolidBackground(true);
    setBackgroundColor("#ffffff");
    setCopyStatus("idle");
    setTocCopyStatus("idle");
  };

  useEffect(() => {
    if (useSolidBackground) {
      colorInputRef.current?.focus();
    }
  }, [useSolidBackground]);

  useEffect(() => {
    setChartOutputMapping((current) => normalizeChartOutputMapping(segmentRows, current));
  }, [segmentRows]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY);
    if (!saved) return;
    const parsed = Number(saved);
    if (!Number.isFinite(parsed)) return;
    setSidebarWidthPx(clamp(Math.round(parsed), MIN_SIDEBAR_WIDTH, MAX_SIDEBAR_WIDTH));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(sidebarWidthPx));
  }, [sidebarWidthPx]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    if (!isSidebarResizing) return;

    const handleMouseMove = (event: MouseEvent) => {
      const current = sidebarResizeRef.current;
      if (!current) return;
      const nextWidth = current.startWidth + (event.clientX - current.startX);
      setSidebarWidthPx(clamp(Math.round(nextWidth), MIN_SIDEBAR_WIDTH, MAX_SIDEBAR_WIDTH));
    };

    const handleMouseUp = () => {
      sidebarResizeRef.current = null;
      setIsSidebarResizing(false);
    };

    document.body.classList.add("ms-is-resizing");
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.body.classList.remove("ms-is-resizing");
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isSidebarResizing]);

  return (
    <div className={`app-shell density-${density}`} style={densityStyle(density)}>
      <SidebarProvider defaultOpen style={{ "--sidebar-width": `${sidebarWidthPx}px` } as CSSProperties}>
        <Sidebar variant="inset" collapsible="offcanvas" className="ms-editor-sidebar">
          <SidebarHeader className="ms-sidebar-title-wrap">
            <span className="ms-sidebar-title">Workspace Controls</span>
          </SidebarHeader>
          <SidebarContent className="ms-sidebar-scroll">
            <section className="ms-sidebar-sections">
              <details className="ms-collapsible ms-tone-1" open>
                <summary>0. Workspace & Export</summary>
                <section className="ms-section-block">
                  <div className="ms-workspace-controls">
                    <label className="ms-field ms-workspace-field">
                      <span>Preview Width</span>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={MIN_PREVIEW_WIDTH}
                        max={MAX_PREVIEW_SIZE}
                        value={previewWidth}
                        onChange={handlePreviewDimension(setPreviewWidth, MIN_PREVIEW_WIDTH, MAX_PREVIEW_SIZE)}
                      />
                    </label>
                    <label className="ms-field ms-workspace-field">
                      <span>Preview Height</span>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={MIN_PREVIEW_HEIGHT}
                        max={MAX_PREVIEW_SIZE}
                        value={previewHeight}
                        onChange={handlePreviewDimension(setPreviewHeight, MIN_PREVIEW_HEIGHT, MAX_PREVIEW_SIZE)}
                      />
                    </label>
                    <label className="ms-field ms-check-field ms-workspace-field">
                      <span>Background Fill</span>
                      <label className="ms-inline-check">
                        <Checkbox
                          checked={useSolidBackground}
                          onCheckedChange={(checked) => setUseSolidBackground(checked === true)}
                        />
                        Use solid
                      </label>
                    </label>
                    {useSolidBackground ? (
                      <label className="ms-field ms-workspace-field ms-color-field">
                        <span>Background Color</span>
                        <input
                          ref={colorInputRef}
                          className="ms-color-input"
                          type="color"
                          value={backgroundColor}
                          onChange={(event) => setBackgroundColor(event.target.value)}
                        />
                      </label>
                    ) : null}
                  </div>

                  <div className="ms-workspace-derivation">
                    <label className="ms-field ms-workspace-field">
                      <span>Known Year</span>
                      <Input
                        type="number"
                        inputMode="numeric"
                        value={Number.isFinite(knownYearInput.knownYear) ? knownYearInput.knownYear : ""}
                        onChange={(event) => handleKnownYearInputChange("knownYear", Number(event.target.value))}
                      />
                    </label>
                    <label className="ms-field ms-workspace-field">
                      <span>Known Size</span>
                      <Input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        value={Number.isFinite(knownYearInput.knownMarketSize) ? knownYearInput.knownMarketSize : ""}
                        onChange={(event) => handleKnownYearInputChange("knownMarketSize", Number(event.target.value))}
                      />
                    </label>
                    <label className="ms-field ms-workspace-field">
                      <span>CAGR (%)</span>
                      <Input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        value={Number.isFinite(knownYearInput.cagrPercent) ? knownYearInput.cagrPercent : ""}
                        onChange={(event) => handleKnownYearInputChange("cagrPercent", Number(event.target.value))}
                      />
                    </label>
                    <label className="ms-field ms-workspace-field">
                      <span>Size 2025</span>
                      <Input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        value={Number.isFinite(derived.marketSize2025) ? derived.marketSize2025 : ""}
                        onChange={(event) => handleDerivedValueChange("marketSize2025", Number(event.target.value))}
                      />
                    </label>
                    <label className="ms-field ms-workspace-field">
                      <span>Size 2032</span>
                      <Input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        value={Number.isFinite(derived.marketSize2032) ? derived.marketSize2032 : ""}
                        onChange={(event) => handleDerivedValueChange("marketSize2032", Number(event.target.value))}
                      />
                    </label>
                    <Button type="button" variant="outline" className="ms-secondary-btn ms-recalculate-btn" onClick={handleRecalculate}>
                      Recalculate
                    </Button>
                  </div>

                </section>
              </details>

              <details className="ms-collapsible ms-tone-2" open>
                <summary>1. Market Basics</summary>
                <section className="ms-section-block">
                  <div className="ms-form-grid ms-form-grid-3">
                    <label className="ms-field">
                      <span>Template</span>
                      <Select value={templateKind} onValueChange={(value) => setTemplateKind(value as ChartTemplateKind)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="template1">Template 1</SelectItem>
                          <SelectItem value="template2">Template 2</SelectItem>
                          <SelectItem value="template3">Template 3</SelectItem>
                          <SelectItem value="template4">Template 4</SelectItem>
                        </SelectContent>
                      </Select>
                    </label>

                    <label className="ms-field">
                      <span>Density Mode</span>
                      <Select value={density} onValueChange={(value) => setDensity(value as DensityMode)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select density mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="compact">Compact</SelectItem>
                          <SelectItem value="spacious">Spacious</SelectItem>
                        </SelectContent>
                      </Select>
                    </label>

                    <TableStyleToggle value={tableStyleMode} onChange={setTableStyleMode} />

                    <label className="ms-field">
                      <span>Market Title</span>
                      <Input value={marketTitle} onChange={(event) => setMarketTitle(event.target.value)} />
                    </label>

                    <label className="ms-field">
                      <span>Dominating Region/Country</span>
                      <Input value={dominantRegion} onChange={(event) => setDominantRegion(event.target.value)} />
                    </label>

                    <label className="ms-field">
                      <span>Unit of Market Size</span>
                      <Input value={unit} onChange={(event) => setUnit(event.target.value)} />
                    </label>

                    <label className="ms-field ms-field-full">
                      <span>Key Players (comma/newline separated)</span>
                      <Textarea
                        value={keyPlayersRaw}
                        onChange={(event) => setKeyPlayersRaw(event.target.value)}
                        className="min-h-20 resize-y"
                      />
                    </label>
                  </div>
                </section>
              </details>

              <details className="ms-collapsible ms-tone-3" open>
                <summary>2. Report Coverage</summary>
                <section className="ms-section-block">
                  <div className="ms-form-grid ms-form-grid-3">
                    <label className="ms-field">
                      <span>Base Year</span>
                      <Input
                        type="number"
                        value={Number.isFinite(baseYear) ? baseYear : ""}
                        onChange={(event) => setBaseYear(Number(event.target.value))}
                      />
                    </label>

                    <label className="ms-field">
                      <span>Forecast Period</span>
                      <Input value={forecastPeriod} onChange={(event) => setForecastPeriod(event.target.value)} />
                    </label>

                    <label className="ms-field ms-check-field">
                      <span>Region in Table</span>
                      <label className="ms-inline-check">
                        <Checkbox
                          checked={includeRegionInTable}
                          onCheckedChange={(checked) => setIncludeRegionInTable(checked === true)}
                        />
                        Include region/country segments
                      </label>
                    </label>

                    <label className="ms-field ms-field-full">
                      <span>Historical Data</span>
                      <Input value={historicalDataText} onChange={(event) => setHistoricalDataText(event.target.value)} />
                    </label>
                  </div>
                </section>
              </details>

              <details className="ms-collapsible ms-tone-4" open>
                <summary>3. Segment Catalog</summary>
                <SegmentCatalogEditor rows={segmentRows} onRowsChange={setSegmentRows} />
              </details>

              <details className="ms-collapsible ms-tone-5" open>
                <summary>4. Snapshot Mapping</summary>
                <SegmentMappingControls
                  templateKind={templateKind}
                  mapping={mapping}
                  rows={segmentRows}
                  onMappingChange={setMapping}
                  invalidMessage={mappingValidationMessage}
                />
              </details>

              <details className="ms-collapsible ms-tone-6">
                <summary>5. Advanced Chart Layout</summary>
                <section className="ms-section-block">
                  <details className="ms-advanced-settings" open>
                    <summary>Advanced chart sizing</summary>
                    {templateKind === "template1" ? (
                      <div className="ms-preview-settings-row ms-preview-settings-row-3">
                        <label className="ms-field">
                          <span>Yearly Chart Height</span>
                          <Input
                            type="number"
                            min={MIN_CHART_HEIGHT}
                            max={MAX_CHART_HEIGHT}
                            value={template1ChartHeights.yearlyPlot}
                            onChange={handleTemplate1ChartHeight("yearlyPlot")}
                          />
                        </label>
                        <label className="ms-field">
                          <span>Type Chart Height</span>
                          <Input
                            type="number"
                            min={MIN_CHART_HEIGHT}
                            max={MAX_CHART_HEIGHT}
                            value={template1ChartHeights.typeChart}
                            onChange={handleTemplate1ChartHeight("typeChart")}
                          />
                        </label>
                        <label className="ms-field">
                          <span>Region Chart Height</span>
                          <Input
                            type="number"
                            min={MIN_CHART_HEIGHT}
                            max={MAX_CHART_HEIGHT}
                            value={template1ChartHeights.regionChart}
                            onChange={handleTemplate1ChartHeight("regionChart")}
                          />
                        </label>
                      </div>
                    ) : null}

                    {templateKind === "template2" ? (
                      <div className="ms-preview-settings-row ms-preview-settings-row-3">
                        <label className="ms-field">
                          <span>Top Segment Height</span>
                          <Input
                            type="number"
                            min={MIN_CHART_HEIGHT}
                            max={MAX_CHART_HEIGHT}
                            value={template2ChartHeights.topSegment}
                            onChange={handleTemplate2ChartHeight("topSegment")}
                          />
                        </label>
                        <label className="ms-field">
                          <span>Bottom Left Chart Height</span>
                          <Input
                            type="number"
                            min={MIN_CHART_HEIGHT}
                            max={MAX_CHART_HEIGHT}
                            value={template2ChartHeights.bottomLeft}
                            onChange={handleTemplate2ChartHeight("bottomLeft")}
                          />
                        </label>
                        <label className="ms-field">
                          <span>Bottom Right Chart Height</span>
                          <Input
                            type="number"
                            min={MIN_CHART_HEIGHT}
                            max={MAX_CHART_HEIGHT}
                            value={template2ChartHeights.bottomRight}
                            onChange={handleTemplate2ChartHeight("bottomRight")}
                          />
                        </label>
                      </div>
                    ) : null}

                    {templateKind === "template3" ? (
                      <div className="ms-preview-settings-row ms-preview-settings-row-3">
                        <label className="ms-field">
                          <span>Top Segment Height</span>
                          <Input
                            type="number"
                            min={MIN_CHART_HEIGHT}
                            max={MAX_CHART_HEIGHT}
                            value={template3ChartHeights.topSegment}
                            onChange={handleTemplate3ChartHeight("topSegment")}
                          />
                        </label>
                        <label className="ms-field">
                          <span>Bottom Left Chart Height</span>
                          <Input
                            type="number"
                            min={MIN_CHART_HEIGHT}
                            max={MAX_CHART_HEIGHT}
                            value={template3ChartHeights.bottomLeft}
                            onChange={handleTemplate3ChartHeight("bottomLeft")}
                          />
                        </label>
                        <label className="ms-field">
                          <span>Bottom Right Chart Height</span>
                          <Input
                            type="number"
                            min={MIN_CHART_HEIGHT}
                            max={MAX_CHART_HEIGHT}
                            value={template3ChartHeights.bottomRight}
                            onChange={handleTemplate3ChartHeight("bottomRight")}
                          />
                        </label>
                      </div>
                    ) : null}

                    {templateKind === "template4" ? (
                      <div className="ms-preview-settings-row">
                        <label className="ms-field">
                          <span>Top Segment Height</span>
                          <Input
                            type="number"
                            min={MIN_CHART_HEIGHT}
                            max={MAX_CHART_HEIGHT}
                            value={template4ChartHeights.topSegment}
                            onChange={handleTemplate4ChartHeight("topSegment")}
                          />
                        </label>
                        <label className="ms-field">
                          <span>Bottom Main Chart Height</span>
                          <Input
                            type="number"
                            min={MIN_CHART_HEIGHT}
                            max={MAX_CHART_HEIGHT}
                            value={template4ChartHeights.bottomMain}
                            onChange={handleTemplate4ChartHeight("bottomMain")}
                          />
                        </label>
                      </div>
                    ) : null}
                  </details>

                  {standaloneChartExportControls}

                  {activeErrors.length > 0 ? (
                    <ul className="ms-errors">
                      {activeErrors.map((error) => (
                        <li key={error}>{error}</li>
                      ))}
                    </ul>
                  ) : null}

                  {activeWasAutoBalanced ? (
                    <p className="ms-note">Chart heights were auto-balanced to fit the current preview height.</p>
                  ) : null}

                  {snapshotContext.truncated ? (
                    <p className="ms-note">Rendering top 10 items for chart/legend stability.</p>
                  ) : null}
                </section>
              </details>
            </section>
          </SidebarContent>
        </Sidebar>
        <div
          className={`ms-sidebar-resize-handle${isSidebarResizing ? " is-active" : ""}`}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize sidebar"
          title="Drag to resize sidebar (double-click to reset)"
          style={{ left: `${sidebarWidthPx - 4}px` }}
          onMouseDown={handleSidebarResizeStart}
          onDoubleClick={handleSidebarResizeReset}
        />

        <SidebarInset className="ms-main-shell">
          <header className="ms-workspace-header ms-workspace-header-single">
            <div className="ms-workspace-topbar">
              <div className="ms-workspace-status">
                <SidebarTrigger className="ms-sidebar-trigger" />
                <span className="ms-toolbar-label">MMR Snapshot Builder</span>
                <span className="ms-toolbar-chip">{templateKind.replace("template", "Template ")}</span>
              </div>

              <div className="ms-workspace-actions">
                <Button
                  type="button"
                  className="ms-download-btn ms-toolbar-btn"
                  onClick={() => void handleDownload()}
                  disabled={!activeViewModel || activeErrors.length > 0 || isExporting}
                >
                  {isExporting ? "Exporting..." : "Download WebP"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="ms-secondary-btn ms-copy-btn ms-toolbar-btn"
                  onClick={handleCopyHtml}
                >
                  {copyStatus === "copied"
                    ? "Table HTML Copied"
                    : copyStatus === "failed"
                    ? "Copy Failed"
                    : "Copy Table HTML"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="ms-secondary-btn ms-copy-btn ms-toolbar-btn"
                  onClick={handleCopyTocHtml}
                >
                  {tocCopyStatus === "copied"
                    ? "TOC HTML Copied"
                    : tocCopyStatus === "failed"
                    ? "Copy Failed"
                    : "Copy TOC HTML"}
                </Button>
                <Button type="button" variant="outline" className="ms-secondary-btn ms-clear-btn ms-toolbar-btn" onClick={handleClearAll}>
                  Clear
                </Button>
              </div>
            </div>
          </header>

          <main className="ms-main-content">
            <section className="ms-preview-area ms-preview-area-dual">
              <div className="ms-preview-x-scroll">
                <div className="ms-preview-stack">
                  {templateKind === "template1" && template1ViewModel ? (
                    <Template1Card
                      ref={previewRef}
                      viewModel={template1ViewModel}
                      unit={unit}
                      width={previewWidth}
                      height={previewHeight}
                      backgroundColor={activeBackgroundColor}
                      density={density}
                      chartHeights={template1Balanced.heights}
                    />
                  ) : null}

                  {templateKind === "template2" && template2ViewModel ? (
                    <Template2Card
                      ref={previewRef}
                      viewModel={template2ViewModel}
                      width={previewWidth}
                      height={previewHeight}
                      backgroundColor={activeBackgroundColor}
                      density={density}
                      chartHeights={template2Balanced.heights}
                    />
                  ) : null}

                  {templateKind === "template3" && template3ViewModel ? (
                    <Template3Card
                      ref={previewRef}
                      viewModel={template3ViewModel}
                      width={previewWidth}
                      height={previewHeight}
                      backgroundColor={activeBackgroundColor}
                      density={density}
                      chartHeights={template3Balanced.heights}
                    />
                  ) : null}

                  {templateKind === "template4" && template4ViewModel ? (
                    <Template4Card
                      ref={previewRef}
                      viewModel={template4ViewModel}
                      width={previewWidth}
                      height={previewHeight}
                      backgroundColor={activeBackgroundColor}
                      density={density}
                      chartHeights={template4Balanced.heights}
                    />
                  ) : null}

                  {!snapshotResult.viewModel ? (
                    <div className="ms-preview-placeholder" style={{ width: previewWidth, height: previewHeight }}>
                      Fill required fields and valid mapping to render snapshot preview.
                    </div>
                  ) : null}

                  <SegmentationTablePreview viewModel={tableViewModel} html={tableHtml} />
                  <TocPreview
                    html={tocHtml}
                    segmentCount={tocViewModel.segments.length}
                    keyPlayerCount={tocViewModel.keyPlayers.length}
                    didTruncateSegments={tocViewModel.didTruncateSegments}
                    didTruncateSegmentItems={tocViewModel.didTruncateSegmentItems}
                    didTruncateKeyPlayers={tocViewModel.didTruncateKeyPlayers}
                  />

                  <section className="ms-chart-output-section">
                    <div className="ms-chart-output-section-head">
                      <h2>Standalone chart previews</h2>
                      <p>These exports use the selected segment rows and remain independent from the active Maximize template.</p>
                    </div>

                    <div className="ms-chart-output-grid">
                      <section className="smr-preview-frame ms-chart-output-frame">
                        <div className="smr-preview-frame-head ms-chart-output-frame-head">
                          <span>{MAXIMIZE_CHART_OUTPUT_LABELS.donut}</span>
                          <Button
                            type="button"
                            variant="outline"
                            className="smr-preview-download-btn"
                            onClick={() => handleChartOutputDownload("donut")}
                            disabled={isExporting}
                          >
                            Download
                          </Button>
                        </div>
                        <SmrDonutCard
                          viewModel={chartOutputViewModels.donut}
                          width={MAXIMIZE_CHART_PREVIEW_CANVAS.donut.width}
                          height={MAXIMIZE_CHART_PREVIEW_CANVAS.donut.height}
                          backgroundColor={activeBackgroundColor}
                          layout={MAXIMIZE_CHART_LAYOUTS.donut}
                        />
                      </section>

                      <section className="smr-preview-frame ms-chart-output-frame">
                        <div className="smr-preview-frame-head ms-chart-output-frame-head">
                          <span>{MAXIMIZE_CHART_OUTPUT_LABELS.pie3d}</span>
                          <Button
                            type="button"
                            variant="outline"
                            className="smr-preview-download-btn"
                            onClick={() => handleChartOutputDownload("pie3d")}
                            disabled={isExporting}
                          >
                            Download
                          </Button>
                        </div>
                        <SmrPie3DCard
                          viewModel={chartOutputViewModels.pie3d}
                          width={MAXIMIZE_CHART_PREVIEW_CANVAS.pie3d.width}
                          height={MAXIMIZE_CHART_PREVIEW_CANVAS.pie3d.height}
                          backgroundColor={activeBackgroundColor}
                          layout={MAXIMIZE_CHART_LAYOUTS.pie3d}
                        />
                      </section>

                      <section className="smr-preview-frame ms-chart-output-frame">
                        <div className="smr-preview-frame-head ms-chart-output-frame-head">
                          <span>{MAXIMIZE_CHART_OUTPUT_LABELS.pie2d}</span>
                          <Button
                            type="button"
                            variant="outline"
                            className="smr-preview-download-btn"
                            onClick={() => handleChartOutputDownload("pie2d")}
                            disabled={isExporting}
                          >
                            Download
                          </Button>
                        </div>
                        <SmrPie2DCard
                          viewModel={chartOutputViewModels.pie2d}
                          width={MAXIMIZE_CHART_PREVIEW_CANVAS.pie2d.width}
                          height={MAXIMIZE_CHART_PREVIEW_CANVAS.pie2d.height}
                          backgroundColor={activeBackgroundColor}
                          layout={MAXIMIZE_CHART_LAYOUTS.pie2d}
                        />
                      </section>

                      <section className="smr-preview-frame ms-chart-output-frame">
                        <div className="smr-preview-frame-head ms-chart-output-frame-head">
                          <span>{MAXIMIZE_CHART_OUTPUT_LABELS.column}</span>
                          <Button
                            type="button"
                            variant="outline"
                            className="smr-preview-download-btn"
                            onClick={() => handleChartOutputDownload("column")}
                            disabled={isExporting}
                          >
                            Download
                          </Button>
                        </div>
                        <SmrColumnCard
                          viewModel={chartOutputViewModels.column}
                          width={MAXIMIZE_CHART_PREVIEW_CANVAS.column.width}
                          height={MAXIMIZE_CHART_PREVIEW_CANVAS.column.height}
                          backgroundColor={activeBackgroundColor}
                          layout={MAXIMIZE_CHART_LAYOUTS.column}
                        />
                      </section>
                    </div>
                  </section>
                </div>
              </div>
            </section>
          </main>
        </SidebarInset>
      </SidebarProvider>

      <div className="smr-export-stage" aria-hidden>
        <SmrDonutCard
          ref={donutExportRef}
          viewModel={chartOutputViewModels.donut}
          width={MAXIMIZE_CHART_EXPORT_CANVAS.donut.width}
          height={MAXIMIZE_CHART_EXPORT_CANVAS.donut.height}
          backgroundColor={activeBackgroundColor}
          layout={MAXIMIZE_CHART_LAYOUTS.donut}
        />
        <SmrPie3DCard
          ref={pie3dExportRef}
          viewModel={chartOutputViewModels.pie3d}
          width={MAXIMIZE_CHART_EXPORT_CANVAS.pie3d.width}
          height={MAXIMIZE_CHART_EXPORT_CANVAS.pie3d.height}
          backgroundColor={activeBackgroundColor}
          layout={MAXIMIZE_CHART_LAYOUTS.pie3d}
        />
        <SmrPie2DCard
          ref={pie2dExportRef}
          viewModel={chartOutputViewModels.pie2d}
          width={MAXIMIZE_CHART_EXPORT_CANVAS.pie2d.width}
          height={MAXIMIZE_CHART_EXPORT_CANVAS.pie2d.height}
          backgroundColor={activeBackgroundColor}
          layout={MAXIMIZE_CHART_LAYOUTS.pie2d}
        />
        <SmrColumnCard
          ref={columnExportRef}
          viewModel={chartOutputViewModels.column}
          width={MAXIMIZE_CHART_EXPORT_CANVAS.column.width}
          height={MAXIMIZE_CHART_EXPORT_CANVAS.column.height}
          backgroundColor={activeBackgroundColor}
          layout={MAXIMIZE_CHART_LAYOUTS.column}
        />
      </div>
    </div>
  );
}

type SnapshotBuildContext = {
  formInput: SnapshotFormInput | null;
  errors: string[];
  truncated: boolean;
};

function buildSnapshotContext(input: UnifiedMarketInput): SnapshotBuildContext {
  const mapping = input.mapping;

  if (input.templateKind === "template1") {
    const typeSeries = resolveChartSeries(input.segmentRows, mapping.template1.typeSegmentId);
    const regionSeries = resolveChartSeries(input.segmentRows, mapping.template1.regionSegmentId);

    if (!typeSeries.sourceFound || !regionSeries.sourceFound) {
      return {
        formInput: null,
        errors: ["Select valid segment mappings for Template 1."],
        truncated: false,
      };
    }

    return {
      formInput: createSnapshotInput(
        input,
        typeSeries.sourceTitle,
        regionSeries.sourceTitle,
        "",
        typeSeries.labels,
        regionSeries.labels,
        []
      ),
      errors: [],
      truncated: typeSeries.truncated || regionSeries.truncated,
    };
  }

  if (input.templateKind === "template2") {
    const topSeries = resolveChartSeries(input.segmentRows, mapping.template2.topStackSegmentId);
    const pieSeries = resolveChartSeries(input.segmentRows, mapping.template2.pieSegmentId);
    const hbarSeries = resolveChartSeries(input.segmentRows, mapping.template2.horizontalSegmentId);

    if (!topSeries.sourceFound || !pieSeries.sourceFound || !hbarSeries.sourceFound) {
      return {
        formInput: null,
        errors: ["Select valid segment mappings for Template 2."],
        truncated: false,
      };
    }

    return {
      formInput: createSnapshotInput(
        input,
        hbarSeries.sourceTitle,
        topSeries.sourceTitle,
        pieSeries.sourceTitle,
        hbarSeries.labels,
        topSeries.labels,
        pieSeries.labels
      ),
      errors: [],
      truncated: topSeries.truncated || pieSeries.truncated || hbarSeries.truncated,
    };
  }

  if (input.templateKind === "template3") {
    const topSeries = resolveChartSeries(input.segmentRows, mapping.template3.topStackSegmentId);
    const pieSeries = resolveChartSeries(input.segmentRows, mapping.template3.pieSegmentId);
    const vSeries = resolveChartSeries(input.segmentRows, mapping.template3.verticalSegmentId);

    if (!topSeries.sourceFound || !pieSeries.sourceFound || !vSeries.sourceFound) {
      return {
        formInput: null,
        errors: ["Select valid segment mappings for Template 3."],
        truncated: false,
      };
    }

    return {
      formInput: createSnapshotInput(
        input,
        vSeries.sourceTitle,
        topSeries.sourceTitle,
        pieSeries.sourceTitle,
        vSeries.labels,
        topSeries.labels,
        pieSeries.labels
      ),
      errors: [],
      truncated: topSeries.truncated || pieSeries.truncated || vSeries.truncated,
    };
  }

  const topSeries = resolveChartSeries(input.segmentRows, mapping.template4.topStackSegmentId);
  const verticalSeries = resolveChartSeries(input.segmentRows, mapping.template4.verticalSegmentId);

  if (!topSeries.sourceFound || !verticalSeries.sourceFound) {
    return {
      formInput: null,
      errors: ["Select valid segment mappings for Template 4."],
      truncated: false,
    };
  }

  return {
    formInput: createSnapshotInput(
      input,
      verticalSeries.sourceTitle,
      topSeries.sourceTitle,
      "",
      verticalSeries.labels,
      topSeries.labels,
      []
    ),
    errors: [],
    truncated: topSeries.truncated || verticalSeries.truncated,
  };
}

function createSnapshotInput(
  input: UnifiedMarketInput,
  primaryTitle: string,
  secondaryTitle: string,
  tertiaryTitle: string,
  primaryLabels: string[],
  secondaryLabels: string[],
  tertiaryLabels: string[]
): SnapshotFormInput {
  return {
    marketTitle: input.marketTitle,
    cagrPercent: input.knownYearInput.cagrPercent,
    dominantRegion: input.dominantRegion,
    marketSize2025: input.derived.marketSize2025,
    marketSize2032: input.derived.marketSize2032,
    unit: input.unit,
    forecastPeriod: input.reportCoverage.forecastPeriod,
    primarySegmentTitle: primaryTitle,
    secondarySegmentTitle: secondaryTitle,
    tertiarySegmentTitle: tertiaryTitle,
    typeSegmentsRaw: primaryLabels.join("\n"),
    regionSegmentsRaw: secondaryLabels.join("\n"),
    tertiarySegmentsRaw: tertiaryLabels.join("\n"),
  };
}

function validateMapping(
  templateKind: ChartTemplateKind,
  mapping: SnapshotChartMapping,
  rows: SegmentRowInput[]
): string | undefined {
  const requiredIds =
    templateKind === "template1"
      ? [mapping.template1.typeSegmentId, mapping.template1.regionSegmentId]
      : templateKind === "template2"
      ? [mapping.template2.topStackSegmentId, mapping.template2.pieSegmentId, mapping.template2.horizontalSegmentId]
      : templateKind === "template3"
      ? [mapping.template3.topStackSegmentId, mapping.template3.pieSegmentId, mapping.template3.verticalSegmentId]
      : [mapping.template4.topStackSegmentId, mapping.template4.verticalSegmentId];

  const minimumRows = templateKind === "template2" || templateKind === "template3" ? 3 : 2;
  if (rows.length < minimumRows) {
    return `Add at least ${minimumRows} segment rows for ${templateKind}.`;
  }

  if (requiredIds.some((id) => !id)) {
    return "All chart mapping slots must be selected.";
  }

  const uniqueCount = new Set(requiredIds).size;
  if (uniqueCount !== requiredIds.length) {
    return "Chart mapping slots must point to different segment rows.";
  }

  const missing = requiredIds.find((id) => !rows.some((row) => row.id === id));
  if (missing) {
    return "Mapped segment row was removed. Please re-select mapping.";
  }

  const emptyData = requiredIds.find((id) => {
    const row = rows.find((item) => item.id === id);
    return !row || !row.linesRaw.trim() || !row.title.trim();
  });

  if (emptyData) {
    return "Mapped segment rows require title and at least one hierarchy line.";
  }

  return undefined;
}

function validateUnifiedInput(input: UnifiedMarketInput): string[] {
  const errors: string[] = [];

  if (!input.marketTitle.trim()) errors.push("Market title is required.");
  if (!input.dominantRegion.trim()) errors.push("Dominating region/country is required.");
  if (!input.unit.trim()) errors.push("Unit of market size is required.");
  if (!input.reportCoverage.forecastPeriod.trim()) errors.push("Forecast period is required.");
  if (!input.reportCoverage.historicalDataText.trim()) errors.push("Historical data text is required.");

  if (!Number.isFinite(input.knownYearInput.knownYear) || !Number.isInteger(input.knownYearInput.knownYear)) {
    errors.push("Known market year must be a valid integer year.");
  } else if (input.knownYearInput.knownYear < 1900 || input.knownYearInput.knownYear > 2100) {
    errors.push("Known market year must be between 1900 and 2100.");
  }

  if (!Number.isFinite(input.knownYearInput.knownMarketSize) || input.knownYearInput.knownMarketSize <= 0) {
    errors.push("Known market size must be a positive number.");
  }

  if (!Number.isFinite(input.knownYearInput.cagrPercent) || input.knownYearInput.cagrPercent < 0) {
    errors.push("CAGR must be a non-negative number.");
  }

  if (!Number.isFinite(input.derived.marketSize2025) || input.derived.marketSize2025 <= 0) {
    errors.push("Derived market size for 2025 must be a positive number.");
  }

  if (!Number.isFinite(input.derived.marketSize2032) || input.derived.marketSize2032 <= 0) {
    errors.push("Derived market size for 2032 must be a positive number.");
  }

  if (input.derived.marketSize2032 <= input.derived.marketSize2025) {
    errors.push("Market size in 2032 must be greater than market size in 2025.");
  }

  if (!Number.isFinite(input.reportCoverage.baseYear) || !Number.isInteger(input.reportCoverage.baseYear)) {
    errors.push("Base year must be a valid integer.");
  }

  if (input.segmentRows.length > 50) {
    errors.push("Segment catalog is very large (>50 rows); consider reducing rows for better performance.");
  }

  return errors;
}

function autoBalanceTemplate1(previewHeight: number, requested: Template1ChartHeights) {
  const normalized: Template1ChartHeights = {
    yearlyPlot: clamp(requested.yearlyPlot, MIN_CHART_HEIGHT, MAX_CHART_HEIGHT),
    typeChart: clamp(requested.typeChart, MIN_CHART_HEIGHT, MAX_CHART_HEIGHT),
    regionChart: clamp(requested.regionChart, MIN_CHART_HEIGHT, MAX_CHART_HEIGHT),
  };

  const availablePlotSpace = Math.max(MIN_CHART_HEIGHT * 2, previewHeight - TEMPLATE1_OVERHEAD);
  const requestedBottom = Math.max(normalized.typeChart, normalized.regionChart);

  const { top, bottom } = balanceTwoRows(normalized.yearlyPlot, requestedBottom, availablePlotSpace);

  const heights: Template1ChartHeights = {
    yearlyPlot: top,
    typeChart: Math.min(scaleRelative(normalized.typeChart, requestedBottom, bottom), bottom),
    regionChart: Math.min(scaleRelative(normalized.regionChart, requestedBottom, bottom), bottom),
  };

  const wasAutoBalanced =
    heights.yearlyPlot !== normalized.yearlyPlot ||
    heights.typeChart !== normalized.typeChart ||
    heights.regionChart !== normalized.regionChart;

  return { heights, wasAutoBalanced };
}

function autoBalanceSplitTemplate(previewHeight: number, requested: SplitChartHeights, overhead: number) {
  const normalized: SplitChartHeights = {
    topSegment: clamp(requested.topSegment, MIN_CHART_HEIGHT, MAX_CHART_HEIGHT),
    bottomLeft: clamp(requested.bottomLeft, MIN_CHART_HEIGHT, MAX_CHART_HEIGHT),
    bottomRight: clamp(requested.bottomRight, MIN_CHART_HEIGHT, MAX_CHART_HEIGHT),
  };

  const availablePlotSpace = Math.max(MIN_CHART_HEIGHT * 2, previewHeight - overhead);
  const requestedBottom = Math.max(normalized.bottomLeft, normalized.bottomRight);

  const { top, bottom } = balanceTwoRows(normalized.topSegment, requestedBottom, availablePlotSpace);

  const heights: SplitChartHeights = {
    topSegment: top,
    bottomLeft: Math.min(scaleRelative(normalized.bottomLeft, requestedBottom, bottom), bottom),
    bottomRight: Math.min(scaleRelative(normalized.bottomRight, requestedBottom, bottom), bottom),
  };

  const wasAutoBalanced =
    heights.topSegment !== normalized.topSegment ||
    heights.bottomLeft !== normalized.bottomLeft ||
    heights.bottomRight !== normalized.bottomRight;

  return { heights, wasAutoBalanced };
}

function autoBalanceTemplate4(previewHeight: number, requested: Template4ChartHeights) {
  const normalized: Template4ChartHeights = {
    topSegment: clamp(requested.topSegment, MIN_CHART_HEIGHT, MAX_CHART_HEIGHT),
    bottomMain: clamp(requested.bottomMain, MIN_CHART_HEIGHT, MAX_CHART_HEIGHT),
  };

  const availablePlotSpace = Math.max(MIN_CHART_HEIGHT * 2, previewHeight - TEMPLATE4_OVERHEAD);
  const { top, bottom } = balanceTwoRows(normalized.topSegment, normalized.bottomMain, availablePlotSpace);

  const heights: Template4ChartHeights = {
    topSegment: top,
    bottomMain: bottom,
  };

  const wasAutoBalanced =
    heights.topSegment !== normalized.topSegment || heights.bottomMain !== normalized.bottomMain;

  return { heights, wasAutoBalanced };
}

function balanceTwoRows(top: number, bottom: number, available: number) {
  if (top + bottom <= available) {
    return { top, bottom };
  }

  const scale = available / (top + bottom);
  let scaledTop = Math.max(MIN_CHART_HEIGHT, Math.floor(top * scale));
  let scaledBottom = Math.max(MIN_CHART_HEIGHT, Math.floor(bottom * scale));

  let overflow = scaledTop + scaledBottom - available;

  while (overflow > 0) {
    if (scaledBottom >= scaledTop && scaledBottom > MIN_CHART_HEIGHT) {
      scaledBottom -= 1;
      overflow -= 1;
      continue;
    }

    if (scaledTop > MIN_CHART_HEIGHT) {
      scaledTop -= 1;
      overflow -= 1;
      continue;
    }

    if (scaledBottom > MIN_CHART_HEIGHT) {
      scaledBottom -= 1;
      overflow -= 1;
      continue;
    }

    break;
  }

  return { top: scaledTop, bottom: scaledBottom };
}

function scaleRelative(value: number, sourceMax: number, targetMax: number): number {
  if (sourceMax <= 0) return targetMax;
  return Math.max(MIN_CHART_HEIGHT, Math.round((value / sourceMax) * targetMax));
}

function normalizeChartOutputMapping(
  rows: SegmentRowInput[],
  mapping: MaximizeChartOutputMapping
): MaximizeChartOutputMapping {
  const validIds = new Set(rows.map((row) => row.id));
  const fallback = rows[0]?.id ?? "";

  return {
    donutSegmentId: validIds.has(mapping.donutSegmentId) ? mapping.donutSegmentId : fallback,
    pie3dSegmentId: validIds.has(mapping.pie3dSegmentId) ? mapping.pie3dSegmentId : fallback,
    pie2dSegmentId: validIds.has(mapping.pie2dSegmentId) ? mapping.pie2dSegmentId : fallback,
    columnSegmentId: validIds.has(mapping.columnSegmentId) ? mapping.columnSegmentId : fallback,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function buildSnapshotFileName(marketTitle: string): string {
  const cleaned = marketTitle
    .trim()
    .replace(/[<>:"/\\|?*]+/g, "")
    .replace(/\s+/g, " ");
  const fileBase = cleaned.length > 0 ? cleaned : "Market Snapshot";
  return `${fileBase}.webp`;
}

function buildChartOutputFileName(marketTitle: string, kind: MaximizeChartOutputKind): string {
  const cleaned = marketTitle
    .trim()
    .replace(/[<>:"/\\|?*]+/g, "")
    .replace(/\s+/g, " ");
  const fileBase = cleaned.length > 0 ? cleaned : "Market Snapshot";
  return `${fileBase} ${MAXIMIZE_CHART_OUTPUT_LABELS[kind]}.webp`;
}

function densityStyle(density: DensityMode): CSSProperties {
  if (density === "compact") {
    return {
      ["--density-card-padding-y" as never]: "10px",
      ["--density-card-padding-x" as never]: "12px",
      ["--density-chart-gap" as never]: "10px",
      ["--density-legend-gap" as never]: "6px",
      ["--density-label-font" as never]: "12px",
      ["--density-row-gap" as never]: "6px",
    } as CSSProperties;
  }

  return {
    ["--density-card-padding-y" as never]: "13px",
    ["--density-card-padding-x" as never]: "15px",
    ["--density-chart-gap" as never]: "18px",
    ["--density-legend-gap" as never]: "9px",
    ["--density-label-font" as never]: "13px",
    ["--density-row-gap" as never]: "8px",
  } as CSSProperties;
}
