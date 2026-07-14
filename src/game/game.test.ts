import { describe, expect, it } from "vitest";
import {
  certifiedMaxLevel,
  effectiveLevel,
  nextRequiredExam,
} from "./certification";
import { pickAdaptiveScenario } from "./adaptive";
import { escalatedMood, queueAgingInfo } from "./queueAging";
import { activeElapsedMs } from "./timer";

describe("certification", () => {
  it("caps level at 1 with no exams", () => {
    expect(certifiedMaxLevel([])).toBe(1);
    expect(effectiveLevel(5, [])).toBe(1);
  });

  it("unlocks levels cumulatively per exam", () => {
    expect(certifiedMaxLevel([1])).toBe(2);
    expect(certifiedMaxLevel([1, 2, 3])).toBe(4);
    expect(certifiedMaxLevel([1, 2, 3, 4, 5, 6, 7])).toBe(8);
  });

  it("returns next required exam when XP outranks certs", () => {
    expect(nextRequiredExam(3, [1])).toBe(2);
    expect(nextRequiredExam(3, [1, 2])).toBeNull();
    expect(nextRequiredExam(8, [1, 2, 3, 4, 5, 6])).toBe(7);
  });
});

describe("queueAging", () => {
  it("escalates after wait thresholds", () => {
    const base = Date.now() - 30_000;
    expect(queueAgingInfo(base).level).toBe(0);
    expect(queueAgingInfo(Date.now() - 90_000).level).toBe(1);
    expect(queueAgingInfo(Date.now() - 150_000).level).toBe(2);
    expect(queueAgingInfo(Date.now() - 200_000).level).toBe(3);
  });

  it("bumps mood when aging is high", () => {
    expect(escalatedMood("calm", 3)).toBe("annoyed");
    expect(escalatedMood("friendly", 0)).toBe("friendly");
  });
});

describe("timer", () => {
  it("accumulates elapsed time across segments", () => {
    const now = 10_000;
    const state = {
      elapsedMs: 5000,
      timerAnchor: 8000,
      phase: "awaiting",
    };
    expect(activeElapsedMs(state, now)).toBe(7000);
  });

  it("freezes elapsed when resolved", () => {
    expect(activeElapsedMs({ elapsedMs: 9000, phase: "resolved" }, 50_000)).toBe(9000);
  });

  it("falls back to startReal for legacy saves", () => {
    expect(activeElapsedMs({ startReal: 1000, phase: "awaiting" }, 6000)).toBe(5000);
  });
});

describe("adaptive", () => {
  it("returns a scenario within level gate", () => {
    const s = pickAdaptiveScenario(2, [], {}, "day");
    expect(s.minLevel).toBeLessThanOrEqual(2);
  });

  it("night shift can pick on-call tagged scenarios", () => {
    let foundOnCall = false;
    for (let i = 0; i < 40; i++) {
      const s = pickAdaptiveScenario(4, [], {}, "night");
      if (s.tags.includes("on-call")) foundOnCall = true;
    }
    expect(foundOnCall).toBe(true);
  });
});
