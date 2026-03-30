import assert from "node:assert/strict";
import test from "node:test";
import {
  buildMaximizeChartOutputViewModels,
  defaultMaximizeChartOutputMapping,
} from "./chartOutputs.ts";

test("buildMaximizeChartOutputViewModels derives standalone chart cards from mapped segments", () => {
  const mapping = defaultMaximizeChartOutputMapping("region", "type", "application");
  const result = buildMaximizeChartOutputViewModels({
    marketTitle: "Global Market",
    unit: "USD Billion",
    marketSize2025: 12,
    segmentRows: [
      {
        id: "region",
        title: "Region",
        includeInTable: false,
        linesRaw: "Asia Pacific\nNorth America\nEurope\nMiddle East and Africa\nSouth America",
      },
      {
        id: "type",
        title: "Type",
        includeInTable: true,
        linesRaw: "Type1\nType2\nType3\nType4\nType5\nType6",
      },
      {
        id: "application",
        title: "Application",
        includeInTable: true,
        linesRaw: "Application1\nApplication2\nApplication3\nApplication4\nApplication5",
      },
    ],
    mapping,
  });

  assert.equal(result.donut.sourceTitle, "Type");
  assert.equal(result.pie3d.sourceTitle, "Region");
  assert.equal(result.pie2d.sourceTitle, "Application");
  assert.equal(result.column.sourceTitle, "Type");
  assert.equal(result.donut.series.length, 5);
  assert.equal(result.column.series.length, 4);
  assert.equal(result.donut.truncated, true);
  assert.equal(result.column.truncated, true);
  assert.ok(result.column.series[0].value > result.column.series[1].value);
  assert.ok(result.notes.some((note) => note.includes("Donut chart")));
});
