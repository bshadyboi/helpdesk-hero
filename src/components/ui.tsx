import type { Category, Mood, Tier } from "../game/types";

export const tierStyles: Record<Tier, { label: string; cls: string; icon: string }> = {
  Standard: { label: "Standard", cls: "bg-slate-500/15 text-slate-300 border border-slate-400/20", icon: "🎫" },
  Priority: { label: "Priority", cls: "bg-amber-500/15 text-amber-300 border border-amber-400/25", icon: "⚡" },
  VIP: { label: "VIP", cls: "bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-400/25", icon: "⭐" },
  Executive: { label: "Executive", cls: "bg-rose-500/15 text-rose-300 border border-rose-400/25", icon: "👑" },
};

export const categoryIcon: Record<Category, string> = {
  Accounts: "🔐",
  Network: "🌐",
  Hardware: "🖥️",
  Software: "🧩",
  Email: "✉️",
  Security: "🛡️",
  Mobile: "📱",
};

export const moodStyles: Record<Mood, { label: string; cls: string; emoji: string }> = {
  calm: { label: "Calm", cls: "text-brand-400", emoji: "🙂" },
  friendly: { label: "Happy", cls: "text-emerald-400", emoji: "😄" },
  confused: { label: "Confused", cls: "text-sky-300", emoji: "😕" },
  annoyed: { label: "Annoyed", cls: "text-amber-300", emoji: "😠" },
  panicked: { label: "Panicked", cls: "text-rose-400", emoji: "😰" },
};

export function TierBadge({ tier }: { tier: Tier }) {
  const t = tierStyles[tier];
  return (
    <span className={`chip ${t.cls}`}>
      <span>{t.icon}</span>
      {t.label}
    </span>
  );
}

export function DifficultyDots({ level }: { level: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" title={`Difficulty ${level}/5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${
            i <= level
              ? level >= 5
                ? "bg-rose-400"
                : level >= 4
                ? "bg-amber-400"
                : "bg-brand-400"
              : "bg-white/15"
          }`}
        />
      ))}
    </span>
  );
}

export function Meter({
  value,
  max = 100,
  className = "",
  tone = "brand",
}: {
  value: number;
  max?: number;
  className?: string;
  tone?: "brand" | "csat" | "sla";
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const color =
    tone === "csat"
      ? pct >= 70
        ? "from-emerald-400 to-brand-500"
        : pct >= 40
        ? "from-amber-400 to-amber-500"
        : "from-rose-500 to-rose-600"
      : tone === "sla"
      ? pct >= 50
        ? "from-brand-400 to-brand-500"
        : pct >= 20
        ? "from-amber-400 to-amber-500"
        : "from-rose-500 to-rose-600"
      : "from-brand-400 to-accent-500";
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-white/10 ${className}`}>
      <div
        className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
