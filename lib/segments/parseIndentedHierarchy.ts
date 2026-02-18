import type { ParsedSegmentNode } from "@/lib/template1/types";

const MAX_DEPTH = 4;

export function parseIndentedHierarchy(raw: string): ParsedSegmentNode[] {
  const lines = raw.split(/\r?\n/);
  const nodes: ParsedSegmentNode[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    const leadingMatch = line.match(/^[\t ]*/);
    const leading = leadingMatch?.[0] ?? "";
    const tabs = (leading.match(/\t/g) ?? []).length;
    const spaces = (leading.match(/ /g) ?? []).length;
    const depth = Math.min(MAX_DEPTH, tabs + Math.floor(spaces / 2));

    nodes.push({
      label: line.trim(),
      depth,
    });
  }

  return nodes;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
