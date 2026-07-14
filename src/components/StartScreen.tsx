import { useState } from "react";
import { RANKS, rankForXp } from "../game/ranks";
import type { ShiftType } from "../game/adaptive";
import { formatClock, getSavedShiftSummary, hasSavedShift } from "../game/useShift";
import type { Progress } from "../game/types";
import { speechSupported } from "../lib/speech";

interface Props {
  progress: Progress;
  onResume: () => void;
  onNewShift: (name: string, shiftType: ShiftType) => void;
  onOpenPractice: () => void;
  onReset: () => void;
  onOpenTrophy: () => void;
  onOpenDashboard: () => void;
  onOpenStudy: () => void;
}

export default function StartScreen({
  progress,
  onResume,
  onNewShift,
  onOpenPractice,
  onReset,
  onOpenTrophy,
  onOpenDashboard,
  onOpenStudy,
}: Props) {
  const [name, setName] = useState(progress.agentName || "");
  const [shiftType, setShiftType] = useState<ShiftType>("day");
  const rank = rankForXp(progress.xp);
  const returning = progress.ticketsResolved > 0;
  const saved = hasSavedShift() ? getSavedShiftSummary() : null;

  return (
    <div className="min-h-full grid-bg flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl animate-fade-up">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-brand-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-brand-400" />
            IT Support Simulator
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
            <span className="text-gradient">Helpdesk Hero</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">
            Step onto the support floor, handle real tickets, talk down panicking VIPs, and climb
            from nervous intern to legendary <span className="text-brand-300 font-semibold">Helpdesk Hero</span>.
          </p>
        </div>

        <div className="panel p-6 sm:p-8">
          <label className="mb-2 block text-sm font-semibold text-slate-300">Your agent name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onNewShift(name, shiftType)}
            placeholder="e.g. Alex Rivera"
            maxLength={24}
            className="w-full rounded-xl border border-white/10 bg-ink-900/70 px-4 py-3 text-slate-100 outline-none transition focus:border-brand-400/60 focus:ring-2 focus:ring-brand-400/20"
          />

          {!saved && (
            <div className="mt-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Shift type
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShiftType("day")}
                  className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                    shiftType === "day"
                      ? "border-brand-400/50 bg-brand-500/15 text-brand-100"
                      : "border-white/10 bg-ink-900/60 text-slate-400 hover:bg-white/5"
                  }`}
                >
                  ☀️ Day shift
                </button>
                <button
                  type="button"
                  onClick={() => setShiftType("night")}
                  className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                    shiftType === "night"
                      ? "border-indigo-400/50 bg-indigo-500/15 text-indigo-100"
                      : "border-white/10 bg-ink-900/60 text-slate-400 hover:bg-white/5"
                  }`}
                >
                  🌙 Night shift
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Night shifts bias toward Security, VIP, and harder escalations — closer to on-call reality.
              </p>
            </div>
          )}

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {saved ? (
              <>
                <button className="btn-primary text-base" onClick={onResume}>
                  Resume shift ▸
                </button>
                <button className="btn-ghost text-base" onClick={() => onNewShift(name, shiftType)}>
                  New shift
                </button>
              </>
            ) : (
              <button className="btn-primary text-base" onClick={() => onNewShift(name, shiftType)}>
                {returning ? "Clock in ▸" : "Start your shift ▸"}
              </button>
            )}
            <button className="btn-ghost text-base" onClick={onOpenPractice} title="Practice Library">
              🎯 Practice
            </button>
            <button className="btn-ghost text-base" onClick={onOpenStudy} title="Study Mode & certifications">
              📚 Study
            </button>
            {returning && (
              <button className="btn-ghost text-base" onClick={onOpenTrophy} title="Trophy Room">
                🏆 Trophies
              </button>
            )}
            {returning && (
              <button className="btn-ghost text-base" onClick={onOpenDashboard} title="Performance dashboard">
                📈 Stats
              </button>
            )}
          </div>

          {saved && (
            <div className="mt-4 rounded-xl border border-brand-400/25 bg-brand-500/10 p-4 text-sm text-slate-200">
              <span className="font-semibold text-brand-200">Shift in progress:</span>{" "}
              {saved.resolved} resolved · {saved.queue} waiting
              {saved.hasActive ? " · 1 open ticket" : ""} · clock at {formatClock(saved.clock)}
            </div>
          )}

          {returning && (
            <div className="mt-6 flex flex-wrap items-center gap-4 rounded-xl border border-white/5 bg-white/5 p-4">
              <div className="text-3xl">{rank.icon}</div>
              <div className="flex-1">
                <div className="text-sm text-slate-400">Welcome back</div>
                <div className="font-bold">
                  {rank.title} · Level {rank.level}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <Stat label="Tickets" value={progress.ticketsResolved} />
                <Stat
                  label="Avg CSAT"
                  value={`${progress.ticketsResolved ? Math.round(progress.totalCsat / progress.ticketsResolved) : 0}%`}
                />
                <Stat label="Best streak" value={progress.bestStreak} />
              </div>
            </div>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Feature icon="🎧" title="Real voices" text="Clients actually speak to you via your browser." />
            <Feature icon="🎫" title="Live ticket queue" text="Triage a busy, ever-refilling support floor." />
            <Feature icon="📈" title="Zero to hero" text="Earn XP, ranks & badges as you improve." />
          </div>

          {!speechSupported() && (
            <p className="mt-4 text-xs text-amber-300/80">
              Note: your browser doesn't support speech synthesis, so voices will be silent. Everything
              else works great.
            </p>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
          <span>Tip: turn your volume up — clients talk. 🔊</span>
          {returning && (
            <button onClick={onReset} className="underline decoration-dotted hover:text-slate-300">
              Reset all progress
            </button>
          )}
        </div>

        <RankLadder currentLevel={rank.level} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-lg font-bold text-brand-300">{value}</div>
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
    </div>
  );
}

function Feature({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-ink-900/50 p-4">
      <div className="text-2xl">{icon}</div>
      <div className="mt-2 font-semibold">{title}</div>
      <div className="text-sm text-slate-400">{text}</div>
    </div>
  );
}

function RankLadder({ currentLevel }: { currentLevel: number }) {
  return (
    <div className="mt-8">
      <div className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-slate-500">
        The climb
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {RANKS.map((r, i) => (
          <div key={r.level} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                r.level <= currentLevel
                  ? "border-brand-400/40 bg-brand-500/15 text-brand-200"
                  : "border-white/5 bg-white/5 text-slate-500"
              }`}
              title={r.blurb}
            >
              <span>{r.icon}</span>
              {r.title}
            </div>
            {i < RANKS.length - 1 && <span className="text-slate-600">›</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
