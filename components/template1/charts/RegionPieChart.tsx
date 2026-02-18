import type { DensityMode, SegmentPoint } from "@/lib/template1/types";

const PIE_COLORS = [
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

type RegionPieChartProps = {
  title: string;
  data: SegmentPoint[];
  chartHeight: number;
  density: DensityMode;
};

export function RegionPieChart({ title, data, chartHeight, density }: RegionPieChartProps) {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  const pieSize = clamp(chartHeight, 120, 220);
  const slices = data
    .map((item) => (item.value / total) * 360)
    .reduce<
      {
        start: number;
        end: number;
      }[]
    >((acc, sweep) => {
      const start = acc.length === 0 ? -90 : acc[acc.length - 1].end;
      return [...acc, { start, end: start + sweep }];
    }, []);

  return (
    <section className="t1-region-chart">
      <h3 className="t1-chart-title">{title}</h3>
      <div className="t1-pie-layout" style={{ height: chartHeight }}>
        <svg
          viewBox="0 0 184 184"
          className="t1-pie-svg"
          style={{ width: pieSize, height: pieSize }}
          role="img"
          aria-label={title}
        >
          {data.map((item, index) => {
            const { start, end } = slices[index];

            return (
              <path
                key={item.label}
                d={arcPath(92, 92, 76, start, end)}
                fill={PIE_COLORS[index % PIE_COLORS.length]}
                stroke="#ffffff"
                strokeWidth="2"
              />
            );
          })}
        </svg>

        <ul className="t1-pie-legend">
          {data.map((item, index) => (
            <li className="t1-pie-legend-item" key={item.label}>
              <span
                className="t1-pie-swatch"
                style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
              />
              <span
                className="t1-pie-legend-label"
                title={item.label}
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
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function arcPath(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
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
