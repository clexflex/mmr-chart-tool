import type { ChartTemplateKind, SegmentRowInput, SnapshotChartMapping } from "@/lib/template1/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type SegmentMappingControlsProps = {
  templateKind: ChartTemplateKind;
  mapping: SnapshotChartMapping;
  rows: SegmentRowInput[];
  onMappingChange: (mapping: SnapshotChartMapping) => void;
  invalidMessage?: string;
};

export function SegmentMappingControls({
  templateKind,
  mapping,
  rows,
  onMappingChange,
  invalidMessage,
}: SegmentMappingControlsProps) {
  const options = rows.map((row) => ({ value: row.id, label: row.title || "Untitled Segment" }));

  const updateTemplate1 = (field: "typeSegmentId" | "regionSegmentId", value: string) => {
    onMappingChange({
      ...mapping,
      template1: {
        ...mapping.template1,
        [field]: value,
      },
    });
  };

  const updateTemplate2 = (field: "topStackSegmentId" | "pieSegmentId" | "horizontalSegmentId", value: string) => {
    onMappingChange({
      ...mapping,
      template2: {
        ...mapping.template2,
        [field]: value,
      },
    });
  };

  const updateTemplate3 = (field: "topStackSegmentId" | "pieSegmentId" | "verticalSegmentId", value: string) => {
    onMappingChange({
      ...mapping,
      template3: {
        ...mapping.template3,
        [field]: value,
      },
    });
  };

  const updateTemplate4 = (field: "topStackSegmentId" | "verticalSegmentId", value: string) => {
    onMappingChange({
      ...mapping,
      template4: {
        ...mapping.template4,
        [field]: value,
      },
    });
  };

  return (
    <section className="ms-section-block">
      <h2 className="ms-section-title">Snapshot Mapping</h2>
      <p className="ms-hint">Choose which segment row feeds each chart slot in the active template.</p>

      {templateKind === "template1" ? (
        <div className="ms-form-grid">
          <MappingSelect
            label="Bottom-Left Bar Chart"
            value={mapping.template1.typeSegmentId}
            options={options}
            onChange={(value) => updateTemplate1("typeSegmentId", value)}
          />
          <MappingSelect
            label="Bottom-Right Pie Chart"
            value={mapping.template1.regionSegmentId}
            options={options}
            onChange={(value) => updateTemplate1("regionSegmentId", value)}
          />
        </div>
      ) : null}

      {templateKind === "template2" ? (
        <div className="ms-form-grid ms-form-grid-3">
          <MappingSelect
            label="Top Share Strip"
            value={mapping.template2.topStackSegmentId}
            options={options}
            onChange={(value) => updateTemplate2("topStackSegmentId", value)}
          />
          <MappingSelect
            label="Bottom-Left Pie Chart"
            value={mapping.template2.pieSegmentId}
            options={options}
            onChange={(value) => updateTemplate2("pieSegmentId", value)}
          />
          <MappingSelect
            label="Bottom-Right Horizontal Bars"
            value={mapping.template2.horizontalSegmentId}
            options={options}
            onChange={(value) => updateTemplate2("horizontalSegmentId", value)}
          />
        </div>
      ) : null}

      {templateKind === "template3" ? (
        <div className="ms-form-grid ms-form-grid-3">
          <MappingSelect
            label="Top Share Strip"
            value={mapping.template3.topStackSegmentId}
            options={options}
            onChange={(value) => updateTemplate3("topStackSegmentId", value)}
          />
          <MappingSelect
            label="Bottom-Left Pie Chart"
            value={mapping.template3.pieSegmentId}
            options={options}
            onChange={(value) => updateTemplate3("pieSegmentId", value)}
          />
          <MappingSelect
            label="Bottom-Right Vertical Bars"
            value={mapping.template3.verticalSegmentId}
            options={options}
            onChange={(value) => updateTemplate3("verticalSegmentId", value)}
          />
        </div>
      ) : null}

      {templateKind === "template4" ? (
        <div className="ms-form-grid">
          <MappingSelect
            label="Top Share Strip"
            value={mapping.template4.topStackSegmentId}
            options={options}
            onChange={(value) => updateTemplate4("topStackSegmentId", value)}
          />
          <MappingSelect
            label="Bottom Vertical Bars"
            value={mapping.template4.verticalSegmentId}
            options={options}
            onChange={(value) => updateTemplate4("verticalSegmentId", value)}
          />
        </div>
      ) : null}

      {invalidMessage ? <p className="ms-errors-inline">{invalidMessage}</p> : null}
    </section>
  );
}

type MappingSelectProps = {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
};

function MappingSelect({ label, value, options, onChange }: MappingSelectProps) {
  return (
    <label className="ms-field">
      <span>{label}</span>
      <Select value={value} onValueChange={onChange}>
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
