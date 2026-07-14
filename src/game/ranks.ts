export interface Rank {
  level: number;
  title: string;
  minXp: number;
  blurb: string;
  icon: string;
}

/** XP thresholds designed for a satisfying "zero to hero" climb. */
export const RANKS: Rank[] = [
  { level: 1, title: "Intern", minXp: 0, icon: "🎓", blurb: "First day on the floor. Everyone starts here." },
  { level: 2, title: "Help Desk Trainee", minXp: 120, icon: "🧑‍💻", blurb: "You know where the reset button is." },
  { level: 3, title: "Support Technician", minXp: 320, icon: "🛠️", blurb: "Tickets don't scare you anymore." },
  { level: 4, title: "Senior Technician", minXp: 640, icon: "⚙️", blurb: "You close tickets in your sleep." },
  { level: 5, title: "Escalation Specialist", minXp: 1080, icon: "🚀", blurb: "The hard ones land on your desk now." },
  { level: 6, title: "Team Lead", minXp: 1680, icon: "🧭", blurb: "The floor looks to you when things break." },
  { level: 7, title: "Service Desk Manager", minXp: 2500, icon: "📊", blurb: "SLAs bend to your will." },
  { level: 8, title: "Helpdesk Hero", minXp: 3600, icon: "🦸", blurb: "Zero to hero. You are the legend now." },
];

export function rankForXp(xp: number): Rank {
  let current = RANKS[0];
  for (const r of RANKS) if (xp >= r.minXp) current = r;
  return current;
}

export function nextRank(xp: number): Rank | null {
  for (const r of RANKS) if (xp < r.minXp) return r;
  return null;
}

/** Returns 0..1 progress toward the next rank. */
export function rankProgress(xp: number): number {
  const cur = rankForXp(xp);
  const nxt = nextRank(xp);
  if (!nxt) return 1;
  return (xp - cur.minXp) / (nxt.minXp - cur.minXp);
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  desc: string;
}

export const BADGES: Badge[] = [
  { id: "first-ticket", name: "First Blood", icon: "🩹", desc: "Resolve your first ticket." },
  { id: "perfect-csat", name: "Customer Champion", icon: "💯", desc: "Finish a ticket with 100% satisfaction." },
  { id: "speed-demon", name: "Speed Demon", icon: "⚡", desc: "Beat an SLA with time to spare." },
  { id: "streak-5", name: "On Fire", icon: "🔥", desc: "Hit a 5-ticket first-try streak." },
  { id: "vip-handled", name: "VIP Whisperer", icon: "👑", desc: "Resolve a VIP or Executive ticket." },
  { id: "security-pro", name: "Threat Hunter", icon: "🛡️", desc: "Handle a security incident correctly." },
  { id: "shift-complete", name: "Full Shift", icon: "🌙", desc: "Complete a full day-in-the-life shift." },
  { id: "hero", name: "Helpdesk Hero", icon: "🦸", desc: "Reach the final rank." },
];
