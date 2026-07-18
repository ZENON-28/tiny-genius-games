"use client";

import { useEffect, useState, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import Background from "@/components/Background";
import Mascot from "@/components/Mascot";
import BigButton from "@/components/BigButton";
import { createRoom, subscribeRoom, updateRoom } from "@/lib/room";
import { randomGameId } from "@/lib/room";
import type { RoomState, GameId } from "@/types";
import { ColorMemoryHost } from "@/games/ColorMemory";
import { OddOneOutHost } from "@/games/OddOneOut";
import { isFirebaseConfigured } from "@/lib/firebase";

export default function HostPage() {
  const [room, setRoom] = useState<RoomState | null>(null);
  const [joinUrl, setJoinUrl] = useState("");
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    void (async () => {
      const newRoom = await createRoom();
      setRoom(newRoom);
      unsub = subscribeRoom(newRoom.code, (r) => r && setRoom(r));
    })();
    return () => unsub?.();
  }, []);

  useEffect(() => {
    if (room && typeof window !== "undefined") {
      setJoinUrl(`${window.location.origin}/join?code=${room.code}`);
    }
  }, [room?.code]);

  const startGame = useCallback(
    (game?: GameId) => {
      if (!room) return;
      void updateRoom(room.code, {
        status: "playing",
        currentGame: game ?? randomGameId(),
        questionNumber: 0,
      });
    },
    [room]
  );

  function togglePause() {
    if (!room) return;
    void updateRoom(room.code, { status: room.status === "paused" ? "playing" : "paused" });
  }

  function restart() {
    if (!room) return;
    void updateRoom(room.code, {
      status: "playing",
      questionNumber: 0,
      colorMemory: undefined,
      oddOneOut: undefined,
    });
  }

  function resetScores() {
    if (!room) return;
    const players = { ...room.players };
    Object.keys(players).forEach((id) => (players[id] = { ...players[id], score: 0 }));
    void updateRoom(room.code, { players });
  }

  function switchGame(game: GameId) {
    if (!room) return;
    void updateRoom(room.code, {
      currentGame: game,
      questionNumber: 0,
      colorMemory: undefined,
      oddOneOut: undefined,
    });
  }

  function toggleSound() {
    if (!room) return;
    void updateRoom(room.code, { soundOn: !room.soundOn });
  }

  function goToLobby() {
    if (!room) return;
    void updateRoom(room.code, {
      status: "lobby",
      currentGame: null,
      questionNumber: 0,
      colorMemory: undefined,
      oddOneOut: undefined,
    });
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setFullscreen(false);
    }
  }

  const playerCount = room ? Object.keys(room.players).length : 0;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-10">
      <Background />

      {!isFirebaseConfigured && (
        <div className="rounded-2xl bg-yellow-100 px-4 py-2 text-center font-body text-sm font-semibold text-yellow-700">
          Demo mode: Firebase isn&apos;t configured, so this room only syncs between
          browser tabs on this device.
        </div>
      )}

      {!room && <Mascot mood="thinking" message="Creating your room..." />}

      {room && room.status === "lobby" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-6"
        >
          <Mascot mood="waving" message="Scan or type the code to join!" size={130} />

          <div className="flex flex-col items-center gap-4 rounded-5xl bg-white/90 p-8 shadow-chunky">
            <p className="font-display text-lg font-bold text-purple-500">ROOM CODE</p>
            <p className="font-display text-6xl font-extrabold tracking-widest text-pink-500">
              {room.code}
            </p>
            {joinUrl && (
              <div className="rounded-3xl bg-white p-4 shadow-inner">
                <QRCodeSVG value={joinUrl} size={160} fgColor="#8B5CF6" />
              </div>
            )}
            <p className="font-body text-sm text-purple-400">{joinUrl}</p>
          </div>

          <div className="rounded-4xl bg-white/80 px-6 py-4 shadow-chunky-sm">
            <p className="mb-2 text-center font-display font-bold text-purple-600">
              Players joined: {playerCount}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <AnimatePresence>
                {Object.values(room.players).map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center gap-2 rounded-3xl bg-purple-100 px-4 py-2"
                  >
                    <span className="text-2xl">{p.emoji}</span>
                    <span className="font-display font-bold text-purple-700">{p.name}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <BigButton color="green" onClick={() => startGame("color-memory")} disabled={playerCount === 0}>
              🎨 Color Memory
            </BigButton>
            <BigButton color="orange" onClick={() => startGame("odd-one-out")} disabled={playerCount === 0}>
              🔎 Odd One Out
            </BigButton>
          </div>
        </motion.div>
      )}

      {room && room.status !== "lobby" && (
        <div className="flex w-full max-w-4xl flex-col items-center gap-6">
          {room.status === "paused" ? (
            <Mascot mood="thinking" message="Paused ⏸️" />
          ) : room.currentGame === "color-memory" ? (
            <ColorMemoryHost room={room} />
          ) : room.currentGame === "odd-one-out" ? (
            <OddOneOutHost room={room} />
          ) : null}

          {/* Admin control bar */}
          <div className="flex flex-wrap justify-center gap-3 rounded-4xl bg-white/80 p-4 shadow-chunky-sm">
            <ControlButton onClick={togglePause} emoji={room.status === "paused" ? "▶️" : "⏸️"} label={room.status === "paused" ? "Resume" : "Pause"} />
            <ControlButton onClick={restart} emoji="🔁" label="Restart" />
            <ControlButton onClick={resetScores} emoji="🧮" label="Reset Score" />
            <ControlButton onClick={() => switchGame("color-memory")} emoji="🎨" label="Color Game" />
            <ControlButton onClick={() => switchGame("odd-one-out")} emoji="🔎" label="Odd Game" />
            <ControlButton onClick={toggleSound} emoji={room.soundOn ? "🔊" : "🔇"} label="Sound" />
            <ControlButton onClick={toggleFullscreen} emoji={fullscreen ? "⤢" : "⛶"} label="Fullscreen" />
            <ControlButton onClick={goToLobby} emoji="🏠" label="Lobby" />
          </div>
        </div>
      )}
    </main>
  );
}

function ControlButton({
  onClick,
  emoji,
  label,
}: {
  onClick: () => void;
  emoji: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 rounded-2xl bg-purple-50 px-4 py-2 font-body text-xs font-bold text-purple-600 transition hover:bg-purple-100 active:scale-95"
    >
      <span className="text-xl">{emoji}</span>
      {label}
    </button>
  );
}
