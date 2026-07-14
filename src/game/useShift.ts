import { useEffect, useReducer } from "react";
import type { Category, CategoryStat, ChatMessage, Mood, Scenario, TicketResult } from "./types";
import { pickAdaptiveScenario, type ShiftType } from "./adaptive";
import { scenarioById } from "./scenarios";

export const SHIFT_START_MIN = 9 * 60; // 9:00 AM
export const SHIFT_NIGHT_START = 17 * 60; // 5:00 PM
export const SHIFT_GOAL = 6;
const MIN_PER_TICKET = Math.round((8 * 60) / SHIFT_GOAL);
const MAX_QUEUE = 4;

export type ShiftMode = "shift" | "practice";

export type Phase = "opening-typing" | "awaiting" | "reply-typing" | "resolved";

export interface QueueItem {
  instanceId: string;
  scenario: Scenario;
  arrivedClock: number;
}

interface Pending {
  reply: string;
  correct: boolean;
  mood: Mood;
  coaching?: string;
}

export interface ActiveState {
  item: QueueItem;
  stepIndex: number;
  csat: number;
  mood: Mood;
  messages: ChatMessage[];
  wrongPicks: number;
  /** @deprecated legacy — use elapsedMs + timerAnchor */
  startReal: number;
  /** accumulated ms on this ticket (frozen across refresh) */
  elapsedMs: number;
  /** wall-clock anchor for the current running segment */
  timerAnchor: number;
  phase: Phase;
  coaching: string | null;
  pending: Pending | null;
  lastResult: TicketResult | null;
}

export interface ShiftState {
  clock: number;
  queue: QueueItem[];
  resolved: TicketResult[];
  active: ActiveState | null;
  ended: boolean;
  seq: number;
  level: number;
  recorded: string[];
  mode: ShiftMode;
  categoryStats: Partial<Record<Category, CategoryStat>>;
  shiftType: ShiftType;
}

type Action =
  | {
      type: "START";
      level: number;
      categoryStats: Partial<Record<Category, CategoryStat>>;
      shiftType?: ShiftType;
    }
  | { type: "PRACTICE_START"; level: number; scenarioId: string; categoryStats: Partial<Record<Category, CategoryStat>> }
  | { type: "ENQUEUE" }
  | { type: "OPEN"; instanceId: string }
  | { type: "REVEAL_OPENING" }
  | { type: "PICK"; optionId: string }
  | { type: "REVEAL_REPLY" }
  | { type: "CLOSE_ACTIVE" }
  | { type: "END_SHIFT" }
  | { type: "SET_LEVEL"; level: number }
  | { type: "SET_CATEGORY_STATS"; categoryStats: Partial<Record<Category, CategoryStat>> }
  | { type: "MARK_RECORDED"; instanceId: string };

let idCounter = 0;
const uid = (p: string) => `${p}-${Date.now()}-${idCounter++}`;

function makeQueueItem(state: ShiftState, exclude: string[]): QueueItem {
  const scenario = pickAdaptiveScenario(
    state.level,
    exclude,
    state.categoryStats,
    state.shiftType
  );
  return { instanceId: uid("t"), scenario, arrivedClock: state.clock };
}

function makePracticeItem(state: ShiftState, scenario: Scenario): QueueItem {
  return { instanceId: uid("t"), scenario, arrivedClock: state.clock };
}

function msg(role: ChatMessage["role"], text: string): ChatMessage {
  return { id: uid("m"), role, text, ts: Date.now() };
}

function activeElapsedMs(a: ActiveState, now = Date.now()): number {
  if (a.elapsedMs == null) {
    if (a.startReal) return Math.max(0, now - a.startReal);
    return 0;
  }
  const anchor = a.timerAnchor ?? now;
  const base = a.elapsedMs;
  if (a.phase === "resolved") return base;
  return base + Math.max(0, now - anchor);
}

