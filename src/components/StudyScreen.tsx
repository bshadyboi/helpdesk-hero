import { useMemo, useState } from "react";
import { KB } from "../game/knowledge";
import { EXAMS, type Exam } from "../game/exams";
import type { Category, Progress } from "../game/types";
import { categoryIcon } from "./ui";

interface Props {
  progress: Progress;
  onClose: () => void;
  onPassExam: (id: number) => { alreadyPassed: boolean; xpAwarded: number };
}

type Tab = "kb" | "exams";

export default function StudyScreen({ progress, onClose, onPassExam }: Props) {
  const [tab, setTab] = useState<Tab>("kb");
  const [activeExam, setActiveExam] = useState<Exam | null>(null);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
      <div className="mx-auto my-4 w-full max-w-3xl animate-pop-in panel overflow-hidden">
        <div className="flex items-center justify-between bg-gradient-to-br from-accent-500/20 to-brand-500/15 p-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-brand-200">
              Training Center
            </div>
            <h2 className="text-2xl font-extrabold">Study &amp; Certify</h2>
            <div className="text-sm text-slate-300">
              Learn the playbook, then prove it. {progress.passedExamLevels.length}/{EXAMS.length} certifications earned.
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost">
            Close ✕
          </button>
        </div>

        {activeExam ? (
          <ExamRunner
            exam={activeExam}
            alreadyPassed={progress.passedExamLevels.includes(activeExam.id)}
            onPassExam={onPassExam}
            onBack={() => setActiveExam(null)}
          />
        ) : (
          <>
            <div className="flex gap-2 border-b border-white/5 px-5 pt-4">
              <TabButton active={tab === "kb"} onClick={() => setTab("kb")}>
                📚 Knowledge Base
              </TabButton>
              <TabButton active={tab === "exams"} onClick={() => setTab("exams")}>
                📜 Certifications
              </TabButton>
            </div>

            {tab === "kb" ? (
              <KnowledgeLibrary />
            ) : (
              <ExamList progress={progress} onStart={(e) => setActiveExam(e)} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function KnowledgeLibrary() {
  const grouped = useMemo(() => {
    const map = new Map<Category, typeof KB>();
    for (const a of KB) {
      const arr = map.get(a.category) ?? [];
      arr.push(a);
      map.set(a.category, arr);
    }
    return Array.from(map.entries());
  }, []);

  return (
    <div className="max-h-[65vh] space-y-5 overflow-y-auto p-5">
      {grouped.map(([category, articles]) => (
        <div key={category}>
          <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
            {categoryIcon[category]} {category}
          </div>
          <div className="space-y-2">
            {articles.map((a) => (
              <div key={a.id} className="rounded-xl border border-white/5 bg-ink-900/60 p-4">
                <div className="mb-1 font-bold text-slate-100">{a.title}</div>
                <p className="text-sm leading-relaxed text-slate-400">{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ExamList({
  progress,
  onStart,
}: {
  progress: Progress;
  onStart: (exam: Exam) => void;
}) {
  return (
    <div className="max-h-[65vh] space-y-3 overflow-y-auto p-5">
      {EXAMS.map((exam) => {
        const passed = progress.passedExamLevels.includes(exam.id);
        return (
          <button
            key={exam.id}
            onClick={() => onStart(exam)}
            className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
              passed
                ? "border-emerald-400/30 bg-emerald-500/10 hover:bg-emerald-500/15"
                : "border-white/10 bg-ink-900/60 hover:bg-white/5"
            }`}
          >
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-ink-950/60 text-2xl">
              {exam.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 font-bold">
                {exam.title}
                {passed && (
                  <span className="chip border border-emerald-400/30 bg-emerald-500/15 text-emerald-200">
                    ✓ Certified
                  </span>
                )}
              </div>
              <div className="text-sm text-slate-400">{exam.blurb}</div>
              <div className="mt-0.5 text-xs text-slate-500">
                {exam.questions.length} questions · pass {exam.passPct}%
              </div>
            </div>
            <span className="text-brand-300">{passed ? "Retake ▸" : "Start ▸"}</span>
          </button>
        );
      })}
    </div>
  );
}

function ExamRunner({
  exam,
  alreadyPassed,
  onPassExam,
  onBack,
}: {
  exam: Exam;
  alreadyPassed: boolean;
  onPassExam: (id: number) => { alreadyPassed: boolean; xpAwarded: number };
  onBack: () => void;
}) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(0);

  const correctCount = exam.questions.filter((q) => answers[q.id] === q.answer).length;
  const pct = Math.round((correctCount / exam.questions.length) * 100);
  const passed = pct >= exam.passPct;
  const allAnswered = exam.questions.every((q) => answers[q.id] !== undefined);

  const submit = () => {
    if (!allAnswered) return;
    setSubmitted(true);
    if (pct >= exam.passPct) {
      const res = onPassExam(exam.id);
      setXpAwarded(res.xpAwarded);
    }
  };

  return (
    <div className="max-h-[70vh] overflow-y-auto p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold">
          <span className="text-xl">{exam.icon}</span> {exam.title}
        </div>
        <button onClick={onBack} className="btn-ghost text-xs">
          ← Back
        </button>
      </div>

      {submitted && (
        <div
          className={`mb-4 rounded-xl border p-4 text-center ${
            passed
              ? "border-emerald-400/30 bg-emerald-500/10"
              : "border-rose-400/30 bg-rose-500/10"
          }`}
        >
          <div className="text-3xl">{passed ? "🎉" : "📚"}</div>
          <div className="mt-1 text-xl font-extrabold">
            {pct}% — {passed ? "Passed!" : "Not yet"}
          </div>
          <div className="text-sm text-slate-300">
            {correctCount}/{exam.questions.length} correct · need {exam.passPct}%
          </div>
          {passed && xpAwarded > 0 && (
            <div className="mt-1 text-sm font-semibold text-brand-300">
              +{xpAwarded} XP · Certified badge earned!
            </div>
          )}
          {passed && xpAwarded === 0 && alreadyPassed && (
            <div className="mt-1 text-xs text-slate-400">Already certified — no additional XP.</div>
          )}
          {!passed && (
            <div className="mt-1 text-xs text-slate-400">Review the explanations below and try again.</div>
          )}
        </div>
      )}

      <div className="space-y-5">
        {exam.questions.map((q, qi) => {
          const picked = answers[q.id];
          return (
            <div key={q.id} className="rounded-xl border border-white/5 bg-ink-900/60 p-4">
              <div className="mb-3 font-semibold">
                {qi + 1}. {q.q}
              </div>
              <div className="space-y-2">
                {q.options.map((opt, oi) => {
                  const isPicked = picked === oi;
                  const isAnswer = q.answer === oi;
                  let cls = "border-white/10 bg-ink-950/40 hover:bg-white/5";
                  if (submitted) {
                    if (isAnswer) cls = "border-emerald-400/40 bg-emerald-500/10 text-emerald-100";
                    else if (isPicked) cls = "border-rose-400/40 bg-rose-500/10 text-rose-100";
                    else cls = "border-white/5 bg-ink-950/40 opacity-70";
                  } else if (isPicked) {
                    cls = "border-brand-400/50 bg-brand-500/15 text-brand-100";
                  }
                  return (
                    <button
                      key={oi}
                      disabled={submitted}
                      onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                      className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition ${cls}`}
                    >
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-white/20 text-[11px]">
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <span className="flex-1">{opt}</span>
                      {submitted && isAnswer && <span>✓</span>}
                      {submitted && isPicked && !isAnswer && <span>✗</span>}
                    </button>
                  );
                })}
              </div>
              {submitted && (
                <div className="mt-2 rounded-lg border border-brand-400/20 bg-brand-500/5 px-3 py-2 text-xs text-slate-300">
                  <span className="font-semibold text-brand-200">Why: </span>
                  {q.explain}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5">
        {!submitted ? (
          <button
            onClick={submit}
            disabled={!allAnswered}
            className="btn-primary w-full text-base disabled:cursor-not-allowed disabled:opacity-40"
          >
            {allAnswered ? "Submit exam ▸" : `Answer all ${exam.questions.length} questions`}
          </button>
        ) : (
          <div className="flex gap-2">
            {!passed && (
              <button
                onClick={() => {
                  setAnswers({});
                  setSubmitted(false);
                }}
                className="btn-primary flex-1"
              >
                Try again
              </button>
            )}
            <button onClick={onBack} className={`btn-ghost ${passed ? "flex-1" : ""}`}>
              Back to certifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px rounded-t-lg border-b-2 px-4 py-2 text-sm font-semibold transition ${
        active
          ? "border-brand-400 text-brand-200"
          : "border-transparent text-slate-400 hover:text-slate-200"
      }`}
    >
      {children}
    </button>
  );
}
