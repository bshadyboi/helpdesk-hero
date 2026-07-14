import { useEffect, useState } from "react";
import type { ActiveState } from "../game/useShift";
import { DifficultyDots, Meter, moodStyles, TierBadge } from "./ui";

interface Props {
  active: ActiveState | null;
}

export default function CustomerCard({ active }: Props) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!active || active.phase === "resolved") return;
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [active, active?.phase]);

  if (!active) {
    return (
      <div className="panel p-4">
        <div className="text-sm font-bold text-slate-300">Client details</div>
        <p className="mt-2 text-xs text-slate-500">
          Open a ticket to see who you're helping, their mood, satisfaction, and SLA countdown.
        </p>
      </div>
    );
  }

  const s = active.item.scenario;
  const mood = moodStyles[active.mood];
  const elapsed = Math.floor((now - active.startReal) / 1000);
  const remaining = Math.max(0, s.slaSeconds - elapsed);
  const overdue = remaining <= 0 && active.phase !== "resolved";
  const mm = Math.floor(remaining / 60);
  const ss = (remaining % 60).toString().padStart(2, "0");

  return (
    <div className="panel overflow-hidden">
      <div className="bg-gradient-to-br from-ink-800 to-ink-900 p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-ink-950/60 text-3xl">
            {s.persona.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-bold">{s.persona.name}</div>
            <div className="truncate text-xs text-slate-400">{s.persona.role}</div>
            <div className="truncate text-[11px] text-slate-500">{s.persona.company}</div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <TierBadge tier={s.tier} />
          <span className="chip bg-white/5 text-slate-300">
            <DifficultyDots level={s.difficulty} />
          </span>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-slate-400">Mood</span>
            <span className={`font-semibold ${mood.cls}`}>
              {mood.emoji} {mood.label}
            </span>
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-slate-400">Satisfaction (CSAT)</span>
            <span className="font-bold tabular-nums">{Math.round(active.csat)}%</span>
          </div>
          <Meter value={active.csat} tone="csat" />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-slate-400">SLA remaining</span>
            <span
              className={`font-bold tabular-nums ${
                active.phase === "resolved"
                  ? "text-emerald-400"
                  : overdue
                  ? "text-rose-400"
                  : remaining < 30
                  ? "text-amber-300"
                  : "text-slate-200"
              }`}
            >
              {active.phase === "resolved" ? "Resolved" : overdue ? "OVERDUE" : `${mm}:${ss}`}
            </span>
          </div>
          <Meter
            value={active.phase === "resolved" ? 100 : remaining}
            max={s.slaSeconds}
            tone="sla"
          />
        </div>

        <div className="rounded-xl border border-white/5 bg-ink-900/60 p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Ticket summary
          </div>
          <p className="mt-1 text-sm text-slate-300">{s.summary}</p>
        </div>
      </div>
    </div>
  );
}