function computeResult(a: ActiveState): TicketResult {
  const timeSeconds = Math.round(activeElapsedMs(a) / 1000);
  const s = a.item.scenario;
  const slaMet = timeSeconds <= s.slaSeconds;
  const csat = Math.max(0, Math.min(100, Math.round(a.csat)));
  const perfMult = 0.4 + 0.6 * (csat / 100);
  const firstTryMult = a.wrongPicks === 0 ? 1.15 : 1;
  const slaMult = slaMet ? 1.1 : 1;
  const xpEarned = Math.round(s.xp * perfMult * firstTryMult * slaMult);
  return {
    scenarioId: s.id,
    title: s.title,
    persona: s.persona.name,
    csat,
    xpEarned,
    timeSeconds,
    slaMet,
    firstTryStreak: a.wrongPicks === 0 ? 1 : 0,
    wrongPicks: a.wrongPicks,
  };
}

function reducer(state: ShiftState, action: Action): ShiftState {
  switch (action.type) {
    case "START": {
      const shiftType = action.shiftType ?? "day";
      let s: ShiftState = {
        clock: shiftType === "night" ? SHIFT_NIGHT_START : SHIFT_START_MIN,
        queue: [],
        resolved: [],
        active: null,
        ended: false,
        seq: 0,
        level: action.level,
        recorded: [],
        mode: "shift",
        categoryStats: action.categoryStats,
        shiftType,
      };
      const exclude: string[] = [];
      for (let i = 0; i < 3; i++) {
        const item = makeQueueItem(s, exclude);
        exclude.push(item.scenario.id);
        s = { ...s, queue: [...s.queue, item] };
      }
      return s;
    }

    case "PRACTICE_START": {
      const scenario = scenarioById(action.scenarioId);
      if (!scenario || scenario.minLevel > action.level) return state;
      const item = makePracticeItem(
        {
          clock: SHIFT_START_MIN,
          queue: [],
          resolved: [],
          active: null,
          ended: false,
          seq: 0,
          level: action.level,
          recorded: [],
          mode: "practice",
          categoryStats: action.categoryStats,
          shiftType: "day",
        },
        scenario
      );
      return {
        clock: SHIFT_START_MIN,
        queue: [item],
        resolved: [],
        active: null,
        ended: false,
        seq: 0,
        level: action.level,
        recorded: [],
        mode: "practice",
        categoryStats: action.categoryStats,
        shiftType: "day",
      };
    }

    case "SET_CATEGORY_STATS":
      return { ...state, categoryStats: action.categoryStats };

    case "SET_LEVEL":
      return { ...state, level: action.level };

    case "ENQUEUE": {
      if (state.ended || state.mode === "practice") return state;
      if (state.queue.length >= MAX_QUEUE) return state;
      const exclude = [
        ...state.queue.map((q) => q.scenario.id),
        ...(state.active ? [state.active.item.scenario.id] : []),
      ];
      return { ...state, queue: [...state.queue, makeQueueItem(state, exclude)] };
    }

    case "OPEN": {
      if (state.active && state.active.phase !== "resolved") return state;
      const item = state.queue.find((q) => q.instanceId === action.instanceId);
      if (!item) return state;
      const step = item.scenario.steps[0];
      const now = Date.now();
      const active: ActiveState = {
        item,
        stepIndex: 0,
        csat: 80,
        mood: step.clientMood,
        messages: [],
        wrongPicks: 0,
        startReal: now,
        elapsedMs: 0,
        timerAnchor: now,
        phase: "opening-typing",
        coaching: null,
        pending: null,
        lastResult: null,
      };
      return { ...state, active, queue: state.queue.filter((q) => q.instanceId !== action.instanceId) };
    }

    case "REVEAL_OPENING": {
      const a = state.active;
      if (!a || a.phase !== "opening-typing") return state;
      const step = a.item.scenario.steps[a.stepIndex];
      return {
        ...state,
        active: {
          ...a,
          phase: "awaiting",
          mood: step.clientMood,
          messages: [...a.messages, msg("client", step.clientMessage)],
        },
      };
    }

    case "PICK": {
      const a = state.active;
      if (!a || a.phase !== "awaiting") return state;
      const step = a.item.scenario.steps[a.stepIndex];
      const opt = step.options.find((o) => o.id === action.optionId);
      if (!opt) return state;
      const csat = Math.max(0, Math.min(100, a.csat + opt.csat));
      return {
        ...state,
        active: {
          ...a,
          csat,
          phase: "reply-typing",
          coaching: null,
          wrongPicks: a.wrongPicks + (opt.correct ? 0 : 1),
          messages: [...a.messages, msg("agent", opt.text)],
          pending: { reply: opt.reply, correct: opt.correct, mood: opt.mood ?? a.mood, coaching: opt.coaching },
        },
      };
    }

    case "REVEAL_REPLY": {
      const a = state.active;
      if (!a || a.phase !== "reply-typing" || !a.pending) return state;
      const messages = [...a.messages, msg("client", a.pending.reply)];
      const mood = a.pending.mood;
      const isLastStep = a.stepIndex >= a.item.scenario.steps.length - 1;

      if (a.pending.correct && isLastStep) {
        const resolvedActive: ActiveState = {
          ...a,
          messages,
          mood,
          phase: "resolved",
          pending: null,
          coaching: null,
        };
        const result = computeResult(resolvedActive);
        return {
          ...state,
          active: { ...resolvedActive, lastResult: result },
          resolved: [...state.resolved, result],
        };
      }

      if (a.pending.correct) {
        const nextIndex = a.stepIndex + 1;
        return {
          ...state,
          active: {
            ...a,
            messages,
            mood,
            stepIndex: nextIndex,
            phase: "awaiting",
            pending: null,
            coaching: null,
          },
        };
      }

      // Wrong pick: stay on the same step, show coaching, let them retry.
      return {
        ...state,
        active: {
          ...a,
          messages,
          mood,
          phase: "awaiting",
          pending: null,
          coaching: a.pending.coaching ?? "Not quite — think about the safest next step.",
        },
      };
    }

    case "CLOSE_ACTIVE": {
      if (!state.active) return state;
      const clock = state.clock + MIN_PER_TICKET;
      const shiftDone =
        state.mode === "practice"
          ? state.resolved.length >= 1
          : state.resolved.length >= SHIFT_GOAL;
      let next: ShiftState = { ...state, active: null, clock, ended: shiftDone };
      if (!shiftDone && state.mode === "shift" && next.queue.length < 3) {
        const exclude = next.queue.map((q) => q.scenario.id);
        next = { ...next, queue: [...next.queue, makeQueueItem(next, exclude)] };
      }
      return next;
    }

    case "END_SHIFT":
      return { ...state, ended: true, active: state.active };

    case "MARK_RECORDED":
      return state.recorded.includes(action.instanceId)
        ? state
        : { ...state, recorded: [...state.recorded, action.instanceId] };

    default:
      return state;
  }
}

