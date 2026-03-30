import type { SmrSeriesPoint } from "./types";

export const SMR_PIE_LAYOUT_BOX = {
  viewBoxSize: 280,
  centerX: 140,
  centerY: 140,
  radius: 124,
  innerRadius: 56,
} as const;

export const SMR_COLUMN_LAYOUT_BOX = {
  viewBoxWidth: 460,
  viewBoxHeight: 196,
  plotLeft: 32,
  plotRight: 428,
  plotTop: 12,
  plotBottom: 142,
  axisY: 142,
  labelY: 164,
  labelMaxLength: 12,
} as const;

export function buildSmrColumnSvgModel(series: SmrSeriesPoint[], maxValue: number) {
  const count = Math.max(series.length, 1);
  const plotWidth = SMR_COLUMN_LAYOUT_BOX.plotRight - SMR_COLUMN_LAYOUT_BOX.plotLeft;
  const slotWidth = plotWidth / count;
  const maxBarWidth = Math.min(44, slotWidth * 0.46);
  const plotHeight = SMR_COLUMN_LAYOUT_BOX.plotBottom - SMR_COLUMN_LAYOUT_BOX.plotTop;

  return {
    items: series.map((item, index) => {
      const barHeight = Math.max(20, Math.round((item.value / maxValue) * plotHeight));
      const centerX = SMR_COLUMN_LAYOUT_BOX.plotLeft + slotWidth * index + slotWidth / 2;
      const barWidth = Math.min(maxBarWidth, Math.max(22, slotWidth * 0.4));
      const barX = centerX - barWidth / 2;
      const barY = SMR_COLUMN_LAYOUT_BOX.plotBottom - barHeight;
      const fontSize = columnLabelFontSize(item.label);

      return {
        ...item,
        centerX,
        barX,
        barY,
        barWidth,
        barHeight,
        fontSize,
        lines: wrapColumnLabel(item.label, SMR_COLUMN_LAYOUT_BOX.labelMaxLength),
      };
    }),
  };
}

function wrapColumnLabel(label: string, maxLength: number) {
  const words = label.split(/\s+/).filter(Boolean);
  if (words.length <= 1 && label.length <= maxLength) return [label];

  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const next = currentLine ? `${currentLine} ${word}` : word;
    if (next.length <= maxLength || currentLine.length === 0) {
      currentLine = next;
      return;
    }

    lines.push(currentLine);
    currentLine = word;
  });

  if (currentLine) lines.push(currentLine);
  return lines.slice(0, 3);
}

function columnLabelFontSize(label: string) {
  if (label.length > 26) return 10.5;
  if (label.length > 18) return 11.5;
  return 12.5;
}
