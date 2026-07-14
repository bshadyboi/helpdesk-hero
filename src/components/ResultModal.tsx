import { useEffect, useMemo, useState } from "react";
import { BADGES, RANKS } from "../game/ranks";
import { kbById } from "../game/knowledge";
import { lessonFor } from "../game/lessons";
import type { Category, Scenario, Tier, TicketResult } from "../game/types";
import Confetti from "./Confetti";
import { categoryIcon, tierStyles } from "./ui";

interface Props {
  result: TicketResult;
  scenario: Scenario;
  leveledUp: boolean;
  newLevel: number;
  newBadges: string[];
  /** Log the wrap-up documentation; returns true if the "By The Book" badge just unlocked. */
  onDocumented: (correct: boolean) => boolean;
  onNext: () => void;
  shiftDone: boolean;
  practiceMode?: boolean;
}

const CATEGORIES = Object.keys(categoryIcon) as Category[];
const TIERS = Object.keys(tierStyles) as Tier[];

export default function ResultModal({
  result,
  scenario,
  leveledUp,
  newLevel,
  newBadges,
  onDocumented,
  onNext,
  shiftDone,
  practiceMode,
}: Props) {
  // Stage 1: documentation wrap-up. Stage 2: results + debrief.
  const [phase, setPhase] = useState<"doc" | "review">("doc");
  const [cat, setCat] = useState<Category | null>(null);
  const [tier, setTier] = useState<Tier | null>(null);
  const [docBadge, setDocBadge] = useState(false);

  const catCorrect = cat === scenario.category;
  const tierCorrect = tier === scenario.tier;
  const docPerfect = catCorrect && tierCorrect;

  const great = result.csat >= 85 && result.wrongPicks === 0;
  const good = result.csat >= 65;
  const headline = great ? "Flawless!" : good ? "Ticket resolved!" : "Resolved — with lessons";
  const emoji = great ? "🌟" : good ? "✅" : "📘";
  const rank = RANKS.find((r) => r.level === newLevel);
  const celebrate = leveledUp || newBadges.length > 0 || great || docBadge;

  const kbRefs = useMemo(() => {
    const ids = new Set<string>();
    for (const step of scenario.steps) for (const id of step.kb ?? []) ids.add(id);
    return Array.from(ids)
      .map((id) => kbById(id))
      .filter((a): a is NonNullable<typeof a> => Boolean(a));
  }, [scenario]);

  const lesson = lessonFor(scenario.id);

  const submitDoc = () => {
    if (!cat || !tier) return;
    setDocBadge(onDocumented(docPerfect));
    setPhase("review");
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (phase === "doc") {
          if (cat && tier) submitDoc();
        } else {
          onNext();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, cat, tier]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
      {phase === "review" && celebrate && <Confetti count={leveledUp ? 130 : 80} />}
      <div className="my-4 w-full max-w-md animate-pop-in panel overflow-hidden">
        <div
          className={`p-6 text-center ${
            phase === "doc"
              ? "bg-gradient-to-br from-brand-500/15 to-accent-500/10"
              : great
              ? "bg-gradient-to-br from-emerald-500/20 to-brand-500/10"
              : good
              ? "bg-gradient-to-br from-brand-500/15 to-accent-500/10"
              : "bg-gradient-to-br from-amber-500/10 to-ink-800"
          }`}
        >
          <div className="text-5xl">{phase === "doc" ? "🗂️" : emoji}</div>
          <h2 className="mt-2 text-2xl font-extrabold">
            {phase === "doc" ? "Log the ticket" : headline}
          </h2>
          <p className="text-sm text-slate-300">
            {scenario.title} · {scenario.persona.name}
          </p>
        </div>

        {phase === "doc" ? (
          <div className="p-5">
            <p className="mb-4 text-center text-sm text-slate-400">
              Before you close it, classify the ticket like you would in a real ticketing system.
            </p>

            <div className="mb-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Category
              </div>
              <div className="grid grid-cols-4 gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCat(c)}
                    className={`flex flex-col items-center gap-1 rounded-lg border px-1.5 py-2 text-[11px] font-semibold transition ${
                      cat === c
                        ? "border-brand-400/60 bg-brand-500/15 text-brand-100"
                        : "border-white/5 bg-ink-900/60 text-slate-400 hover:bg-white/5"
                    }`}
                  >
                    <span className="text-lg">{categoryIcon[c]}</span>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Priority
              </div>
              <div className="grid grid-cols-4 gap-2">
                {TIERS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTier(t)}
                    className={`flex flex-col items-center gap-1 rounded-lg border px-1.5 py-2 text-[11px] font-semibold transition ${
                      tier === t
                        ? "border-accent-400/60 bg-accent-500/15 text-accent-100"
                        : "border-white/5 bg-ink-900/60 text-slate-400 hover:bg-white/5"
                    }`}
                  >
                    <span className="text-lg">{tierStyles[t].icon}</span>
                    {tierStyles[t].label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={submitDoc}
              disabled={!cat || !tier}
              className="btn-primary w-full text-base disabled:cursor-not-allowed disabled:opacity-40"
            >
              Log ticket ▸
            </button>
          </div>
        ) : (
          <>
            {/* Documentation feedback */}
            <div className="mx-5 mt-4 rounded-xl border border-white/10 bg-ink-900/60 p-3 text-sm">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Ticket log
              </div>
              <DocLine
                label="Category"
                picked={cat!}
                correct={catCorrect}
                answer={scenario.category}
              />
              <DocLine
                label="Priority"
                picked={tier!}
                correct={tierCorrect}
                answer={scenario.tier}
              />
              {docPerfect ? (
                <div className="mt-1 text-xs text-emerald-300">Filed perfectly. That's how you keep a queue sane.</div>
              ) : (
                <div className="mt-1 text-xs text-amber-300/90">
                  Accurate classification routes tickets to the right team and sets the right SLA.
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 p-5 pb-3">
              <ResultStat label="Satisfaction" value={`${result.csat}%`} tone={result.csat >= 70 ? "good" : result.csat >= 40 ? "mid" : "bad"} />
              <ResultStat label="XP earned" value={`+${result.xpEarned}`} tone="xp" />
              <ResultStat
                label="Resolution time"
                value={`${Math.floor(result.timeSeconds / 60)}m ${result.timeSeconds % 60}s`}
                tone="neutral"
              />
              <ResultStat
                label="SLA"
                value={result.slaMet ? "Met ✔" : "Missed"}
                tone={result.slaMet ? "good" : "bad"}
              />
            </div>

            {/* Learning debrief */}
            {lesson && (
              <div className="mx-5 mb-3 rounded-xl border border-brand-400/25 bg-brand-500/10 p-3">
                <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-200">
                  <span>💡</span> Key takeaway
                </div>
                <p className="text-sm text-slate-200">{lesson}</p>
              </div>
            )}

            {kbRefs.length > 0 && (
              <div className="mx-5 mb-3 rounded-xl border border-white/10 bg-ink-900/50 p-3">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Reference — knowledge base
                </div>
                <div className="space-y-2">
                  {kbRefs.map((a) => (
                    <details key={a.id} className="group">
                      <summary className="cursor-pointer list-none text-sm font-semibold text-slate-200 marker:hidden">
                        <span className="mr-1 text-brand-300 transition group-open:rotate-90 inline-block">▸</span>
                        {a.title}
                      </summary>
                      <p className="mt-1 pl-4 text-xs leading-relaxed text-slate-400">{a.body}</p>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {result.wrongPicks === 0 ? (
              <div className="mx-5 mb-3 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-center text-sm text-emerald-300">
                🔥 First-try perfect — streak continues!
              </div>
            ) : (
              <div className="mx-5 mb-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-sm text-slate-400">
                {result.wrongPicks} misstep{result.wrongPicks > 1 ? "s" : ""} — streak reset. You'll nail it next time.
              </div>
            )}

            {leveledUp && rank && (
              <div className="mx-5 mb-3 animate-pop-in rounded-xl border border-accent-400/40 bg-accent-500/15 px-3 py-3 text-center">
                <div className="text-lg font-extrabold text-accent-200">
                  {rank.icon} Level up! You're now a {rank.title}
                </div>
                <div className="text-xs text-slate-300">{rank.blurb}</div>
              </div>
            )}

            {(newBadges.length > 0 || docBadge) && (
              <div className="mx-5 mb-3 flex flex-wrap justify-center gap-2">
                {[...newBadges, ...(docBadge ? ["documentarian"] : [])].map((id) => {
                  const b = BADGES.find((x) => x.id === id);
                  if (!b) return null;
                  return (
                    <span
                      key={id}
                      className="chip animate-pop-in border border-amber-400/30 bg-amber-500/15 text-amber-200"
                      title={b.desc}
                    >
                      {b.icon} {b.name}
                    </span>
                  );
                })}
              </div>
            )}

            <div className="p-5 pt-2">
              <button onClick={onNext} className="btn-primary w-full text-base">
                {practiceMode
                  ? "Finish practice ▸"
                  : shiftDone
                  ? "Finish shift & see summary ▸"
                  : "Next ticket ▸"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DocLine({
  label,
  picked,
  correct,
  answer,
}: {
  label: string;
  picked: string;
  correct: boolean;
  answer: string;
}) {
  return (
    <div className="flex items-center justify-between py-0.5 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className={correct ? "font-semibold text-emerald-300" : "font-semibold text-rose-300"}>
        {correct ? `✓ ${picked}` : `✗ ${picked} → ${answer}`}
      </span>
    </div>
  );
}

function ResultStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "good" | "mid" | "bad" | "xp" | "neutral";
}) {
  const color =
    tone === "good"
      ? "text-emerald-400"
      : tone === "bad"
      ? "text-rose-400"
      : tone === "mid"
      ? "text-amber-300"
      : tone === "xp"
      ? "text-brand-300"
      : "text-slate-200";
  return (
    <div className="rounded-xl border border-white/5 bg-ink-900/60 p-3 text-center">
      <div className={`text-xl font-extrabold ${color}`}>{value}</div>
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
    </div>
  );
}