const initialState: ShiftState = {
  clock: SHIFT_START_MIN,
  queue: [],
  resolved: [],
  active: null,
  ended: false,
  seq: 0,
  level: 1,
  recorded: [],
  mode: "shift",
  categoryStats: {},
  shiftType: "day",
};

function normalizeActiveTimer(active: ActiveState): ActiveState {
  if (active.phase === "resolved") return active;
  const now = Date.now();
  const elapsedMs = activeElapsedMs(active, now);
  return { ...active, elapsedMs, timerAnchor: now, startReal: now - elapsedMs };
}

function snapshotStateForSave(state: ShiftState): ShiftState {
  if (!state.active || state.active.phase === "resolved") return state;
  return { ...state, active: normalizeActiveTimer(state.active) };
}

function hydrateLoadedShift(saved: ShiftState): ShiftState {
  if (saved.active && saved.active.phase !== "resolved") {
    return { ...saved, active: normalizeActiveTimer(saved.active) };
  }
  return saved;
}

const SHIFT_STORAGE_KEY = "helpdesk-hero:shift:v1";

/** Load any in-progress shift saved from a previous session. */
function loadShift(): ShiftState {
  try {
    const raw = localStorage.getItem(SHIFT_STORAGE_KEY);
    if (!raw) return initialState;
    const saved = JSON.parse(raw) as Partial<ShiftState> | null;
    if (!saved || typeof saved !== "object" || !Array.isArray(saved.queue)) {
      return initialState;
    }
    const merged = {
      ...initialState,
      ...saved,
      mode: saved.mode ?? "shift",
      categoryStats: saved.categoryStats ?? {},
      shiftType: saved.shiftType ?? "day",
    } as ShiftState;
    return hydrateLoadedShift(merged);
  } catch {
    return initialState;
  }
}

