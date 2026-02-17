"use client";

import { useMemo, useRef, useState } from "react";
import { Template1Card } from "@/components/template1/Template1Card";
import { downloadElementAsWebp } from "@/lib/export/downloadWebp";
import { buildTemplate1ViewModel } from "@/lib/template1/generateData";
import { segmentLimit } from "@/lib/template1/parseInputs";
import type { SnapshotFormInput } from "@/lib/template1/types";

const DEFAULT_FORM: SnapshotFormInput = {
  marketTitle: "Global Market",
  cagrPercent: 4.5,
  dominantRegion: "Asia Pacific",
  marketSize2025: 5,
  marketSize2032: 10,
  unit: "USD Billion",
  forecastPeriod: "2026-2032",
  primarySegmentTitle: "Type",
  secondarySegmentTitle: "Region",
  typeSegmentsRaw: "Type1\nType2\nType3\nType4\nType5\nType6",
  regionSegmentsRaw: "Asia Pacific\nNorth America\nEurope\nMiddle East and Africa\nSouth America",
};

type ChartHeights = {
  yearlyPlot: number;
  typeChart: number;
  regionChart: number;
};

const DEFAULT_CHART_HEIGHTS: ChartHeights = {
  yearlyPlot: 163,
  typeChart: 170,
  regionChart: 170,
};

const MIN_PREVIEW_WIDTH = 600;
const MIN_PREVIEW_HEIGHT = 420;
const MAX_PREVIEW_SIZE = 900;
const MIN_CHART_HEIGHT = 120;
const MAX_CHART_HEIGHT = 320;
const CHART_BALANCE_OVERHEAD = 168;

