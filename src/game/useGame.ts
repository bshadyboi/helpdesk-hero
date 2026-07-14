import { useCallback, useEffect, useState } from "react";
import type { Progress, TicketResult } from "./types";
import { BADGES, rankForXp } from "./ranks";
import { effectiveLevel as calcEffectiveLevel } from "./certification";
import { scenarioById } from "./scenarios";

const STORAGE_KEY = "helpdesk-hero:v1";
const HISTORY_CAP = 50;
const EXAM_XP_REWARD = 150;

const defaultProgress: Progress = {
  xp: 0,
  ticketsResolved: 0,
  totalCsat: 0,
  bestStreak: 0,
  currentStreak: 0,
  completedScenarioIds: [],
  unlockedBadgeIds: [],
  soundOn: true,
  voiceOn: true,
  agentName: "",
  history: [],
  categoryStats: {},
  passedExamLevels: [],
  docsCorrect: 0,
  tutorialSeen: false,
};

function load(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultProgress };
    return { ...defaultProgress, ...(JSON.parse(raw) as Partial<Progress>) };
  } catch {
    return { ...defaultProgress };
  }
}

export interface UseGame {
  progress: Progress;
  level: number;
  xpLevel: number;
  effectiveLevel: number;
  avgCsat: number;
  newlyUnlocked: string[];
  clearNewlyUnlocked: () => void;
  setAgentName: (name: string) => void;
  toggleSound: () => void;
  toggleVoice: () => void;
  recordResult: (
    result: TicketResult,
    extraBadges?: string[]
  ) => { leveledUp: boolean; newBadges: string[]; newLevel: number };
  recordDocumentation: (classificationCorrect: boolean, noteCorrect: boolean) => boolean;
  passExam: (level: number) => { alreadyPassed: boolean; xpAwarded: number };
  markTutorialSeen: () => void;
  resetProgress: () => void;
}

