import assert from "node:assert/strict";
import test from "node:test";
import { RootHtml } from "./RootHtml";

test("RootLayout tolerates client-side html attribute injection during hydration", () => {
  const element = RootHtml({ children: <div>content</div> });

  assert.equal(element.type, "html");
  assert.equal(element.props.suppressHydrationWarning, true);
});
