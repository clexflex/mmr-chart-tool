"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from "react";
import { SegmentCatalogEditor } from "@/components/segments/SegmentCatalogEditor";
import { SmrColumnCard, SmrDonutCard, SmrPie2DCard, SmrPie3DCard } from "@/components/smr/SmrChartCards";
import { SmrMappingEditor } from "@/components/smr/SmrMappingEditor";
import { SmrSnapshotCard } from "@/components/smr/SmrSnapshotCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { downloadElementAsWebp } from "@/lib/export/downloadWebp";
import { deriveMarketSizes, resetDerivedOverrides } from "@/lib/market/deriveMarketSizes";
import { buildSmrFileName, buildSmrViewModels, defaultSmrMapping } from "@/lib/smr/generateData";
import { downloadSmrZip } from "@/lib/smr/exportZip";
import type {
  SmrChartMapping,
  SmrDerivedMarketSizes,
  SmrInput,
  SmrKnownYearInput,
  SmrOutputKind,
  SmrSegmentRowInput,
} from "@/lib/smr/types";

const SEGMENT_REGION_ID = "smr-region";
const SEGMENT_APPLICATION_ID = "smr-application";
const SEGMENT_TYPE_ID = "smr-type";
const SEGMENT_END_USE_ID = "smr-end-use";

const DEFAULT_KNOWN_YEAR_INPUT: SmrKnownYearInput = {
  knownYear: 2025,
  knownMarketSize: 5,
  cagrPercent: 4.5,
};

const DEFAULT_SEGMENT_ROWS: SmrSegmentRowInput[] = [
  {
    id: SEGMENT_REGION_ID,
    title: "Region",
    includeInTable: false,
    linesRaw: "North America\nAsia Pacific\nEurope\nMiddle East and Africa\nSouth America",
  },
  {
    id: SEGMENT_APPLICATION_ID,
    title: "Application",
    includeInTable: false,
    linesRaw: "Application1\nApplication2\nApplication3\nApplication4\nApplication5",
  },
  {
    id: SEGMENT_TYPE_ID,
    title: "Type",
    includeInTable: false,
    linesRaw: "Type1\nType2\nType3\nType4",
  },
  {
    id: SEGMENT_END_USE_ID,
    title: "End User",
    includeInTable: false,
    linesRaw: "Segment1\nSegment2\nSegment3\nSegment4",
  },
];

const DEFAULT_KEY_PLAYERS = Array.from({ length: 20 }, (_, index) => `Company${index + 1}`).join("\n");
const DEFAULT_MAPPING = defaultSmrMapping(
  SEGMENT_REGION_ID,
  SEGMENT_END_USE_ID,
  SEGMENT_APPLICATION_ID,
  SEGMENT_TYPE_ID
);

const OUTPUT_LABELS: Record<SmrOutputKind, string> = {
  snapshot: "Full Snapshot",
  donut: "Donut",
  pie3d: "Region Pie",
  pie2d: "Flat Pie",
  column: "Column",
};

type SmrSnapshotLayout = {
  barChartHeight: number;
  pieChartSize: number;
  ribbonMinHeight: number;
};

type SmrFigureLayout = {
  chartSize: number;
  plotHeight: number;
};

type SmrCanvasSize = {
  width: number;
  height: number;
};

const DEFAULT_SNAPSHOT_LAYOUT: SmrSnapshotLayout = {
  barChartHeight: 220,
  pieChartSize: 240,
  ribbonMinHeight: 46,
};

const DEFAULT_DONUT_LAYOUT: SmrFigureLayout = {
  chartSize: 236,
  plotHeight: 206,
};

const DEFAULT_PIE3D_LAYOUT: SmrFigureLayout = {
  chartSize: 236,
  plotHeight: 206,
};

const DEFAULT_PIE2D_LAYOUT: SmrFigureLayout = {
  chartSize: 236,
  plotHeight: 206,
};

const DEFAULT_COLUMN_LAYOUT: SmrFigureLayout = {
  chartSize: 468,
  plotHeight: 190,
};

