import { EXAMS } from "./exams";
import { RANKS } from "./ranks";

/** XP rank level unlocked by each passed exam (cumulative). */
export function certifiedMaxLevel(passedExamLevels: number[]): number {
  let max = 1;
  if (passedExamLevels.includes(1)) max = Math.max(max, 2);
  if (passedExamLevels.includes(2)) max = Math.max(max, 3);
  if (passedExamLevels.includes(3)) max = Math.max(max, 4);
  if (passedExamLevels.includes(4)) max = Math.max(max, 5);
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
  const needed = cap + 1;
  if (needed > 4) return null;
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
