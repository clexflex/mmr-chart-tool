"use client";

import { useMemo, useRef, useState, type CSSProperties } from "react";
import { Template1Card } from "@/components/template1/Template1Card";
import { Template2Card } from "@/components/template2/Template2Card";
import { Template3Card } from "@/components/template3/Template3Card";
import { Template4Card } from "@/components/template4/Template4Card";
import { downloadElementAsWebp } from "@/lib/export/downloadWebp";
import { buildTemplate1ViewModel } from "@/lib/template1/generateData";
import { segmentLimit } from "@/lib/template1/parseInputs";
import type { DensityMode, SnapshotFormInput } from "@/lib/template1/types";
import { buildTemplate2ViewModel } from "@/lib/template2/generateData";
import { buildTemplate3ViewModel } from "@/lib/template3/generateData";
import { buildTemplate4ViewModel } from "@/lib/template4/generateData";

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
  tertiarySegmentTitle: "Application",
  typeSegmentsRaw: "Type1\nType2\nType3\nType4\nType5\nType6",
  regionSegmentsRaw: "Asia Pacific\nNorth America\nEurope\nMiddle East and Africa\nSouth America",
  tertiarySegmentsRaw: "Application1\nApplication2\nApplication3\nApplication4\nApplication5",
};

type TemplateKind = "template1" | "template2" | "template3" | "template4";

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

const MIN_PREVIEW_WIDTH = 600;
const MIN_PREVIEW_HEIGHT = 420;
const MAX_PREVIEW_SIZE = 900;
const MIN_CHART_HEIGHT = 110;
const MAX_CHART_HEIGHT = 320;
const TEMPLATE1_OVERHEAD = 168;
const TEMPLATE2_OVERHEAD = 198;
const TEMPLATE3_OVERHEAD = 198;
const TEMPLATE4_OVERHEAD = 186;

