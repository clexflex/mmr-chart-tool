import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const projectRoot = process.cwd();

function readProjectFile(path: string) {
  return readFileSync(resolve(projectRoot, path), "utf8");
}

test("market snapshot and smr exports use the updated webp quality and size caps", () => {
  const mainPage = readProjectFile("app/page.tsx");
  const smrPage = readProjectFile("app/smr/page.tsx");
  const exportHelper = readProjectFile("lib/export/downloadWebp.ts");
  const zipExport = readProjectFile("lib/smr/exportZip.ts");

  assert.match(exportHelper, /quality:\s*0\.85/);
  assert.match(exportHelper, /maxFileSizeKb:\s*45/);

  assert.match(mainPage, /quality:\s*0\.85/);
  assert.match(mainPage, /maxFileSizeKb:\s*45/);
  assert.match(mainPage, /maxFileSizeKb:\s*100/);

  assert.match(smrPage, /quality:\s*0\.85/);
  assert.match(smrPage, /maxFileSizeKb:\s*100/);

  assert.match(zipExport, /quality:\s*0\.85/);
  assert.match(zipExport, /maxFileSizeKb:\s*75/);
});

test("shared smr styles use tighter snapshot bars and larger standalone typography", () => {
  const globalsCss = readProjectFile("app/globals.css");

  const hbarChartRule = globalsCss.match(/\.smr-hbar-chart\s*\{[\s\S]*?\}/);
  const hbarTrackRule = globalsCss.match(/\.smr-hbar-track\s*\{[\s\S]*?\}/);

  assert.ok(hbarChartRule, "Expected .smr-hbar-chart rule");
  assert.ok(hbarTrackRule, "Expected .smr-hbar-track rule");
  assert.match(hbarChartRule[0], /gap:\s*calc\(18px \* var\(--smr-scale\)\);/);
  assert.match(hbarTrackRule[0], /height:\s*calc\(18px \* var\(--smr-scale\)\);/);
  assert.match(globalsCss, /\.smr-figure-title\s*\{[\s\S]*?font-size:\s*calc\(20px \* var\(--smr-scale\)\);[\s\S]*?\}/);
  assert.match(globalsCss, /\.smr-pie-legend-row\s*\{[\s\S]*?font-size:\s*calc\(16px \* var\(--smr-scale\)\);[\s\S]*?\}/);
});

test("main market snapshot horizontal bars keep gap and thickness aligned", () => {
  const horizontalBarChart = readProjectFile("components/template1/charts/TypeHorizontalBarChart.tsx");
  const mainPage = readProjectFile("app/page.tsx");

  assert.match(mainPage, /typeChart:\s*220,/);
  assert.match(horizontalBarChart, /const barThickness = 15;/);
  assert.match(horizontalBarChart, /const rowGap =/);
  assert.match(horizontalBarChart, /display: "grid",/);
  assert.match(horizontalBarChart, /rowGap,/);
  assert.match(horizontalBarChart, /gridTemplateRows: `repeat\(\$\{data\.length\}, \$\{barThickness\}px\)`,/);
  assert.match(horizontalBarChart, /style=\{\{ minHeight: barThickness, marginBottom: 0 \}\}/);
  assert.match(horizontalBarChart, /<div className="t1-hbar-track" style=\{\{ height: barThickness \}\}>/);
  assert.match(horizontalBarChart, /className="t1-hbar-fill"[\s\S]*?height: barThickness,/);
});
