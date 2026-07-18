"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { RoomState } from "@/types";
import { updateRoom, patchRoomField } from "@/lib/room";
import { getOddOneOutQuestion } from "@/data/oddOneOutQuestions";
import { playSound } from "@/lib/sounds";
import { fireConfetti } from "./../components/Confetti";
import Mascot from "./../components/Mascot";
import Scoreboard from "./../components/Scoreboard";

const SHOW_DURATION_MS = 10_000; // 10 seconds for the host to present the question

// ---------------------------------------------------------------------------
// HOST VIEW — shows the four items; the player sees them AFTER host says ready
// ---------------------------------------------------------------------------
export function OddOneOutHost({ room }: { room: RoomState }) {
  const state = room.oddOneOut;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playerId = Object.keys(room.players)[0];
  const player = playerId ? room.players[playerId] : undefined;

  // Live countdown while in "show" phase
  const [countdown, setCountdown] = useState(SHOW_DURATION_MS / 1000);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Re-fires whenever state is cleared (restart, game switch, etc.)
  useEffect(() => {
    if (!state) void loadQuestion(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // Start/stop countdown ticker when phase changes
  useEffect(() => {
    if (state?.phase === "show") {
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
  }, [state?.phase]);

  async function loadQuestion(index: number) {
    const q = getOddOneOutQuestion(index);
    await updateRoom(room.code, {
      oddOneOut: {
        questionIndex: index,
        options: q.options,
        oddIndex: q.oddIndex,
        category: q.category,
        phase: "show",
        // selectedIndex and lastResult intentionally omitted:
        // Firestore rejects `undefined` in nested objects, and omitting
        // them is safe because updateDoc replaces the whole oddOneOut map.
      },
    });
    // Auto-advance to input after 10 s — host can also skip early.
    timerRef.current = setTimeout(() => {
      void advanceToInput();
    }, SHOW_DURATION_MS);
  }

  async function advanceToInput() {
    if (timerRef.current) clearTimeout(timerRef.current);
    await patchRoomField(room.code, "oddOneOut.phase", "input");
  }

  useEffect(() => {
    if (!state || state.selectedIndex === undefined || state.lastResult) return;
    void grade(state.selectedIndex === state.oddIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.selectedIndex]);

  async function grade(correct: boolean) {
    playSound(correct ? "correct" : "wrong", room.soundOn);
    if (correct) fireConfetti();
    if (playerId) {
      await patchRoomField(
        room.code,
        `players.${playerId}.score`,
        (player?.score ?? 0) + (correct ? 1 : 0)
      );
    }
    await patchRoomField(room.code, "oddOneOut.lastResult", correct ? "correct" : "wrong");
    await patchRoomField(room.code, "oddOneOut.phase", "result");
    await patchRoomField(room.code, "questionNumber", room.questionNumber + 1);

    window.setTimeout(() => {
      void loadQuestion((state?.questionIndex ?? 0) + 1);
    }, 2200);
  }

  if (!state) {
    return <Mascot mood="thinking" message="Get ready..." />;
  }

  // Detect if this is a numbers round (options are single digit strings)
  const isNumbers = state.options.every((o) => /^\d$/.test(o));

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <Scoreboard score={player?.score ?? 0} questionNumber={room.questionNumber + 1} />

      <div className="rounded-5xl bg-white/70 p-10 shadow-chunky">
        <p className="mb-6 text-center font-display text-2xl font-bold text-purple-700">
          Find the odd one out! ({state.category})
        </p>
        <div className="grid grid-cols-4 gap-6">
          {state.options.map((opt, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{
                scale: 1,
                ...(state.lastResult && i === state.oddIndex ? { y: [0, -10, 0] } : {}),
              }}
              transition={{ delay: i * 0.08 }}
              className={`flex h-28 w-28 items-center justify-center rounded-3xl shadow-chunky-sm ${
                state.lastResult && i === state.selectedIndex
                  ? state.lastResult === "correct"
                    ? "bg-green-200"
                    : "bg-red-200 animate-shake-sm"
                  : "bg-white"
              } ${isNumbers ? "text-7xl font-black text-gray-800" : "text-6xl"}`}
            >
              {opt}
            </motion.div>
          ))}
        </div>

        {/* Show phase: countdown + skip button */}
        {state.phase === "show" && (
          <div className="mt-8 flex flex-col items-center gap-4">
            <span className="text-4xl font-bold text-purple-500 tabular-nums">
              {countdown}s
            </span>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => void advanceToInput()}
              className="rounded-2xl bg-purple-600 px-8 py-3 font-display text-lg font-bold text-white shadow-chunky-sm hover:bg-purple-700 active:translate-y-0.5"
            >
              ▶ Player is Ready!
            </motion.button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {state.lastResult && (
          <Mascot
            mood={state.lastResult === "correct" ? "excited" : "sad"}
            message={state.lastResult === "correct" ? "You did it! 🎉" : "Nice try! Let's go again!"}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PLAYER VIEW — shows the actual emoji/number options; player taps the odd one
// ---------------------------------------------------------------------------
export function OddOneOutPlayer({ room }: { room: RoomState }) {
  const state = room.oddOneOut;

  // Locked if: no state, player already answered, still in show phase, or result
  const disabled =
    !state || state.selectedIndex !== undefined || state.phase === "show" || state.phase === "result";

  async function choose(i: number) {
    if (disabled) return;
    playSound("click", room.soundOn);
    await patchRoomField(room.code, "oddOneOut.selectedIndex", i);
  }

  // Numbers round = single digit strings
  const isNumbers = state?.options.every((o) => /^\d$/.test(o));

  function cardStyle(i: number) {
    if (!state?.lastResult) return "bg-white";
    if (i === state.selectedIndex)
      return state.lastResult === "correct" ? "bg-green-200" : "bg-red-200";
    if (i === state.oddIndex && state.lastResult === "wrong") return "bg-green-100";
    return "bg-white opacity-50";
  }

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <AnimatePresence mode="wait">
        {state?.phase === "show" && (
          <motion.p
            key="show"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center font-display text-xl font-bold text-purple-700"
          >
            Get ready... 👀
          </motion.p>
        )}
        {state?.phase === "input" && state?.selectedIndex === undefined && (
          <motion.p
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center font-display text-xl font-bold text-purple-700"
          >
            Tap the odd one out! 🤔
          </motion.p>
        )}
        {state?.phase === "input" && state?.selectedIndex !== undefined && (
          <motion.p
            key="waiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center font-display text-xl font-bold text-purple-700"
          >
            Waiting for result... ⏳
          </motion.p>
        )}
        {state?.phase === "result" && (
          <motion.p
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center font-display text-xl font-bold text-purple-700"
          >
            {state.lastResult === "correct" ? "Great job! 🎉" : "Nice try! 💪"}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Show blurred placeholder cards while in show phase */}
      {state?.phase === "show" && (
        <div className="grid w-full max-w-sm grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-square rounded-3xl bg-purple-100 shadow-chunky-sm animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Show actual options once input or result phase */}
      {(state?.phase === "input" || state?.phase === "result") && state?.options && (
        <div className="grid w-full max-w-sm grid-cols-2 gap-4">
          {state.options.map((opt, i) => (
            <motion.button
              key={i}
              disabled={disabled}
              onClick={() => choose(i)}
              whileTap={{ scale: 0.88 }}
              animate={
                state.lastResult && i === state.oddIndex
                  ? { y: [0, -8, 0] }
                  : {}
              }
              className={`flex aspect-square items-center justify-center rounded-3xl shadow-chunky-sm transition-colors disabled:cursor-not-allowed ${cardStyle(i)} ${
                isNumbers
                  ? "text-6xl font-black text-gray-800"
                  : "text-5xl"
              }`}
            >
              {opt}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
