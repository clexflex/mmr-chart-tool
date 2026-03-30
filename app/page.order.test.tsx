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

test("maximize places standalone chart export controls inside advanced chart layout", () => {
  const html = renderToStaticMarkup(React.createElement(Home));
  const advancedLayoutIndex = html.indexOf("5. Advanced Chart Layout");
  const standaloneExportIndex = html.indexOf("Standalone chart exports");

  assert.notEqual(advancedLayoutIndex, -1, "advanced chart layout section should render");
  assert.notEqual(standaloneExportIndex, -1, "standalone chart export controls should render");
  assert.ok(advancedLayoutIndex < standaloneExportIndex, "standalone chart export controls should render inside the advanced chart layout section");
});

test("maximize uses compact preview canvases and larger hidden export canvases", () => {
  const html = renderToStaticMarkup(React.createElement(Home));

  assert.match(html, /width:620px;height:300px/);
  assert.match(html, /width:1118px;height:315px/);
  assert.match(html, /width:1180px;height:344px/);
  assert.match(html, /width:1214px;height:329px/);
});
