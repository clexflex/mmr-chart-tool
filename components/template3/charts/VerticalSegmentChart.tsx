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
                style={
                  density === "compact"
                    ? {
                        fontSize: "12px",
                        whiteSpace: "normal",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }
                    : { fontSize: "13px" }
                }
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
