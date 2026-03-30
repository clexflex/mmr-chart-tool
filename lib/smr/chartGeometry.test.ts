import assert from "node:assert/strict";
import test from "node:test";
import { SMR_COLUMN_LAYOUT_BOX, SMR_PIE_LAYOUT_BOX, buildSmrColumnSvgModel } from "./chartGeometry.ts";

test("pie geometry uses most of the square view box", () => {
  const horizontalPadding = SMR_PIE_LAYOUT_BOX.centerX - SMR_PIE_LAYOUT_BOX.radius;
  const verticalPadding = SMR_PIE_LAYOUT_BOX.centerY - SMR_PIE_LAYOUT_BOX.radius;

  assert.ok(horizontalPadding >= 14);
  assert.ok(verticalPadding >= 14);
  assert.ok(SMR_PIE_LAYOUT_BOX.radius * 2 <= SMR_PIE_LAYOUT_BOX.viewBoxSize * 0.9);
});

test("column geometry keeps bars close to the card edges", () => {
  const svgModel = buildSmrColumnSvgModel(
    [
      { label: "North America", value: 34 },
      { label: "Asia Pacific", value: 28 },
      { label: "Europe", value: 22 },
      { label: "South America", value: 16 },
    ],
    34
  );

  const firstBar = svgModel.items[0];
  const lastBar = svgModel.items.at(-1);

  assert.ok(firstBar);
  assert.ok(lastBar);
  assert.ok(SMR_COLUMN_LAYOUT_BOX.plotLeft >= 22);
  assert.ok(SMR_COLUMN_LAYOUT_BOX.viewBoxWidth - SMR_COLUMN_LAYOUT_BOX.plotRight >= 22);
  assert.ok(SMR_COLUMN_LAYOUT_BOX.plotBottom / SMR_COLUMN_LAYOUT_BOX.viewBoxHeight <= 0.76);
  assert.ok(firstBar.barX >= SMR_COLUMN_LAYOUT_BOX.plotLeft);
  assert.ok(lastBar.barX + lastBar.barWidth <= SMR_COLUMN_LAYOUT_BOX.plotRight);
  assert.ok(firstBar.barWidth <= 58);
});
