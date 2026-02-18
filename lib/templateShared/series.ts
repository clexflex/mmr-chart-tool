import type { SegmentPoint } from "@/lib/template1/types";

export function createShareSeries(labels: string[]): SegmentPoint[] {
  const weights = descendingWeights(labels.length);
  const total = weights.reduce((acc, item) => acc + item, 0);

  const rounded = weights.map((weight, index) => {
    if (index === labels.length - 1) {
      return 0;
    }
    return Number(((weight / total) * 100).toFixed(1));
  });

  const used = rounded.slice(0, -1).reduce((acc, value) => acc + value, 0);
  rounded[rounded.length - 1] = Number((100 - used).toFixed(1));

  return labels.map((label, index) => ({
    label,
    value: rounded[index],
  }));
}

export function createValueSeries(labels: string[], totalValue: number): SegmentPoint[] {
  const weights = descendingWeights(labels.length);
  const totalWeight = weights.reduce((acc, item) => acc + item, 0);

  return labels.map((label, index) => ({
    label,
    value: Number(((weights[index] / totalWeight) * totalValue).toFixed(2)),
  }));
}

export function formatNumber(value: number): string {
  return Number(value.toFixed(2)).toString();
}

export function unitLabelForType(unit: string): string {
  if (/billion|bn/i.test(unit)) {
    return "Bn";
  }
  return unit;
}

function descendingWeights(length: number): number[] {
  return Array.from({ length }, (_, index) => length - index);
}
