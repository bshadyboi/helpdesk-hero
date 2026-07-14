import { useEffect, useState } from "react";
import Achievements from "./components/Achievements";
import StartScreen from "./components/StartScreen";
import Workspace from "./components/Workspace";
import { useGame } from "./game/useGame";
import { clearSavedShift } from "./game/useShift";

const SCREEN_KEY = "helpdesk-hero:screen";

export default function App() {
  const game = useGame();
  // Remember whether the player was clocked in so a refresh doesn't dump them
  // back on the sign-in screen.
  const [screen, setScreen] = useState<"start" | "work">(() => {
    try {
      return localStorage.getItem(SCREEN_KEY) === "work" ? "work" : "start";
    } catch {
      return "start";
    }
  });
  const [showTrophy, setShowTrophy] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(SCREEN_KEY, screen);
    } catch {
      // ignore storage errors
    }
  }, [screen]);

  return (
    <div className="min-h-full">
      {screen === "start" ? (
        <StartScreen
          progress={game.progress}
          onStart={(name) => {
            game.setAgentName(name);
            // Clocking in always begins a fresh shift.
            clearSavedShift();
            setScreen("work");
          }}
          onOpenTrophy={() => setShowTrophy(true)}
          onReset={() => {
            if (confirm("Reset all progress, ranks, and badges? This can't be undone.")) {
              game.resetProgress();
              clearSavedShift();
              setScreen("start");
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
