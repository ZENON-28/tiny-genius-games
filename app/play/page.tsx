"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Background from "@/components/Background";
import Mascot from "@/components/Mascot";
import Scoreboard from "@/components/Scoreboard";
import { subscribeRoom } from "@/lib/room";
import type { RoomState } from "@/types";
import { ColorMemoryPlayer } from "@/games/ColorMemory";
import { OddOneOutPlayer } from "@/games/OddOneOut";

function PlayController() {
  const params = useSearchParams();
  const code = params.get("code") ?? "";
  const playerId = params.get("pid") ?? "";
  const [room, setRoom] = useState<RoomState | null>(null);

  useEffect(() => {
    if (!code) return;
    const unsub = subscribeRoom(code, setRoom);
    return () => unsub();
  }, [code]);

  const me = room?.players[playerId];

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-10">
      <Background />

      {!room && <Mascot mood="thinking" message="Connecting..." />}

      {room && (
        <>
          <div className="flex items-center gap-3 rounded-3xl bg-white/90 px-5 py-2 shadow-chunky-sm">
            <span className="text-2xl">{me?.emoji ?? "🙂"}</span>
            <span className="font-display font-bold text-purple-700">{me?.name ?? "Player"}</span>
          </div>

          {room.status === "lobby" && (
            <Mascot mood="happy" message="Waiting for the host to start... 🎮" size={130} />
          )}

          {room.status === "paused" && <Mascot mood="thinking" message="Game paused ⏸️" />}

          {room.status === "playing" && room.currentGame === "color-memory" && (
            <ColorMemoryPlayer room={room} playerId={playerId} />
          )}
          {room.status === "playing" && room.currentGame === "odd-one-out" && (
            <OddOneOutPlayer room={room} />
          )}

          {me && <Scoreboard score={me.score} />}
        </>
      )}
    </main>
  );
}

export default function PlayPage() {
  return (
    <Suspense fallback={null}>
      <PlayController />
    </Suspense>
  );
}
