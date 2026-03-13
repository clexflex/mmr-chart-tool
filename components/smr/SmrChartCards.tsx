"use client";

import { forwardRef, type CSSProperties } from "react";
import type { SmrChartCardViewModel, SmrSeriesPoint } from "@/lib/smr/types";

const SMR_COLORS = ["#3f6798", "#4b79b0", "#5684c0", "#8ea2c8", "#b0bcd3"];

type CardProps = {
  viewModel: SmrChartCardViewModel;
  width: number;
  height: number;
  backgroundColor: string;
  layout?: {
    chartSize?: number;
    plotHeight?: number;
  };
};

export const SmrDonutCard = forwardRef<HTMLDivElement, CardProps>(function SmrDonutCard(
  { viewModel, width, height, backgroundColor, layout },
  ref
) {
  const style = createCardStyle(width, height, backgroundColor, {
    chartSize: layout?.chartSize ?? 240,
    plotHeight: layout?.plotHeight ?? 200,
  });

  return (
    <div ref={ref} className="smr-card smr-figure-card" style={style}>
      <h2 className="smr-figure-title">{viewModel.chartTitle}</h2>
      <div className="smr-donut-layout">
        <div className="smr-pie-shell">
          <svg viewBox="0 0 420 320" className="smr-chart-svg" aria-hidden>
            {renderDonutSlices(viewModel.series, 165, 155, 110, 58)}
          </svg>
        </div>
        <PieLegend series={viewModel.series} />
      </div>
    </div>
  );
});

export const SmrPie3DCard = forwardRef<HTMLDivElement, CardProps>(function SmrPie3DCard(
  { viewModel, width, height, backgroundColor, layout },
  ref
) {
  const style = createCardStyle(width, height, backgroundColor, {
    chartSize: layout?.chartSize ?? 240,
    plotHeight: layout?.plotHeight ?? 200,
  });

  return (
    <div ref={ref} className="smr-card smr-figure-card" style={style}>
      <h2 className="smr-figure-title">{viewModel.chartTitle}</h2>
      <div className="smr-flat-pie-layout">
        <div className="smr-pie-shell">
          <svg viewBox="0 0 420 320" className="smr-chart-svg" aria-hidden>
            {renderPieSlices(viewModel.series, 165, 155, 110)}
          </svg>
        </div>
        <PieLegend series={viewModel.series} />
      </div>
    </div>
  );
});

export const SmrPie2DCard = forwardRef<HTMLDivElement, CardProps>(function SmrPie2DCard(
  { viewModel, width, height, backgroundColor, layout },
  ref
) {
  const style = createCardStyle(width, height, backgroundColor, {
    chartSize: layout?.chartSize ?? 240,
    plotHeight: layout?.plotHeight ?? 200,
  });

  return (
    <div ref={ref} className="smr-card smr-figure-card" style={style}>
      <h2 className="smr-figure-title">{viewModel.chartTitle}</h2>
      <div className="smr-flat-pie-layout">
        <div className="smr-pie-shell">
          <svg viewBox="0 0 420 320" className="smr-chart-svg" aria-hidden>
            {renderPieSlices(viewModel.series, 165, 155, 110)}
          </svg>
        </div>
        <PieLegend series={viewModel.series} />
      </div>
    </div>
  );
});

