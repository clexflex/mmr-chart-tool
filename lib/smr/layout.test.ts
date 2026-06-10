import assert from "node:assert/strict";
import test from "node:test";
import {
  SMR_FIGURE_CARD_CHROME,
  fitStandaloneColumnLayout,
  fitStandalonePieLayout,
  fitStandaloneSideLegendPieLayout,
} from "./layout.ts";

test("fitStandalonePieLayout keeps standalone pies inside preview card bounds", () => {
  const result = fitStandalonePieLayout({
    width: 620,
    height: 300,
    requestedChartSize: 296,
    requestedPlotHeight: 256,
  });

  const availableWidth = 620 - SMR_FIGURE_CARD_CHROME.paddingX * 2 * result.scale;
  const availableHeight =
    300 -
    SMR_FIGURE_CARD_CHROME.paddingY * 2 * result.scale -
    SMR_FIGURE_CARD_CHROME.titleReserve * result.scale;

  assert.ok(result.shellSize <= 296);
  assert.ok(result.shellSize <= 256);
  assert.ok(result.shellSize <= availableHeight);
  assert.ok(result.legendColumns >= 1);
  assert.ok(result.legendItemWidth <= availableWidth);
});

test("fitStandalonePieLayout keeps standalone pies inside export card bounds", () => {
  const result = fitStandalonePieLayout({
    width: 1180,
    height: 344,
    requestedChartSize: 296,
    requestedPlotHeight: 256,
  });

  const availableWidth = 1180 - SMR_FIGURE_CARD_CHROME.paddingX * 2 * result.scale;
  const availableHeight =
    344 -
    SMR_FIGURE_CARD_CHROME.paddingY * 2 * result.scale -
    SMR_FIGURE_CARD_CHROME.titleReserve * result.scale;

  assert.ok(result.shellSize <= availableHeight);
  assert.ok(result.legendColumns >= 1);
  assert.ok(result.legendItemWidth <= availableWidth);
});

test("fitStandaloneSideLegendPieLayout keeps side-legend pies inside preview card bounds", () => {
  const result = fitStandaloneSideLegendPieLayout({
    width: 620,
    height: 300,
    requestedChartSize: 282,
    requestedPlotHeight: 240,
  });

  const availableWidth = 620 - SMR_FIGURE_CARD_CHROME.paddingX * 2 * result.scale;
  const availableHeight =
    300 -
    SMR_FIGURE_CARD_CHROME.paddingY * 2 * result.scale -
    SMR_FIGURE_CARD_CHROME.titleReserve * result.scale;

  assert.ok(result.shellSize <= 282);
  assert.ok(result.shellSize <= 240);
  assert.ok(result.shellSize <= availableHeight);
  assert.ok(result.groupWidth <= availableWidth);
});

test("fitStandaloneSideLegendPieLayout keeps side-legend pies inside export card bounds", () => {
  const result = fitStandaloneSideLegendPieLayout({
    width: 1118,
    height: 315,
    requestedChartSize: 282,
    requestedPlotHeight: 240,
  });

  const availableWidth = 1118 - SMR_FIGURE_CARD_CHROME.paddingX * 2 * result.scale;
  const availableHeight =
    315 -
    SMR_FIGURE_CARD_CHROME.paddingY * 2 * result.scale -
    SMR_FIGURE_CARD_CHROME.titleReserve * result.scale;

  assert.ok(result.shellSize <= availableHeight);
  assert.ok(result.groupWidth <= availableWidth);
});

test("fitStandaloneColumnLayout constrains width and height for preview cards", () => {
  const result = fitStandaloneColumnLayout({
    width: 620,
    height: 300,
    requestedChartSize: 760,
    requestedPlotHeight: 238,
  });

  const availableWidth = 620 - SMR_FIGURE_CARD_CHROME.paddingX * 2 * result.scale;
  const availableHeight =
    300 -
    SMR_FIGURE_CARD_CHROME.paddingY * 2 * result.scale -
    SMR_FIGURE_CARD_CHROME.titleReserve * result.scale;

  assert.ok(result.stageWidth <= 760);
  assert.ok(result.stageWidth <= availableWidth);
  assert.ok(result.stageHeight <= 238);
  assert.ok(result.stageHeight <= availableHeight);
});

test("fitStandaloneColumnLayout constrains width and height for export cards", () => {
  const result = fitStandaloneColumnLayout({
    width: 1214,
    height: 329,
    requestedChartSize: 760,
    requestedPlotHeight: 238,
  });

  const availableWidth = 1214 - SMR_FIGURE_CARD_CHROME.paddingX * 2 * result.scale;
  const availableHeight =
    329 -
    SMR_FIGURE_CARD_CHROME.paddingY * 2 * result.scale -
    SMR_FIGURE_CARD_CHROME.titleReserve * result.scale;

  assert.ok(result.stageWidth <= availableWidth);
  assert.ok(result.stageHeight <= availableHeight);
});
