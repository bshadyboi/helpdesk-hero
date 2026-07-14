import { BADGES, RANKS, nextRank, rankForXp, rankProgress } from "../game/ranks";
import { SCENARIOS } from "../game/scenarios";
import type { Progress } from "../game/types";
import { Meter } from "./ui";

interface Props {
  progress: Progress;
  onClose: () => void;
}

export default function Achievements({ progress, onClose }: Props) {
  const rank = rankForXp(progress.xp);
  const next = nextRank(progress.xp);
  const unlocked = new Set(progress.unlockedBadgeIds);
  const avg = progress.ticketsResolved
    ? Math.round(progress.totalCsat / progress.ticketsResolved)
    : 0;
  const completed = new Set(progress.completedScenarioIds).size;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
      <div className="mx-auto my-4 w-full max-w-3xl animate-pop-in panel overflow-hidden">
        <div className="flex items-center justify-between bg-gradient-to-br from-accent-500/20 to-brand-500/15 p-6">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-ink-950/50 text-3xl">
              {rank.icon}
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-brand-200">
                Trophy Room
              </div>
              <h2 className="text-2xl font-extrabold">
                {progress.agentName || "Agent"} · {rank.title}
              </h2>
              <div className="text-sm text-slate-300">Level {rank.level} · {progress.xp} XP</div>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost">
            Close ✕
          </button>
        </div>

        {/* Lifetime stats */}
        <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
          <Stat label="Tickets resolved" value={progress.ticketsResolved} />
          <Stat label="Avg CSAT" value={`${avg}%`} />
          <Stat label="Best streak" value={progress.bestStreak} />
          <Stat label="Badges" value={`${unlocked.size}/${BADGES.length}`} />
        </div>

        {/* Next rank progress */}
        <div className="px-5">
          <div className="rounded-xl border border-white/5 bg-ink-900/60 p-4">
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-semibold">
                {next ? `Next: ${next.icon} ${next.title}` : "Max rank reached 🎉"}
              </span>
              <span className="text-slate-400">
                {next ? `${next.minXp - progress.xp} XP to go` : "Legend"}
              </span>
            </div>
            <Meter value={rankProgress(progress.xp) * 100} />
          </div>
        </div>

        {/* Rank ladder */}
        <div className="p-5">
          <SectionTitle>The Climb</SectionTitle>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {RANKS.map((r) => {
              const reached = progress.xp >= r.minXp;
              const current = r.level === rank.level;
              return (
                <div
                  key={r.level}
                  className={`rounded-xl border p-3 text-center transition ${
                    current
                      ? "border-brand-400/50 bg-brand-500/15 shadow-glow"
                      : reached
                      ? "border-white/10 bg-white/5"
                      : "border-white/5 bg-ink-900/40 opacity-50"
                  }`}
                  title={r.blurb}
                >
                  <div className="text-2xl">{r.icon}</div>
                  <div className="mt-1 text-xs font-bold leading-tight">{r.title}</div>
                  <div className="text-[10px] text-slate-500">Lv {r.level} · {r.minXp} XP</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Badges */}
        <div className="px-5 pb-5">
          <SectionTitle>
            Badges · {unlocked.size}/{BADGES.length}
          </SectionTitle>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {BADGES.map((b) => {
              const got = unlocked.has(b.id);
              return (
                <div
                  key={b.id}
                  className={`rounded-xl border p-3 text-center transition ${
                    got
                      ? "border-amber-400/30 bg-amber-500/10"
                      : "border-white/5 bg-ink-900/40"
                  }`}
                >
                  <div className={`text-3xl ${got ? "" : "grayscale opacity-40"}`}>{b.icon}</div>
                  <div className={`mt-1 text-xs font-bold ${got ? "text-amber-200" : "text-slate-500"}`}>
                    {b.name}
                  </div>
                  <div className="mt-0.5 text-[10px] leading-tight text-slate-500">
                    {got ? b.desc : "🔒 Locked"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Case files */}
        <div className="border-t border-white/5 px-5 py-4 text-center text-sm text-slate-400">
          Case files cleared:{" "}
          <span className="font-bold text-brand-300">
            {completed}/{SCENARIOS.length}
          </span>{" "}
          unique scenarios mastered
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-white/5 bg-ink-900/60 p-4 text-center">
      <div className="text-2xl font-extrabold text-brand-300">{value}</div>
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
      {children}
    </div>
  );
}
