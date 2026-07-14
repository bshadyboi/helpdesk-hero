import { useEffect, useRef, useState } from "react";
import type { UseGame } from "../game/useGame";
import { SHIFT_GOAL, SHIFT_START_MIN, useShift } from "../game/useShift";
import { blip, cancelSpeech, speak } from "../lib/speech";
import ChatPanel from "./ChatPanel";
import CustomerCard from "./CustomerCard";
import KnowledgePanel from "./KnowledgePanel";
import ResultModal from "./ResultModal";
import ShiftSummary from "./ShiftSummary";
import TicketQueue from "./TicketQueue";
import TopBar from "./TopBar";

interface Props {
  game: UseGame;
  onExit: () => void;
  onOpenTrophy: () => void;
}

interface Outcome {
  leveledUp: boolean;
  newLevel: number;
  newBadges: string[];
}

export default function Workspace({ game, onExit, onOpenTrophy }: Props) {
  const { progress, level, recordResult, toggleSound, toggleVoice } = game;
  const { state, dispatch } = useShift(level);

  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [toast, setToast] = useState<{ id: number; text: string; tier: string } | null>(null);

  // Seed "already handled" trackers from any restored shift so a refresh
  // neither re-speaks the current message nor re-banks a resolved ticket.
  const spokenRef = useRef<Set<string>>(
    new Set(
      (state.active?.messages ?? [])
        .filter((m) => m.role === "client")
        .map((m) => m.id)
    )
  );
  const recordedRef = useRef<Set<string>>(new Set(state.recorded));
  const startedRef = useRef(false);
  const prevQueueLen = useRef(0);

  // Kick off the first shift once — but only if there isn't a saved shift to resume.
  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      const hasSavedShift =
        state.active !== null ||
        state.queue.length > 0 ||
        state.resolved.length > 0 ||
        state.ended;
      if (!hasSavedShift) dispatch({ type: "START", level });
    }
    return () => cancelSpeech();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Speak new client messages + play a chime.
  const active = state.active;
  const lastMsg = active?.messages[active.messages.length - 1];
  useEffect(() => {
    if (!active || !lastMsg || lastMsg.role !== "client") return;
    if (spokenRef.current.has(lastMsg.id)) return;
    spokenRef.current.add(lastMsg.id);
    blip("message", progress.soundOn);
    if (progress.voiceOn) {
      setSpeakingId(lastMsg.id);
      speak(lastMsg.text, {
        persona: active.item.scenario.persona,
        onEnd: () => setSpeakingId((cur) => (cur === lastMsg.id ? null : cur)),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMsg?.id]);

  // Record a resolved ticket exactly once and capture the reward outcome.
  // Guarded by both an in-memory ref (same session) and the persisted
  // `recorded` list (survives refresh) so XP is never double-counted.
  useEffect(() => {
    if (!active?.lastResult) return;
    const instanceId = active.item.instanceId;
    if (recordedRef.current.has(instanceId) || state.recorded.includes(instanceId)) {
      // Already banked (e.g. resumed after a refresh) — show the result so the
      // player can continue, but never re-award XP or badges.
      setOutcome((cur) => cur ?? { leveledUp: false, newLevel: level, newBadges: [] });
      return;
    }
    recordedRef.current.add(instanceId);
    dispatch({ type: "MARK_RECORDED", instanceId });

    const s = active.item.scenario;
    const extra: string[] = [];
    if (s.tier === "VIP" || s.tier === "Executive") extra.push("vip-handled");
    if (s.category === "Security") extra.push("security-pro");
    if (state.resolved.length >= SHIFT_GOAL) extra.push("shift-complete");

    const res = recordResult(active.lastResult, extra);
    setOutcome(res);
    blip(res.leveledUp ? "levelup" : "success", progress.soundOn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.lastResult]);

  // Announce newly-arrived tickets with a toast.
  useEffect(() => {
    const len = state.queue.length;
    if (len > prevQueueLen.current && prevQueueLen.current !== 0 && !state.ended) {
      const newest = state.queue[state.queue.length - 1];
      setToast({
        id: Date.now(),
        text: `${newest.scenario.persona.name} · ${newest.scenario.title}`,
        tier: newest.scenario.tier,
      });
    }
    prevQueueLen.current = len;
  }, [state.queue.length, state.ended]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3600);
    return () => clearTimeout(t);
  }, [toast]);

  const handleOpen = (instanceId: string) => {
    if (active && active.phase !== "resolved") return;
    blip("newticket", progress.soundOn);
    setOutcome(null);
    dispatch({ type: "OPEN", instanceId });
  };

  const handlePick = (optionId: string) => {
    if (!active) return;
    const step = active.item.scenario.steps[active.stepIndex];
    const opt = step.options.find((o) => o.id === optionId);
    blip(opt?.correct ? "click" : "error", progress.soundOn);
    dispatch({ type: "PICK", optionId });
  };

  const handleReplay = (id: string, text: string) => {
    if (!active) return;
    setSpeakingId(id);
    speak(text, {
      persona: active.item.scenario.persona,
      onEnd: () => setSpeakingId((cur) => (cur === id ? null : cur)),
    });
  };

  const handleNext = () => {
    cancelSpeech();
    setSpeakingId(null);
    setOutcome(null);
    dispatch({ type: "CLOSE_ACTIVE" });
  };

  const handleEndShift = () => {
    cancelSpeech();
    dispatch({ type: "END_SHIFT" });
  };

  const handleNewShift = () => {
    spokenRef.current.clear();
    recordedRef.current.clear();
    prevQueueLen.current = 0;
    setToast(null);
    setOutcome(null);
    dispatch({ type: "START", level });
  };

  if (state.ended) {
    return (
      <ShiftSummary
        results={state.resolved}
        progress={progress}
        startClock={SHIFT_START_MIN}
        endClock={state.clock}
        onNewShift={handleNewShift}
        onHome={() => {
          cancelSpeech();
          onExit();
        }}
      />
    );
  }

  const showModal = active?.phase === "resolved" && active.lastResult && outcome;

  return (
    <div className="flex min-h-full flex-col">
      <TopBar
        progress={progress}
        clock={state.clock}
        resolvedCount={state.resolved.length}
        onToggleSound={toggleSound}
        onToggleVoice={() => {
          if (progress.voiceOn) cancelSpeech();
          toggleVoice();
        }}
        onEndShift={handleEndShift}
        onOpenTrophy={onOpenTrophy}
      />

      <main className="mx-auto grid w-full max-w-[1600px] flex-1 grid-cols-1 gap-4 p-4 xl:grid-cols-[300px_minmax(0,1fr)_330px]">
        <div className="h-[420px] xl:h-[calc(100vh-124px)]">
          <TicketQueue
            queue={state.queue}
            activeInstanceId={active?.item.instanceId ?? null}
            canOpen={!active || active.phase === "resolved"}
            onOpen={handleOpen}
          />
        </div>

        <div className="h-[75vh] xl:h-[calc(100vh-124px)]">
          <ChatPanel
            active={active}
            progress={progress}
            speakingId={speakingId}
            onPick={handlePick}
            onReplay={handleReplay}
          />
        </div>

        <div className="flex flex-col gap-4">
          <CustomerCard active={active} />
          <KnowledgePanel active={active} />
        </div>
      </main>

      {toast && (
        <div
          key={toast.id}
          className="fixed bottom-5 right-5 z-40 flex animate-slide-in items-center gap-3 rounded-xl border border-brand-400/30 bg-ink-850/95 px-4 py-3 shadow-glow backdrop-blur-xl"
        >
          <span className="grid h-9 w-9 shrink-0 animate-pulse-ring place-items-center rounded-lg bg-brand-500/20 text-lg">
            📩
          </span>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-brand-300">New {toast.tier} ticket</div>
            <div className="truncate text-sm text-slate-200">{toast.text}</div>
          </div>
        </div>
      )}

      {showModal && active?.lastResult && outcome && (
        <ResultModal
          result={active.lastResult}
          leveledUp={outcome.leveledUp}
          newLevel={outcome.newLevel}
          newBadges={outcome.newBadges}
          shiftDone={state.resolved.length >= SHIFT_GOAL}
          onNext={handleNext}
        />
      )}
    </div>
  );
}
