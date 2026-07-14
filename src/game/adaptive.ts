import type { Category, CategoryStat, Scenario } from "./types";
import { SCENARIOS } from "./scenarios";

export type ShiftType = "day" | "night";

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

function nightPool(pool: Scenario[]): Scenario[] {
  const biased = pool.filter(
    (s) =>
      s.category === "Security" ||
      s.difficulty >= 4 ||
      s.tier === "Priority" ||
      s.tier === "VIP" ||
      s.tier === "Executive"
  );
  return biased.length ? biased : pool;
}

/** Pick a scenario, biasing toward weak categories and optional night-shift mix. */
export function pickAdaptiveScenario(
  level: number,
  excludeIds: string[],
  categoryStats: Partial<Record<Category, CategoryStat>> | undefined,
  shiftType: ShiftType = "day"
): Scenario {
  const available = SCENARIOS.filter((s) => s.minLevel <= level);
  const fresh = available.filter((s) => !excludeIds.includes(s.id));
  let pool = fresh.length ? fresh : available.length ? available : SCENARIOS;

  if (shiftType === "night") {
    pool = nightPool(pool);
  }

  const weak = weakCategories(categoryStats ?? {});
  if (weak.length === 0) {
    return pool[Math.floor(Math.random() * pool.length)];
  }

  let biased = pool.filter((s) => weak.includes(s.category));
  if (shiftType === "night" && biased.length) {
    biased = nightPool(biased);
  }

  const useWeak = biased.length > 0 && Math.random() < 0.65;
  const finalPool = useWeak ? biased : pool;
  return finalPool[Math.floor(Math.random() * finalPool.length)];
}