export default function Home() {
  const [templateKind, setTemplateKind] = useState<TemplateKind>("template1");
  const [density, setDensity] = useState<DensityMode>("spacious");
  const [form, setForm] = useState<SnapshotFormInput>(DEFAULT_FORM);
  const [previewWidth, setPreviewWidth] = useState(900);
  const [previewHeight, setPreviewHeight] = useState(580);
  const [template1ChartHeights, setTemplate1ChartHeights] =
    useState<Template1ChartHeights>(DEFAULT_TEMPLATE1_CHART_HEIGHTS);
  const [template2ChartHeights, setTemplate2ChartHeights] =
    useState<SplitChartHeights>(DEFAULT_SPLIT_CHART_HEIGHTS);
  const [template3ChartHeights, setTemplate3ChartHeights] =
    useState<SplitChartHeights>(DEFAULT_SPLIT_CHART_HEIGHTS);
  const [template4ChartHeights, setTemplate4ChartHeights] =
    useState<Template4ChartHeights>(DEFAULT_TEMPLATE4_CHART_HEIGHTS);
  const [useSolidBackground, setUseSolidBackground] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState("#e7e7e7");
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const template1Result = useMemo(() => buildTemplate1ViewModel(form), [form]);
  const template2Result = useMemo(() => buildTemplate2ViewModel(form), [form]);
  const template3Result = useMemo(() => buildTemplate3ViewModel(form), [form]);
  const template4Result = useMemo(() => buildTemplate4ViewModel(form), [form]);

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
  const activeResult =
    templateKind === "template1"
      ? template1Result
      : templateKind === "template2"
      ? template2Result
      : templateKind === "template3"
      ? template3Result
      : template4Result;
  const activeErrors = activeResult.errors;
  const activeViewModel = activeResult.viewModel;
  const activeWasAutoBalanced =
    templateKind === "template1"
      ? template1Balanced.wasAutoBalanced
      : templateKind === "template2"
      ? template2Balanced.wasAutoBalanced
      : templateKind === "template3"
      ? template3Balanced.wasAutoBalanced
      : template4Balanced.wasAutoBalanced;

  const showTertiary = templateKind === "template2" || templateKind === "template3";

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

  const handleDownload = async () => {
    if (!activeViewModel || !previewRef.current || activeErrors.length > 0 || isExporting) {
      return;
    }

    setIsExporting(true);
    try {
      await downloadElementAsWebp(previewRef.current, {
        fileName: `market-snapshot-${templateKind}.webp`,
        pixelRatio: 1,
        width: previewWidth,
        height: previewHeight,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`app-shell density-${density}`} style={densityStyle(density)}>
      <main className="ms-page">
        <section className="ms-panel">
          <h1 className="ms-heading">MMR Market Snapshot Builder</h1>
          <p className="ms-subheading">Template-driven snapshot preview and WebP export</p>

          <div className="ms-preview-settings">
            <div className="ms-preview-settings-row ms-preview-settings-row-3">
              <label className="ms-field">
                <span>Template</span>
                <select
                  value={templateKind}
                  onChange={(event) => setTemplateKind(event.target.value as TemplateKind)}
                >
                  <option value="template1">Template 1</option>
                  <option value="template2">Template 2</option>
                  <option value="template3">Template 3</option>
                  <option value="template4">Template 4</option>
                </select>
              </label>
              <label className="ms-field">
                <span>Density Mode</span>
                <select value={density} onChange={(event) => setDensity(event.target.value as DensityMode)}>
                  <option value="compact">Compact</option>
                  <option value="spacious">Spacious</option>
                </select>
              </label>
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
            </div>

            <div className="ms-preview-settings-row ms-preview-settings-row-3">
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
              {templateKind === "template1" ? (
                <div className="ms-preview-settings-row ms-preview-settings-row-3">
                  <label className="ms-field">
                    <span>Yearly Chart Height</span>
                    <input
                      type="number"
                      min={MIN_CHART_HEIGHT}
                      max={MAX_CHART_HEIGHT}
                      value={template1ChartHeights.yearlyPlot}
                      onChange={handleTemplate1ChartHeight("yearlyPlot")}
                    />
                  </label>
                  <label className="ms-field">
                    <span>Type Chart Height</span>
                    <input
                      type="number"
                      min={MIN_CHART_HEIGHT}
                      max={MAX_CHART_HEIGHT}
                      value={template1ChartHeights.typeChart}
                      onChange={handleTemplate1ChartHeight("typeChart")}
                    />
                  </label>
                  <label className="ms-field">
                    <span>Region Chart Height</span>
                    <input
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
                    <input
                      type="number"
                      min={MIN_CHART_HEIGHT}
                      max={MAX_CHART_HEIGHT}
                      value={template2ChartHeights.topSegment}
                      onChange={handleTemplate2ChartHeight("topSegment")}
                    />
                  </label>
                  <label className="ms-field">
                    <span>Bottom Left Chart Height</span>
                    <input
                      type="number"
                      min={MIN_CHART_HEIGHT}
                      max={MAX_CHART_HEIGHT}
                      value={template2ChartHeights.bottomLeft}
                      onChange={handleTemplate2ChartHeight("bottomLeft")}
                    />
                  </label>
                  <label className="ms-field">
                    <span>Bottom Right Chart Height</span>
                    <input
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
                    <input
                      type="number"
                      min={MIN_CHART_HEIGHT}
                      max={MAX_CHART_HEIGHT}
                      value={template3ChartHeights.topSegment}
                      onChange={handleTemplate3ChartHeight("topSegment")}
                    />
                  </label>
                  <label className="ms-field">
                    <span>Bottom Left Chart Height</span>
                    <input
                      type="number"
                      min={MIN_CHART_HEIGHT}
                      max={MAX_CHART_HEIGHT}
                      value={template3ChartHeights.bottomLeft}
                      onChange={handleTemplate3ChartHeight("bottomLeft")}
                    />
                  </label>
                  <label className="ms-field">
                    <span>Bottom Right Chart Height</span>
                    <input
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
                    <input
                      type="number"
                      min={MIN_CHART_HEIGHT}
                      max={MAX_CHART_HEIGHT}
                      value={template4ChartHeights.topSegment}
                      onChange={handleTemplate4ChartHeight("topSegment")}
                    />
                  </label>
                  <label className="ms-field">
                    <span>Bottom Main Chart Height</span>
                    <input
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
              <span>Primary Segment Title</span>
              <input value={form.primarySegmentTitle} onChange={updateText("primarySegmentTitle")} />
            </label>

            <label className="ms-field">
              <span>Secondary Segment Title</span>
              <input value={form.secondarySegmentTitle} onChange={updateText("secondarySegmentTitle")} />
            </label>

            {showTertiary ? (
              <label className="ms-field ms-field-full">
                <span>Tertiary Segment Title</span>
                <input value={form.tertiarySegmentTitle} onChange={updateText("tertiarySegmentTitle")} />
              </label>
            ) : null}

            <label className="ms-field ms-field-full">
              <span>Unit of Market Size</span>
              <input value={form.unit} onChange={updateText("unit")} />
            </label>

            <label className="ms-field ms-field-full">
              <span>
                {form.primarySegmentTitle || "Primary"} Segments (comma/newline separated, top {segmentLimit()} rendered)
              </span>
              <textarea rows={4} value={form.typeSegmentsRaw} onChange={updateText("typeSegmentsRaw")} />
            </label>

            <label className="ms-field ms-field-full">
              <span>
                {form.secondarySegmentTitle || "Secondary"} Segments (comma/newline separated, top {segmentLimit()} rendered)
              </span>
              <textarea rows={4} value={form.regionSegmentsRaw} onChange={updateText("regionSegmentsRaw")} />
            </label>

            {showTertiary ? (
              <label className="ms-field ms-field-full">
                <span>
                  {form.tertiarySegmentTitle || "Tertiary"} Segments (comma/newline separated, top {segmentLimit()} rendered)
                </span>
                <textarea rows={4} value={form.tertiarySegmentsRaw} onChange={updateText("tertiarySegmentsRaw")} />
              </label>
            ) : null}
          </div>

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

          {showTruncationNote(templateKind, template1Result.viewModel, template2Result.viewModel, template3Result.viewModel, template4Result.viewModel) ? (
            <p className="ms-note">Rendering top {segmentLimit()} items for chart/legend stability.</p>
          ) : null}

          <button
            type="button"
            className="ms-download-btn"
            onClick={handleDownload}
            disabled={!activeViewModel || activeErrors.length > 0 || isExporting}
          >
            {isExporting ? "Generating WebP..." : "Download WebP"}
          </button>
        </section>

        <section className="ms-preview-area">
          {templateKind === "template1" && template1Result.viewModel ? (
            <Template1Card
              ref={previewRef}
              viewModel={template1Result.viewModel}
              unit={form.unit}
              width={previewWidth}
              height={previewHeight}
              backgroundColor={activeBackgroundColor}
              density={density}
              chartHeights={template1Balanced.heights}
            />
          ) : null}

          {templateKind === "template2" && template2Result.viewModel ? (
            <Template2Card
              ref={previewRef}
              viewModel={template2Result.viewModel}
              width={previewWidth}
              height={previewHeight}
              backgroundColor={activeBackgroundColor}
              density={density}
              chartHeights={template2Balanced.heights}
            />
          ) : null}

          {templateKind === "template3" && template3Result.viewModel ? (
            <Template3Card
              ref={previewRef}
              viewModel={template3Result.viewModel}
              width={previewWidth}
              height={previewHeight}
              backgroundColor={activeBackgroundColor}
              density={density}
              chartHeights={template3Balanced.heights}
            />
          ) : null}

          {templateKind === "template4" && template4Result.viewModel ? (
            <Template4Card
              ref={previewRef}
              viewModel={template4Result.viewModel}
              width={previewWidth}
              height={previewHeight}
              backgroundColor={activeBackgroundColor}
              density={density}
              chartHeights={template4Balanced.heights}
            />
          ) : null}

          {!activeViewModel ? (
            <div className="ms-preview-placeholder" style={{ width: previewWidth, height: previewHeight }}>
              Fill required fields to render preview.
            </div>
          ) : null}
        </section>
      </main>

      <footer className="site-footer">
        <p>
          Designed by{" "}
          <a href="https://www.fatmangosolutions.com/" target="_blank" rel="noopener noreferrer">
            Yashraj Ghosalkar
          </a>
        </p>
        <p className="site-footer-social">
          Follow me on{" "}
          <a href="https://www.linkedin.com/in/yashrajghosalkar/" target="_blank" rel="noopener noreferrer">
            <LinkedInIcon /> LinkedIn
          </a>
        </p>
        <p>
          Designed for{" "}
          <a href="https://www.maximizemarketresearch.com/" target="_blank" rel="noopener noreferrer">
            MMR
          </a>
        </p>
      </footer>
    </div>
  );
}

function showTruncationNote(
  templateKind: TemplateKind,
  template1ViewModel: ReturnType<typeof buildTemplate1ViewModel>["viewModel"],
  template2ViewModel: ReturnType<typeof buildTemplate2ViewModel>["viewModel"],
  template3ViewModel: ReturnType<typeof buildTemplate3ViewModel>["viewModel"],
  template4ViewModel: ReturnType<typeof buildTemplate4ViewModel>["viewModel"]
): boolean {
  if (templateKind === "template1") {
    return Boolean(template1ViewModel?.meta.truncatedTypes || template1ViewModel?.meta.truncatedRegions);
  }

  if (templateKind === "template2") {
    return Boolean(
      template2ViewModel?.meta.truncatedPrimary ||
        template2ViewModel?.meta.truncatedSecondary ||
        template2ViewModel?.meta.truncatedTertiary
    );
  }

  if (templateKind === "template3") {
    return Boolean(
      template3ViewModel?.meta.truncatedPrimary ||
        template3ViewModel?.meta.truncatedSecondary ||
        template3ViewModel?.meta.truncatedTertiary
    );
  }

  return Boolean(template4ViewModel?.meta.truncatedPrimary || template4ViewModel?.meta.truncatedSecondary);
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

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
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

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
      <path
        d="M6.94 8.5H3.56V20h3.38V8.5zM5.25 3A1.97 1.97 0 003.3 4.97c0 1.1.86 1.97 1.93 1.97h.02c1.09 0 1.97-.87 1.97-1.97A1.96 1.96 0 005.25 3zM20.7 13.41c0-3.33-1.78-4.88-4.16-4.88-1.92 0-2.78 1.05-3.26 1.79V8.5H9.9c.04 1.22 0 11.5 0 11.5h3.38v-6.42c0-.34.03-.68.13-.92.27-.68.88-1.38 1.9-1.38 1.34 0 1.87 1.02 1.87 2.5V20H20.7v-6.59z"
        fill="currentColor"
      />
    </svg>
  );
}
