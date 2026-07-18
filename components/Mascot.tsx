"use client";

import { motion, AnimatePresence } from "framer-motion";

export type MascotMood = "happy" | "excited" | "sad" | "thinking" | "waving";

const MOOD_FACE: Record<MascotMood, { eyes: string; mouth: string }> = {
  happy: { eyes: "◕ ◕", mouth: "‿" },
  excited: { eyes: "★ ★", mouth: "▽" },
  sad: { eyes: "╥ ╥", mouth: "︿" },
  thinking: { eyes: "• •", mouth: "─" },
  waving: { eyes: "◕ ◕", mouth: "‿" },
};

interface MascotProps {
  mood?: MascotMood;
  message?: string;
  size?: number;
  className?: string;
}

export default function Mascot({
  mood = "happy",
  message,
  size = 140,
  className = "",
}: MascotProps) {
  const face = MOOD_FACE[mood];

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            className="mb-2 rounded-3xl bg-white px-5 py-2 font-display text-lg font-bold text-purple-600 shadow-chunky-sm"
          >
            {message}
            <div className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-8 border-t-8 border-x-transparent border-t-white" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={{ y: [0, -10, 0], rotate: mood === "waving" ? [0, -4, 4, 0] : 0 }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{ width: size, height: size }}
        className="relative drop-shadow-xl"
      >
        {/* Body */}
        <div className="absolute inset-0 rounded-[45%] bg-gradient-to-b from-sky-300 via-purple-300 to-purple-400" />
        {/* Visor */}
        <div className="absolute left-[15%] top-[22%] h-[40%] w-[70%] rounded-[40%] bg-white/90 shadow-inner" />
        {/* Face */}
        <div className="absolute left-0 top-[30%] flex w-full flex-col items-center gap-1">
          <span className="text-xl font-black tracking-widest text-purple-600">
            {face.eyes}
          </span>
          <span className="text-lg font-black text-pink-500">{face.mouth}</span>
        </div>
        {/* Antenna */}
        <motion.div
          animate={{ rotate: [0, 8, -8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="absolute -top-4 left-1/2 h-5 w-1.5 -translate-x-1/2 rounded-full bg-purple-400"
        >
          <div className="absolute -top-2 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-yellow-300 shadow-glow" />
        </motion.div>
        {/* Cheeks */}
        <div className="absolute left-[10%] top-[52%] h-3 w-3 rounded-full bg-pink-300/70" />
        <div className="absolute right-[10%] top-[52%] h-3 w-3 rounded-full bg-pink-300/70" />
      </motion.div>
    </div>
  );
}
