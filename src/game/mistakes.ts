import type { Progress } from "./types";
import { scenarioById } from "./scenarios";

export interface MistakeTicket {
  scenarioId: string;
  title: string;
  category: string;
  csat: number;
  wrongPicks: number;
}

/** Lowest-CSAT tickets from history — for "replay my mistakes" practice. */
export function worstMistakes(progress: Progress, limit = 3): MistakeTicket[] {
  const seen = new Set<string>();
  const sorted = [...progress.history].sort((a, b) => a.csat - b.csat);
  const out: MistakeTicket[] = [];

  for (const h of sorted) {
    if (seen.has(h.scenarioId)) continue;
    seen.add(h.scenarioId);
    const s = scenarioById(h.scenarioId);
    out.push({
      scenarioId: h.scenarioId,
      title: s?.title ?? h.scenarioId,
      category: h.category,
      csat: h.csat,
      wrongPicks: h.wrongPicks,
    });
    if (out.length >= limit) break;
  }
  return out;
}
