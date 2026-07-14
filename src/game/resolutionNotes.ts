import { lessonFor } from "./lessons";
import type { Scenario } from "./types";

export interface ResolutionNote {
  id: string;
  text: string;
  correct: boolean;
}

const WRONG_NOTES = [
  "Marked resolved — no notes added.",
  "Escalated to Tier 2 without documenting steps taken.",
  "Closed as user error; no follow-up scheduled.",
  "Reset password and closed immediately.",
  "Rebooted machine; ticket closed without verification.",
];

/** Three resolution-note options for the ticket log step (one correct). */
export function resolutionNotesFor(scenario: Scenario): ResolutionNote[] {
  const correctText =
    lessonFor(scenario.id) ??
    `Resolved ${scenario.title}: verified issue, applied fix, confirmed with user.`;

  const wrong = WRONG_NOTES.filter((t) => t !== correctText).slice(0, 2);
  const options: ResolutionNote[] = [
    { id: "correct", text: correctText, correct: true },
    ...wrong.map((text, i) => ({ id: `wrong-${i}`, text, correct: false })),
  ];

  // Stable shuffle seeded by scenario id so it's consistent per ticket.
  const seed = scenario.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  for (let i = options.length - 1; i > 0; i--) {
    const j = (seed + i * 7) % (i + 1);
    [options[i], options[j]] = [options[j], options[i]];
  }
  return options;
}
