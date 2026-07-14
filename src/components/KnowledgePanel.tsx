import { useState } from "react";
import type { ActiveState } from "../game/useShift";
import { kbById } from "../game/knowledge";
import { categoryIcon } from "./ui";

interface Props {
  active: ActiveState | null;
}

export default function KnowledgePanel({ active }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  const step = active ? active.item.scenario.steps[active.stepIndex] : null;
  const ids = step?.kb ?? [];
  const articles = ids.map(kbById).filter(Boolean);

  return (
    <div className="panel flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
        <span className="text-lg">📚</span>
        <h3 className="font-bold">Knowledge Base</h3>
        <span className="ml-auto text-[11px] text-slate-500">smart hints</span>
      </div>

      <div className="max-h-64 space-y-2 overflow-y-auto p-3">
        {!active && (
          <p className="px-1 py-4 text-center text-xs text-slate-500">
            Relevant help articles appear here while you work a ticket.
          </p>
        )}
        {active && articles.length === 0 && (
          <p className="px-1 py-4 text-center text-xs text-slate-500">
            Trust your instincts on this one — no articles for this step.
          </p>
        )}
        {articles.map((a) => {
          if (!a) return null;
          const open = openId === a.id;
          return (
            <div key={a.id} className="rounded-xl border border-white/5 bg-ink-900/60">
              <button
                onClick={() => setOpenId(open ? null : a.id)}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
              >
                <span>{categoryIcon[a.category]}</span>
                <span className="flex-1 text-sm font-semibold text-slate-200">{a.title}</span>
                <span className={`text-slate-500 transition ${open ? "rotate-90" : ""}`}>›</span>
              </button>
              {open && (
                <p className="animate-fade-up border-t border-white/5 px-3 py-2.5 text-xs leading-relaxed text-slate-300">
                  {a.body}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
