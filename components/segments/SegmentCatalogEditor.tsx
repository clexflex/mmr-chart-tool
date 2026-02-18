import type { SegmentRowInput } from "@/lib/template1/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type SegmentCatalogEditorProps = {
  rows: SegmentRowInput[];
  onRowsChange: (rows: SegmentRowInput[]) => void;
};

export function SegmentCatalogEditor({ rows, onRowsChange }: SegmentCatalogEditorProps) {
  const addRow = () => {
    const next = [
      ...rows,
      {
        id: crypto.randomUUID(),
        title: "",
        includeInTable: true,
        linesRaw: "",
      },
    ];
    onRowsChange(next);
  };

  const removeRow = (id: string) => {
    onRowsChange(rows.filter((row) => row.id !== id));
  };

  const updateRow = (id: string, patch: Partial<SegmentRowInput>) => {
    onRowsChange(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  return (
    <section className="ms-section-block">
      <div className="ms-section-head-inline">
        <h2 className="ms-section-title">Segment Catalog</h2>
        <Button type="button" variant="outline" className="ms-secondary-btn" onClick={addRow}>
          Add Segment
        </Button>
      </div>

      <div className="ms-segment-list">
        {rows.map((row, index) => {
          return (
            <article className="ms-segment-card" key={row.id}>
              <div className="ms-segment-card-head">
                <h3>Segment {index + 1}</h3>
                <Button
                  type="button"
                  variant="outline"
                  className="ms-danger-btn"
                  onClick={() => removeRow(row.id)}
                  disabled={rows.length === 1}
                >
                  Remove
                </Button>
              </div>

              <div className="ms-form-grid">
                <label className="ms-field">
                  <span>Segment Title</span>
                  <Input value={row.title} onChange={(event) => updateRow(row.id, { title: event.target.value })} />
                </label>

                <label className="ms-field ms-check-field">
                  <span>Include in Table</span>
                  <label className="ms-inline-check">
                    <Checkbox
                      checked={row.includeInTable}
                      onCheckedChange={(checked) => updateRow(row.id, { includeInTable: checked === true })}
                    />
                    Include this segment row
                  </label>
                </label>
              </div>

              <label className="ms-field ms-field-full">
                <span>Segment Hierarchy (newline + indent by tabs/2 spaces)</span>
                <Textarea
                  rows={6}
                  value={row.linesRaw}
                  onChange={(event) => updateRow(row.id, { linesRaw: event.target.value })}
                />
              </label>
            </article>
          );
        })}
      </div>
    </section>
  );
}