/** Wipe the saved shift (used on full reset and when clocking into a fresh shift). */
export function clearSavedShift() {
  try {
    localStorage.removeItem(SHIFT_STORAGE_KEY);
  } catch {
    // ignore storage errors
  }
}

export interface SavedShiftSummary {
  resolved: number;
  queue: number;
  hasActive: boolean;
  clock: number;
  mode: ShiftMode;
}

/** True when a resumable shift exists in localStorage. */
export function hasSavedShift(): boolean {
  try {
    const raw = localStorage.getItem(SHIFT_STORAGE_KEY);
    if (!raw) return false;
    const saved = JSON.parse(raw) as Partial<ShiftState>;
    if (!saved || saved.mode === "practice") return false;
    return Boolean(
      saved.active || (saved.queue && saved.queue.length > 0) || (saved.resolved && saved.resolved.length > 0)
    );
  } catch {
    return false;
  }
}

export function getSavedShiftSummary(): SavedShiftSummary | null {
  try {
    const raw = localStorage.getItem(SHIFT_STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as Partial<ShiftState>;
    if (!saved || saved.mode === "practice") return null;
    const has =
      saved.active || (saved.queue && saved.queue.length > 0) || (saved.resolved && saved.resolved.length > 0);
    if (!has) return null;
    return {
      resolved: saved.resolved?.length ?? 0,
      queue: saved.queue?.length ?? 0,
      hasActive: Boolean(saved.active),
      clock: saved.clock ?? SHIFT_START_MIN,
      mode: saved.mode ?? "shift",
    };
  } catch {
    return null;
  }
}

export function useShift(
  level: number,
  categoryStats: Partial<Record<Category, CategoryStat>>,
  ticketsResolved: number
) {
  const [state, dispatch] = useReducer(reducer, undefined, loadShift);

  // Persist the live shift; freeze SLA timer so refresh doesn't eat the clock.
  useEffect(() => {
    try {
      localStorage.setItem(SHIFT_STORAGE_KEY, JSON.stringify(snapshotStateForSave(state)));
    } catch {
      // ignore storage quota / serialization errors
    }
  }, [state]);

  // Refresh queue weights after each resolved ticket (weak-area targeting).
  useEffect(() => {
    dispatch({ type: "SET_CATEGORY_STATS", categoryStats });
  }, [ticketsResolved, categoryStats]);

  // Keep the difficulty gate in sync with the player's live level.
  useEffect(() => {
    dispatch({ type: "SET_LEVEL", level });
  }, [level]);

  // Drive the timed "client is typing" reveals.
  useEffect(() => {
    const a = state.active;
    if (!a) return;
    if (a.phase === "opening-typing") {
      const t = setTimeout(() => dispatch({ type: "REVEAL_OPENING" }), 850);
      return () => clearTimeout(t);
    }
    if (a.phase === "reply-typing") {
      const delay = 700 + Math.min(1400, a.pending?.reply.length ? a.pending.reply.length * 12 : 700);
      const t = setTimeout(() => dispatch({ type: "REVEAL_REPLY" }), delay);
      return () => clearTimeout(t);
    }
  }, [state.active?.phase, state.active?.messages.length]);

  // Live queue: new tickets arrive periodically (shift mode only).
  useEffect(() => {
    if (state.ended || state.mode === "practice" || state.resolved.length >= SHIFT_GOAL) return;
    const t = setInterval(() => dispatch({ type: "ENQUEUE" }), 26000);
    return () => clearInterval(t);
  }, [state.ended, state.resolved.length]);

  return { state, dispatch };
}

export function activeElapsedSeconds(active: ActiveState): number {
  return Math.floor(activeElapsedMs(active) / 1000);
}

export function formatClock(minutes: number): string {
  const m = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60);
  let h = Math.floor(m / 60);
  const mm = (m % 60).toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${mm} ${ampm}`;
}
