import type { Progress } from "./types";

export const SAVE_VERSION = 1;

export interface ExportBundle {
  version: number;
  exportedAt: number;
  progress: Progress;
}

export function exportProgressData(progress: Progress): string {
  const bundle: ExportBundle = {
    version: SAVE_VERSION,
    exportedAt: Date.now(),
    progress,
  };
  return JSON.stringify(bundle, null, 2);
}

export function importProgressData(raw: string): Progress | null {
  try {
    const parsed = JSON.parse(raw) as Partial<ExportBundle & Progress>;
    if (parsed.version && parsed.progress && typeof parsed.progress === "object") {
      return parsed.progress;
    }
    if (typeof parsed.xp === "number") {
      return parsed as Progress;
    }
    return null;
  } catch {
    return null;
  }
}
