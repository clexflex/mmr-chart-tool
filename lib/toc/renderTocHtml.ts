import { escapeHtml } from "@/lib/segments/parseIndentedHierarchy";
import type { TocViewModel } from "@/lib/toc/buildTocViewModel";

export function renderTocHtml(viewModel: TocViewModel): string {
  const linesHtml = viewModel.lines
    .map((line) => {
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
    })
    .join("");

  return `<div class="toc-document">${linesHtml}</div>`;
}
