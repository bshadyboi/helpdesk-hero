import { RANKS, rankForXp } from "./ranks";
import type { Category, Progress } from "./types";
import { weakCategories } from "./adaptive";

const CAT_ICON: Record<Category, string> = {
  Accounts: "🔐",
  Network: "🌐",
  Hardware: "🖥️",
  Software: "🧩",
  Email: "✉️",
  Security: "🛡️",
  Mobile: "📱",
};

export interface BriefingLine {
  icon: string;
  text: string;
}

export function buildShiftBriefing(progress: Progress, level: number): BriefingLine[] {
  const rank = rankForXp(progress.xp);
  const next = RANKS.find((r) => r.level === level + 1);
  const weak = weakCategories(progress.categoryStats, 2);
  const lines: BriefingLine[] = [];

  lines.push({
    icon: rank.icon,
    text: `You're clocked in as ${rank.title} (Level ${level}). ${rank.blurb}`,
  });

  if (next) {
    lines.push({
      icon: "📈",
      text: `Next promotion: ${next.title} at ${next.minXp} XP — you're at ${progress.xp}.`,
    });
  }

  if (weak.length > 0 && progress.ticketsResolved >= 3) {
    const labels = weak.map((c) => `${CAT_ICON[c]} ${c}`).join(" & ");
    lines.push({
      icon: "🎯",
      text: `Today's coaching focus: ${labels}. The queue will lean your way so you can sharpen up.`,
    });
  } else if (progress.ticketsResolved < 3) {
    lines.push({
      icon: "🎫",
      text: "Goal: resolve 6 tickets this shift. Read each issue, pick the safest action, then log the ticket before closing.",
    });
  }

  if (level >= 3) {
    lines.push({
      icon: "👑",
      text: "VIP and Executive tickets are on the floor — lead with calm, own the problem, and never skip verification.",
    });
  } else {
    lines.push({
      icon: "💡",
      text: "Stuck? Open the Knowledge Base on the right. Wrong picks show coaching — use it to learn the real desk habit.",
    });
  }

  return lines;
}
