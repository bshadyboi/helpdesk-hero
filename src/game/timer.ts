/** Shared SLA timer math — paused across refresh via elapsedMs + timerAnchor. */
export interface TimerState {
  elapsedMs?: number | null;
  startReal?: number;
  timerAnchor?: number;
  phase: string;
}

export function activeElapsedMs(a: TimerState, now = Date.now()): number {
  if (a.elapsedMs == null) {
    if (a.startReal) return Math.max(0, now - a.startReal);
    return 0;
  }
  const anchor = a.timerAnchor ?? now;
  const base = a.elapsedMs;
  if (a.phase === "resolved") return base;
  return base + Math.max(0, now - anchor);
}

export function activeElapsedSeconds(a: TimerState, now = Date.now()): number {
  return Math.floor(activeElapsedMs(a, now) / 1000);
}
