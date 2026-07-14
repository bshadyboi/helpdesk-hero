import { useMemo } from "react";

const COLORS = ["#2dd4bf", "#5eead4", "#818cf8", "#f472b6", "#fbbf24", "#34d399", "#60a5fa"];

export default function Confetti({ count = 90 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }).map(() => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 1.6 + Math.random() * 1.6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 0.7 + Math.random() * 0.9,
        rounded: Math.random() > 0.6,
      })),
    [count]
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `scale(${p.size})`,
            borderRadius: p.rounded ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  );
}
