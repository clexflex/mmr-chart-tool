"use client";

import Image from "next/image";
import { forwardRef, type CSSProperties } from "react";
import type { SmrSnapshotViewModel } from "@/lib/smr/types";

type SmrSnapshotCardProps = {
  viewModel: SmrSnapshotViewModel;
  width: number;
  height: number;
  backgroundColor: string;
  layout?: {
    barChartHeight: number;
    pieChartSize: number;
    ribbonMinHeight: number;
  };
};

const SNAPSHOT_COLORS = ["#4f7fb9", "#5684c0", "#5f8ccc", "#84a1d2", "#b0bdd3"];

export const SmrSnapshotCard = forwardRef<HTMLDivElement, SmrSnapshotCardProps>(function SmrSnapshotCard(
  { viewModel, width, height, backgroundColor, layout },
  ref
) {
  const displayBars = [...viewModel.barSeries].reverse();
  const maxBar = Math.max(...viewModel.barSeries.map((item) => item.value), 1);
  const scale = Math.min(1.02, Math.max(0.82, width / 900));
  const keyPlayersHeading = viewModel.marketTitle.trim().length > 32
    ? "Major Key Players in the Market"
    : `Major Key Players in the ${viewModel.marketTitle}`;
  const topRowHeight = Math.max(206, Math.min(Math.round(height * 0.38), 228));
  const topContentHeight = Math.max(148, topRowHeight - Math.round(52 * scale));
  const style = {
    width,
    height,
    backgroundColor,
    ["--smr-scale" as never]: scale,
    ["--smr-snapshot-bar-height" as never]: `${layout?.barChartHeight ?? 268}px`,
    ["--smr-snapshot-pie-size" as never]: `${layout?.pieChartSize ?? 300}px`,
    ["--smr-ribbon-min-height" as never]: `${layout?.ribbonMinHeight ?? 64}px`,
    ["--smr-snapshot-top-row-height" as never]: `${topRowHeight}px`,
    ["--smr-snapshot-top-content-height" as never]: `${topContentHeight}px`,
  } as CSSProperties;

  return (
    <div ref={ref} className="smr-card smr-snapshot-card" style={style}>
      <div className="smr-snapshot-header">
        <h1>{viewModel.marketTitle}</h1>
        <div className="smr-logo-wrap">
          <Image src="/Stellar-Market-Logo.png" alt="Stellar Market Research" width={226} height={86} priority />
        </div>
      </div>

      <div className="smr-snapshot-body">
        <div className="smr-snapshot-top-row">
          <h2 className="smr-section-title smr-snapshot-top-title">{viewModel.barTitle}</h2>
          <div className="smr-snapshot-top-spacer" aria-hidden />

          <section className="smr-snapshot-bar-panel">
            <div className="smr-hbar-chart">
              {displayBars.map((item, index) => (
                <div className="smr-hbar-row" key={`${item.label}-${index}`}>
                  <span className="smr-hbar-label" title={item.label}>
                    {item.label}
                  </span>
                  <div className="smr-hbar-track">
                    <div
                      className="smr-hbar-fill"
                      style={{
                        width: `${(item.value / maxBar) * 100}%`,
                        backgroundColor: SNAPSHOT_COLORS[Math.max(0, SNAPSHOT_COLORS.length - 1 - index)],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="smr-ribbon-stack">
            {viewModel.ribbons.map((ribbon, index) => (
              <div className={`smr-ribbon smr-ribbon-${index % 2 === 0 ? "dark" : "light"}`} key={ribbon.id}>
                <span>{ribbon.text}</span>
              </div>
            ))}
          </section>
        </div>

        <div className="smr-snapshot-bottom-row">
          <section className="smr-key-player-panel">
            <h2 className="smr-section-title">{keyPlayersHeading}</h2>
            <div className="smr-key-player-columns">
              {viewModel.keyPlayerColumns.map((column, columnIndex) => (
                <ul key={`col-${columnIndex}`}>
                  {column.map((player) => (
                    <li key={player} title={player}>
                      {player}
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </section>

          <section className="smr-snapshot-pie-panel">
            <h2 className="smr-section-title">{viewModel.pieTitle}</h2>
            <div className="smr-snapshot-pie-layout">
              <svg viewBox="0 0 380 320" className="smr-chart-svg" aria-hidden>
                {renderPieSlices(viewModel.pieSeries, 150, 160, 118)}
              </svg>

              <div className="smr-snapshot-legend">
                {viewModel.pieSeries.map((item, index) => (
                  <div className="smr-snapshot-legend-row" key={`${item.label}-${index}`}>
                    <span className="smr-snapshot-legend-swatch" style={{ backgroundColor: SNAPSHOT_COLORS[index % SNAPSHOT_COLORS.length] }} />
                    <span className="smr-snapshot-legend-text" title={item.label}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
});

function renderPieSlices(series: SmrSnapshotViewModel["pieSeries"], cx: number, cy: number, radius: number) {
  let startAngle = -90;

  return series.map((item, index) => {
    const sliceAngle = (item.value / 100) * 360;
    const endAngle = startAngle + sliceAngle;
    const path = describeArcSlice(cx, cy, radius, startAngle, endAngle);
    startAngle = endAngle;

    return (
      <path
        key={`${item.label}-${index}`}
        d={path}
        fill={SNAPSHOT_COLORS[index % SNAPSHOT_COLORS.length]}
        stroke="#f4f5f7"
        strokeWidth="3"
      />
    );
  });
}


function describeArcSlice(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [`M ${cx} ${cy}`, `L ${start.x} ${start.y}`, `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`, "Z"].join(" ");
}

function polarToCartesian(cx: number, cy: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}
