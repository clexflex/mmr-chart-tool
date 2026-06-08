import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const projectRoot = process.cwd();

function readProjectFile(path: string) {
  return readFileSync(resolve(projectRoot, path), "utf8");
}

test("main builder, smr, and segmentation-toc are wired to 2034", () => {
  const mainPage = readProjectFile("app/page.tsx");
  const smrPage = readProjectFile("app/smr/page.tsx");
  const segmentationTocPage = readProjectFile("app/segmentation-toc/page.tsx");
  const deriveMarketSizes = readProjectFile("lib/market/deriveMarketSizes.ts");
  const templateTypes = readProjectFile("lib/template1/types.ts");
  const smrTypes = readProjectFile("lib/smr/types.ts");
  const template1Data = readProjectFile("lib/template1/generateData.ts");
  const template2Data = readProjectFile("lib/template2/generateData.ts");
  const template3Data = readProjectFile("lib/template3/generateData.ts");
  const template4Data = readProjectFile("lib/template4/generateData.ts");
  const marketSizeTable = readProjectFile("components/template3/MarketSizeTable.tsx");
  const yearlyChart = readProjectFile("components/template1/charts/YearlyColumnChart.tsx");
  const tableViewModel = readProjectFile("lib/table/buildSegmentationTableViewModel.ts");
  const tableHtml = readProjectFile("lib/table/renderSegmentationTableHtml.ts");
  const tocViewModel = readProjectFile("lib/toc/buildTocViewModel.ts");
  const smrData = readProjectFile("lib/smr/generateData.ts");

  assert.match(mainPage, /2026-2034/);
  assert.match(mainPage, /Size 2034/);
  assert.match(mainPage, /marketSize2034/);
  assert.match(mainPage, /is2034Overridden/);

  assert.match(smrPage, /2026-2034/);
  assert.match(smrPage, /Size 2034/);
  assert.match(smrPage, /marketSize2034/);
  assert.match(smrPage, /is2034Overridden/);

  assert.match(segmentationTocPage, /2026-2034/);
  assert.match(segmentationTocPage, /Size 2034/);
  assert.match(segmentationTocPage, /marketSize2034/);
  assert.match(segmentationTocPage, /is2034Overridden/);

  assert.match(deriveMarketSizes, /TARGET_2034 = 2034/);
  assert.match(deriveMarketSizes, /marketSize2034/);
  assert.match(templateTypes, /marketSize2034/);
  assert.match(templateTypes, /is2034Overridden/);
  assert.match(templateTypes, /value2034/);
  assert.match(smrTypes, /marketSize2034/);
  assert.match(smrTypes, /is2034Overridden/);

  assert.match(template1Data, /marketSize2034/);
  assert.match(template1Data, /\(2020-2034\)/);
  assert.match(template1Data, /year <= 2034/);
  assert.match(template2Data, /marketSize2034/);
  assert.match(template3Data, /marketSize2034/);
  assert.match(template4Data, /marketSize2034/);
  assert.match(marketSizeTable, /2034/);
  assert.match(yearlyChart, /point\.year === 2025 \|\| point\.year === 2034/);

  assert.match(tableViewModel, /marketSize2034/);
  assert.match(tableHtml, /Market Size in 2034/);
  assert.match(tocViewModel, /2025-2034/);
  assert.match(smrData, /Market Size in 2034/);
  assert.match(smrData, /marketSize2034/);
});
