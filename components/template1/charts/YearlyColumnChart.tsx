import type { YearPoint } from "@/lib/template1/types";

type YearlyColumnChartProps = {
  title: string;
  data: YearPoint[];
  unit: string;
};

export function YearlyColumnChart({ title, data, unit }: YearlyColumnChartProps) {
  const maxValue = Math.max(...data.map((item) => item.value));

  return (
    <section className="t1-yearly-chart">
      <h3 className="t1-chart-title t1-chart-title-center">{title}</h3>
      <div className="t1-yearly-plot-wrap">
        <div className="t1-yearly-plot">
          {data.map((point) => {
            const barHeight = Math.max(8, (point.value / maxValue) * 126);
            const shouldAnnotate = point.year === 2025 || point.year === 2032;

            return (
              <div className="t1-year-col" key={point.year}>
                <div className="t1-year-bar-shell">
                  <div className="t1-year-bar" style={{ height: `${barHeight}px` }}>
                    {shouldAnnotate ? (
                      <span className="t1-year-bar-label">
                        {formatNumber(point.value)} {compactUnit(unit)}
                      </span>
                    ) : null}
                  </div>
                </div>
                <span className="t1-year-label">{point.year}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function compactUnit(unit: string): string {
  return /billion|bn/i.test(unit) ? "Bn" : unit;
}

function formatNumber(value: number): string {
  return Number(value.toFixed(2)).toString();
}
