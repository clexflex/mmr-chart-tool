import JSZip from "jszip";
import { elementToWebpBlob } from "@/lib/export/downloadWebp";
import type { SmrOutputKind } from "@/lib/smr/types";

type ZipEntry = {
  kind: SmrOutputKind;
  element: HTMLElement;
  fileName: string;
  width: number;
  height: number;
};

export async function downloadSmrZip(entries: ZipEntry[], archiveName = "smr-snapshot-assets.zip"): Promise<void> {
  const zip = new JSZip();

  for (const entry of entries) {
    const blob = await elementToWebpBlob(entry.element, {
      fileName: entry.fileName,
      pixelRatio: 1,
      quality: 0.85,
      format: "image/webp",
      maxFileSizeKb: 75,
      width: entry.width,
      height: entry.height,
    });

    zip.file(entry.fileName, blob);
  }

  const archive = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(archive);
  const link = document.createElement("a");
  link.href = url;
  link.download = archiveName;
  link.click();
  URL.revokeObjectURL(url);
}
