import type { DerivedMarketSizes, KnownYearInput } from "@/lib/template1/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type KnownYearDerivationPanelProps = {
  knownYearInput: KnownYearInput;
  derived: DerivedMarketSizes;
  onKnownYearInputChange: (field: keyof KnownYearInput, value: number) => void;
  onDerivedValueChange: (field: "marketSize2025" | "marketSize2032", value: number) => void;
  onRecalculate: () => void;
};

export function KnownYearDerivationPanel({
  knownYearInput,
  derived,
  onKnownYearInputChange,
  onDerivedValueChange,
  onRecalculate,
}: KnownYearDerivationPanelProps) {
  return (
    <section className="ms-section-block">
      <h2 className="ms-section-title">Size Derivation</h2>

      <div className="ms-form-grid ms-form-grid-3">
        <label className="ms-field">
          <span>Known Market Year</span>
          <Input
            type="number"
            value={Number.isFinite(knownYearInput.knownYear) ? knownYearInput.knownYear : ""}
            onChange={(event) => onKnownYearInputChange("knownYear", Number(event.target.value))}
          />
        </label>

        <label className="ms-field">
          <span>Known Market Size</span>
          <Input
            type="number"
            step="0.01"
            value={Number.isFinite(knownYearInput.knownMarketSize) ? knownYearInput.knownMarketSize : ""}
            onChange={(event) => onKnownYearInputChange("knownMarketSize", Number(event.target.value))}
          />
        </label>

        <label className="ms-field">
          <span>CAGR (%)</span>
          <Input
            type="number"
            step="0.01"
            value={Number.isFinite(knownYearInput.cagrPercent) ? knownYearInput.cagrPercent : ""}
            onChange={(event) => onKnownYearInputChange("cagrPercent", Number(event.target.value))}
          />
        </label>

        <label className="ms-field">
          <span>Derived Market Size (2025)</span>
          <Input
            type="number"
            step="0.01"
            value={Number.isFinite(derived.marketSize2025) ? derived.marketSize2025 : ""}
            onChange={(event) => onDerivedValueChange("marketSize2025", Number(event.target.value))}
          />
        </label>

        <label className="ms-field">
          <span>Derived Market Size (2032)</span>
          <Input
            type="number"
            step="0.01"
            value={Number.isFinite(derived.marketSize2032) ? derived.marketSize2032 : ""}
            onChange={(event) => onDerivedValueChange("marketSize2032", Number(event.target.value))}
          />
        </label>

        <div className="ms-derive-actions">
          <Button type="button" variant="outline" className="ms-secondary-btn" onClick={onRecalculate}>
            Recalculate from Known Year
          </Button>
          <p className="ms-inline-note">
            Overrides: 2025 {derived.is2025Overridden ? "Yes" : "No"}, 2032 {derived.is2032Overridden ? "Yes" : "No"}
          </p>
        </div>
      </div>
    </section>
  );
}
