import { toCanvas } from "html-to-image";
import type { ExportOptions } from "@/lib/template1/types";

const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  fileName: "market-snapshot-template1.webp",
  pixelRatio: 2,
  quality: 0.95,
  format: "image/webp",
};

export async function downloadElementAsWebp(
  element: HTMLElement,
  options?: Partial<ExportOptions>
): Promise<void> {
  const config = { ...DEFAULT_EXPORT_OPTIONS, ...options };

  const canvas = await toCanvas(element, {
    pixelRatio: config.pixelRatio,
    cacheBust: true,
    backgroundColor: "#e7e7e7",
  });

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (!result) {
          reject(new Error("Unable to generate WebP blob."));
          return;
        }
        resolve(result);
      },
      config.format,
      config.quality
    );
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = config.fileName;
  link.click();
  URL.revokeObjectURL(url);
}
