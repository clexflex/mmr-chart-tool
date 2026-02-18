import type { DensityMode, SegmentPoint } from "@/lib/template1/types";

const STACK_COLORS = [
  "#5d96c9",
  "#ea7d2f",
  "#a6a6a6",
  "#f3bf00",
  "#4b6fbf",
  "#7f5aa3",
  "#4ca56b",
  "#d85f8d",
  "#7d92a8",
  "#8c9e3f",
];

type StackedShareBarProps = {
  title: string;
  data: SegmentPoint[];
  chartHeight: number;
  density: DensityMode;
};

export function StackedShareBar({ title, data, chartHeight, density }: StackedShareBarProps) {
  return (
    <section className="t3-stacked-chart" style={{ height: chartHeight }}>
      <h3 className="t1-chart-title">{title}</h3>
      <div className="t3-stacked-row-wrap">
        <span className="t3-stacked-year">2025</span>
        <div className="t3-stacked-bar">
          {data.map((item, index) => (
            <div
              key={item.label}
              className="t3-stacked-segment"
              style={{
                width: `${item.value}%`,
                backgroundColor: STACK_COLORS[index % STACK_COLORS.length],
              }}
              title={`${item.label}: ${item.value}%`}
            />
          ))}
        </div>
      </div>

      <ul className="t3-legend-grid" style={{ marginTop: density === "compact" ? 6 : 10 }}>
        {data.map((item, index) => (
          <li key={item.label} className="t3-legend-item" title={item.label}>
            <span
              className="t3-legend-swatch"
              style={{ backgroundColor: STACK_COLORS[index % STACK_COLORS.length] }}
            />
            <span
              className="t3-legend-label"
              style={responsiveLegendStyle(item.label, density)}
            >
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function responsiveLegendStyle(label: string, density: DensityMode) {
  if (density === "compact") {
    return {
      fontSize: "10px",
      whiteSpace: "normal" as const,
      overflowWrap: "anywhere" as const,
      wordBreak: "break-word" as const,
      lineHeight: 1.15,
    };
  }

  return {
    fontSize: label.length > 22 ? "10px" : label.length > 14 ? "11px" : "12px",
    whiteSpace: "normal" as const,
    overflowWrap: "anywhere" as const,
    wordBreak: "break-word" as const,
    lineHeight: 1.15,
  };
}
