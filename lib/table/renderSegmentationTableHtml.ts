import { escapeHtml } from "@/lib/segments/parseIndentedHierarchy";
import type { ParsedSegmentNode, SegmentationTableViewModel, TableStyleMode } from "@/lib/template1/types";

export function renderSegmentationTableHtml(viewModel: SegmentationTableViewModel): string {
  if (viewModel.styleMode === "modern") {
    return renderModernTable(viewModel);
  }

  return renderLegacyTable(viewModel);
}

function renderLegacyTable(viewModel: SegmentationTableViewModel): string {
  const alternating = "background-color: #87cefa;";
  const title = escapeHtml(viewModel.marketTitle);
  const rows = viewModel.segmentRows;
  const rowspan = Math.max(1, rows.length);

  const coverageRows = [
    `<tr style="height: 13px; border: 1px solid black;"><th style="${alternating} color: black; height: 13px; border: 1px solid black;" colspan="4">${title}</th></tr>`,
    `<tr style="height: 13px; border: 1px solid black;"><td style="height: 13px; border: 1px solid black; text-align: left;"><strong>Report Coverage</strong></td><td style="height: 13px; border: 1px solid black; text-align: left;" colspan="3">Details</td></tr>`,
    `<tr style="height: 13px; ${alternating} border: 1px solid black;"><td style="height: 13px; border: 1px solid black; text-align: left;"><strong>Base Year:</strong></td><td style="height: 13px; border: 1px solid black; text-align: left;">${escapeHtml(String(viewModel.baseYear))}</td><td style="height: 13px; border: 1px solid black; text-align: left;"><strong>Forecast Period:</strong></td><td style="height: 13px; border: 1px solid black; text-align: left;">${escapeHtml(viewModel.forecastPeriod)}</td></tr>`,
    `<tr style="height: 13px;"><td style="height: 13px; border: 1px solid black; text-align: left;"><strong>Historical Data:</strong></td><td style="height: 13px; border: 1px solid black; text-align: left;">${escapeHtml(viewModel.historicalDataText)}</td><td style="height: 13px; border: 1px solid black; text-align: left;"><strong>Market Size in ${escapeHtml(String(viewModel.baseYear))}:</strong></td><td style="height: 13px; border: 1px solid black; text-align: left;">${escapeHtml(viewModel.marketSizeBase)}</td></tr>`,
    `<tr style="height: 13px; ${alternating} border: 1px solid black;"><td style="height: 13px; border: 1px solid black; text-align: left;"><strong>Forecast Period ${escapeHtml(viewModel.forecastPeriod)} CAGR:</strong></td><td style="height: 13px; border: 1px solid black; text-align: left;">${escapeHtml(viewModel.cagrText)}</td><td style="height: 13px; border: 1px solid black; text-align: left;"><strong>Market Size in 2032:</strong></td><td style="height: 13px; border: 1px solid black; text-align: left;">${escapeHtml(viewModel.marketSizeTarget)}</td></tr>`,
  ];

  const segmentRows = rows.length > 0 ? rows : [{ title: "-", nodes: [{ label: "-", depth: 0 }] }];

  const segmentHtml = segmentRows
    .map((row, index) => {
      const rowStyle = index % 2 === 1 ? `${alternating} border: 1px solid black;` : "border: 1px solid black;";
      const leftCell =
        index === 0
          ? `<td style="height: 13px; border: 1px solid black; text-align: left;" rowspan="${rowspan}"><strong>Segments Covered:</strong></td>`
          : "";

      return `<tr style="height: 13px; ${rowStyle}">${leftCell}<td style="height: 13px; border: 1px solid black; text-align: left;">${escapeHtml(withByPrefix(row.title))}</td><td style="height: 13px; border: 1px solid black; text-align: left;" colspan="2">${renderLegacyNodeLines(row.nodes)}</td></tr>`;
    })
    .join("");

  return `<table style="border: 1px solid black; border-collapse: collapse; width: 100%;"><tbody>${coverageRows.join("")}${segmentHtml}</tbody></table>`;
}

function renderLegacyNodeLines(nodes: ParsedSegmentNode[]): string {
  return nodes
    .map((node) => {
      const indent = "&nbsp;".repeat(node.depth * 4);
      const text = `${indent}${escapeHtml(node.label)}`;
      if (node.depth > 0) {
        return `<em>${text}</em>`;
      }
      return text;
    })
    .join("<br>");
}

function renderModernTable(viewModel: SegmentationTableViewModel): string {
  const segmentRows = viewModel.segmentRows.length > 0 ? viewModel.segmentRows : [{ title: "-", nodes: [{ label: "-", depth: 0 }] }];

  const detailRows = segmentRows
    .map(
      (row) => `<tr><td class="sgt-title">${escapeHtml(withByPrefix(row.title))}</td><td class="sgt-values">${renderModernNodeLines(row.nodes)}</td></tr>`
    )
    .join("");

  return `<table class="sgt-table-modern"><thead><tr><th colspan="2">${escapeHtml(viewModel.marketTitle)}</th></tr></thead><tbody><tr><td><strong>Base Year</strong></td><td>${escapeHtml(String(viewModel.baseYear))}</td></tr><tr><td><strong>Forecast Period</strong></td><td>${escapeHtml(viewModel.forecastPeriod)}</td></tr><tr><td><strong>Historical Data</strong></td><td>${escapeHtml(viewModel.historicalDataText)}</td></tr><tr><td><strong>Market Size in ${escapeHtml(String(viewModel.baseYear))}</strong></td><td>${escapeHtml(viewModel.marketSizeBase)}</td></tr><tr><td><strong>CAGR (${escapeHtml(viewModel.forecastPeriod)})</strong></td><td>${escapeHtml(viewModel.cagrText)}</td></tr><tr><td><strong>Market Size in 2032</strong></td><td>${escapeHtml(viewModel.marketSizeTarget)}</td></tr><tr><td class="sgt-covered" colspan="2"><strong>Segments Covered</strong></td></tr>${detailRows}</tbody></table>`;
}

function renderModernNodeLines(nodes: ParsedSegmentNode[]): string {
  return nodes
    .map((node) => {
      const pad = node.depth * 12;
      const fontStyle = node.depth > 0 ? "font-style: italic;" : "";
      return `<div style="padding-left:${pad}px;${fontStyle}">${escapeHtml(node.label)}</div>`;
    })
    .join("");
}

function withByPrefix(title: string): string {
  if (/^by\s+/i.test(title.trim())) {
    return title.trim();
  }

  return `by ${title.trim()}`;
}

export function tableStyleLabel(mode: TableStyleMode): string {
  return mode === "legacy" ? "Legacy" : "Modern";
}
