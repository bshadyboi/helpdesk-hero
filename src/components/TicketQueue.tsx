import type { QueueItem } from "../game/useShift";
import { formatClock } from "../game/useShift";
import { categoryIcon, DifficultyDots, TierBadge } from "./ui";

interface Props {
  queue: QueueItem[];
  activeInstanceId: string | null;
  canOpen: boolean;
  onOpen: (instanceId: string) => void;
}

export default function TicketQueue({ queue, activeInstanceId, canOpen, onOpen }: Props) {
  return (
    <aside className="panel flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">📥</span>
          <h2 className="font-bold">Ticket Queue</h2>
        </div>
        <span className="chip bg-brand-500/15 text-brand-300">
          {queue.length} waiting
        </span>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {queue.length === 0 && (
          <div className="grid h-full place-items-center px-4 text-center text-sm text-slate-500">
            <div>
              <div className="mb-2 text-3xl">🌿</div>
              Queue's clear for a sec. New tickets roll in constantly — hang tight.
            </div>
          </div>
        )}

        {queue.map((item, i) => {
          const s = item.scenario;
          const isActive = item.instanceId === activeInstanceId;
          const isNew = i === queue.length - 1;
          return (
            <button
              key={item.instanceId}
              disabled={!canOpen && !isActive}
              onClick={() => onOpen(item.instanceId)}
              className={`group w-full animate-slide-in rounded-xl border p-3 text-left transition ${
                isActive
                  ? "border-brand-400/50 bg-brand-500/10"
                  : "border-white/5 bg-ink-900/60 hover:border-brand-400/30 hover:bg-ink-800/70"
              } ${!canOpen && !isActive ? "opacity-50" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{s.persona.avatar}</span>
                  <div>
                    <div className="text-sm font-semibold leading-tight">{s.persona.name}</div>
                    <div className="text-[11px] text-slate-400">{s.persona.role}</div>
                  </div>
                </div>
                <TierBadge tier={s.tier} />
              </div>

              <div className="mt-2 flex items-center gap-1.5 text-sm font-medium text-slate-200">
                <span>{categoryIcon[s.category]}</span>
                <span className="line-clamp-1">{s.title}</span>
              </div>

              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <DifficultyDots level={s.difficulty} />
                  <span>SLA {Math.round(s.slaSeconds / 60)}m</span>
                </span>
                <span>{isNew ? "just now" : `@ ${formatClock(item.arrivedClock)}`}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="border-t border-white/5 px-4 py-2 text-center text-[11px] text-slate-500">
        Click a ticket to start helping. One at a time!
      </div>
    </aside>
  );
}
