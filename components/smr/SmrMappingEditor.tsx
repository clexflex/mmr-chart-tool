"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SmrChartMapping, SmrSegmentRowInput } from "@/lib/smr/types";

type Props = {
  rows: SmrSegmentRowInput[];
  mapping: SmrChartMapping;
  onChange: (mapping: SmrChartMapping) => void;
};

export function SmrMappingEditor({ rows, mapping, onChange }: Props) {
  const options = rows
    .filter((row) => row.title.trim())
    .map((row) => ({ value: row.id, label: row.title.trim() }));

  return (
    <section className="ms-section-block">
      <div className="ms-section-head-inline">
        <h2 className="ms-section-title">SMR Chart Mapping</h2>
      </div>
      <p className="ms-hint">Choose which segment row feeds each SMR output. Region stays the default for the full snapshot pie.</p>

      <div className="ms-form-grid ms-form-grid-3">
        <MappingField
          label="Full Snapshot Bar"
          value={mapping.snapshotBarSegmentId}
          options={options}
          onChange={(value) => onChange({ ...mapping, snapshotBarSegmentId: value })}
        />
        <MappingField
          label="Full Snapshot Pie"
          value={mapping.snapshotPieSegmentId}
          options={options}
          onChange={(value) => onChange({ ...mapping, snapshotPieSegmentId: value })}
        />
        <MappingField
          label="Donut Chart"
          value={mapping.donutSegmentId}
          options={options}
          onChange={(value) => onChange({ ...mapping, donutSegmentId: value })}
        />
        <MappingField
          label="Region Pie Chart"
          value={mapping.pie3dSegmentId}
          options={options}
          onChange={(value) => onChange({ ...mapping, pie3dSegmentId: value })}
        />
        <MappingField
          label="Flat Pie Chart"
          value={mapping.pie2dSegmentId}
          options={options}
          onChange={(value) => onChange({ ...mapping, pie2dSegmentId: value })}
        />
        <MappingField
          label="Column Chart"
          value={mapping.columnSegmentId}
          options={options}
          onChange={(value) => onChange({ ...mapping, columnSegmentId: value })}
        />
      </div>
    </section>
  );
}

function MappingField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  const fallback = options[0]?.value ?? "";

  return (
    <label className="ms-field">
      <span>{label}</span>
      <Select value={value || fallback} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select segment" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}