export function useGame(): UseGame {
  const [progress, setProgress] = useState<Progress>(load);
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const xpLevel = rankForXp(progress.xp).level;
  const level = calcEffectiveLevel(xpLevel, progress.passedExamLevels);
  const avgCsat = progress.ticketsResolved
    ? Math.round(progress.totalCsat / progress.ticketsResolved)
    : 0;

  const setAgentName = useCallback((name: string) => {
    setProgress((p) => ({ ...p, agentName: name.trim().slice(0, 24) || "Agent" }));
  }, []);

  const toggleSound = useCallback(() => setProgress((p) => ({ ...p, soundOn: !p.soundOn })), []);
  const toggleVoice = useCallback(() => setProgress((p) => ({ ...p, voiceOn: !p.voiceOn })), []);

  const clearNewlyUnlocked = useCallback(() => setNewlyUnlocked([]), []);

  const recordResult = useCallback<UseGame["recordResult"]>((result, extraBadges = []) => {
    let leveledUp = false;
    let newLevel = 1;
    const newBadges: string[] = [];

    setProgress((prev) => {
      const beforeLevel = rankForXp(prev.xp).level;
      const xp = prev.xp + Math.max(0, result.xpEarned);
      const afterLevel = rankForXp(xp).level;
      leveledUp = afterLevel > beforeLevel;
      newLevel = afterLevel;

      const currentStreak = result.wrongPicks === 0 ? prev.currentStreak + 1 : 0;
      const bestStreak = Math.max(prev.bestStreak, currentStreak);
      const completedScenarioIds = prev.completedScenarioIds.includes(result.scenarioId)
        ? prev.completedScenarioIds
        : [...prev.completedScenarioIds, result.scenarioId];

      // Evaluate badge unlocks.
      const has = new Set(prev.unlockedBadgeIds);
      const unlock = (id: string) => {
        if (!has.has(id) && BADGES.some((b) => b.id === id)) {
          has.add(id);
          newBadges.push(id);
        }
      };

      unlock("first-ticket");
      if (result.csat >= 100) unlock("perfect-csat");
      if (result.slaMet) unlock("speed-demon");
      if (currentStreak >= 5) unlock("streak-5");
      if (afterLevel >= 8) unlock("hero");
      for (const b of extraBadges) unlock(b);

      // Track per-category performance + a rolling history for the dashboard.
      const category = scenarioById(result.scenarioId)?.category ?? "Accounts";
      const prevStat = prev.categoryStats[category] ?? { resolved: 0, csatSum: 0 };
      const categoryStats = {
        ...prev.categoryStats,
        [category]: {
          resolved: prevStat.resolved + 1,
          csatSum: prevStat.csatSum + result.csat,
        },
      };
      const history = [
        ...prev.history,
        {
          scenarioId: result.scenarioId,
          category,
          csat: result.csat,
          xpEarned: result.xpEarned,
          slaMet: result.slaMet,
          wrongPicks: result.wrongPicks,
          ts: Date.now(),
        },
      ].slice(-HISTORY_CAP);

      return {
        ...prev,
        xp,
        ticketsResolved: prev.ticketsResolved + 1,
        totalCsat: prev.totalCsat + result.csat,
        currentStreak,
        bestStreak,
        completedScenarioIds,
        unlockedBadgeIds: Array.from(has),
        categoryStats,
        history,
      };
    });

    if (newBadges.length) setNewlyUnlocked((n) => [...n, ...newBadges]);
    return { leveledUp, newBadges, newLevel };
  }, []);

  // Log wrap-up documentation accuracy; returns true when the "By The Book" badge
  // was newly unlocked so the UI can celebrate it.
  const recordDocumentation = useCallback<UseGame["recordDocumentation"]>(
    (classificationCorrect, noteCorrect) => {
      let unlockedBadge = false;
      const perfect = classificationCorrect && noteCorrect;
      setProgress((prev) => {
        const docsCorrect = prev.docsCorrect + (perfect ? 1 : 0);
        const has = new Set(prev.unlockedBadgeIds);
        if (perfect && !has.has("documentarian")) {
          has.add("documentarian");
          unlockedBadge = true;
        }
        return { ...prev, docsCorrect, unlockedBadgeIds: Array.from(has) };
      });
      if (unlockedBadge) setNewlyUnlocked((n) => [...n, "documentarian"]);
      return unlockedBadge;
    },
    []
  );

  // Bank a passed certification exam: awards XP once and unlocks "Certified".
  const passExam = useCallback<UseGame["passExam"]>((examLevel) => {
    let alreadyPassed = false;
    let xpAwarded = 0;
    setProgress((prev) => {
      if (prev.passedExamLevels.includes(examLevel)) {
        alreadyPassed = true;
        return prev;
      }
      xpAwarded = EXAM_XP_REWARD;
      const has = new Set(prev.unlockedBadgeIds);
      if (!has.has("certified")) has.add("certified");
      return {
        ...prev,
        xp: prev.xp + EXAM_XP_REWARD,
        passedExamLevels: [...prev.passedExamLevels, examLevel],
        unlockedBadgeIds: Array.from(has),
      };
    });
    if (!alreadyPassed) setNewlyUnlocked((n) => [...n, "certified"]);
    return { alreadyPassed, xpAwarded };
  }, []);

  const markTutorialSeen = useCallback(() => {
    setProgress((p) => (p.tutorialSeen ? p : { ...p, tutorialSeen: true }));
  }, []);

  // Allow tier/category-specific badges to be unlocked from the UI layer.
  const resetProgress = useCallback(() => {
    setProgress({ ...defaultProgress });
    setNewlyUnlocked([]);
  }, []);

  return {
    progress,
    level,
    xpLevel,
    effectiveLevel: level,
    avgCsat,
    newlyUnlocked,
    clearNewlyUnlocked,
    setAgentName,
    toggleSound,
    toggleVoice,
    recordResult,
    recordDocumentation,
    passExam,
    markTutorialSeen,
    resetProgress,
  };
}
