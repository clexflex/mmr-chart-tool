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
  typeSegmentsRaw: "Type1\nType2\nType3\nType4\nType5\nType6",
  regionSegmentsRaw: "Asia Pacific\nNorth America\nEurope\nMiddle East and Africa\nSouth America",
};

export default function Home() {
  const [form, setForm] = useState<SnapshotFormInput>(DEFAULT_FORM);
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const { viewModel, errors } = useMemo(() => buildTemplate1ViewModel(form), [form]);

  const updateText = (field: keyof SnapshotFormInput) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
    };

  const updateNumber =
    (field: keyof SnapshotFormInput) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((current) => ({
        ...current,
        [field]: event.target.value === "" ? Number.NaN : Number(event.target.value),
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

          <label className="ms-field ms-field-full">
            <span>Unit of Market Size</span>
            <input value={form.unit} onChange={updateText("unit")} />
          </label>

          <label className="ms-field ms-field-full">
            <span>Type Segments (comma or newline separated, top {segmentLimit()} rendered)</span>
            <textarea rows={4} value={form.typeSegmentsRaw} onChange={updateText("typeSegmentsRaw")} />
          </label>

          <label className="ms-field ms-field-full">
            <span>Region Segments (comma or newline separated, top {segmentLimit()} rendered)</span>
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
          <Template1Card ref={previewRef} viewModel={viewModel} unit={form.unit} />
        ) : (
          <div className="ms-preview-placeholder">Fill required fields to render preview.</div>
        )}
      </section>
    </main>
  );
}
