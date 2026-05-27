import type { DensityMode, SegmentPoint } from "@/lib/template1/types";

type TypeHorizontalBarChartProps = {
  title: string;
  data: SegmentPoint[];
  chartHeight: number;
  density: DensityMode;
};

export function TypeHorizontalBarChart({
  title,
  data,
  chartHeight,
  density,
}: TypeHorizontalBarChartProps) {
  const maxValue = Math.max(...data.map((item) => item.value));
  const barThickness = 15;
  const rowGap =
    data.length > 1
      ? Math.min(15, Math.max(0, (chartHeight - barThickness * data.length) / (data.length - 1)))
      : 0;

  return (
    <section className="t1-type-chart">
      <h3 className="t1-chart-title">{title}</h3>
      <div
        className="t1-hbar-area"
        style={{
          height: chartHeight,
          display: "grid",
          rowGap,
          gridTemplateRows: `repeat(${data.length}, ${barThickness}px)`,
          alignContent: "start",
        }}
      >
        {data.map((item) => (
          <div className="t1-hbar-row" key={item.label} style={{ minHeight: barThickness, marginBottom: 0 }}>
            <span
              className="t1-hbar-label"
              title={item.label}
              style={responsiveLabelStyle(item.label, density)}
            >
              {item.label}
            </span>
            <div className="t1-hbar-track" style={{ height: barThickness }}>
              <div
                className="t1-hbar-fill"
                style={{
                  width: `${Math.max(7, (item.value / maxValue) * 100)}%`,
                  height: barThickness,
                }}
              />
            </div>
          </div>
        ))}
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
    fontSize: label.length > 24 ? "10px" : label.length > 16 ? "11px" : "12px",
    whiteSpace: "normal" as const,
    overflowWrap: "anywhere" as const,
    wordBreak: "break-word" as const,
    lineHeight: 1.15,
  };
}
