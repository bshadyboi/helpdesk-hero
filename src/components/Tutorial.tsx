import { useState } from "react";

interface Props {
  agentName: string;
  onClose: () => void;
}

interface Step {
  icon: string;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    icon: "🎧",
    title: "Welcome to the floor",
    body: "You're a help desk agent. Real users show up with real problems. Your job: solve them, keep people happy, and level up from intern to Helpdesk Hero.",
  },
  {
    icon: "🎫",
    title: "The ticket queue (left)",
    body: "New tickets arrive on the left, each with a customer, a category, a priority tier, and a difficulty. Click one to open it. A busy floor keeps filling up, so triage matters.",
  },
  {
    icon: "💬",
    title: "The conversation (center)",
    body: "The customer explains their issue — and they actually talk (turn your volume up!). Each step gives you multiple-choice responses. Pick the best action to move the ticket forward.",
  },
  {
    icon: "🧭",
    title: "Right choice vs. wrong choice",
    body: "A good choice raises satisfaction (CSAT) and advances the ticket. A poor one drops CSAT and shows a coaching tip so you learn why — then you can try again.",
  },
  {
    icon: "📚",
    title: "Use your resources",
    body: "The Customer card shows mood, CSAT, and your SLA timer. The Knowledge Base panel gives real hints for the current step. Stuck? That's what it's there for.",
  },
  {
    icon: "🗂️",
    title: "Close it like a pro",
    body: "After resolving, you'll log the ticket (category + priority) and get a debrief with the key lesson — just like a real ticketing system. Beat the SLA and go first-try for bonus XP.",
  },
  {
    icon: "📜",
    title: "Level up & get certified",
    body: "Earn XP and badges, watch your Dashboard for weak spots, and pass certification exams in Study Mode. Ready? Let's take your first ticket.",
  },
];

export default function Tutorial({ agentName, onClose }: Props) {
  const [i, setI] = useState(0);
  const step = STEPS[i];
  const last = i === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md animate-pop-in panel overflow-hidden">
        <div className="bg-gradient-to-br from-brand-500/20 to-accent-500/15 p-6 text-center">
          <div className="text-5xl">{step.icon}</div>
          <h2 className="mt-2 text-2xl font-extrabold">{step.title}</h2>
        </div>

        <div className="p-6">
          <p className="min-h-[80px] text-center text-slate-300">
            {i === 0 ? `${agentName || "Agent"}, ${step.body.charAt(0).toLowerCase()}${step.body.slice(1)}` : step.body}
          </p>

          <div className="mt-5 flex justify-center gap-1.5">
            {STEPS.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === i ? "w-6 bg-brand-400" : "w-1.5 bg-white/15"
                }`}
              />
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <button onClick={onClose} className="btn-ghost text-sm">
              Skip
            </button>
            <div className="flex gap-2">
              {i > 0 && (
                <button onClick={() => setI((n) => n - 1)} className="btn-ghost text-sm">
                  ← Back
                </button>
              )}
              <button
                onClick={() => (last ? onClose() : setI((n) => n + 1))}
                className="btn-primary text-sm"
              >
                {last ? "Take my first ticket ▸" : "Next →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
