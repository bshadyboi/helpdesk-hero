import { buildShiftBriefing } from "../game/shiftBriefing";
import type { Progress } from "../game/types";

interface Props {
  progress: Progress;
  level: number;
  onBegin: () => void;
}

export default function ShiftBriefing({ progress, level, onBegin }: Props) {
  const lines = buildShiftBriefing(progress, level);

  return (
    <div className="fixed inset-0 z-[55] grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg animate-pop-in panel overflow-hidden">
        <div className="bg-gradient-to-br from-brand-500/25 to-accent-500/15 p-6 text-center">
          <div className="text-4xl">📋</div>
          <h2 className="mt-2 text-2xl font-extrabold">Shift briefing</h2>
          <p className="text-sm text-slate-300">
            {progress.agentName || "Agent"} — here's your floor rundown before tickets hit.
          </p>
        </div>

        <div className="space-y-3 p-5">
          {lines.map((line, i) => (
            <div
              key={i}
              className="flex gap-3 rounded-xl border border-white/5 bg-ink-900/60 p-3 text-sm text-slate-200"
            >
              <span className="text-xl shrink-0">{line.icon}</span>
              <p className="leading-relaxed">{line.text}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 p-5">
          <button onClick={onBegin} className="btn-primary w-full text-base">
            Hit the floor ▸
          </button>
        </div>
      </div>
    </div>
  );
}
