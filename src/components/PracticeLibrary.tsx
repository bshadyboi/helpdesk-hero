import { useMemo, useState } from "react";
import { SCENARIOS } from "../game/scenarios";
import type { Category, Scenario } from "../game/types";
import { categoryIcon, DifficultyDots, TierBadge } from "./ui";

interface Props {
  level: number;
  completedIds: string[];
  onPractice: (scenarioId: string) => void;
  onClose: () => void;
}

const CATEGORIES = Object.keys(categoryIcon) as Category[];

export default function PracticeLibrary({ level, completedIds, onPractice, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState<Category | "all">("all");
  const completed = new Set(completedIds);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SCENARIOS.filter((s) => {
      if (s.minLevel > level) return false;
      if (catFilter !== "all" && s.category !== catFilter) return false;
      if (!q) return true;
      return (
        s.title.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
      );
    }).sort((a, b) => a.difficulty - b.difficulty || a.title.localeCompare(b.title));
  }, [query, catFilter, level]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
      <div className="mx-auto my-4 w-full max-w-3xl animate-pop-in panel overflow-hidden">
        <div className="flex items-center justify-between bg-gradient-to-br from-brand-500/20 to-accent-500/15 p-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-brand-200">
              Practice Library
            </div>
            <h2 className="text-2xl font-extrabold">Replay any scenario</h2>
            <div className="text-sm text-slate-300">
              Run a single ticket in isolation — great for weak spots. You still earn XP.
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost">
            Close ✕
          </button>
        </div>

        <div className="space-y-3 border-b border-white/5 p-5">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tickets, tags, categories…"
            className="w-full rounded-xl border border-white/10 bg-ink-900/70 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-brand-400/60"
          />
          <div className="flex flex-wrap gap-2">
            <FilterChip active={catFilter === "all"} onClick={() => setCatFilter("all")}>
              All
            </FilterChip>
            {CATEGORIES.map((c) => (
              <FilterChip key={c} active={catFilter === c} onClick={() => setCatFilter(c)}>
                {categoryIcon[c]} {c}
              </FilterChip>
            ))}
          </div>
        </div>

        <div className="max-h-[55vh] space-y-2 overflow-y-auto p-5">
          {list.map((s) => (
            <ScenarioRow
              key={s.id}
              scenario={s}
              cleared={completed.has(s.id)}
              onPractice={() => onPractice(s.id)}
            />
          ))}
          {list.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">No scenarios match your search.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ScenarioRow({
  scenario: s,
  cleared,
  onPractice,
}: {
  scenario: Scenario;
  cleared: boolean;
  onPractice: () => void;
}) {
  return (
    <button
      onClick={onPractice}
      className="flex w-full items-center gap-3 rounded-xl border border-white/5 bg-ink-900/60 p-3 text-left transition hover:border-brand-400/30 hover:bg-ink-800"
    >
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ink-950/60 text-2xl">
        {s.persona.avatar}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold">{s.title}</span>
          {cleared && (
            <span className="chip border border-emerald-400/25 bg-emerald-500/10 text-[10px] text-emerald-200">
              ✓ cleared
            </span>
          )}
        </div>
        <div className="truncate text-xs text-slate-400">{s.summary}</div>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-slate-500">
            {categoryIcon[s.category]} {s.category}
          </span>
          <TierBadge tier={s.tier} />
          <DifficultyDots level={s.difficulty} />
        </div>
      </div>
      <span className="shrink-0 text-sm text-brand-300">Practice ▸</span>
    </button>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
        active
          ? "border-brand-400/50 bg-brand-500/15 text-brand-100"
          : "border-white/10 bg-ink-900/60 text-slate-400 hover:bg-white/5"
      }`}
    >
      {children}
    </button>
  );
}