export const SmrColumnCard = forwardRef<HTMLDivElement, CardProps>(function SmrColumnCard(
  { viewModel, width, height, backgroundColor, layout },
  ref
) {
  const maxValue = Math.max(...viewModel.series.map((item) => item.value), 1);
  const style = createCardStyle(width, height, backgroundColor, {
    chartSize: layout?.chartSize ?? 500,
    plotHeight: layout?.plotHeight ?? 200,
  });
  const svgModel = buildColumnSvgModel(viewModel.series, maxValue);

  return (
    <div ref={ref} className="smr-card smr-figure-card" style={style}>
      <h2 className="smr-figure-title">{viewModel.chartTitle}</h2>
      <div className="smr-column-stage">
        <svg viewBox="0 0 560 280" className="smr-chart-svg" aria-hidden>
          <line x1="46" y1="216" x2="514" y2="216" stroke="#c7ccd1" strokeWidth="2" />
          {svgModel.items.map((item, index) => (
            <g key={`${item.label}-${index}`}>
              <rect x={item.barX} y={item.barY} width={item.barWidth} height={item.barHeight} fill={colorForIndex(index)} rx="2" />
              <text
                x={item.centerX}
                y="244"
                textAnchor="middle"
                className="smr-column-label-svg"
                fontSize={item.fontSize}
              >
                {item.lines.map((line, lineIndex) => (
                  <tspan key={`${line}-${lineIndex}`} x={item.centerX} dy={lineIndex === 0 ? 0 : item.fontSize + 2}>
                    {line}
                  </tspan>
                ))}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
});

function PieLegend({ series, inline = false }: { series: SmrSeriesPoint[]; inline?: boolean }) {
  return (
    <div className={`smr-pie-legend${inline ? " is-inline" : ""}`}>
      {series.map((item, index) => (
        <div className="smr-pie-legend-row" key={`${item.label}-${index}`}>
          <span className="smr-pie-swatch" style={{ backgroundColor: colorForIndex(index) }} />
          <span className="smr-pie-legend-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function renderPieSlices(series: SmrSeriesPoint[], cx: number, cy: number, radius: number) {
  let startAngle = -90;

  return series.map((item, index) => {
    const sliceAngle = (item.value / 100) * 360;
    const endAngle = startAngle + sliceAngle;
    const path = describeArcSlice(cx, cy, radius, startAngle, endAngle);
    startAngle = endAngle;

    return <path key={`${item.label}-${index}`} d={path} fill={colorForIndex(index)} stroke="#f3f4f6" strokeWidth="3" />;
  });
}

function renderDonutSlices(series: SmrSeriesPoint[], cx: number, cy: number, radius: number, innerRadius: number) {
  let startAngle = -90;

  return series.map((item, index) => {
    const sliceAngle = (item.value / 100) * 360;
    const endAngle = startAngle + sliceAngle;
    const path = describeDonutSlice(cx, cy, radius, innerRadius, startAngle, endAngle);
    startAngle = endAngle;

    return <path key={`${item.label}-${index}`} d={path} fill={colorForIndex(index)} stroke="#f3f4f6" strokeWidth="3" />;
  });
}

function describeArcSlice(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [`M ${cx} ${cy}`, `L ${start.x} ${start.y}`, `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`, "Z"].join(" ");
}

function describeDonutSlice(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number
) {
  const outerStart = polarToCartesian(cx, cy, outerRadius, endAngle);
  const outerEnd = polarToCartesian(cx, cy, outerRadius, startAngle);
  const innerStart = polarToCartesian(cx, cy, innerRadius, startAngle);
  const innerEnd = polarToCartesian(cx, cy, innerRadius, endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${innerEnd.x} ${innerEnd.y}`,
    "Z",
  ].join(" ");
}

function polarToCartesian(cx: number, cy: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

function buildColumnSvgModel(series: SmrSeriesPoint[], maxValue: number) {
  const count = Math.max(series.length, 1);
  const plotLeft = 56;
  const plotWidth = 448;
  const slotWidth = plotWidth / count;
  const maxBarWidth = Math.min(54, slotWidth * 0.5);
  const plotBottom = 216;
  const plotTop = 38;
  const plotHeight = plotBottom - plotTop;

  return {
    items: series.map((item, index) => {
      const barHeight = Math.max(18, Math.round((item.value / maxValue) * plotHeight));
      const centerX = plotLeft + slotWidth * index + slotWidth / 2;
      const barWidth = Math.min(maxBarWidth, Math.max(24, slotWidth * 0.48));
      const barX = centerX - barWidth / 2;
      const barY = plotBottom - barHeight;
      const fontSize = columnLabelFontSize(item.label);

      return {
        ...item,
        centerX,
        barX,
        barY,
        barWidth,
        barHeight,
        fontSize,
        lines: wrapColumnLabel(item.label, 16),
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
  if (label.length > 28) return 11;
  if (label.length > 18) return 12;
  return 13;
}

function colorForIndex(index: number) {
  return SMR_COLORS[index % SMR_COLORS.length];
}

function createCardStyle(
  width: number,
  height: number,
  backgroundColor: string,
  layout: { chartSize: number; plotHeight: number }
) {
  const scale = Math.min(1.12, Math.max(1, width / 600));

  return {
    width,
    height,
    backgroundColor,
    ["--smr-scale" as never]: scale,
    ["--smr-figure-chart-size" as never]: `${layout.chartSize}px`,
    ["--smr-figure-plot-height" as never]: `${layout.plotHeight}px`,
  } as CSSProperties;
}
