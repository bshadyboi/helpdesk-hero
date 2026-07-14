import { useEffect, useRef } from "react";
import type { ActiveState } from "../game/useShift";
import type { Progress } from "../game/types";
import { categoryIcon } from "./ui";

interface Props {
  active: ActiveState | null;
  progress: Progress;
  speakingId: string | null;
  onPick: (optionId: string) => void;
  onReplay: (id: string, text: string) => void;
}

export default function ChatPanel({ active, progress, speakingId, onPick, onReplay }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [active?.messages.length, active?.phase, active?.coaching]);

  // Keyboard shortcuts: A–Z or 1–9 to choose a response.
  useEffect(() => {
    if (!active || active.phase !== "awaiting") return;
    const opts = active.item.scenario.steps[active.stepIndex].options;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      let idx = -1;
      if (/^[1-9]$/.test(e.key)) idx = parseInt(e.key, 10) - 1;
      else {
        const l = e.key.toLowerCase();
        if (l >= "a" && l <= "z") idx = l.charCodeAt(0) - 97;
      }
      if (idx >= 0 && idx < opts.length) {
        e.preventDefault();
        onPick(opts[idx].id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active?.phase, active?.stepIndex, active?.item.instanceId, onPick]);

  if (!active) {
    return (
      <section className="panel flex h-full flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 text-6xl animate-bounce-sm">🎧</div>
        <h2 className="text-xl font-bold">You're on the floor</h2>
        <p className="mt-2 max-w-sm text-slate-400">
          Pick a ticket from the queue on the left to open a live chat with a client. Listen, diagnose,
          and resolve it to earn XP and keep customers happy.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs text-slate-500">
          <span className="chip bg-white/5">1 · Read the issue</span>
          <span className="chip bg-white/5">2 · Choose the best action</span>
          <span className="chip bg-white/5">3 · Resolve & delight</span>
        </div>
      </section>
    );
  }

  const s = active.item.scenario;
  const step = s.steps[active.stepIndex];
  const showOptions = active.phase === "awaiting";
  const clientTyping = active.phase === "opening-typing" || active.phase === "reply-typing";

  return (
    <section className="panel flex h-full flex-col overflow-hidden">
      {/* Chat header */}
      <div className="flex items-center gap-3 border-b border-white/5 bg-ink-900/40 px-4 py-3">
        <div className="relative">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-ink-800 text-2xl">
            {s.persona.avatar}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-ink-850 bg-emerald-400" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-bold">{s.persona.name}</span>
            <span className="chip bg-white/5 text-[10px] text-slate-400">
              {categoryIcon[s.category]} {s.category}
            </span>
          </div>
          <div className="truncate text-xs text-slate-400">
            {s.persona.role} · {s.persona.company}
          </div>
        </div>
        <div className="text-right text-[11px] text-slate-500">
          <div className="font-mono text-slate-400">#{s.id.slice(0, 6).toUpperCase()}</div>
          <div>
            Step {Math.min(active.stepIndex + 1, s.steps.length)}/{s.steps.length}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
        <div className="mx-auto w-fit rounded-full bg-white/5 px-3 py-1 text-[11px] text-slate-400">
          Ticket opened · {s.title}
        </div>

        {active.messages.map((m) => {
          if (m.role === "agent") {
            return (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[80%] animate-pop-in rounded-2xl rounded-br-sm bg-gradient-to-br from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-medium text-ink-950 shadow-glow">
                  {stripQuotes(m.text)}
                </div>
              </div>
            );
          }
          const speaking = speakingId === m.id;
          return (
            <div key={m.id} className="flex items-end gap-2">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink-800 text-lg">
                {s.persona.avatar}
              </div>
              <div
                className={`group relative max-w-[80%] animate-pop-in rounded-2xl rounded-bl-sm border px-4 py-2.5 text-sm shadow-card transition ${
                  speaking
                    ? "border-brand-400/50 bg-ink-800"
                    : "border-white/5 bg-ink-850"
                }`}
              >
                {m.text}
                <button
                  onClick={() => onReplay(m.id, m.text)}
                  title="Replay voice"
                  className="ml-2 align-middle text-xs text-slate-500 opacity-0 transition hover:text-brand-300 group-hover:opacity-100"
                >
                  {speaking ? "🔊" : "🔁"}
                </button>
              </div>
            </div>
          );
        })}

        {clientTyping && (
          <div className="flex items-end gap-2">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink-800 text-lg">
              {s.persona.avatar}
            </div>
            <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-white/5 bg-ink-850 px-4 py-3">
              <span className="typing-dot h-2 w-2 rounded-full bg-slate-400" />
              <span className="typing-dot h-2 w-2 rounded-full bg-slate-400" />
              <span className="typing-dot h-2 w-2 rounded-full bg-slate-400" />
            </div>
          </div>
        )}

        {active.coaching && showOptions && (
          <div className="mx-auto max-w-[92%] animate-fade-up rounded-xl border border-amber-400/25 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-200">
            <span className="font-semibold">Coach:</span> {active.coaching}
          </div>
        )}
      </div>

      {/* Response options */}
      <div className="border-t border-white/5 bg-ink-900/40 p-3">
        {showOptions ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                How do you respond?
              </span>
              <span className="hidden text-[10px] text-slate-600 sm:inline">
                tip: press A–{String.fromCharCode(64 + step.options.length)} or 1–{step.options.length}
              </span>
            </div>
            {step.options.map((o, i) => (
              <button
                key={o.id}
                onClick={() => onPick(o.id)}
                className="flex w-full items-center gap-3 rounded-xl border border-white/5 bg-ink-850 px-3 py-2.5 text-left text-sm transition hover:border-brand-400/40 hover:bg-ink-800 active:scale-[0.99]"
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-white/5 text-xs font-bold text-slate-400">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-slate-200">{o.text}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 py-3 text-sm text-slate-500">
            {active.phase === "resolved" ? (
              <span className="font-semibold text-brand-300">Ticket resolved ✔</span>
            ) : (
              <>
                <span className="typing-dot h-1.5 w-1.5 rounded-full bg-slate-500" />
                {progress.voiceOn ? `${s.persona.name} is responding…` : "…"}
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function stripQuotes(t: string): string {
  return t.replace(/^["“]|["”]$/g, "");
}
