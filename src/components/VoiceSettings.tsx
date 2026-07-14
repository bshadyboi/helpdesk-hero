import { SCENARIOS } from "../game/scenarios";
import { listEnglishVoices, setVoiceOverrides } from "../lib/speech";
import { useEffect, useMemo, useState } from "react";

interface Props {
  personaVoices: Record<string, string>;
  onChange: (personaVoices: Record<string, string>) => void;
  onClose: () => void;
}

/** Unique client personas across all scenarios. */
const PERSONAS = Array.from(
  new Map(SCENARIOS.map((s) => [s.persona.name, s.persona])).values()
).sort((a, b) => a.name.localeCompare(b.name));

export default function VoiceSettings({ personaVoices, onChange, onClose }: Props) {
  const [draft, setDraft] = useState(personaVoices);
  const voices = useMemo(() => listEnglishVoices(), []);

  useEffect(() => {
    setVoiceOverrides(draft);
  }, [draft]);

  const setVoice = (name: string, voiceName: string) => {
    setDraft((prev) => {
      const next = { ...prev };
      if (!voiceName) delete next[name];
      else next[name] = voiceName;
      return next;
    });
  };

  const save = () => {
    onChange(draft);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
      <div className="mx-auto my-4 w-full max-w-lg animate-pop-in panel overflow-hidden">
        <div className="flex items-center justify-between bg-gradient-to-br from-brand-500/20 to-accent-500/15 p-5">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-brand-200">Audio</div>
            <h2 className="text-xl font-extrabold">Client voice picker</h2>
            <p className="text-sm text-slate-400">Assign a system voice to each client persona.</p>
          </div>
          <button onClick={onClose} className="btn-ghost">
            ✕
          </button>
        </div>

        {!voices.length ? (
          <div className="p-8 text-center text-sm text-slate-400">
            No English voices found in this browser. Clients will use the default voice.
          </div>
        ) : (
          <div className="max-h-[55vh] space-y-2 overflow-y-auto p-4">
            {PERSONAS.map((p) => (
              <div
                key={p.name}
                className="flex items-center gap-3 rounded-xl border border-white/5 bg-ink-900/60 p-3"
              >
                <span className="text-2xl">{p.avatar}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{p.name}</div>
                  <div className="text-[11px] text-slate-500">{p.role}</div>
                </div>
                <select
                  value={draft[p.name] ?? ""}
                  onChange={(e) => setVoice(p.name, e.target.value)}
                  className="max-w-[180px] rounded-lg border border-white/10 bg-ink-950 px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-brand-400/50"
                >
                  <option value="">Auto ({p.voiceHint})</option>
                  {voices.map((v) => (
                    <option key={v.voiceURI} value={v.name}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 border-t border-white/5 p-4">
          <button
            onClick={() => {
              setDraft({});
              onChange({});
            }}
            className="btn-ghost flex-1"
          >
            Reset all
          </button>
          <button onClick={save} className="btn-primary flex-1">
            Save voices
          </button>
        </div>
      </div>
    </div>
  );
}
