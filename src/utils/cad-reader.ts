import { detectPaperFormat, getFileDimensions, mmToPx } from "./cadDimensions";

export type PaperFormat = "A0" | "A1" | "A2" | "A3" | "A4" | "custom";

export interface Dimensions {
  w: number;
  h: number;
  format: PaperFormat;
  widthPx: number;
  heightPx: number;
  filename: string;
  orientation: "landscape" | "portrait";
  source: "file" | "filename" | "default";
  confidence: "high" | "medium" | "low";
}

const DEFAULT_DPI = 300;

/**
 * Read dimensions for CAD inputs (PDF/JPG/PNG/SVG) with filename fallback.
 * Returns ISO A0-A4 or custom, with karta A3 (420×320mm) supported.
 */
export async function readFile(file: File, dpi: number = DEFAULT_DPI): Promise<Dimensions> {
  const dims = await getFileDimensions(file, dpi);
  return {
    w: dims.widthMm,
    h: dims.heightMm,
    format: dims.format,
    widthPx: dims.widthPx,
    heightPx: dims.heightPx,
    filename: dims.filename,
    orientation: dims.orientation,
    source: dims.source,
    confidence: dims.confidence,
  };
}

/**
 * Detect format from dimensions with optional DPI context.
 * Uses ISO A0-A4 + karta A3 rules from cadDimensions.
 */
export function detectSize(w: number, h: number): Dimensions {
  const format = detectPaperFormat(w, h);
  const orientation = w > h ? "landscape" : "portrait";
  return {
    w,
    h,
    format,
    widthPx: mmToPx(w, DEFAULT_DPI),
    heightPx: mmToPx(h, DEFAULT_DPI),
    filename: "",
    orientation,
    source: "default",
    confidence: "low",
  };
}
