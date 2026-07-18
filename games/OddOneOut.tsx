"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { RoomState } from "@/types";
import { updateRoom, patchRoomField } from "@/lib/room";
import { getOddOneOutQuestion } from "@/data/oddOneOutQuestions";
import { playSound } from "@/lib/sounds";
import { fireConfetti } from "./../components/Confetti";
import Mascot from "./../components/Mascot";
import Scoreboard from "./../components/Scoreboard";

// ---------------------------------------------------------------------------
// HOST VIEW — shows the four images; the player never sees them, only the
// host/TV screen does.
// ---------------------------------------------------------------------------
export function OddOneOutHost({ room }: { room: RoomState }) {
  const state = room.oddOneOut;
  const started = useRef(false);
  const playerId = Object.keys(room.players)[0];
  const player = playerId ? room.players[playerId] : undefined;

  useEffect(() => {
    if (!state && !started.current) {
      started.current = true;
      void loadQuestion(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

async function loadQuestion(index: number) {
    const q = getOddOneOutQuestion(index);
    await updateRoom(room.code, {
      oddOneOut: {
        questionIndex: index,
        options: q.options,
        oddIndex: q.oddIndex,
        category: q.category,
      },
    });
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
    await patchRoomField(room.code, "questionNumber", room.questionNumber + 1);

    window.setTimeout(() => {
      void loadQuestion((state?.questionIndex ?? 0) + 1);
    }, 2200);
  }

  if (!state) {
    return <Mascot mood="thinking" message="Get ready..." />;
  }

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
              className={`flex h-28 w-28 items-center justify-center rounded-3xl text-6xl shadow-chunky-sm ${
                state.lastResult && i === state.selectedIndex
                  ? state.lastResult === "correct"
                    ? "bg-green-200"
                    : "bg-red-200 animate-shake-sm"
                  : "bg-white"
              }`}
            >
              {opt}
            </motion.div>
          ))}
        </div>
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
// PLAYER VIEW — four plain answer buttons (A/B/C/D style), no image shown
// ---------------------------------------------------------------------------
export function OddOneOutPlayer({ room }: { room: RoomState }) {
  const state = room.oddOneOut;
  const labels = ["🔴", "🟢", "🔵", "🟡"];
  const colors = ["bg-candy-red", "bg-candy-green", "bg-candy-blue", "bg-candy-yellow"];
  const disabled = !state || state.selectedIndex !== undefined;

  async function choose(i: number) {
    if (disabled) return;
    playSound("click", room.soundOn);
    await patchRoomField(room.code, "oddOneOut.selectedIndex", i);
  }

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <p className="text-center font-display text-xl font-bold text-purple-700">
        {state?.selectedIndex === undefined
          ? "Which one is different? 🤔"
          : state.lastResult === "correct"
          ? "Great job! 🎉"
          : "Nice try! 💪"}
      </p>
      <div className="grid w-full max-w-sm grid-cols-2 gap-4">
        {labels.map((l, i) => (
          <motion.button
            key={i}
            disabled={disabled}
            onClick={() => choose(i)}
            whileTap={{ scale: 0.9 }}
            className={`aspect-square rounded-3xl text-5xl text-white shadow-chunky-sm disabled:opacity-40 ${colors[i]}`}
          >
            {l}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
