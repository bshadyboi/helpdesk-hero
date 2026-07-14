import type { Persona } from "../game/types";

/**
 * Thin wrapper around the Web Speech API (SpeechSynthesis).
 * Gives each client persona a distinct-sounding voice with no backend or API key,
 * so the app can ship as a fully static site.
 */

let cachedVoices: SpeechSynthesisVoice[] = [];

function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  const v = window.speechSynthesis.getVoices();
  if (v.length) cachedVoices = v;
  return cachedVoices;
}

// Voices load async in most browsers.
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = () => loadVoices();
}

export function speechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function pickVoice(hint: Persona["voiceHint"]): SpeechSynthesisVoice | null {
  const voices = cachedVoices.length ? cachedVoices : loadVoices();
  if (!voices.length) return null;

  const english = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
  const pool = english.length ? english : voices;

  const femaleHints = ["female", "samantha", "victoria", "karen", "moira", "tessa", "zira", "fiona", "aria", "jenny"];
  const maleHints = ["male", "daniel", "alex", "fred", "david", "george", "rishi", "guy", "tom", "oliver"];

  const matches = (v: SpeechSynthesisVoice, hints: string[]) =>
    hints.some((h) => v.name.toLowerCase().includes(h));

  if (hint === "female") {
    const f = pool.find((v) => matches(v, femaleHints) && !matches(v, ["male"]));
    if (f) return f;
  }
  if (hint === "male") {
    const m = pool.find((v) => matches(v, maleHints));
    if (m) return m;
  }
  // Deterministic fallback so a persona keeps a consistent voice.
  const idx = hint === "female" ? 0 : hint === "male" ? Math.min(1, pool.length - 1) : Math.floor(pool.length / 2);
  return pool[idx] ?? pool[0] ?? null;
}

export function cancelSpeech() {
  if (speechSupported()) window.speechSynthesis.cancel();
}

interface SpeakOpts {
  persona: Persona;
  onStart?: () => void;
  onEnd?: () => void;
}

export function speak(text: string, { persona, onStart, onEnd }: SpeakOpts) {
  if (!speechSupported()) {
    onStart?.();
    onEnd?.();
    return;
  }
  // Interrupt anything currently speaking.
  window.speechSynthesis.cancel();

  const clean = text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "").replace(/["“”]/g, "");
  const utter = new SpeechSynthesisUtterance(clean);
  const voice = pickVoice(persona.voiceHint);
  if (voice) utter.voice = voice;
  utter.pitch = persona.pitch;
  utter.rate = persona.rate;
  utter.volume = 1;
  utter.onstart = () => onStart?.();
  utter.onend = () => onEnd?.();
  utter.onerror = () => onEnd?.();

  // Some browsers need a tick after cancel().
  setTimeout(() => window.speechSynthesis.speak(utter), 40);
}

/** Tiny UI blips using the Web Audio API — no asset files needed. */
let audioCtx: AudioContext | null = null;
function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!audioCtx) audioCtx = new AC();
  return audioCtx;
}

type Blip = "message" | "success" | "error" | "levelup" | "click" | "newticket";

export function blip(kind: Blip, enabled: boolean) {
  if (!enabled) return;
  const c = ctx();
  if (!c) return;
  if (c.state === "suspended") c.resume();

  const now = c.currentTime;
  const play = (freq: number, start: number, dur: number, type: OscillatorType = "sine", gain = 0.06) => {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now + start);
    g.gain.setValueAtTime(0, now + start);
    g.gain.linearRampToValueAtTime(gain, now + start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
    osc.connect(g).connect(c.destination);
    osc.start(now + start);
    osc.stop(now + start + dur + 0.02);
  };

  switch (kind) {
    case "message":
      play(660, 0, 0.12, "sine");
      break;
    case "newticket":
      play(520, 0, 0.1, "triangle");
      play(780, 0.09, 0.12, "triangle");
      break;
    case "click":
      play(320, 0, 0.05, "square", 0.03);
      break;
    case "success":
      play(523, 0, 0.12, "sine");
      play(659, 0.1, 0.12, "sine");
      play(784, 0.2, 0.18, "sine");
      break;
    case "error":
      play(220, 0, 0.18, "sawtooth", 0.05);
      break;
    case "levelup":
      play(523, 0, 0.12, "triangle");
      play(659, 0.1, 0.12, "triangle");
      play(784, 0.2, 0.12, "triangle");
      play(1047, 0.32, 0.28, "triangle");
      break;
  }
}
