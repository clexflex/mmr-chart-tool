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

  assert.match(
    globalsCss,
    /\.smr-hbar-chart\s*\{[\s\S]*?gap:\s*calc\(6px \* var\(--smr-scale\)\);[\s\S]*?\}/
  );
  assert.match(globalsCss, /\.smr-hbar-track\s*\{[\s\S]*?height:\s*calc\(26px \* var\(--smr-scale\)\);[\s\S]*?\}/);
  assert.match(globalsCss, /\.smr-figure-title\s*\{[\s\S]*?font-size:\s*calc\(20px \* var\(--smr-scale\)\);[\s\S]*?\}/);
  assert.match(globalsCss, /\.smr-pie-legend-row\s*\{[\s\S]*?font-size:\s*calc\(16px \* var\(--smr-scale\)\);[\s\S]*?\}/);
});
