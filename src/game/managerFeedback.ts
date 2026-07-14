import type { Progress, TicketResult } from "./types";
import { weakCategories } from "./adaptive";

export interface ManagerNote {
  manager: string;
  title: string;
  lines: string[];
}

export function buildManagerFeedback(
  results: TicketResult[],
  progress: Progress,
  grade: string
): ManagerNote {
  const manager = "Victor Nash";
  const title = "Service Desk Manager";
  const lines: string[] = [];

  if (results.length === 0) {
    lines.push("You clocked out without closing tickets. Come back when you're ready to run the floor.");
    return { manager, title, lines };
  }

  const avg = Math.round(results.reduce((a, r) => a + r.csat, 0) / results.length);
  const slaMet = results.filter((r) => r.slaMet).length;
  const flawless = results.filter((r) => r.wrongPicks === 0).length;
  const missedSla = results.length - slaMet;

  // Opening tone tied to grade
  if (grade === "A+" || grade === "A") {
    lines.push(
      `${progress.agentName || "Agent"}, strong shift — ${avg}% average CSAT and a ${grade}. That's the standard we want on the floor.`
    );
  } else if (grade === "B") {
    lines.push(
      `Solid work today at ${avg}% CSAT. You're handling the floor, but there's room to tighten up before the next level.`
    );
  } else {
    lines.push(
      `Thanks for grinding through a tough shift (${avg}% CSAT). Let's talk about what to change before your next clock-in.`
    );
  }

  // Specific coaching
  if (flawless >= results.length - 1 && flawless > 0) {
    lines.push(
      `${flawless} flawless first-try resolutions — your triage instincts are sharp. Keep that streak mindset.`
    );
  } else if (results.some((r) => r.wrongPicks >= 2)) {
    lines.push(
      "A few tickets needed multiple attempts. Slow down on the first reply — read the KB hint before guessing."
    );
  }

  if (missedSla >= 2) {
    lines.push(
      `You missed SLA on ${missedSla} tickets. Scope the issue fast, pick the quickest likely fix, and don't over-engineer under pressure.`
    );
  } else if (slaMet === results.length) {
    lines.push("Every SLA met — nice pacing. That's how you earn trust with panicking users.");
  }

  const weak = weakCategories(progress.categoryStats, 1);
  if (weak.length > 0 && progress.ticketsResolved >= 5) {
    const cat = weak[0];
    const stat = progress.categoryStats[cat];
    const catAvg = stat ? Math.round(stat.csatSum / stat.resolved) : 0;
    lines.push(
      `Heads-up for tomorrow: ${cat} is still your focus area (${catAvg}% lifetime CSAT). Hit Study Mode or Practice Library for extra reps.`
    );
  }

  // Highlight best/worst ticket this shift
  const worst = [...results].sort((a, b) => a.csat - b.csat)[0];
  const best = [...results].sort((a, b) => b.csat - a.csat)[0];
  if (worst && best && worst.csat < 70 && best.csat >= 85) {
    lines.push(
      `High point: "${best.title}" (${best.csat}% CSAT). Rough one: "${worst.title}" — review that scenario in Practice if you want a redo.`
    );
  }

  return { manager, title, lines };
}
