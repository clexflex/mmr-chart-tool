import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const projectRoot = process.cwd();

function readProjectFile(path: string) {
  return readFileSync(resolve(projectRoot, path), "utf8");
}

test("standalone smr exports resolve from preview canvas sizes instead of larger hard-coded export sizes", () => {
  const smrPage = readProjectFile("app/smr/page.tsx");

  assert.match(smrPage, /function resolveExportCanvasSize/);
  assert.match(smrPage, /const exportCanvasSize = resolveExportCanvasSize\(kind, canvasSizes\);/);
  assert.match(smrPage, /width: resolveExportCanvasSize\(kind, canvasSizes\)\.width/);
  assert.match(smrPage, /height: resolveExportCanvasSize\(kind, canvasSizes\)\.height/);
  assert.doesNotMatch(smrPage, /const exportCanvasSize = EXPORT_CANVAS_SIZES\[kind\];/);
});