const DEFAULT_CANVAS_SIZES: Record<SmrOutputKind, SmrCanvasSize> = {
  snapshot: { width: 900, height: 600 },
  donut: { width: 620, height: 300 },
  pie3d: { width: 620, height: 300 },
  pie2d: { width: 620, height: 300 },
  column: { width: 620, height: 300 },
};

const MIN_PREVIEW_WIDTH = 600;
const MIN_PREVIEW_HEIGHT = 300;
const MAX_PREVIEW_WIDTH = 920;
const MAX_PREVIEW_HEIGHT = 760;
const MIN_SIDEBAR_WIDTH = 400;
const DEFAULT_SIDEBAR_WIDTH = 440;
const MAX_SIDEBAR_WIDTH = 620;
const SIDEBAR_WIDTH_STORAGE_KEY = "smr.sidebarWidthPx.v1";

export default function SmrPage() {
  const [marketTitle, setMarketTitle] = useState("Global Market");
  const [dominantRegion, setDominantRegion] = useState("North America");
  const [unit, setUnit] = useState("USD Billion");
  const [forecastPeriod, setForecastPeriod] = useState("2026-2032");
  const [knownYearInput, setKnownYearInput] = useState<SmrKnownYearInput>(DEFAULT_KNOWN_YEAR_INPUT);
  const [derived, setDerived] = useState<SmrDerivedMarketSizes>(() => deriveMarketSizes(DEFAULT_KNOWN_YEAR_INPUT));
  const [segmentRows, setSegmentRows] = useState<SmrSegmentRowInput[]>(DEFAULT_SEGMENT_ROWS);
  const [mapping, setMapping] = useState<SmrChartMapping>(DEFAULT_MAPPING);
  const [keyPlayersRaw, setKeyPlayersRaw] = useState(DEFAULT_KEY_PLAYERS);
  const [canvasSizes, setCanvasSizes] = useState<Record<SmrOutputKind, SmrCanvasSize>>(DEFAULT_CANVAS_SIZES);
  const [useSolidBackground, setUseSolidBackground] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [activeOutput, setActiveOutput] = useState<SmrOutputKind>("snapshot");
  const [snapshotLayout, setSnapshotLayout] = useState<SmrSnapshotLayout>(DEFAULT_SNAPSHOT_LAYOUT);
  const [donutLayout, setDonutLayout] = useState<SmrFigureLayout>(DEFAULT_DONUT_LAYOUT);
  const [pie3dLayout, setPie3dLayout] = useState<SmrFigureLayout>(DEFAULT_PIE3D_LAYOUT);
  const [pie2dLayout, setPie2dLayout] = useState<SmrFigureLayout>(DEFAULT_PIE2D_LAYOUT);
  const [columnLayout, setColumnLayout] = useState<SmrFigureLayout>(DEFAULT_COLUMN_LAYOUT);
  const [sidebarWidthPx, setSidebarWidthPx] = useState(DEFAULT_SIDEBAR_WIDTH);
  const [isSidebarResizing, setIsSidebarResizing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const colorInputRef = useRef<HTMLInputElement>(null);
  const sidebarResizeRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const snapshotRef = useRef<HTMLDivElement>(null);
  const donutRef = useRef<HTMLDivElement>(null);
  const pie3dRef = useRef<HTMLDivElement>(null);
  const pie2dRef = useRef<HTMLDivElement>(null);
  const columnRef = useRef<HTMLDivElement>(null);
  const snapshotPreviewRef = useRef<HTMLDivElement>(null);
  const donutPreviewRef = useRef<HTMLDivElement>(null);
  const pie3dPreviewRef = useRef<HTMLDivElement>(null);
  const pie2dPreviewRef = useRef<HTMLDivElement>(null);
  const columnPreviewRef = useRef<HTMLDivElement>(null);

  const activeCanvasSize = canvasSizes[activeOutput];

  const input: SmrInput = useMemo(
    () => ({
      marketTitle,
      dominantRegion,
      unit,
      knownYearInput,
      derived,
      forecastPeriod,
      keyPlayersRaw,
      segmentRows,
      mapping,
      previewWidth: activeCanvasSize.width,
      previewHeight: activeCanvasSize.height,
      useSolidBackground,
      backgroundColor,
      activeOutput,
    }),
    [
      marketTitle,
      dominantRegion,
      unit,
      knownYearInput,
      derived,
      forecastPeriod,
      keyPlayersRaw,
      segmentRows,
      mapping,
      activeCanvasSize.width,
      activeCanvasSize.height,
      useSolidBackground,
      backgroundColor,
      activeOutput,
    ]
  );

  const viewModels = useMemo(() => buildSmrViewModels(input), [input]);
  const activeBackgroundColor = useSolidBackground ? backgroundColor : "transparent";

  const exportRefs: Record<SmrOutputKind, React.RefObject<HTMLDivElement | null>> = {
    snapshot: snapshotRef,
    donut: donutRef,
    pie3d: pie3dRef,
    pie2d: pie2dRef,
    column: columnRef,
  };

  const previewRefs: Record<SmrOutputKind, RefObject<HTMLDivElement | null>> = {
    snapshot: snapshotPreviewRef,
    donut: donutPreviewRef,
    pie3d: pie3dPreviewRef,
    pie2d: pie2dPreviewRef,
    column: columnPreviewRef,
  };

  useEffect(() => {
    setMapping((current) => normalizeMapping(segmentRows, current));
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
    if (useSolidBackground) {
      colorInputRef.current?.focus();
    }
  }, [useSolidBackground]);

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

  const handleKnownYearInputChange = (field: keyof SmrKnownYearInput, value: number) => {
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

  const handleCanvasDimension =
    (kind: SmrOutputKind, field: keyof SmrCanvasSize, min: number, max: number) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(event.target.value);
      if (!Number.isFinite(value)) return;
      setCanvasSizes((current) => ({
        ...current,
        [kind]: {
          ...current[kind],
          [field]: clamp(Math.round(value), min, max),
        },
      }));
    };

  const handleDownloadOutput = async (kind: SmrOutputKind) => {
    const element = exportRefs[kind].current;
    if (!element || isExporting) return;

    setIsExporting(true);
    try {
      await downloadElementAsWebp(element, {
        fileName: buildSmrFileName(marketTitle, kind),
        pixelRatio: 1,
        quality: 0.78,
        maxFileSizeKb: 80,
        width: canvasSizes[kind].width,
        height: canvasSizes[kind].height,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadAll = async () => {
    const entries = (Object.keys(exportRefs) as SmrOutputKind[])
      .map((kind) => {
        const element = exportRefs[kind].current;
        if (!element) return null;
        return {
          kind,
          element,
          fileName: buildSmrFileName(marketTitle, kind),
          width: canvasSizes[kind].width,
          height: canvasSizes[kind].height,
        };
      })
      .filter((entry): entry is { kind: SmrOutputKind; element: HTMLDivElement; fileName: string; width: number; height: number } => entry !== null);

    if (entries.length !== 5 || isExporting) return;

    setIsExporting(true);
    try {
      await downloadSmrZip(entries, `${sanitizeFileBase(marketTitle)} SMR Assets.zip`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleClear = () => {
    setMarketTitle("Global Market");
    setDominantRegion("North America");
    setUnit("USD Billion");
    setForecastPeriod("2026-2032");
    setKnownYearInput(DEFAULT_KNOWN_YEAR_INPUT);
    setDerived(deriveMarketSizes(DEFAULT_KNOWN_YEAR_INPUT));
    setSegmentRows(DEFAULT_SEGMENT_ROWS);
    setMapping(DEFAULT_MAPPING);
    setKeyPlayersRaw(DEFAULT_KEY_PLAYERS);
    setCanvasSizes(DEFAULT_CANVAS_SIZES);
    setUseSolidBackground(true);
    setBackgroundColor("#ffffff");
    setActiveOutput("snapshot");
    setSnapshotLayout(DEFAULT_SNAPSHOT_LAYOUT);
    setDonutLayout(DEFAULT_DONUT_LAYOUT);
    setPie3dLayout(DEFAULT_PIE3D_LAYOUT);
    setPie2dLayout(DEFAULT_PIE2D_LAYOUT);
    setColumnLayout(DEFAULT_COLUMN_LAYOUT);
  };

  const focusOutput = (kind: SmrOutputKind) => {
    setActiveOutput(kind);
    window.requestAnimationFrame(() => {
      previewRefs[kind].current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    });
  };

  return (
    <div className="app-shell smr-shell">
      <SidebarProvider defaultOpen style={{ "--sidebar-width": `${sidebarWidthPx}px` } as CSSProperties}>
        <Sidebar variant="inset" collapsible="offcanvas" className="ms-editor-sidebar">
          <SidebarHeader className="ms-sidebar-title-wrap">
            <span className="ms-sidebar-title">SMR Builder</span>
          </SidebarHeader>
          <SidebarContent className="ms-sidebar-scroll">
            <section className="ms-sidebar-sections">
              <details className="ms-collapsible ms-tone-1" open>
                <summary>1. Market Basics</summary>
                <section className="ms-section-block">
                  <div className="ms-form-grid ms-form-grid-3">
                    <label className="ms-field">
                      <span>Market Title</span>
                      <Input value={marketTitle} onChange={(event) => setMarketTitle(event.target.value)} />
                    </label>
                    <label className="ms-field">
                      <span>Dominant Region/Country</span>
                      <Input value={dominantRegion} onChange={(event) => setDominantRegion(event.target.value)} />
                    </label>
                    <label className="ms-field">
                      <span>Unit</span>
                      <Input value={unit} onChange={(event) => setUnit(event.target.value)} />
                    </label>
                    <label className="ms-field ms-field-full">
                      <span>Key Players (comma/newline separated)</span>
                      <Textarea value={keyPlayersRaw} onChange={(event) => setKeyPlayersRaw(event.target.value)} rows={8} />
                    </label>
                  </div>
                </section>
              </details>

              <details className="ms-collapsible ms-tone-2" open>
                <summary>2. Size Derivation</summary>
                <section className="ms-section-block">
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
                      <span>Forecast Period</span>
                      <Input value={forecastPeriod} onChange={(event) => setForecastPeriod(event.target.value)} />
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
                    <Button type="button" variant="outline" className="ms-secondary-btn ms-recalculate-btn" onClick={() => setDerived(resetDerivedOverrides(knownYearInput))}>
                      Recalculate
                    </Button>
                  </div>
                </section>
              </details>

              <details className="ms-collapsible ms-tone-3" open>
                <summary>3. Segment Catalog</summary>
                <SegmentCatalogEditor rows={segmentRows} onRowsChange={setSegmentRows} />
              </details>

              <details className="ms-collapsible ms-tone-4" open>
                <summary>4. SMR Mapping</summary>
                <SmrMappingEditor rows={segmentRows} mapping={mapping} onChange={setMapping} />
              </details>

              <details className="ms-collapsible ms-tone-5" open>
                <summary>5. Preview & Export</summary>
                <section className="ms-section-block">
                  <div className="ms-form-grid ms-form-grid-3">
                    <label className="ms-field">
                      <span>Primary Download Target</span>
                      <Select value={activeOutput} onValueChange={(value) => focusOutput(value as SmrOutputKind)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select output" />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(OUTPUT_LABELS) as SmrOutputKind[]).map((kind) => (
                            <SelectItem key={kind} value={kind}>
                              {OUTPUT_LABELS[kind]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </label>
                    <label className="ms-field">
                      <span>Preview Width</span>
                      <Input
                        type="number"
                        inputMode="numeric"
                        value={activeCanvasSize.width}
                        min={MIN_PREVIEW_WIDTH}
                        max={MAX_PREVIEW_WIDTH}
                        onChange={handleCanvasDimension(activeOutput, "width", MIN_PREVIEW_WIDTH, MAX_PREVIEW_WIDTH)}
                      />
                    </label>
                    <label className="ms-field">
                      <span>Preview Height</span>
                      <Input
                        type="number"
                        inputMode="numeric"
                        value={activeCanvasSize.height}
                        min={MIN_PREVIEW_HEIGHT}
                        max={MAX_PREVIEW_HEIGHT}
                        onChange={handleCanvasDimension(activeOutput, "height", MIN_PREVIEW_HEIGHT, MAX_PREVIEW_HEIGHT)}
                      />
                    </label>
                    <label className="ms-field ms-check-field">
                      <span>Background Fill</span>
                      <label className="ms-inline-check">
                        <Checkbox checked={useSolidBackground} onCheckedChange={(checked) => setUseSolidBackground(checked === true)} />
                        Use solid
                      </label>
                    </label>
                    {useSolidBackground ? (
                      <label className="ms-field ms-color-field">
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

                  {viewModels.notes.length > 0 ? (
                    <div className="smr-note-stack">
                      {viewModels.notes.map((note) => (
                        <p className="ms-note" key={note}>
                          {note}
                        </p>
                      ))}
                    </div>
                  ) : null}

                  <div className="smr-download-grid">
                    <Button type="button" className="ms-download-btn" onClick={() => handleDownloadOutput(activeOutput)} disabled={isExporting}>
                      {isExporting ? "Exporting..." : `Download ${OUTPUT_LABELS[activeOutput]}`}
                    </Button>
                    <Button type="button" variant="outline" className="ms-secondary-btn" onClick={handleDownloadAll} disabled={isExporting}>
                      Download All
                    </Button>
                    <Button type="button" variant="outline" className="ms-secondary-btn ms-clear-btn" onClick={handleClear}>
                      Clear
                    </Button>
                  </div>
                </section>
              </details>

              <details className="ms-collapsible ms-tone-6">
                <summary>6. Advanced Chart Layout</summary>
                <section className="ms-section-block">
                  <div className="ms-preview-settings-row ms-preview-settings-row-3">
                    <label className="ms-field">
                      <span>Snapshot Width</span>
                      <Input
                        type="number"
                        value={canvasSizes.snapshot.width}
                        min={MIN_PREVIEW_WIDTH}
                        max={MAX_PREVIEW_WIDTH}
                        onChange={handleCanvasDimension("snapshot", "width", MIN_PREVIEW_WIDTH, MAX_PREVIEW_WIDTH)}
                      />
                    </label>
                    <label className="ms-field">
                      <span>Snapshot Height</span>
                      <Input
                        type="number"
                        value={canvasSizes.snapshot.height}
                        min={360}
                        max={MAX_PREVIEW_HEIGHT}
                        onChange={handleCanvasDimension("snapshot", "height", 360, MAX_PREVIEW_HEIGHT)}
                      />
                    </label>
                    <label className="ms-field">
                      <span>Donut Height</span>
                      <Input
                        type="number"
                        value={canvasSizes.donut.height}
                        min={300}
                        max={600}
                        onChange={handleCanvasDimension("donut", "height", 300, 600)}
                      />
                    </label>
                    <label className="ms-field">
                      <span>Donut Width</span>
                      <Input
                        type="number"
                        value={canvasSizes.donut.width}
                        min={MIN_PREVIEW_WIDTH}
                        max={MAX_PREVIEW_WIDTH}
                        onChange={handleCanvasDimension("donut", "width", MIN_PREVIEW_WIDTH, MAX_PREVIEW_WIDTH)}
                      />
                    </label>
                    <label className="ms-field">
                      <span>3D Pie Height</span>
                      <Input
                        type="number"
                        value={canvasSizes.pie3d.height}
                        min={300}
                        max={600}
                        onChange={handleCanvasDimension("pie3d", "height", 300, 600)}
                      />
                    </label>
                    <label className="ms-field">
                      <span>3D Pie Width</span>
                      <Input
                        type="number"
                        value={canvasSizes.pie3d.width}
                        min={MIN_PREVIEW_WIDTH}
                        max={MAX_PREVIEW_WIDTH}
                        onChange={handleCanvasDimension("pie3d", "width", MIN_PREVIEW_WIDTH, MAX_PREVIEW_WIDTH)}
                      />
                    </label>
                    <label className="ms-field">
                      <span>Flat Pie Height</span>
                      <Input
                        type="number"
                        value={canvasSizes.pie2d.height}
                        min={300}
                        max={600}
                        onChange={handleCanvasDimension("pie2d", "height", 300, 600)}
                      />
                    </label>
                    <label className="ms-field">
                      <span>Flat Pie Width</span>
                      <Input
                        type="number"
                        value={canvasSizes.pie2d.width}
                        min={MIN_PREVIEW_WIDTH}
                        max={MAX_PREVIEW_WIDTH}
                        onChange={handleCanvasDimension("pie2d", "width", MIN_PREVIEW_WIDTH, MAX_PREVIEW_WIDTH)}
                      />
                    </label>
                    <label className="ms-field">
                      <span>Column Height</span>
                      <Input
                        type="number"
                        value={canvasSizes.column.height}
                        min={300}
                        max={600}
                        onChange={handleCanvasDimension("column", "height", 300, 600)}
                      />
                    </label>
                    <label className="ms-field">
                      <span>Column Width</span>
                      <Input
                        type="number"
                        value={canvasSizes.column.width}
                        min={MIN_PREVIEW_WIDTH}
                        max={MAX_PREVIEW_WIDTH}
                        onChange={handleCanvasDimension("column", "width", MIN_PREVIEW_WIDTH, MAX_PREVIEW_WIDTH)}
                      />
                    </label>
                    <label className="ms-field">
                      <span>Snapshot Bar Height</span>
                      <Input
                        type="number"
                        value={snapshotLayout.barChartHeight}
                        min={170}
                        max={320}
                        onChange={(event) =>
                          setSnapshotLayout((current) => ({
                            ...current,
                            barChartHeight: clamp(Number(event.target.value) || current.barChartHeight, 170, 320),
                          }))
                        }
                      />
                    </label>
                    <label className="ms-field">
                      <span>Snapshot Pie Size</span>
                      <Input
                        type="number"
                        value={snapshotLayout.pieChartSize}
                        min={180}
                        max={320}
                        onChange={(event) =>
                          setSnapshotLayout((current) => ({
                            ...current,
                            pieChartSize: clamp(Number(event.target.value) || current.pieChartSize, 180, 320),
                          }))
                        }
                      />
                    </label>
                    <label className="ms-field">
                      <span>Ribbon Height</span>
                      <Input
                        type="number"
                        value={snapshotLayout.ribbonMinHeight}
                        min={38}
                        max={80}
                        onChange={(event) =>
                          setSnapshotLayout((current) => ({
                            ...current,
                            ribbonMinHeight: clamp(Number(event.target.value) || current.ribbonMinHeight, 38, 80),
                          }))
                        }
                      />
                    </label>
                    <label className="ms-field">
                      <span>Donut Size</span>
                      <Input
                        type="number"
                        value={donutLayout.chartSize}
                        min={180}
                        max={320}
                        onChange={(event) =>
                          setDonutLayout((current) => ({
                            ...current,
                            chartSize: clamp(Number(event.target.value) || current.chartSize, 180, 320),
                          }))
                        }
                      />
                    </label>
                    <label className="ms-field">
                      <span>3D Pie Width</span>
                      <Input
                        type="number"
                        value={pie3dLayout.chartSize}
                        min={240}
                        max={460}
                        onChange={(event) =>
                          setPie3dLayout((current) => ({
                            ...current,
                            chartSize: clamp(Number(event.target.value) || current.chartSize, 240, 460),
                          }))
                        }
                      />
                    </label>
                    <label className="ms-field">
                      <span>3D Pie Height</span>
                      <Input
                        type="number"
                        value={pie3dLayout.plotHeight}
                        min={160}
                        max={300}
                        onChange={(event) =>
                          setPie3dLayout((current) => ({
                            ...current,
                            plotHeight: clamp(Number(event.target.value) || current.plotHeight, 160, 300),
                          }))
                        }
                      />
                    </label>
                    <label className="ms-field">
                      <span>Flat Pie Size</span>
                      <Input
                        type="number"
                        value={pie2dLayout.chartSize}
                        min={180}
                        max={320}
                        onChange={(event) =>
                          setPie2dLayout((current) => ({
                            ...current,
                            chartSize: clamp(Number(event.target.value) || current.chartSize, 180, 320),
                          }))
                        }
                      />
                    </label>
                    <label className="ms-field">
                      <span>Column Plot Height</span>
                      <Input
                        type="number"
                        value={columnLayout.plotHeight}
                        min={170}
                        max={320}
                        onChange={(event) =>
                          setColumnLayout((current) => ({
                            ...current,
                            plotHeight: clamp(Number(event.target.value) || current.plotHeight, 170, 320),
                          }))
                        }
                      />
                    </label>
                  </div>
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
                <span className="ms-toolbar-label">Stellar Snapshot Builder</span>
                <span className="ms-toolbar-chip">{OUTPUT_LABELS[activeOutput]}</span>
              </div>

              <div className="ms-workspace-actions">
                {(Object.keys(OUTPUT_LABELS) as SmrOutputKind[]).map((kind) => (
                  <Button
                    key={kind}
                    type="button"
                    variant={kind === activeOutput ? "default" : "outline"}
                    className={kind === activeOutput ? "ms-download-btn ms-toolbar-btn" : "ms-secondary-btn ms-toolbar-btn"}
                    onClick={() => focusOutput(kind)}
                  >
                    {OUTPUT_LABELS[kind]}
                  </Button>
                ))}
              </div>
            </div>
          </header>

          <main className="ms-main-content">
            <section className="ms-preview-area ms-preview-area-dual">
              <div className="ms-preview-x-scroll">
                <div className="ms-preview-stack smr-preview-collection">
                  <div ref={snapshotPreviewRef} className={`smr-preview-frame${activeOutput === "snapshot" ? " is-active" : ""}`}>
                    <div className="smr-preview-frame-head">
                      <span>Full Snapshot</span>
                      <Button type="button" variant="outline" className="smr-preview-download-btn" onClick={() => handleDownloadOutput("snapshot")} disabled={isExporting}>
                        Download
                      </Button>
                    </div>
                    <SmrSnapshotCard
                      viewModel={viewModels.snapshot}
                      width={canvasSizes.snapshot.width}
                      height={canvasSizes.snapshot.height}
                      backgroundColor={activeBackgroundColor}
                      layout={snapshotLayout}
                    />
                  </div>

                  <div ref={donutPreviewRef} className={`smr-preview-frame${activeOutput === "donut" ? " is-active" : ""}`}>
                    <div className="smr-preview-frame-head">
                      <span>Donut</span>
                      <Button type="button" variant="outline" className="smr-preview-download-btn" onClick={() => handleDownloadOutput("donut")} disabled={isExporting}>
                        Download
                      </Button>
                    </div>
                    <SmrDonutCard
                      viewModel={viewModels.donut}
                      width={canvasSizes.donut.width}
                      height={canvasSizes.donut.height}
                      backgroundColor={activeBackgroundColor}
                      layout={donutLayout}
                    />
                  </div>

                  <div ref={pie3dPreviewRef} className={`smr-preview-frame${activeOutput === "pie3d" ? " is-active" : ""}`}>
                    <div className="smr-preview-frame-head">
                      <span>Region Pie</span>
                      <Button type="button" variant="outline" className="smr-preview-download-btn" onClick={() => handleDownloadOutput("pie3d")} disabled={isExporting}>
                        Download
                      </Button>
                    </div>
                    <SmrPie3DCard
                      viewModel={viewModels.pie3d}
                      width={canvasSizes.pie3d.width}
                      height={canvasSizes.pie3d.height}
                      backgroundColor={activeBackgroundColor}
                      layout={pie3dLayout}
                    />
                  </div>

                  <div ref={pie2dPreviewRef} className={`smr-preview-frame${activeOutput === "pie2d" ? " is-active" : ""}`}>
                    <div className="smr-preview-frame-head">
                      <span>Flat Pie</span>
                      <Button type="button" variant="outline" className="smr-preview-download-btn" onClick={() => handleDownloadOutput("pie2d")} disabled={isExporting}>
                        Download
                      </Button>
                    </div>
                    <SmrPie2DCard
                      viewModel={viewModels.pie2d}
                      width={canvasSizes.pie2d.width}
                      height={canvasSizes.pie2d.height}
                      backgroundColor={activeBackgroundColor}
                      layout={pie2dLayout}
                    />
                  </div>

                  <div ref={columnPreviewRef} className={`smr-preview-frame${activeOutput === "column" ? " is-active" : ""}`}>
                    <div className="smr-preview-frame-head">
                      <span>Column</span>
                      <Button type="button" variant="outline" className="smr-preview-download-btn" onClick={() => handleDownloadOutput("column")} disabled={isExporting}>
                        Download
                      </Button>
                    </div>
                    <SmrColumnCard
                      viewModel={viewModels.column}
                      width={canvasSizes.column.width}
                      height={canvasSizes.column.height}
                      backgroundColor={activeBackgroundColor}
                      layout={columnLayout}
                    />
                  </div>
                </div>
              </div>
            </section>
          </main>
        </SidebarInset>
      </SidebarProvider>

      <div className="smr-export-stage" aria-hidden>
        <SmrSnapshotCard
          ref={snapshotRef}
          viewModel={viewModels.snapshot}
          width={canvasSizes.snapshot.width}
          height={canvasSizes.snapshot.height}
          backgroundColor={activeBackgroundColor}
          layout={snapshotLayout}
        />
        <SmrDonutCard ref={donutRef} viewModel={viewModels.donut} width={canvasSizes.donut.width} height={canvasSizes.donut.height} backgroundColor={activeBackgroundColor} layout={donutLayout} />
        <SmrPie3DCard ref={pie3dRef} viewModel={viewModels.pie3d} width={canvasSizes.pie3d.width} height={canvasSizes.pie3d.height} backgroundColor={activeBackgroundColor} layout={pie3dLayout} />
        <SmrPie2DCard ref={pie2dRef} viewModel={viewModels.pie2d} width={canvasSizes.pie2d.width} height={canvasSizes.pie2d.height} backgroundColor={activeBackgroundColor} layout={pie2dLayout} />
        <SmrColumnCard ref={columnRef} viewModel={viewModels.column} width={canvasSizes.column.width} height={canvasSizes.column.height} backgroundColor={activeBackgroundColor} layout={columnLayout} />
      </div>
    </div>
  );
}

function normalizeMapping(rows: SmrSegmentRowInput[], mapping: SmrChartMapping): SmrChartMapping {
  const validIds = new Set(rows.map((row) => row.id));
  const fallback = rows[0]?.id ?? "";

  return {
    snapshotBarSegmentId: validIds.has(mapping.snapshotBarSegmentId) ? mapping.snapshotBarSegmentId : fallback,
    snapshotPieSegmentId: validIds.has(mapping.snapshotPieSegmentId) ? mapping.snapshotPieSegmentId : fallback,
    donutSegmentId: validIds.has(mapping.donutSegmentId) ? mapping.donutSegmentId : fallback,
    pie3dSegmentId: validIds.has(mapping.pie3dSegmentId) ? mapping.pie3dSegmentId : fallback,
    pie2dSegmentId: validIds.has(mapping.pie2dSegmentId) ? mapping.pie2dSegmentId : fallback,
    columnSegmentId: validIds.has(mapping.columnSegmentId) ? mapping.columnSegmentId : fallback,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function sanitizeFileBase(value: string) {
  return (value.trim() || "Market Snapshot")
    .replace(/[<>:"/\\|?*]+/g, "")
    .replace(/\s+/g, " ");
}
