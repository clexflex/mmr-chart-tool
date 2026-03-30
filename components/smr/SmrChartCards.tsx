"use client";

import { forwardRef, type CSSProperties } from "react";
import { buildSmrColumnSvgModel, SMR_COLUMN_LAYOUT_BOX, SMR_PIE_LAYOUT_BOX } from "@/lib/smr/chartGeometry";
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
          <svg
            viewBox={`0 0 ${SMR_PIE_LAYOUT_BOX.viewBoxSize} ${SMR_PIE_LAYOUT_BOX.viewBoxSize}`}
            className="smr-chart-svg"
            aria-hidden
          >
            {renderDonutSlices(
              viewModel.series,
              SMR_PIE_LAYOUT_BOX.centerX,
              SMR_PIE_LAYOUT_BOX.centerY,
              SMR_PIE_LAYOUT_BOX.radius,
              SMR_PIE_LAYOUT_BOX.innerRadius
            )}
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
          <svg
            viewBox={`0 0 ${SMR_PIE_LAYOUT_BOX.viewBoxSize} ${SMR_PIE_LAYOUT_BOX.viewBoxSize}`}
            className="smr-chart-svg"
            aria-hidden
          >
            {renderPieSlices(
              viewModel.series,
              SMR_PIE_LAYOUT_BOX.centerX,
              SMR_PIE_LAYOUT_BOX.centerY,
              SMR_PIE_LAYOUT_BOX.radius
            )}
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
          <svg
            viewBox={`0 0 ${SMR_PIE_LAYOUT_BOX.viewBoxSize} ${SMR_PIE_LAYOUT_BOX.viewBoxSize}`}
            className="smr-chart-svg"
            aria-hidden
          >
            {renderPieSlices(
              viewModel.series,
              SMR_PIE_LAYOUT_BOX.centerX,
              SMR_PIE_LAYOUT_BOX.centerY,
              SMR_PIE_LAYOUT_BOX.radius
            )}
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
  const svgModel = buildSmrColumnSvgModel(viewModel.series, maxValue);

  return (
    <div ref={ref} className="smr-card smr-figure-card" style={style}>
      <h2 className="smr-figure-title">{viewModel.chartTitle}</h2>
      <div className="smr-column-stage">
        <svg
          viewBox={`0 0 ${SMR_COLUMN_LAYOUT_BOX.viewBoxWidth} ${SMR_COLUMN_LAYOUT_BOX.viewBoxHeight}`}
          className="smr-chart-svg"
          aria-hidden
        >
          <line
            x1={SMR_COLUMN_LAYOUT_BOX.plotLeft}
            y1={SMR_COLUMN_LAYOUT_BOX.axisY}
            x2={SMR_COLUMN_LAYOUT_BOX.plotRight}
            y2={SMR_COLUMN_LAYOUT_BOX.axisY}
            stroke="#c7ccd1"
            strokeWidth="2"
          />
          {svgModel.items.map((item, index) => (
            <g key={`${item.label}-${index}`}>
              <rect x={item.barX} y={item.barY} width={item.barWidth} height={item.barHeight} fill={colorForIndex(index)} rx="2" />
              <text
                x={item.centerX}
                y={SMR_COLUMN_LAYOUT_BOX.labelY}
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

function renderPieSlices(series: SmrSeriesPoint[], cx: number, cy: number, radius: number, radiusY = radius) {
  let startAngle = -90;

  return series.map((item, index) => {
    const sliceAngle = (item.value / 100) * 360;
    const endAngle = startAngle + sliceAngle;
    const path = describeArcSlice(cx, cy, radius, radiusY, startAngle, endAngle);
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

function describeArcSlice(cx: number, cy: number, radiusX: number, radiusY: number, startAngle: number, endAngle: number) {
  const start = polarToCartesianEllipse(cx, cy, radiusX, radiusY, endAngle);
  const end = polarToCartesianEllipse(cx, cy, radiusX, radiusY, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [`M ${cx} ${cy}`, `L ${start.x} ${start.y}`, `A ${radiusX} ${radiusY} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`, "Z"].join(" ");
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

function polarToCartesianEllipse(cx: number, cy: number, radiusX: number, radiusY: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + radiusX * Math.cos(angleInRadians),
    y: cy + radiusY * Math.sin(angleInRadians),
  };
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
