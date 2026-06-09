import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const projectRoot = process.cwd();

function readProjectFile(path: string) {
  return readFileSync(resolve(projectRoot, path), "utf8");
}

test("smr standalone charts default to hidden borders and expose a toggle in advanced layout", () => {
  const smrPage = readProjectFile("app/smr/page.tsx");
  const chartCards = readProjectFile("components/smr/SmrChartCards.tsx");
  const globalsCss = readProjectFile("app/globals.css");

  assert.match(smrPage, /showStandaloneBorders/);
  assert.match(smrPage, /Show Borders/);
  assert.match(smrPage, /useState\(false\)/);
  assert.match(smrPage, /setShowStandaloneBorders\(false\)/);
  assert.match(smrPage, /smr-preview-frame borderless/);
  assert.match(smrPage, /showBorder=\{showStandaloneBorders\}/);

  assert.match(chartCards, /showBorder\?: boolean/);
  assert.match(chartCards, /showBorder = false/);
  assert.match(chartCards, /smr-figure-card\$\{showBorder \? "" : " is-borderless"\}/);

  assert.match(globalsCss, /\.smr-figure-card\.is-borderless/);
  assert.match(globalsCss, /\.smr-preview-frame\.borderless/);
});
