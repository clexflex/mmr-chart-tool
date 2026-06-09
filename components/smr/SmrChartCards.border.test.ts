import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const projectRoot = process.cwd();

function readProjectFile(path: string) {
  return readFileSync(resolve(projectRoot, path), "utf8");
}

test("standalone smr chart cards support borderless rendering by default", () => {
  const chartCards = readProjectFile("components/smr/SmrChartCards.tsx");
  const globalsCss = readProjectFile("app/globals.css");

  assert.match(chartCards, /showBorder\?: boolean/);
  assert.match(chartCards, /showBorder = false/);
  assert.match(chartCards, /smr-card smr-figure-card\$\{showBorder \? "" : " is-borderless"\}/);
  assert.match(globalsCss, /\.smr-figure-card\.is-borderless/);
});
