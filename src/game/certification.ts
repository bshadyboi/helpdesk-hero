import { EXAMS } from "./exams";
import { RANKS } from "./ranks";

/** XP rank level unlocked by each passed exam (cumulative). */
export function certifiedMaxLevel(passedExamLevels: number[]): number {
  let max = 1;
  for (let exam = 1; exam <= 7; exam++) {
    if (passedExamLevels.includes(exam)) max = Math.max(max, exam + 1);
  }
  return max;
}

/** Ticket queue difficulty gate: XP rank capped until certifications are passed. */
export function effectiveLevel(xpLevel: number, passedExamLevels: number[]): number {
  return Math.min(xpLevel, certifiedMaxLevel(passedExamLevels));
}

/** Next exam the player must pass to raise their effective level, if any. */
export function nextRequiredExam(xpLevel: number, passedExamLevels: number[]): number | null {
  const cap = certifiedMaxLevel(passedExamLevels);
  if (xpLevel <= cap) return null;
  // Exam N unlocks ticket level N+1; when capped at `cap`, pass exam `cap`.
  const needed = cap;
  if (needed > 7) return null;
  return passedExamLevels.includes(needed) ? null : needed;
}

export function examByLevel(level: number) {
  return EXAMS.find((e) => e.id === level);
}

export function certGateMessage(xpLevel: number, passedExamLevels: number[]): string | null {
  const examId = nextRequiredExam(xpLevel, passedExamLevels);
  if (!examId) return null;
  const exam = examByLevel(examId);
  const xpRank = RANKS.find((r) => r.level === xpLevel);
  if (!exam || !xpRank) return null;
  return `Your XP qualifies you as ${xpRank.title}, but you need to pass "${exam.title}" in Study Mode before harder tickets enter your queue.`;
}