export default function Home() {
  const [form, setForm] = useState<SnapshotFormInput>(DEFAULT_FORM);
  const [previewWidth, setPreviewWidth] = useState(900);
  const [previewHeight, setPreviewHeight] = useState(580);
  const [chartHeights, setChartHeights] = useState<ChartHeights>(DEFAULT_CHART_HEIGHTS);
  const [useSolidBackground, setUseSolidBackground] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState("#e7e7e7");
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const { viewModel, errors } = useMemo(() => buildTemplate1ViewModel(form), [form]);
  const { balancedHeights, wasAutoBalanced } = useMemo(
    () => autoBalanceChartHeights(previewHeight, chartHeights),
    [previewHeight, chartHeights]
  );

  const activeBackgroundColor = useSolidBackground ? backgroundColor : "transparent";

  const updateText =
    (field: keyof SnapshotFormInput) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
    };

  const updateNumber =
    (field: keyof SnapshotFormInput) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((current) => ({
        ...current,
        [field]: event.target.value === "" ? Number.NaN : Number(event.target.value),
      }));
    };

  const handlePreviewDimension =
    (setter: React.Dispatch<React.SetStateAction<number>>, min: number, max: number) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const raw = Number(event.target.value);
      if (!Number.isFinite(raw)) return;
      setter(clamp(Math.round(raw), min, max));
    };

  const handleChartHeight =
    (field: keyof ChartHeights) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const raw = Number(event.target.value);
      if (!Number.isFinite(raw)) return;
      setChartHeights((current) => ({
        ...current,
        [field]: clamp(Math.round(raw), MIN_CHART_HEIGHT, MAX_CHART_HEIGHT),
      }));
    };

  const handleDownload = async () => {
    if (!viewModel || !previewRef.current || errors.length > 0 || isExporting) {
      return;
    }

    setIsExporting(true);
    try {
      await downloadElementAsWebp(previewRef.current, {
        fileName: "market-snapshot-template1.webp",
        pixelRatio: 1,
        width: previewWidth,
        height: previewHeight,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main className="ms-page">
      <section className="ms-panel">
        <h1 className="ms-heading">MMR Market Snapshot Builder</h1>
        <p className="ms-subheading">Template 1: Form input to image preview and WebP export</p>

        <div className="ms-preview-settings">
          <div className="ms-preview-settings-row">
            <label className="ms-field">
              <span>Preview Width (px)</span>
              <input
                type="number"
                min={MIN_PREVIEW_WIDTH}
                max={MAX_PREVIEW_SIZE}
                value={previewWidth}
                onChange={handlePreviewDimension(setPreviewWidth, MIN_PREVIEW_WIDTH, MAX_PREVIEW_SIZE)}
              />
            </label>
            <label className="ms-field">
              <span>Preview Height (px)</span>
              <input
                type="number"
                min={MIN_PREVIEW_HEIGHT}
                max={MAX_PREVIEW_SIZE}
                value={previewHeight}
                onChange={handlePreviewDimension(setPreviewHeight, MIN_PREVIEW_HEIGHT, MAX_PREVIEW_SIZE)}
              />
            </label>
          </div>

          <div className="ms-preview-settings-row">
            <label className="ms-field ms-check-field">
              <span>Background Fill</span>
              <label className="ms-inline-check">
                <input
                  type="checkbox"
                  checked={useSolidBackground}
                  onChange={(event) => setUseSolidBackground(event.target.checked)}
                />
                Use solid background
              </label>
            </label>
            <label className="ms-field">
              <span>Background Color</span>
              <input
                className="ms-color-input"
                type="color"
                value={backgroundColor}
                onChange={(event) => setBackgroundColor(event.target.value)}
                disabled={!useSolidBackground}
              />
            </label>
          </div>

          <details className="ms-advanced-settings">
            <summary>Advanced chart sizing</summary>
            <div className="ms-preview-settings-row">
              <label className="ms-field">
                <span>Yearly Chart Height</span>
                <input
                  type="number"
                  min={MIN_CHART_HEIGHT}
                  max={MAX_CHART_HEIGHT}
                  value={chartHeights.yearlyPlot}
                  onChange={handleChartHeight("yearlyPlot")}
                />
              </label>
              <label className="ms-field">
                <span>Type Chart Height</span>
                <input
                  type="number"
                  min={MIN_CHART_HEIGHT}
                  max={MAX_CHART_HEIGHT}
                  value={chartHeights.typeChart}
                  onChange={handleChartHeight("typeChart")}
                />
              </label>
              <label className="ms-field">
                <span>Region Chart Height</span>
                <input
                  type="number"
                  min={MIN_CHART_HEIGHT}
                  max={MAX_CHART_HEIGHT}
                  value={chartHeights.regionChart}
                  onChange={handleChartHeight("regionChart")}
                />
              </label>
            </div>
          </details>
        </div>

        <div className="ms-form-grid">
          <label className="ms-field">
            <span>Market Title</span>
            <input value={form.marketTitle} onChange={updateText("marketTitle")} />
          </label>

          <label className="ms-field">
            <span>CAGR (%)</span>
            <input
              type="number"
              step="0.01"
              value={Number.isNaN(form.cagrPercent) ? "" : form.cagrPercent}
              onChange={updateNumber("cagrPercent")}
            />
          </label>

          <label className="ms-field">
            <span>Dominating Region/Country</span>
            <input value={form.dominantRegion} onChange={updateText("dominantRegion")} />
          </label>

          <label className="ms-field">
            <span>Forecast Period</span>
            <input value={form.forecastPeriod} onChange={updateText("forecastPeriod")} />
          </label>

          <label className="ms-field">
            <span>Market Size (2025)</span>
            <input
              type="number"
              step="0.01"
              value={Number.isNaN(form.marketSize2025) ? "" : form.marketSize2025}
              onChange={updateNumber("marketSize2025")}
            />
          </label>

          <label className="ms-field">
            <span>Market Size (2032)</span>
            <input
              type="number"
              step="0.01"
              value={Number.isNaN(form.marketSize2032) ? "" : form.marketSize2032}
              onChange={updateNumber("marketSize2032")}
            />
          </label>

          <label className="ms-field">
            <span>Primary Segment Title (bar chart)</span>
            <input value={form.primarySegmentTitle} onChange={updateText("primarySegmentTitle")} />
          </label>

          <label className="ms-field">
            <span>Secondary Segment Title (pie chart)</span>
            <input value={form.secondarySegmentTitle} onChange={updateText("secondarySegmentTitle")} />
          </label>

          <label className="ms-field ms-field-full">
            <span>Unit of Market Size</span>
            <input value={form.unit} onChange={updateText("unit")} />
          </label>

          <label className="ms-field ms-field-full">
            <span>
              {form.primarySegmentTitle || "Primary"} Segments (comma or newline separated, top {segmentLimit()} rendered)
            </span>
            <textarea rows={4} value={form.typeSegmentsRaw} onChange={updateText("typeSegmentsRaw")} />
          </label>

          <label className="ms-field ms-field-full">
            <span>
              {form.secondarySegmentTitle || "Secondary"} Segments (comma or newline separated, top {segmentLimit()} rendered)
            </span>
            <textarea rows={4} value={form.regionSegmentsRaw} onChange={updateText("regionSegmentsRaw")} />
          </label>
        </div>

        {errors.length > 0 ? (
          <ul className="ms-errors">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        ) : null}

        {wasAutoBalanced ? (
          <p className="ms-note">Chart heights were auto-balanced to fit the current preview height.</p>
        ) : null}

        {viewModel && (viewModel.meta.truncatedTypes || viewModel.meta.truncatedRegions) ? (
          <p className="ms-note">Rendering top {segmentLimit()} items for chart/legend stability.</p>
        ) : null}

        <button
          type="button"
          className="ms-download-btn"
          onClick={handleDownload}
          disabled={!viewModel || errors.length > 0 || isExporting}
        >
          {isExporting ? "Generating WebP..." : "Download WebP"}
        </button>
      </section>

      <section className="ms-preview-area">
        {viewModel ? (
          <Template1Card
            ref={previewRef}
            viewModel={viewModel}
            unit={form.unit}
            width={previewWidth}
            height={previewHeight}
            backgroundColor={activeBackgroundColor}
            chartHeights={balancedHeights}
          />
        ) : (
          <div className="ms-preview-placeholder" style={{ width: previewWidth, height: previewHeight }}>
            Fill required fields to render preview.
          </div>
        )}
      </section>
    </main>
  );
}

function autoBalanceChartHeights(previewHeight: number, requested: ChartHeights) {
  const normalized: ChartHeights = {
    yearlyPlot: clamp(requested.yearlyPlot, MIN_CHART_HEIGHT, MAX_CHART_HEIGHT),
    typeChart: clamp(requested.typeChart, MIN_CHART_HEIGHT, MAX_CHART_HEIGHT),
    regionChart: clamp(requested.regionChart, MIN_CHART_HEIGHT, MAX_CHART_HEIGHT),
  };

  const availablePlotSpace = Math.max(MIN_CHART_HEIGHT * 2, previewHeight - CHART_BALANCE_OVERHEAD);
  const requestedTop = normalized.yearlyPlot;
  const requestedBottom = Math.max(normalized.typeChart, normalized.regionChart);

  let balancedTop = requestedTop;
  let balancedBottom = requestedBottom;

  if (requestedTop + requestedBottom > availablePlotSpace) {
    const scale = availablePlotSpace / (requestedTop + requestedBottom);
    balancedTop = Math.max(MIN_CHART_HEIGHT, Math.floor(requestedTop * scale));
    balancedBottom = Math.max(MIN_CHART_HEIGHT, Math.floor(requestedBottom * scale));

    let overflow = balancedTop + balancedBottom - availablePlotSpace;
    while (overflow > 0) {
      if (balancedBottom >= balancedTop && balancedBottom > MIN_CHART_HEIGHT) {
        balancedBottom -= 1;
        overflow -= 1;
        continue;
      }

      if (balancedTop > MIN_CHART_HEIGHT) {
        balancedTop -= 1;
        overflow -= 1;
        continue;
      }

      if (balancedBottom > MIN_CHART_HEIGHT) {
        balancedBottom -= 1;
        overflow -= 1;
        continue;
      }

      break;
    }
  }

  const bottomBase = requestedBottom === 0 ? 1 : requestedBottom;
  let balancedType = Math.max(
    MIN_CHART_HEIGHT,
    Math.round((normalized.typeChart / bottomBase) * balancedBottom)
  );
  let balancedRegion = Math.max(
    MIN_CHART_HEIGHT,
    Math.round((normalized.regionChart / bottomBase) * balancedBottom)
  );

  const pairMax = Math.max(balancedType, balancedRegion);
  if (pairMax > balancedBottom) {
    const pairScale = balancedBottom / pairMax;
    balancedType = Math.max(MIN_CHART_HEIGHT, Math.floor(balancedType * pairScale));
    balancedRegion = Math.max(MIN_CHART_HEIGHT, Math.floor(balancedRegion * pairScale));
  }

  balancedType = Math.min(balancedType, balancedBottom);
  balancedRegion = Math.min(balancedRegion, balancedBottom);

  const balancedHeights: ChartHeights = {
    yearlyPlot: balancedTop,
    typeChart: balancedType,
    regionChart: balancedRegion,
  };

  const wasAutoBalanced =
    balancedHeights.yearlyPlot !== normalized.yearlyPlot ||
    balancedHeights.typeChart !== normalized.typeChart ||
    balancedHeights.regionChart !== normalized.regionChart;

  return { balancedHeights, wasAutoBalanced };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
