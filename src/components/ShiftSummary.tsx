import { rankForXp } from "../game/ranks";
import { buildManagerFeedback } from "../game/managerFeedback";
import type { Progress, TicketResult } from "../game/types";
import { formatClock } from "../game/useShift";

interface Props {
  results: TicketResult[];
  progress: Progress;
  startClock: number;
  endClock: number;
  practiceMode?: boolean;
  onNewShift: () => void;
  onHome: () => void;
}

export default function ShiftSummary({
  results,
  progress,
  startClock,
  endClock,
  practiceMode,
  onNewShift,
  onHome,
}: Props) {
  const rank = rankForXp(progress.xp);
  const xp = results.reduce((a, r) => a + r.xpEarned, 0);
  const avg = results.length
    ? Math.round(results.reduce((a, r) => a + r.csat, 0) / results.length)
    : 0;
  const slaMet = results.filter((r) => r.slaMet).length;
  const flawless = results.filter((r) => r.wrongPicks === 0).length;

  const grade =
    avg >= 90 ? "A+" : avg >= 80 ? "A" : avg >= 70 ? "B" : avg >= 55 ? "C" : avg > 0 ? "D" : "—";

  const manager = buildManagerFeedback(results, progress, grade);

  return (
    <div className="min-h-full grid-bg flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl animate-fade-up panel overflow-hidden">
        <div className="bg-gradient-to-br from-brand-500/20 to-accent-500/15 p-8 text-center">
          <div className="text-sm font-semibold uppercase tracking-widest text-brand-200">
            {practiceMode ? "Practice complete" : "Shift complete"}
          </div>
          <h1 className="mt-1 text-4xl font-extrabold">
            {formatClock(startClock)} – {formatClock(endClock)}
          </h1>
          <p className="mt-2 text-slate-300">
            Nice work, {progress.agentName || "Agent"}. Here's how your day went.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
          <Big label="Grade" value={grade} accent />
          <Big label="Tickets" value={results.length} />
          <Big label="Avg CSAT" value={`${avg}%`} />
          <Big label="XP earned" value={`+${xp}`} />
        </div>

        <div className="grid grid-cols-2 gap-3 px-5 pb-2">
          <Small label="SLAs met" value={`${slaMet}/${results.length}`} />
          <Small label="Flawless resolutions" value={`${flawless}/${results.length}`} />
        </div>

        {!practiceMode && manager.lines.length > 0 && (
          <div className="mx-5 mb-3 rounded-xl border border-white/10 bg-ink-900/60 p-4">
            <div className="mb-2 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-ink-800 text-xl">🧑‍💼</div>
              <div>
                <div className="font-bold">{manager.manager}</div>
                <div className="text-xs text-slate-400">{manager.title}</div>
              </div>
            </div>
            <div className="space-y-2 text-sm text-slate-300">
              {manager.lines.map((line, i) => (
                <p key={i} className="leading-relaxed">
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}

        {practiceMode && results[0] && (
          <div className="mx-5 mb-3 rounded-xl border border-brand-400/25 bg-brand-500/10 p-4 text-sm text-slate-200">
            <span className="font-semibold text-brand-200">Practice note:</span> You earned full XP for
            this run. Try another scenario from the library or clock in for a live shift.
          </div>
        )}

        <div className="px-5 py-3">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Tickets handled
          </div>
          <div className="max-h-52 space-y-1.5 overflow-y-auto pr-1">
            {results.map((r, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg border border-white/5 bg-ink-900/60 px-3 py-2 text-sm"
              >
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    r.csat >= 70 ? "bg-emerald-400" : r.csat >= 40 ? "bg-amber-400" : "bg-rose-400"
                  }`}
                />
                <span className="flex-1 truncate">{r.title}</span>
                <span className="text-slate-400">{r.csat}%</span>
                <span className="w-14 text-right text-brand-300">+{r.xpEarned}</span>
              </div>
            ))}
            {results.length === 0 && (
              <p className="py-4 text-center text-sm text-slate-500">No tickets resolved this shift.</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/5 p-5">
          <div className="text-sm">
            <span className="text-slate-400">Current rank: </span>
            <span className="font-bold">
              {rank.icon} {rank.title}
            </span>
          </div>
          <div className="flex gap-2">
            <button onClick={onHome} className="btn-ghost">
              {practiceMode ? "Back to library" : "Home"}
            </button>
            {!practiceMode && (
              <button onClick={onNewShift} className="btn-primary">
                Start next shift ▸
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Big({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-white/5 bg-ink-900/60 p-4 text-center">
      <div className={`text-3xl font-extrabold ${accent ? "text-gradient" : "text-slate-100"}`}>
        {value}
      </div>
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
    </div>
  );
}

function Small({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}
