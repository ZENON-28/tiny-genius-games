"use client";

import { motion } from "framer-motion";

const decorations = [
  { emoji: "☁️", top: "8%", left: "6%", size: 60, delay: 0 },
  { emoji: "☁️", top: "14%", left: "78%", size: 50, delay: 1.2 },
  { emoji: "⭐", top: "22%", left: "20%", size: 28, delay: 0.4 },
  { emoji: "✨", top: "10%", left: "45%", size: 24, delay: 0.8 },
  { emoji: "🌈", top: "4%", left: "60%", size: 70, delay: 0 },
  { emoji: "🎈", top: "70%", left: "10%", size: 40, delay: 0.6 },
  { emoji: "🫧", top: "60%", left: "85%", size: 34, delay: 1.5 },
  { emoji: "🪐", top: "78%", left: "70%", size: 44, delay: 0.3 },
  { emoji: "🌳", top: "85%", left: "4%", size: 54, delay: 0.9 },
  { emoji: "⛰️", top: "88%", left: "88%", size: 60, delay: 0.2 },
  { emoji: "✨", top: "45%", left: "92%", size: 22, delay: 1.1 },
  { emoji: "🍃", top: "35%", left: "3%", size: 26, delay: 1.8 },
];

export default function Background() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-gradient-to-b from-sky-100 via-purple-50 to-pink-50"
    >
      {decorations.map((d, i) => (
        <motion.div
          key={i}
          className="absolute select-none opacity-80"
          style={{ top: d.top, left: d.left, fontSize: d.size }}
          animate={{ y: [0, -14, 0] }}
          transition={{
            duration: 5 + (i % 3),
            delay: d.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {d.emoji}
        </motion.div>
      ))}
    </div>
  );
}
