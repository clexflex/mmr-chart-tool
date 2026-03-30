import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import SmrPage from "./page";

test("smr uses compact preview canvases and larger hidden export canvases", () => {
  const html = renderToStaticMarkup(React.createElement(SmrPage));

  assert.match(html, /width:620px;height:300px/);
  assert.match(html, /width:1118px;height:315px/);
  assert.match(html, /width:1180px;height:344px/);
  assert.match(html, /width:1214px;height:329px/);
});
