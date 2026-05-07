"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { SegmentationTablePreview } from "@/components/segmentation-table/SegmentationTablePreview";
import { TableStyleToggle } from "@/components/segmentation-table/TableStyleToggle";
import { SegmentCatalogEditor } from "@/components/segments/SegmentCatalogEditor";
import { TocPreview } from "@/components/toc/TocPreview";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { deriveMarketSizes, resetDerivedOverrides } from "@/lib/market/deriveMarketSizes";
import { buildSegmentationTableViewModel } from "@/lib/table/buildSegmentationTableViewModel";
import { renderSegmentationTableHtml } from "@/lib/table/renderSegmentationTableHtml";
import { buildTocViewModel } from "@/lib/toc/buildTocViewModel";
import { renderTocHtml } from "@/lib/toc/renderTocHtml";
import type {
  ChartTemplateKind,
  DensityMode,
  KnownYearInput,
  SegmentRowInput,
  SnapshotChartMapping,
  TableStyleMode,
  UnifiedMarketInput,
} from "@/lib/template1/types";

const SEGMENT_PRIMARY_ID = "segment-primary";
const SEGMENT_REGION_ID = "segment-region";
const SEGMENT_TERTIARY_ID = "segment-tertiary";

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

const DEFAULT_KEY_PLAYERS_RAW = "Company1\nCompany2\nCompany3";
const DEFAULT_TEMPLATE_KIND: ChartTemplateKind = "template1";
const DEFAULT_DENSITY: DensityMode = "spacious";
const MIN_SIDEBAR_WIDTH = 400;
const DEFAULT_SIDEBAR_WIDTH = 440;
const MAX_SIDEBAR_WIDTH = 620;
const SIDEBAR_WIDTH_STORAGE_KEY = "segmentation-toc.sidebarWidthPx.v1";

