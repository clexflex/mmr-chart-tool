const TABLE_STYLE = "border: 1px solid black; border-collapse: collapse; width: 100%;";
const CELL_STYLE = "height: 13px; border: 1px solid black; text-align: left; padding: 5px;";
const HEADER_STYLE = "background-color: #87cefa; color: black; height: 13px; border: 1px solid black; padding: 10px 5px;";
const INLINE_TAGS = new Set(["STRONG", "B", "EM", "I", "U", "S", "SUB", "SUP", "CODE", "BR"]);

export type ConversionResult = { html: string; tableCount: number; rowCount: number; cellCount: number };

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function safeUrl(value: string): string | null {
  const url = value.trim();
  return /^(https?:|mailto:|#)/i.test(url) ? url : null;
}

type Stats = Omit<ConversionResult, "html">;

function renderContents(node: Node, stats: Stats): string {
  return Array.from(node.childNodes).map((child) => renderNode(child, stats)).join("");
}

function renderNode(node: Node, stats: Stats): string {
  if (node.nodeType === Node.TEXT_NODE) return escapeHtml(node.textContent || "");
  if (node.nodeType !== Node.ELEMENT_NODE) return "";
  const element = node as HTMLElement;
  if (element.matches("script,style,meta,link,xml")) return "";
  if (element.tagName === "TABLE") return renderTable(element as HTMLTableElement, stats);
  if (element.tagName === "BR") return "<br>";
  const content = renderContents(element, stats);
  const style = element.getAttribute("style") || "";
  const decorations = [
    /font-weight\s*:\s*(bold|[6-9]00)/i.test(style) ? "strong" : "",
    /font-style\s*:\s*italic/i.test(style) ? "em" : "",
    /text-decoration(?:-line)?\s*:\s*underline/i.test(style) ? "u" : "",
  ].filter(Boolean);
  const styled = decorations.reduce((value, tag) => `<${tag}>${value}</${tag}>`, content);
  if (element.tagName === "A") {
    const href = safeUrl(element.getAttribute("href") || "");
    return href ? `<a href="${escapeHtml(href)}">${styled}</a>` : styled;
  }
  if (element.tagName === "P" || element.tagName === "DIV") return `${styled}<br>`;
  if (element.tagName === "LI") return `• ${styled}<br>`;
  if (INLINE_TAGS.has(element.tagName)) {
    const tag = element.tagName.toLowerCase();
    return `<${tag}>${styled}</${tag}>`;
  }
  return styled;
}

function directRows(table: HTMLTableElement): HTMLTableRowElement[] {
  return Array.from(table.children).flatMap((child) =>
    child.tagName === "TR"
      ? [child as HTMLTableRowElement]
      : ["THEAD", "TBODY", "TFOOT"].includes(child.tagName)
        ? Array.from(child.children).filter((row): row is HTMLTableRowElement => row.tagName === "TR")
        : []
  );
}

function renderTable(table: HTMLTableElement, stats: Stats): string {
  stats.tableCount++;
  const rows = directRows(table);
  stats.rowCount += rows.length;
  const body = rows.map((row, rowIndex) => {
    const cells = Array.from(row.children).filter((child): child is HTMLTableCellElement => child.tagName === "TD" || child.tagName === "TH");
    stats.cellCount += cells.length;
    const rowStyle = `height: 13px; ${rowIndex > 0 && rowIndex % 2 === 0 ? "background-color: #87cefa; " : ""}border: 1px solid black;`;
    return `<tr style="${rowStyle}">${cells.map((cell) => {
      const tag = rowIndex === 0 ? "th" : cell.tagName.toLowerCase();
      const colspan = Math.max(1, cell.colSpan || 1);
      const rowspan = cell.hasAttribute("rowspan") && cell.rowSpan === 0 ? 0 : Math.max(1, cell.rowSpan || 1);
      const attrs = `${colspan > 1 ? ` colspan="${colspan}"` : ""}${rowspan === 0 || rowspan > 1 ? ` rowspan="${rowspan}"` : ""}`;
      const align = /text-align\s*:\s*(center|right|justify)/i.exec(cell.getAttribute("style") || "")?.[1];
      const content = renderContents(cell, stats).replace(/(?:<br>)+$/, "") || "&nbsp;";
      const style = `${rowIndex === 0 ? HEADER_STYLE : CELL_STYLE}${align ? ` text-align: ${align};` : ""}`;
      return `<${tag}${attrs} style="${style}">${content}</${tag}>`;
    }).join("")}</tr>`;
  }).join("");
  return `<table style="${TABLE_STYLE}"><tbody>${body}</tbody></table>`;
}

export function convertWordTable(html: string, plainText = ""): ConversionResult {
  const stats = { tableCount: 0, rowCount: 0, cellCount: 0 };
  const source = html.trim();
  if (source) {
    const doc = new DOMParser().parseFromString(source, "text/html");
    const tables = Array.from(doc.querySelectorAll("table")).filter((table) => !table.parentElement?.closest("table"));
    if (tables.length) return { html: tables.map((table) => renderTable(table, stats)).join("\n"), ...stats };
  }
  const text = plainText || (!source.includes("<") ? source : "");
  if (!text.trim()) throw new Error("Paste a Word table or tab-separated rows to convert.");
  const rows = text.replace(/\r\n?/g, "\n").replace(/\n$/, "").split("\n").map((row) => row.split("\t"));
  if (!rows.some((row) => row.length > 1)) throw new Error("No table found. Copy the table in Word, then paste it here.");
  const table = document.createElement("table");
  const tbody = table.createTBody();
  rows.forEach((row) => {
    const tr = tbody.insertRow();
    row.forEach((value) => { tr.insertCell().textContent = value; });
  });
  return { html: renderTable(table, stats), ...stats };
}
