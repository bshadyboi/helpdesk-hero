import { certGateMessage } from "../game/certification";

interface Props {
  xpLevel: number;
  passedExamLevels: number[];
  onOpenStudy: () => void;
}

export default function CertGateBanner({ xpLevel, passedExamLevels, onOpenStudy }: Props) {
  const message = certGateMessage(xpLevel, passedExamLevels);
  if (!message) return null;

  return (
    <div className="border-b border-amber-400/25 bg-amber-500/10 px-4 py-2.5">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-2 text-sm">
        <span className="text-amber-100">
          <span className="mr-1">📜</span>
          {message}
        </span>
        <button onClick={onOpenStudy} className="btn-ghost shrink-0 text-xs">
          Open Study Mode ▸
        </button>
      </div>
    </div>
  );
}