export default function SegmentationTocPage() {
  const [marketTitle, setMarketTitle] = useState("Global Market");
  const [unit, setUnit] = useState("USD Billion");
  const [knownYearInput, setKnownYearInput] = useState<KnownYearInput>(DEFAULT_KNOWN_YEAR_INPUT);
  const [derived, setDerived] = useState(() => deriveMarketSizes(DEFAULT_KNOWN_YEAR_INPUT));
  const [forecastPeriod, setForecastPeriod] = useState("2026-2032");
  const [baseYear, setBaseYear] = useState(2025);
  const [historicalDataText, setHistoricalDataText] = useState("2020 to 2025");
  const [segmentRows, setSegmentRows] = useState<SegmentRowInput[]>(DEFAULT_SEGMENT_ROWS);
  const [mapping] = useState<SnapshotChartMapping>(DEFAULT_MAPPING);
  const [keyPlayersRaw, setKeyPlayersRaw] = useState(DEFAULT_KEY_PLAYERS_RAW);
  const [tableStyleMode, setTableStyleMode] = useState<TableStyleMode>("legacy");
  const [includeRegionInTable, setIncludeRegionInTable] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");
  const [tocCopyStatus, setTocCopyStatus] = useState<"idle" | "copied" | "failed">("idle");
  const [sidebarWidthPx, setSidebarWidthPx] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_SIDEBAR_WIDTH;
    const saved = window.localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY);
    if (!saved) return DEFAULT_SIDEBAR_WIDTH;
    const parsed = Number(saved);
    if (!Number.isFinite(parsed)) return DEFAULT_SIDEBAR_WIDTH;
    return clamp(Math.round(parsed), MIN_SIDEBAR_WIDTH, MAX_SIDEBAR_WIDTH);
  });
  const [isSidebarResizing, setIsSidebarResizing] = useState(false);
  const sidebarResizeRef = useRef<{ startX: number; startWidth: number } | null>(null);

  const unifiedInput: UnifiedMarketInput = useMemo(
    () => ({
      marketTitle,
      dominantRegion: "Asia Pacific",
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
      previewWidth: 900,
      previewHeight: 580,
      density: DEFAULT_DENSITY,
      templateKind: DEFAULT_TEMPLATE_KIND,
    }),
    [
      marketTitle,
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
    ]
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(sidebarWidthPx));
  }, [sidebarWidthPx]);

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

  const handleClear = () => {
    setMarketTitle("Global Market");
    setUnit("USD Billion");
    setKnownYearInput(DEFAULT_KNOWN_YEAR_INPUT);
    setDerived(deriveMarketSizes(DEFAULT_KNOWN_YEAR_INPUT));
    setForecastPeriod("2026-2032");
    setBaseYear(2025);
    setHistoricalDataText("2020 to 2025");
    setSegmentRows(DEFAULT_SEGMENT_ROWS);
    setKeyPlayersRaw(DEFAULT_KEY_PLAYERS_RAW);
    setTableStyleMode("legacy");
    setIncludeRegionInTable(false);
    setCopyStatus("idle");
    setTocCopyStatus("idle");
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

  return (
    <div className="app-shell">
      <SidebarProvider defaultOpen style={{ "--sidebar-width": `${sidebarWidthPx}px` } as CSSProperties}>
        <Sidebar variant="inset" collapsible="offcanvas" className="ms-editor-sidebar">
          <SidebarHeader className="ms-sidebar-title-wrap">
            <span className="ms-sidebar-title">Workspace Controls</span>
          </SidebarHeader>
          <SidebarContent className="ms-sidebar-scroll">
            <section className="ms-sidebar-sections">
              <details className="ms-collapsible ms-tone-1" open>
                <summary>1. Market Basics</summary>
                <section className="ms-section-block">
                  <div className="ms-form-grid ms-form-grid-3">
                    <TableStyleToggle value={tableStyleMode} onChange={setTableStyleMode} />

                    <label className="ms-field">
                      <span>Market Title</span>
                      <Input value={marketTitle} onChange={(event) => setMarketTitle(event.target.value)} />
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

              <details className="ms-collapsible ms-tone-2" open>
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

              <details className="ms-collapsible ms-tone-3" open>
                <summary>3. Size Derivation</summary>
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
                    <Button
                      type="button"
                      variant="outline"
                      className="ms-secondary-btn ms-recalculate-btn"
                      onClick={() => setDerived(resetDerivedOverrides(knownYearInput))}
                    >
                      Recalculate
                    </Button>
                  </div>
                </section>
              </details>

              <details className="ms-collapsible ms-tone-4" open>
                <summary>4. Segment Catalog</summary>
                <SegmentCatalogEditor rows={segmentRows} onRowsChange={setSegmentRows} />
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
                <span className="ms-toolbar-label">Segmentation Table + TOC Builder</span>
              </div>

              <div className="ms-workspace-actions">
                <Button
                  type="button"
                  variant="outline"
                  className="ms-secondary-btn ms-copy-btn ms-toolbar-btn"
                  onClick={handleCopyHtml}
                >
                  {copyStatus === "copied" ? "Table HTML Copied" : copyStatus === "failed" ? "Copy Failed" : "Copy Table HTML"}
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
                <Button
                  type="button"
                  variant="outline"
                  className="ms-secondary-btn ms-clear-btn ms-toolbar-btn"
                  onClick={handleClear}
                >
                  Clear
                </Button>
              </div>
            </div>
          </header>

          <main className="ms-main-content">
            <section className="ms-preview-area ms-preview-area-dual">
              <div className="ms-preview-x-scroll">
                <div className="ms-preview-stack">
                  <SegmentationTablePreview viewModel={tableViewModel} html={tableHtml} />
                  <TocPreview
                    html={tocHtml}
                    segmentCount={tocViewModel.segments.length}
                    keyPlayerCount={tocViewModel.keyPlayers.length}
                    didTruncateSegments={tocViewModel.didTruncateSegments}
                    didTruncateSegmentItems={tocViewModel.didTruncateSegmentItems}
                    didTruncateKeyPlayers={tocViewModel.didTruncateKeyPlayers}
                  />
                </div>
              </div>
            </section>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}
