import { useMemo } from "react";
import { worstMistakes } from "../game/mistakes";
import { rankForXp } from "../game/ranks";
import type { Category, Progress } from "../game/types";
import { categoryIcon } from "./ui";

interface Props {
  progress: Progress;
  onClose: () => void;
  onReplayMistake?: (scenarioId: string) => void;
}

export default function Dashboard({ progress, onClose, onReplayMistake }: Props) {
  const rank = rankForXp(progress.xp);
  const history = progress.history;
  const mistakes = useMemo(() => worstMistakes(progress, 3), [progress.history]);
  const avg = progress.ticketsResolved
    ? Math.round(progress.totalCsat / progress.ticketsResolved)
    : 0;
  const slaRate = history.length
    ? Math.round((history.filter((h) => h.slaMet).length / history.length) * 100)
    : 0;
  const firstTryRate = history.length
    ? Math.round((history.filter((h) => h.wrongPicks === 0).length / history.length) * 100)
    : 0;

  const cats = useMemo(() => {
    const rows = (Object.keys(categoryIcon) as Category[])
      .map((c) => {
        const stat = progress.categoryStats[c];
        return stat && stat.resolved > 0
          ? { category: c, resolved: stat.resolved, avg: Math.round(stat.csatSum / stat.resolved) }
          : null;
      })
      .filter((r): r is { category: Category; resolved: number; avg: number } => r !== null);
    rows.sort((a, b) => b.avg - a.avg);
    return rows;
  }, [progress.categoryStats]);

  const strongest = cats[0];
  const weakest = cats.length > 1 ? cats[cats.length - 1] : undefined;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
      <div className="mx-auto my-4 w-full max-w-3xl animate-pop-in panel overflow-hidden">
        <div className="flex items-center justify-between bg-gradient-to-br from-brand-500/20 to-accent-500/15 p-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-brand-200">
              Performance Dashboard
            </div>
            <h2 className="text-2xl font-extrabold">
              {progress.agentName || "Agent"} · {rank.icon} {rank.title}
            </h2>
            <div className="text-sm text-slate-300">{progress.ticketsResolved} tickets resolved all-time</div>
          </div>
          <button onClick={onClose} className="btn-ghost">
            Close ✕
          </button>
        </div>

        {progress.ticketsResolved === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <div className="mb-2 text-4xl">📈</div>
            Resolve some tickets and your performance trends will show up here.
          </div>
        ) : (
          <>
            {/* Headline stats */}
            <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
              <Stat label="Avg CSAT" value={`${avg}%`} tone={avg >= 80 ? "good" : avg >= 60 ? "mid" : "bad"} />
              <Stat label="SLA met" value={`${slaRate}%`} tone={slaRate >= 80 ? "good" : slaRate >= 50 ? "mid" : "bad"} />
              <Stat label="First-try" value={`${firstTryRate}%`} tone={firstTryRate >= 70 ? "good" : firstTryRate >= 40 ? "mid" : "bad"} />
              <Stat label="Docs correct" value={progress.docsCorrect} tone="neutral" />
            </div>

            {/* CSAT trend */}
            <div className="px-5">
              <SectionTitle>Recent CSAT trend (last {Math.min(history.length, 50)} tickets)</SectionTitle>
              <div className="rounded-xl border border-white/5 bg-ink-900/60 p-4">
                <Sparkline values={history.map((h) => h.csat)} />
              </div>
            </div>

            {/* Category breakdown */}
            <div className="p-5">
              <SectionTitle>Strengths & weaknesses by category</SectionTitle>
              <div className="space-y-2">
                {cats.map((row) => (
                  <div key={row.category} className="flex items-center gap-3">
                    <div className="w-28 shrink-0 text-sm">
                      <span className="mr-1">{categoryIcon[row.category]}</span>
                      {row.category}
                    </div>
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full ${
                          row.avg >= 80
                            ? "bg-emerald-400"
                            : row.avg >= 60
                            ? "bg-amber-400"
                            : "bg-rose-400"
                        }`}
                        style={{ width: `${row.avg}%` }}
                      />
                    </div>
                    <div className="w-24 shrink-0 text-right text-xs text-slate-400">
                      {row.avg}% · {row.resolved}×
                    </div>
                  </div>
                ))}
              </div>

              {(strongest || weakest) && (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {strongest && (
                    <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-sm">
                      <span className="font-semibold text-emerald-300">Strongest:</span>{" "}
                      {categoryIcon[strongest.category]} {strongest.category} ({strongest.avg}% CSAT)
                    </div>
                  )}
                  {weakest && weakest.category !== strongest?.category && (
                    <div className="rounded-xl border border-amber-400/20 bg-amber-500/10 p-3 text-sm">
                      <span className="font-semibold text-amber-300">Focus area:</span>{" "}
                      {categoryIcon[weakest.category]} {weakest.category} ({weakest.avg}% CSAT) — try Study Mode.
                    </div>
                  )}
                </div>
              )}
            </div>

            {mistakes.length > 0 && onReplayMistake && (
              <div className="px-5 pb-5">
                <SectionTitle>Replay my mistakes</SectionTitle>
                <p className="mb-3 text-xs text-slate-500">
                  Practice your lowest-CSAT tickets until the habit sticks.
                </p>
                <div className="space-y-2">
                  {mistakes.map((m) => (
                    <button
                      key={m.scenarioId}
                      onClick={() => {
                        onReplayMistake(m.scenarioId);
                        onClose();
                      }}
                      className="flex w-full items-center gap-3 rounded-xl border border-rose-400/20 bg-rose-500/10 p-3 text-left transition hover:bg-rose-500/15"
                    >
                      <span className="text-xl">{categoryIcon[m.category as Category]}</span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-slate-100">{m.title}</div>
                        <div className="text-xs text-slate-400">
                          {m.csat}% CSAT{m.wrongPicks > 0 ? ` · ${m.wrongPicks} wrong pick${m.wrongPicks > 1 ? "s" : ""}` : ""}
                        </div>
                      </div>
                      <span className="shrink-0 text-xs font-semibold text-brand-300">Practice ▸</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/** Lightweight inline SVG sparkline for the CSAT trend (0..100). */
function Sparkline({ values }: { values: number[] }) {
  const W = 640;
  const H = 120;
  const pad = 6;
  if (values.length === 0) return <div className="text-sm text-slate-500">No data yet.</div>;

  const n = values.length;
  const x = (i: number) => (n === 1 ? W / 2 : pad + (i * (W - pad * 2)) / (n - 1));
  const y = (v: number) => H - pad - (Math.max(0, Math.min(100, v)) / 100) * (H - pad * 2);

  const points = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const areaPoints = `${pad},${H - pad} ${points} ${W - pad},${H - pad}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-32 w-full" preserveAspectRatio="none">
      {[25, 50, 75].map((g) => (
        <line
          key={g}
          x1={pad}
          x2={W - pad}
          y1={y(g)}
          y2={y(g)}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={1}
        />
      ))}
      <polyline points={areaPoints} fill="rgba(56,189,248,0.12)" stroke="none" />
      <polyline
        points={points}
        fill="none"
        stroke="rgb(56,189,248)"
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {values.map((v, i) => (
        <circle
          key={i}
          cx={x(i)}
          cy={y(v)}
          r={n > 30 ? 1.5 : 3}
          fill={v >= 70 ? "rgb(52,211,153)" : v >= 40 ? "rgb(251,191,36)" : "rgb(251,113,133)"}
        />
      ))}
    </svg>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: "good" | "mid" | "bad" | "neutral";
}) {
  const color =
    tone === "good"
      ? "text-emerald-400"
      : tone === "bad"
      ? "text-rose-400"
      : tone === "mid"
      ? "text-amber-300"
      : "text-brand-300";
  return (
    <div className="rounded-xl border border-white/5 bg-ink-900/60 p-4 text-center">
      <div className={`text-2xl font-extrabold ${color}`}>{value}</div>
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">{children}</div>
  );
}
