import { toCanvas } from "html-to-image";
import type { ExportOptions } from "@/lib/template1/types";

const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  fileName: "market-snapshot-template1.webp",
  pixelRatio: 1,
  quality: 0.85,
  format: "image/webp",
  maxFileSizeKb: 45,
};

export async function downloadElementAsWebp(
  element: HTMLElement,
  options?: Partial<ExportOptions> & { width?: number; height?: number }
): Promise<void> {
  const config = { ...DEFAULT_EXPORT_OPTIONS, ...options };
  const blob = await elementToWebpBlob(element, options);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = config.fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export async function elementToWebpBlob(
  element: HTMLElement,
  options?: Partial<ExportOptions> & { width?: number; height?: number }
): Promise<Blob> {
  const config = { ...DEFAULT_EXPORT_OPTIONS, ...options };
  const width = options?.width ?? Math.round(element.getBoundingClientRect().width);
  const height = options?.height ?? Math.round(element.getBoundingClientRect().height);

  const canvas = await toCanvas(element, {
    pixelRatio: config.pixelRatio,
    width,
    height,
    cacheBust: true,
  });

  let blob = await canvasToBlob(canvas, config.format, config.quality);
  const maxBytes = (config.maxFileSizeKb ?? 45) * 1024;

  if (blob.size > maxBytes) {
    const qualitySteps = [0.72, 0.68, 0.64, 0.6, 0.56, 0.52, 0.48, 0.44, 0.4];
    for (const quality of qualitySteps) {
      const candidate = await canvasToBlob(canvas, config.format, quality);
      blob = candidate;
      if (candidate.size <= maxBytes) {
        break;
      }
    }
  }

  return blob;
}

function canvasToBlob(canvas: HTMLCanvasElement, format: string, quality: number): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (!result) {
          reject(new Error("Unable to generate WebP blob."));
          return;
        }
        resolve(result);
      },
      format,
      quality
    );
  });
}
