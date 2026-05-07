import { escapeHtml } from "@/lib/segments/parseIndentedHierarchy";
import type { TocLine, TocViewModel } from "@/lib/toc/buildTocViewModel";

export function renderTocHtml(viewModel: TocViewModel): string {
  return renderTocCopyHtml(viewModel.lines);
}

export function renderTocPreviewHtml(viewModel: TocViewModel): string {
  const linesHtml = viewModel.lines.map((line) => renderPreviewLine(line)).join("");
  return `<div class="toc-document">${linesHtml}</div>`;
}

function renderTocCopyHtml(lines: TocLine[]): string {
  return lines
    .map((line) => {
      if (line.spacer) {
        return "<br>";
      }

      const safeText = escapeHtml(line.text);
      const indent = buildNestedIndent(line.text);
      let content = `${indent}${safeText}`;

      if (line.italic) {
        content = `<em>${content}</em>`;
      }

      if (line.strong) {
        content = `<strong>${content}</strong>`;
      }

      return `${content}<br>`;
    })
    .join("");
}

function renderPreviewLine(line: TocLine): string {
  if (line.spacer) {
    return `<div class="toc-spacer"></div>`;
  }

  const safeText = escapeHtml(line.text);
  let content = safeText;

  if (line.italic) {
    content = `<em>${content}</em>`;
  }

  if (line.strong) {
    content = `<strong>${content}</strong>`;
  }

  return `<div class="toc-line">${content}</div>`;
}

function buildNestedIndent(lineText: string): string {
  const level = extractNumberingLevel(lineText);
  if (level <= 2) {
    return "";
  }

  const indentLevel = level - 2;
  return "&nbsp;".repeat(indentLevel * 4);
}

function extractNumberingLevel(lineText: string): number {
  const numbering = lineText.match(/^(\d+(?:\.\d+)*\.?)/)?.[1];
  if (!numbering) return 0;
  const cleaned = numbering.replace(/\.$/, "");
  if (!cleaned) return 0;
  return cleaned.split(".").length;
}
