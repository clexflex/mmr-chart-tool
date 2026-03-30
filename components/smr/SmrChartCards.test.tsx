import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SmrDonutCard, SmrPie2DCard, SmrPie3DCard } from "./SmrChartCards";

const viewModel = {
  marketTitle: "Global Market",
  chartTitle: "Global Market Share, by Application in 2025 (%)",
  unitShort: "%",
  sourceTitle: "Application",
  truncated: false,
  series: [
    { label: "Application1", value: 28 },
    { label: "Application2", value: 22 },
    { label: "Application3", value: 21 },
    { label: "Application4", value: 18 },
    { label: "Application5", value: 11 },
  ],
};

test("region pie card renders as a flat pie with side legend", () => {
  const html = renderToStaticMarkup(
    <SmrPie3DCard viewModel={viewModel} width={600} height={300} backgroundColor="#ffffff" layout={{ chartSize: 260, plotHeight: 220 }} />
  );

  assert.match(html, /smr-flat-pie-layout/);
  assert.match(html, /smr-pie-shell/);
  assert.doesNotMatch(html, /smr-pie3d-layout/);
  assert.doesNotMatch(html, /smr-pie-legend is-inline/);
});

test("donut and flat pie cards keep the side legend layout", () => {
  const donutHtml = renderToStaticMarkup(
    <SmrDonutCard viewModel={viewModel} width={600} height={300} backgroundColor="#ffffff" layout={{ chartSize: 260, plotHeight: 220 }} />
  );
  const pie2dHtml = renderToStaticMarkup(
    <SmrPie2DCard viewModel={viewModel} width={600} height={300} backgroundColor="#ffffff" layout={{ chartSize: 260, plotHeight: 220 }} />
  );

  assert.match(donutHtml, /smr-donut-layout/);
  assert.doesNotMatch(donutHtml, /smr-pie-legend is-inline/);
  assert.match(pie2dHtml, /smr-flat-pie-layout/);
  assert.doesNotMatch(pie2dHtml, /smr-pie-legend is-inline/);
});
