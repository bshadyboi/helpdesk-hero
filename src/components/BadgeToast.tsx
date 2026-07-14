import { BADGES } from "../game/ranks";

interface Props {
  badgeIds: string[];
  onDone: () => void;
}

export default function BadgeToast({ badgeIds, onDone }: Props) {
  if (!badgeIds.length) return null;

  return (
    <div className="fixed bottom-5 left-5 z-50 max-w-sm animate-slide-in">
      <div className="flex flex-col gap-2 rounded-xl border border-amber-400/30 bg-ink-850/95 p-2 shadow-glow backdrop-blur-xl">
        {badgeIds.map((id) => {
          const b = BADGES.find((x) => x.id === id);
          if (!b) return null;
          return (
            <div key={id} className="flex items-center gap-3 px-2 py-1">
              <span className="text-2xl">{b.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold uppercase tracking-wide text-amber-300">
                  Badge unlocked
                </div>
                <div className="font-bold text-amber-100">{b.name}</div>
                <div className="text-xs text-slate-400">{b.desc}</div>
              </div>
            </div>
          );
        })}
        <button
          onClick={onDone}
          className="btn-ghost w-full text-xs"
          aria-label="Dismiss badge notifications"
        >
          Nice! ✕
        </button>
      </div>
    </div>
  );
}
