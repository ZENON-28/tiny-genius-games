"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { RoomState } from "@/types";
import { updateRoom, patchRoomField } from "@/lib/room";
import { playSound } from "@/lib/sounds";
import { fireConfetti } from "./../components/Confetti";
import Mascot from "./../components/Mascot";
import Scoreboard from "./../components/Scoreboard";

const COLORS = [
  { id: "red", hex: "#FB6F92", label: "Red" },
  { id: "green", hex: "#34D399", label: "Green" },
  { id: "blue", hex: "#38BDF8", label: "Blue" },
  { id: "yellow", hex: "#FFD166", label: "Yellow" },
  { id: "purple", hex: "#8B5CF6", label: "Purple" },
  { id: "orange", hex: "#FF9F5B", label: "Orange" },
  { id: "pink", hex: "#FF6FB5", label: "Pink" },
  { id: "teal", hex: "#2DD4BF", label: "Teal" },
];

function generateSequence(length: number): string[] {
  const seq: string[] = [];
  for (let i = 0; i < length; i++) {
    // ✅ CHANGED: clamp pool size to [3, 4]
    seq.push(COLORS[Math.floor(Math.random() * Math.max(Math.min(length + 2, 4), 3))].id);
  }
  return seq;
}

function colorHex(id: string) {
  return COLORS.find((c) => c.id === id)?.hex ?? "#ccc";
}

// ---------------------------------------------------------------------------
// HOST VIEW — shows the sequence, then waits for the player's answer
// ---------------------------------------------------------------------------
export function ColorMemoryHost({ room }: { room: RoomState }) {
  const cm = room.colorMemory;
  const started = useRef(false);
  const playerId = Object.keys(room.players)[0];
  const player = playerId ? room.players[playerId] : undefined;

  useEffect(() => {
    if (!cm && !started.current) {
      started.current = true;
      void startRound(3);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cm]);

  async function startRound(level: number) {
    const sequence = generateSequence(level);
    await updateRoom(room.code, {
      colorMemory: { sequence, playerInput: [], phase: "show", level },
    });
    window.setTimeout(() => {
      void patchRoomField(room.code, "colorMemory.phase", "input");
    }, 1500 + level * 900);
  }

  useEffect(() => {
    if (!cm || cm.phase !== "input") return;
    if (cm.playerInput.length === 0) return;
    if (cm.playerInput.length < cm.sequence.length) return;

    const correct = cm.sequence.every((c, i) => c === cm.playerInput[i]);
    void gradeRound(correct);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cm?.playerInput]);

  async function gradeRound(correct: boolean) {
    playSound(correct ? "correct" : "wrong", room.soundOn);
    if (correct) fireConfetti();
    if (playerId) {
      await patchRoomField(
        room.code,
        `players.${playerId}.score`,
        (player?.score ?? 0) + (correct ? 1 : 0)
      );
    }
    await patchRoomField(room.code, "colorMemory.phase", "result");
    await patchRoomField(room.code, "colorMemory.lastResult", correct ? "correct" : "wrong");
    await patchRoomField(room.code, "questionNumber", room.questionNumber + 1);

    window.setTimeout(() => {
      const nextLevel = correct ? Math.min((cm?.level ?? 3) + 1, 8) : cm?.level ?? 3;
      void startRound(nextLevel);
    }, 2200);
  }

  if (!cm) {
    return (
      <div className="flex flex-col items-center gap-4">
        <Mascot mood="thinking" message="Get ready..." />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <Scoreboard score={player?.score ?? 0} level={cm.level} questionNumber={room.questionNumber + 1} />

      <div className="rounded-5xl bg-white/70 p-10 shadow-chunky">
        {cm.phase === "show" && (
          <>
            <p className="mb-6 text-center font-display text-2xl font-bold text-purple-700">
              Watch closely! 👀
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {cm.sequence.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.15 }}
                  className="h-20 w-20 rounded-3xl shadow-chunky-sm"
                  style={{ backgroundColor: colorHex(c) }}
                />
              ))}
            </div>
          </>
        )}

        {cm.phase === "input" && (
          <div className="flex flex-col items-center gap-4">
            <p className="font-display text-2xl font-bold text-purple-700">
              Repeat it on your phone! 📱
            </p>
            <div className="flex gap-3">
              {cm.sequence.map((_, i) => (
                <div
                  key={i}
                  className="h-10 w-10 rounded-2xl border-4 border-dashed border-purple-300"
                  style={{
                    backgroundColor: cm.playerInput[i] ? colorHex(cm.playerInput[i]) : "transparent",
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {cm.phase === "result" && (
          <div className="flex flex-col items-center gap-4">
            <Mascot
              mood={cm.lastResult === "correct" ? "excited" : "sad"}
              message={cm.lastResult === "correct" ? "Awesome! 🎉" : "So close! Let's try again!"}
            />
            {cm.lastResult === "wrong" && (
              <div className="flex gap-3">
                {cm.sequence.map((c, i) => (
                  <div
                    key={i}
                    className="h-12 w-12 rounded-2xl shadow-chunky-sm"
                    style={{ backgroundColor: colorHex(c) }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PLAYER VIEW — color buttons only, never shows the sequence itself
// ---------------------------------------------------------------------------
export function ColorMemoryPlayer({
  room,
  playerId,
}: {
  room: RoomState;
  playerId: string;
}) {
  const cm = room.colorMemory;
  const [pressed, setPressed] = useState<string | null>(null);

  async function tapColor(id: string) {
    if (!cm || cm.phase !== "input") return;
    if (cm.playerInput.length >= cm.sequence.length) return;
    playSound("click", room.soundOn);
    setPressed(id);
    window.setTimeout(() => setPressed(null), 150);
    await patchRoomField(room.code, "colorMemory.playerInput", [...cm.playerInput, id]);
  }

  // ✅ CHANGED: clamp active color buttons to [3, 4]
  const activeCount = COLORS.slice(0, Math.max(Math.min((cm?.level ?? 3) + 2, 4), 3));
  const disabled = !cm || cm.phase !== "input";

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <AnimatePresence mode="wait">
        {cm?.phase === "show" && (
          <motion.p
            key="show"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center font-display text-xl font-bold text-purple-700"
          >
            Look at the TV! 📺
          </motion.p>
        )}
        {cm?.phase === "input" && (
          <motion.p
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center font-display text-xl font-bold text-purple-700"
          >
            Tap the colors in order! 🎨
          </motion.p>
        )}
        {cm?.phase === "result" && (
          <motion.p
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center font-display text-xl font-bold text-purple-700"
          >
            {cm.lastResult === "correct" ? "Great job! 🎉" : "Nice try! 💪"}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="grid w-full max-w-sm grid-cols-3 gap-4">
        {activeCount.map((c) => (
          <motion.button
            key={c.id}
            disabled={disabled}
            onClick={() => tapColor(c.id)}
            whileTap={{ scale: 0.88 }}
            animate={pressed === c.id ? { scale: [1, 1.15, 1] } : {}}
            className="aspect-square rounded-3xl shadow-chunky-sm disabled:opacity-40"
            style={{ backgroundColor: c.hex }}
          />
        ))}
      </div>
    </div>
  );
}
