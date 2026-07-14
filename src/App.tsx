import { useState } from "react";
import Achievements from "./components/Achievements";
import StartScreen from "./components/StartScreen";
import Workspace from "./components/Workspace";
import { useGame } from "./game/useGame";

export default function App() {
  const game = useGame();
  const [screen, setScreen] = useState<"start" | "work">("start");
  const [showTrophy, setShowTrophy] = useState(false);

  return (
    <div className="min-h-full">
      {screen === "start" ? (
        <StartScreen
          progress={game.progress}
          onStart={(name) => {
            game.setAgentName(name);
            setScreen("work");
          }}
          onOpenTrophy={() => setShowTrophy(true)}
          onReset={() => {
            if (confirm("Reset all progress, ranks, and badges? This can't be undone.")) {
              game.resetProgress();
            }
          }}
        />
      ) : (
        <Workspace
          key="work"
          game={game}
          onExit={() => setScreen("start")}
          onOpenTrophy={() => setShowTrophy(true)}
        />
      )}

      {showTrophy && <Achievements progress={game.progress} onClose={() => setShowTrophy(false)} />}
    </div>
  );
}
