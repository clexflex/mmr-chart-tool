import type { DensityMode, SegmentPoint } from "@/lib/template1/types";

type VerticalSegmentChartProps = {
  title: string;
  data: SegmentPoint[];
  chartHeight: number;
  density: DensityMode;
};

export function VerticalSegmentChart({ title, data, chartHeight, density }: VerticalSegmentChartProps) {
  const maxValue = Math.max(...data.map((item) => item.value));

  return (
    <section className="t3-vertical-chart" style={{ height: chartHeight }}>
      <h3 className="t1-chart-title">{title}</h3>
      <div className="t3-vertical-plot">
        {data.map((item) => {
          const barHeight = Math.max(8, (item.value / maxValue) * (chartHeight - 56));
          return (
            <div key={item.label} className="t3-vertical-col" title={`${item.label}: ${item.value}`}>
              <div className="t3-vertical-bar-shell" style={{ height: chartHeight - 56 }}>
                <div className="t3-vertical-bar" style={{ height: barHeight }} />
              </div>
              <span
                className="t3-vertical-label"
                style={responsiveLabelStyle(item.label, density)}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function responsiveLabelStyle(label: string, density: DensityMode) {
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
    fontSize: label.length > 18 ? "10px" : label.length > 12 ? "11px" : "12px",
    whiteSpace: "normal" as const,
    overflowWrap: "anywhere" as const,
    wordBreak: "break-word" as const,
    lineHeight: 1.15,
  };
}
