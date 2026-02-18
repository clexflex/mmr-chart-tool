import type { TableStyleMode } from "@/lib/template1/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type TableStyleToggleProps = {
  value: TableStyleMode;
  onChange: (value: TableStyleMode) => void;
};

export function TableStyleToggle({ value, onChange }: TableStyleToggleProps) {
  return (
    <label className="ms-field">
      <span>Table Style</span>
      <Select value={value} onValueChange={(nextValue) => onChange(nextValue as TableStyleMode)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select table style" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="legacy">Legacy</SelectItem>
          <SelectItem value="modern">Modern</SelectItem>
        </SelectContent>
      </Select>
    </label>
  );
}
