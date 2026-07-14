import { nextRank, rankForXp, rankProgress } from "../game/ranks";
import type { Progress } from "../game/types";
import { formatClock, SHIFT_GOAL } from "../game/useShift";
import { Meter } from "./ui";

interface Props {
  progress: Progress;
  clock: number;
  resolvedCount: number;
  onToggleSound: () => void;
  onToggleVoice: () => void;
  onEndShift: () => void;
  onOpenTrophy: () => void;
}

export default function TopBar({
  progress,
  clock,
  resolvedCount,
  onToggleSound,
  onToggleVoice,
  onEndShift,
  onOpenTrophy,
}: Props) {
  const rank = rankForXp(progress.xp);
  const next = nextRank(progress.xp);
  const pct = rankProgress(progress.xp);

  return (
    <header className="glass sticky top-0 z-30 border-b border-white/5 px-4 py-3">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-600 text-lg shadow-glow">
            🎧
          </div>
          <div className="leading-tight">
            <div className="text-sm font-extrabold tracking-tight">
              Helpdesk <span className="text-gradient">Hero</span>
            </div>
            <div className="text-[11px] text-slate-400">{progress.agentName || "Agent"}'s Shift</div>
          </div>
        </div>

        {/* Rank + XP */}
        <div className="order-3 w-full sm:order-2 sm:w-auto sm:flex-1 sm:max-w-md">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-semibold">
              {rank.icon} {rank.title} · Lv {rank.level}
            </span>
            <span className="text-slate-400">
              {next ? `${progress.xp} / ${next.minXp} XP` : `${progress.xp} XP · MAX`}
            </span>
          </div>
          <Meter value={pct * 100} />
        </div>

        {/* Stats */}
        <div className="order-2 flex items-center gap-4 sm:order-3">
          <HudStat icon="🕘" label="Shift time" value={formatClock(clock)} />
          <HudStat icon="✅" label="Resolved" value={`${resolvedCount}/${SHIFT_GOAL}`} />
          <HudStat icon="🔥" label="Streak" value={progress.currentStreak} />
          <HudStat
            icon="💬"
            label="Avg CSAT"
            value={`${
              progress.ticketsResolved ? Math.round(progress.totalCsat / progress.ticketsResolved) : 0
            }%`}
          />
        </div>

        {/* Controls */}
        <div className="order-4 ml-auto flex items-center gap-2">
          <IconToggle
            on={progress.voiceOn}
            onClick={onToggleVoice}
            onIcon="🎙️"
            offIcon="🔇"
            title="Client voices"
          />
          <IconToggle
            on={progress.soundOn}
            onClick={onToggleSound}
            onIcon="🔊"
            offIcon="🔕"
            title="UI sounds"
          />
          <button
            onClick={onOpenTrophy}
            title="Trophy Room"
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/5 bg-white/5 text-base transition hover:bg-white/10"
          >
            🏆
          </button>
          <button onClick={onEndShift} className="btn-ghost text-xs">
            End shift
          </button>
        </div>
      </div>
    </header>
  );
}

function HudStat({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div className="text-center">
      <div className="text-sm font-bold tabular-nums">
        <span className="mr-1">{icon}</span>
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
    </div>
  );
}

function IconToggle({
  on,
  onClick,
  onIcon,
  offIcon,
  title,
}: {
  on: boolean;
  onClick: () => void;
  onIcon: string;
  offIcon: string;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={`${title}: ${on ? "on" : "off"}`}
      className={`grid h-9 w-9 place-items-center rounded-lg border text-base transition ${
        on
          ? "border-brand-400/30 bg-brand-500/10 hover:bg-brand-500/20"
          : "border-white/5 bg-white/5 text-slate-500 hover:bg-white/10"
      }`}
    >
      {on ? onIcon : offIcon}
    </button>
  );
}
