import type { Mood } from "./types";

export type AgingLevel = 0 | 1 | 2 | 3;

export interface AgingInfo {
  level: AgingLevel;
  waitSeconds: number;
  label: string;
  csatPenalty: number;
}

const LABELS = ["On time", "Waiting", "Impatient", "Escalating"] as const;
const PENALTIES: Record<AgingLevel, number> = { 0: 0, 1: -5, 2: -10, 3: -15 };

/** How long a ticket has sat in the queue and how angry the client is getting. */
export function queueAgingInfo(arrivedAtReal: number, now = Date.now()): AgingInfo {
  const waitSeconds = Math.max(0, Math.floor((now - arrivedAtReal) / 1000));
  let level: AgingLevel = 0;
  if (waitSeconds >= 180) level = 3;
  else if (waitSeconds >= 120) level = 2;
  else if (waitSeconds >= 60) level = 1;
  return {
    level,
    waitSeconds,
    label: LABELS[level],
    csatPenalty: PENALTIES[level],
  };
}

const MOOD_ORDER: Mood[] = ["friendly", "calm", "confused", "annoyed", "panicked"];

/** Bump mood when a ticket waited too long before being picked up. */
export function escalatedMood(mood: Mood, level: AgingLevel): Mood {
  if (level < 2) return mood;
  const idx = MOOD_ORDER.indexOf(mood);
  const bump = level === 2 ? 1 : 2;
  return MOOD_ORDER[Math.min(MOOD_ORDER.length - 1, idx + bump)];
}

export function formatWait(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s ? `${m}m ${s}s` : `${m}m`;
}
