import { useEffect, useReducer } from "react";
import type { ChatMessage, Mood, Scenario, TicketResult } from "./types";
import { SCENARIOS } from "./scenarios";

export const SHIFT_START_MIN = 9 * 60; // 9:00 AM
export const SHIFT_GOAL = 6;
const MIN_PER_TICKET = Math.round((8 * 60) / SHIFT_GOAL); // spread across an 8h day
const MAX_QUEUE = 4;

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
  startReal: number;
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
}

type Action =
  | { type: "START"; level: number }
  | { type: "ENQUEUE" }
  | { type: "OPEN"; instanceId: string }
  | { type: "REVEAL_OPENING" }
  | { type: "PICK"; optionId: string }
  | { type: "REVEAL_REPLY" }
  | { type: "CLOSE_ACTIVE" }
  | { type: "END_SHIFT" }
  | { type: "SET_LEVEL"; level: number };

let idCounter = 0;
const uid = (p: string) => `${p}-${Date.now()}-${idCounter++}`;

function pickScenario(level: number, excludeIds: string[]): Scenario {
  const available = SCENARIOS.filter((s) => s.minLevel <= level);
  const fresh = available.filter((s) => !excludeIds.includes(s.id));
  const pool = fresh.length ? fresh : available.length ? available : SCENARIOS;
  // Weight slightly toward variety in difficulty.
  return pool[Math.floor(Math.random() * pool.length)];
}

function makeQueueItem(state: ShiftState, exclude: string[]): QueueItem {
  const scenario = pickScenario(state.level, exclude);
  return { instanceId: uid("t"), scenario, arrivedClock: state.clock };
}

function msg(role: ChatMessage["role"], text: string): ChatMessage {
  return { id: uid("m"), role, text, ts: Date.now() };
}

function computeResult(a: ActiveState): TicketResult {
  const timeSeconds = Math.round((Date.now() - a.startReal) / 1000);
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
      let s: ShiftState = {
        clock: SHIFT_START_MIN,
        queue: [],
        resolved: [],
        active: null,
        ended: false,
        seq: 0,
        level: action.level,
      };
      const exclude: string[] = [];
      for (let i = 0; i < 3; i++) {
        const item = makeQueueItem(s, exclude);
        exclude.push(item.scenario.id);
        s = { ...s, queue: [...s.queue, item] };
      }
      return s;
    }

    case "SET_LEVEL":
      return { ...state, level: action.level };

    case "ENQUEUE": {
      if (state.ended) return state;
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
      const active: ActiveState = {
        item,
        stepIndex: 0,
        csat: 80,
        mood: step.clientMood,
        messages: [],
        wrongPicks: 0,
        startReal: Date.now(),
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
      const ended = state.resolved.length >= SHIFT_GOAL;
      let next: ShiftState = { ...state, active: null, clock, ended };
      // Top the queue back up when a ticket closes.
      if (!ended && next.queue.length < 3) {
        const exclude = next.queue.map((q) => q.scenario.id);
        next = { ...next, queue: [...next.queue, makeQueueItem(next, exclude)] };
      }
      return next;
    }

    case "END_SHIFT":
      return { ...state, ended: true, active: state.active };

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
};

export function useShift(level: number) {
  const [state, dispatch] = useReducer(reducer, initialState);

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

  // Live queue: new tickets arrive periodically for a "busy floor" feel.
  useEffect(() => {
    if (state.ended || state.resolved.length >= SHIFT_GOAL) return;
    const t = setInterval(() => dispatch({ type: "ENQUEUE" }), 26000);
    return () => clearInterval(t);
  }, [state.ended, state.resolved.length]);

  return { state, dispatch };
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
