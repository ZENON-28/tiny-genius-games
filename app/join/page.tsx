"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Background from "@/components/Background";
import Mascot from "@/components/Mascot";
import BigButton from "@/components/BigButton";
import { joinRoom } from "@/lib/room";

const EMOJIS = ["🦄", "🐶", "🐱", "🦊", "🐼", "🐸", "🦁", "🐵", "🐰", "🐻"];

function JoinForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [code, setCode] = useState(params.get("code") ?? "");
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleJoin() {
    setError("");
    if (code.trim().length !== 4) {
      setError("Please enter the 4-digit room code.");
      return;
    }
    setLoading(true);
    const result = await joinRoom(code.trim(), name.trim() || "Player", emoji);
    setLoading(false);
    if (!result) {
      setError("Hmm, we couldn't find that room. Double check the code!");
      return;
    }
    router.push(`/play?code=${code.trim()}&pid=${result.playerId}`);
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-12">
      <Background />
      <Mascot mood="waving" message="What's your name?" size={130} />

      <div className="w-full max-w-sm rounded-4xl bg-white/90 p-8 shadow-chunky">
        <label className="mb-1 block font-display font-bold text-purple-600">Room Code</label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
          placeholder="1234"
          inputMode="numeric"
          className="mb-4 w-full rounded-2xl border-4 border-purple-100 bg-purple-50 px-4 py-3 text-center font-display text-3xl font-extrabold tracking-widest text-purple-700 outline-none focus:border-candy-purple"
        />

        <label className="mb-1 block font-display font-bold text-purple-600">Your Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Superstar"
          maxLength={16}
          className="mb-4 w-full rounded-2xl border-4 border-purple-100 bg-purple-50 px-4 py-3 text-center font-body text-lg font-semibold text-purple-700 outline-none focus:border-candy-purple"
        />

        <label className="mb-2 block font-display font-bold text-purple-600">Pick an Avatar</label>
        <div className="mb-4 grid grid-cols-5 gap-2">
          {EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={`rounded-2xl py-2 text-2xl transition ${
                emoji === e ? "bg-candy-yellow shadow-chunky-sm" : "bg-purple-50"
              }`}
            >
              {e}
            </button>
          ))}
        </div>

        {error && <p className="mb-3 text-center font-body text-sm font-bold text-red-500">{error}</p>}

        <BigButton color="pink" fullWidth onClick={handleJoin} disabled={loading}>
          {loading ? "Joining..." : "🚀 Join Game"}
        </BigButton>
      </div>
    </main>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={null}>
      <JoinForm />
    </Suspense>
  );
}
