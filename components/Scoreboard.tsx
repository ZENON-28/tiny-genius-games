"use client";

interface ScoreboardProps {
  score: number;
  level?: number;
  questionNumber?: number;
  timer?: number;
}

export default function Scoreboard({ score, level, questionNumber, timer }: ScoreboardProps) {
  const stats = [
    { label: "Score", value: score, emoji: "🏆" },
    ...(level !== undefined ? [{ label: "Level", value: level, emoji: "🎯" }] : []),
    ...(questionNumber !== undefined
      ? [{ label: "Question", value: questionNumber, emoji: "❓" }]
      : []),
    ...(timer !== undefined ? [{ label: "Time", value: timer, emoji: "⏱️" }] : []),
  ];

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex items-center gap-2 rounded-3xl bg-white/90 px-5 py-2.5 shadow-chunky-sm"
        >
          <span className="text-xl">{s.emoji}</span>
          <span className="font-display text-lg font-bold text-purple-700">{s.value}</span>
          <span className="font-body text-sm text-purple-400">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
