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
      let content = safeText;

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
