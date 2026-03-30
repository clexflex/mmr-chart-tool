import type { Metadata } from "next";
import { RootHtml } from "./RootHtml";
import "./globals.css";

export const metadata: Metadata = {
  title: "MMR Tools",
  description: "Generate MMR market snapshot template images, segmentation tables, and dynamic TOC HTML.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RootHtml>{children}</RootHtml>;
}
