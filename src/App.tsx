import { useState } from "react";
import type { ShiftType } from "./game/adaptive";
import Achievements from "./components/Achievements";
import Dashboard from "./components/Dashboard";
import PracticeLibrary from "./components/PracticeLibrary";
import StartScreen from "./components/StartScreen";
import StudyScreen from "./components/StudyScreen";
import Workspace from "./components/Workspace";
import { useGame } from "./game/useGame";
import { clearSavedShift } from "./game/useShift";

export default function App() {
  const game = useGame();
  const [screen, setScreen] = useState<"start" | "work">("start");
  const [practiceScenarioId, setPracticeScenarioId] = useState<string | null>(null);
  const [freshShift, setFreshShift] = useState(false);
  const [shiftType, setShiftType] = useState<ShiftType>("day");
  const [showTrophy, setShowTrophy] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showStudy, setShowStudy] = useState(false);
  const [showPracticeLib, setShowPracticeLib] = useState(false);

  const enterWork = (opts: { practiceId?: string | null; fresh?: boolean; shiftType?: ShiftType }) => {
    if (opts.practiceId) {
      clearSavedShift();
      setPracticeScenarioId(opts.practiceId);
      setFreshShift(false);
      setShiftType("day");
    } else if (opts.fresh) {
      clearSavedShift();
      setPracticeScenarioId(null);
      setFreshShift(true);
      setShiftType(opts.shiftType ?? "day");
    } else {
      setPracticeScenarioId(null);
      setFreshShift(false);
    }
    setScreen("work");
  };

  return (
    <div className="min-h-full">
      {screen === "start" ? (
        <StartScreen
          progress={game.progress}
          onResume={() => enterWork({})}
          onNewShift={(name, type) => {
            game.setAgentName(name);
            enterWork({ fresh: true, shiftType: type });
          }}
          onOpenPractice={() => setShowPracticeLib(true)}
          onOpenTrophy={() => setShowTrophy(true)}
          onOpenDashboard={() => setShowDashboard(true)}
          onOpenStudy={() => setShowStudy(true)}
          onReset={() => {
            if (confirm("Reset all progress, ranks, and badges? This can't be undone.")) {
              game.resetProgress();
              clearSavedShift();
              setPracticeScenarioId(null);
              setScreen("start");
            }
          }}
        />
      ) : (
        <Workspace
          key={practiceScenarioId ?? (freshShift ? "fresh" : "resume")}
          game={game}
          practiceScenarioId={practiceScenarioId}
          freshShift={freshShift}
          shiftType={shiftType}
          onExit={() => {
            setPracticeScenarioId(null);
            setFreshShift(false);
            setScreen("start");
          }}
          onPracticeEnd={() => {
            clearSavedShift();
            setPracticeScenarioId(null);
            setFreshShift(false);
            setShowPracticeLib(true);
            setScreen("start");
          }}
          onOpenTrophy={() => setShowTrophy(true)}
          onOpenDashboard={() => setShowDashboard(true)}
          onOpenStudy={() => setShowStudy(true)}
          onOpenPractice={() => {
            setScreen("start");
            setShowPracticeLib(true);
          }}
        />
      )}

      {showTrophy && <Achievements progress={game.progress} onClose={() => setShowTrophy(false)} />}
      {showDashboard && <Dashboard progress={game.progress} onClose={() => setShowDashboard(false)} />}
      {showStudy && (
        <StudyScreen
          progress={game.progress}
          onPassExam={game.passExam}
          onClose={() => setShowStudy(false)}
        />
      )}
      {showPracticeLib && (
        <PracticeLibrary
          level={game.level}
          completedIds={game.progress.completedScenarioIds}
          onPractice={(id) => {
            game.setAgentName(game.progress.agentName || "Agent");
            enterWork({ practiceId: id });
          }}
          onClose={() => setShowPracticeLib(false)}
        />
      )}
    </div>
  );
}
