import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Home from "./page";

test("maximize places standalone charts after TOC preview", () => {
  const html = renderToStaticMarkup(React.createElement(Home));
  const tocIndex = html.indexOf('class="toc-preview"');
  const chartSectionIndex = html.indexOf("ms-chart-output-section");

  assert.notEqual(tocIndex, -1, "TOC preview should render");
  assert.notEqual(chartSectionIndex, -1, "standalone chart section should render");
  assert.ok(tocIndex < chartSectionIndex, "standalone charts should render after TOC preview");
});
