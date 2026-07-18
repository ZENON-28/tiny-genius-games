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

const SHOW_DURATION_MS = 10_000; // 10 seconds to memorise the sequence

function generateSequence(length: number): string[] {
  const seq: string[] = [];
  for (let i = 0; i < length; i++) {
    seq.push(COLORS[Math.floor(Math.random() * 3)].id);
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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playerId = Object.keys(room.players)[0];
  const player = playerId ? room.players[playerId] : undefined;

  // Live countdown (seconds remaining in show phase)
  const [countdown, setCountdown] = useState(SHOW_DURATION_MS / 1000);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Kick off the very first round.
  useEffect(() => {
    if (!cm && !started.current) {
      started.current = true;
      void startRound(3);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cm]);

  // Start/stop countdown ticker whenever phase changes.
  useEffect(() => {
    if (cm?.phase === "show") {
      setCountdown(SHOW_DURATION_MS / 1000);
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          const next = prev - 1;
          return next <= 0 ? 0 : next;
        });
      }, 1000);
    } else {
      if (countdownRef.current) clearInterval(countdownRef.current);
    }
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [cm?.phase]);

  async function startRound(level: number) {
    const sequence = generateSequence(level);
    await updateRoom(room.code, {
      colorMemory: { sequence, playerInput: [], phase: "show", level },
    });
    // Auto-advance after 10 s — host can also skip early.
    timerRef.current = window.setTimeout(() => {
      void advanceToInput();
    }, SHOW_DURATION_MS);
  }

  async function advanceToInput() {
    if (timerRef.current) clearTimeout(timerRef.current);
    await patchRoomField(room.code, "colorMemory.phase", "input");
  }

  // Watch the player's submitted input and grade it once it matches sequence length.
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

            {/* Countdown + skip button */}
            <div className="mt-8 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-4xl font-bold text-purple-500 tabular-nums">
                  {countdown}s
                </span>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => void advanceToInput()}
                className="rounded-2xl bg-purple-600 px-8 py-3 font-display text-lg font-bold text-white shadow-chunky-sm hover:bg-purple-700 active:translate-y-0.5"
              >
                ▶ Player is Ready!
              </motion.button>
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

  // Clamp active colours to 3–4 (matching generateSequence pool)
  const activeCount = COLORS.slice(0, 3);
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
