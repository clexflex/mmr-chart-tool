"use client";

import { useState, type ClipboardEvent } from "react";
import { ToolNav } from "@/components/layout/ToolNav";
import { convertWordTable, type ConversionResult } from "@/lib/wordtohtml/convertTable";

export default function WordToHtmlPage() {
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [source, setSource] = useState("");
  const [message, setMessage] = useState("Paste a copied Word table in the box below.");
  const [copied, setCopied] = useState<"html" | "wordpress" | null>(null);

  function convert(html: string, text: string) {
    try {
      const next = convertWordTable(html, text);
      setResult(next);
      setMessage(`${next.tableCount} table${next.tableCount === 1 ? "" : "s"}, ${next.rowCount} rows, ${next.cellCount} cells converted.`);
      setCopied(null);
    } catch (error) {
      setResult(null);
      setMessage(error instanceof Error ? error.message : "The table could not be converted.");
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLTextAreaElement>) {
    event.preventDefault();
    const html = event.clipboardData.getData("text/html");
    const text = event.clipboardData.getData("text/plain");
    setSource(html || text);
    convert(html, text);
  }

  async function copyHtml(format: "html" | "wordpress") {
    if (!result) return;
    try {
      const value = format === "wordpress" ? `<!-- wp:html -->\n${result.html}\n<!-- /wp:html -->` : result.html;
      await navigator.clipboard.writeText(value);
      setCopied(format);
    } catch {
      setMessage("Copy failed. Select the HTML below and copy it manually.");
    }
  }

  return <div className="word-page">
    <header className="word-header">
      <div><span className="ms-toolbar-label">MMR Tools</span><h1>Word table to HTML</h1></div>
      <ToolNav />
    </header>
    <main className="word-layout">
      <section className="word-panel">
        <h2>Input table</h2>
        <p>Copy a table in Word and paste it here. You can also paste HTML or tab-separated rows.</p>
        <label htmlFor="word-source">Word table or HTML</label>
        <textarea id="word-source" value={source} onChange={(event) => setSource(event.target.value)} onPaste={handlePaste} placeholder="Paste a Word table here…" />
        <div className="word-actions">
          <button type="button" onClick={() => convert(source, source)}>Convert input</button>
          <button type="button" className="word-secondary" onClick={() => { setSource(""); setResult(null); setMessage("Paste a copied Word table in the box below."); }}>Clear</button>
        </div>
        <p role="status" className="word-status">{message}</p>
      </section>
      <section className="word-panel">
        <div className="word-panel-heading"><h2>HTML table</h2><div className="word-actions"><button type="button" onClick={() => void copyHtml("html")} disabled={!result}>{copied === "html" ? "Copied" : "Copy HTML"}</button><button type="button" className="word-secondary" onClick={() => void copyHtml("wordpress")} disabled={!result}>{copied === "wordpress" ? "Copied" : "Copy WordPress block"}</button></div></div>
        <p>In WordPress, use <strong>Copy HTML</strong> for a <strong>Custom HTML</strong> block (/html), or <strong>Copy WordPress block</strong> for the editor’s Code editor. A Code block displays markup as text.</p>
        <div className="word-preview" aria-label="Table preview">{result ? <div dangerouslySetInnerHTML={{ __html: result.html }} /> : <p>Your converted table will appear here.</p>}</div>
        <label htmlFor="word-output">HTML code</label>
        <textarea id="word-output" value={result?.html || ""} readOnly placeholder="HTML code will appear here…" />
      </section>
    </main>
  </div>;
}
