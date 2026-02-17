import type { SegmentPoint } from "@/lib/template1/types";

type TypeHorizontalBarChartProps = {
  title: string;
  data: SegmentPoint[];
};

export function TypeHorizontalBarChart({ title, data }: TypeHorizontalBarChartProps) {
  const maxValue = Math.max(...data.map((item) => item.value));

  return (
    <section className="t1-type-chart">
      <h3 className="t1-chart-title">{title}</h3>
      <div className="t1-hbar-area">
        {data.map((item) => (
          <div className="t1-hbar-row" key={item.label}>
            <span className="t1-hbar-label">{item.label}</span>
            <div className="t1-hbar-track">
              <div
                className="t1-hbar-fill"
                style={{ width: `${Math.max(7, (item.value / maxValue) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
