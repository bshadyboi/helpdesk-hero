import type { Category, CategoryStat, Scenario } from "./types";
import { SCENARIOS } from "./scenarios";

/** Categories with the lowest average CSAT — used to weight the live queue. */
export function weakCategories(
  stats: Partial<Record<Category, CategoryStat>>,
  limit = 2
): Category[] {
  const rows = (Object.keys(stats) as Category[])
    .map((c) => {
      const s = stats[c];
      if (!s || s.resolved < 1) return null;
      return { category: c, avg: s.csatSum / s.resolved };
    })
    .filter((r): r is { category: Category; avg: number } => r !== null);

  if (rows.length === 0) return [];
  rows.sort((a, b) => a.avg - b.avg);
  return rows.slice(0, limit).map((r) => r.category);
}

/** Pick a scenario, biasing ~65% toward weak categories once the player has history. */
export function pickAdaptiveScenario(
  level: number,
  excludeIds: string[],
  categoryStats: Partial<Record<Category, CategoryStat>> | undefined
): Scenario {
  const available = SCENARIOS.filter((s) => s.minLevel <= level);
  const fresh = available.filter((s) => !excludeIds.includes(s.id));
  const pool = fresh.length ? fresh : available.length ? available : SCENARIOS;

  const weak = weakCategories(categoryStats ?? {});
  if (weak.length === 0) {
    return pool[Math.floor(Math.random() * pool.length)];
  }

  const weakPool = pool.filter((s) => weak.includes(s.category));
  const useWeak = weakPool.length > 0 && Math.random() < 0.65;
  const finalPool = useWeak ? weakPool : pool;
  return finalPool[Math.floor(Math.random() * finalPool.length)];
}
