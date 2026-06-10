import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const projectRoot = process.cwd();

function readProjectFile(path: string) {
  return readFileSync(resolve(projectRoot, path), "utf8");
}

test("standalone donut chart uses the side-legend layout path", () => {
  const chartCards = readProjectFile("components/smr/SmrChartCards.tsx");
  const donutBlock = chartCards.match(/export const SmrDonutCard[\s\S]*?export const SmrPie3DCard/)?.[0] ?? "";

  assert.match(donutBlock, /export const SmrDonutCard/);
  assert.match(donutBlock, /const fitted = fitStandaloneSideLegendPieLayout\(/);
  assert.match(donutBlock, /<div className="smr-side-pie-layout">/);
  assert.match(donutBlock, /<PieLegend series=\{viewModel\.series\} \/>/);
  assert.doesNotMatch(donutBlock, /<PieLegend series=\{viewModel\.series\} inline \/>/);
});
