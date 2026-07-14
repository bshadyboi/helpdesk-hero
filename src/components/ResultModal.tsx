import { useEffect } from "react";
import { BADGES, RANKS } from "../game/ranks";
import type { TicketResult } from "../game/types";
import Confetti from "./Confetti";

interface Props {
  result: TicketResult;
  leveledUp: boolean;
  newLevel: number;
  newBadges: string[];
  onNext: () => void;
  shiftDone: boolean;
}

export default function ResultModal({
  result,
  leveledUp,
  newLevel,
  newBadges,
  onNext,
  shiftDone,
}: Props) {
  const great = result.csat >= 85 && result.wrongPicks === 0;
  const good = result.csat >= 65;
  const headline = great ? "Flawless!" : good ? "Ticket resolved!" : "Resolved — with lessons";
  const emoji = great ? "🌟" : good ? "✅" : "📘";
  const rank = RANKS.find((r) => r.level === newLevel);
  const celebrate = leveledUp || newBadges.length > 0 || great;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onNext]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
      {celebrate && <Confetti count={leveledUp ? 130 : 80} />}
      <div className="w-full max-w-md animate-pop-in panel overflow-hidden">
        <div
          className={`p-6 text-center ${
            great
              ? "bg-gradient-to-br from-emerald-500/20 to-brand-500/10"
              : good
              ? "bg-gradient-to-br from-brand-500/15 to-accent-500/10"
              : "bg-gradient-to-br from-amber-500/10 to-ink-800"
          }`}
        >
          <div className="text-5xl">{emoji}</div>
          <h2 className="mt-2 text-2xl font-extrabold">{headline}</h2>
          <p className="text-sm text-slate-300">
            {result.title} · {result.persona}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 p-5">
          <ResultStat label="Satisfaction" value={`${result.csat}%`} tone={result.csat >= 70 ? "good" : result.csat >= 40 ? "mid" : "bad"} />
          <ResultStat label="XP earned" value={`+${result.xpEarned}`} tone="xp" />
          <ResultStat
            label="Resolution time"
            value={`${Math.floor(result.timeSeconds / 60)}m ${result.timeSeconds % 60}s`}
            tone="neutral"
          />
          <ResultStat
            label="SLA"
            value={result.slaMet ? "Met ✔" : "Missed"}
            tone={result.slaMet ? "good" : "bad"}
          />
        </div>

        {result.wrongPicks === 0 ? (
          <div className="mx-5 mb-3 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-center text-sm text-emerald-300">
            🔥 First-try perfect — streak continues!
          </div>
        ) : (
          <div className="mx-5 mb-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-sm text-slate-400">
            {result.wrongPicks} misstep{result.wrongPicks > 1 ? "s" : ""} — streak reset. You'll nail it next time.
          </div>
        )}

        {leveledUp && rank && (
          <div className="mx-5 mb-3 animate-pop-in rounded-xl border border-accent-400/40 bg-accent-500/15 px-3 py-3 text-center">
            <div className="text-lg font-extrabold text-accent-200">
              {rank.icon} Level up! You're now a {rank.title}
            </div>
            <div className="text-xs text-slate-300">{rank.blurb}</div>
          </div>
        )}

        {newBadges.length > 0 && (
          <div className="mx-5 mb-3 flex flex-wrap justify-center gap-2">
            {newBadges.map((id) => {
              const b = BADGES.find((x) => x.id === id);
              if (!b) return null;
              return (
                <span
                  key={id}
                  className="chip animate-pop-in border border-amber-400/30 bg-amber-500/15 text-amber-200"
                  title={b.desc}
                >
                  {b.icon} {b.name}
                </span>
              );
            })}
          </div>
        )}

        <div className="p-5 pt-2">
          <button onClick={onNext} className="btn-primary w-full text-base">
            {shiftDone ? "Finish shift & see summary ▸" : "Next ticket ▸"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ResultStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "good" | "mid" | "bad" | "xp" | "neutral";
}) {
  const color =
    tone === "good"
      ? "text-emerald-400"
      : tone === "bad"
      ? "text-rose-400"
      : tone === "mid"
      ? "text-amber-300"
      : tone === "xp"
      ? "text-brand-300"
      : "text-slate-200";
  return (
    <div className="rounded-xl border border-white/5 bg-ink-900/60 p-3 text-center">
      <div className={`text-xl font-extrabold ${color}`}>{value}</div>
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
    </div>
  );
}
