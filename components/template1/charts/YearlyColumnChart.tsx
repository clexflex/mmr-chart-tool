import type { YearPoint } from "@/lib/template1/types";

type YearlyColumnChartProps = {
  title: string;
  data: YearPoint[];
  unit: string;
  plotHeight: number;
};

export function YearlyColumnChart({ title, data, unit, plotHeight }: YearlyColumnChartProps) {
  const maxValue = Math.max(...data.map((item) => item.value));

  return (
    <section className="t1-yearly-chart">
      <h3 className="t1-chart-title t1-chart-title-center">{title}</h3>
      <div className="t1-yearly-plot-wrap">
        <div className="t1-yearly-plot" style={{ height: plotHeight }}>
          {data.map((point) => {
            const barHeight = Math.max(8, (point.value / maxValue) * (plotHeight - 32));
            const shouldAnnotate = point.year === 2025 || point.year === 2032;
            const showAboveBar = shouldAnnotate && barHeight < 40;
            const labelStyle = showAboveBar
              ? {
                  left: "50%",
                  bottom: "calc(100% + 4px)",
                  transform: "translateX(-50%)",
                }
              : {
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%) rotate(-90deg)",
                  transformOrigin: "center",
                };

            return (
              <div className="t1-year-col" key={point.year}>
                <div className="t1-year-bar-shell" style={{ height: plotHeight - 32 }}>
                  <div className="t1-year-bar" style={{ height: `${barHeight}px` }}>
                    {shouldAnnotate ? (
                      <span className="t1-year-bar-label" style={labelStyle}>
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
