"use client";

import Link from "next/link";
import Background from "@/components/Background";
import Mascot from "@/components/Mascot";
import BigButton from "@/components/BigButton";

export default function AboutPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-12 text-center">
      <Background />
      <Mascot mood="happy" size={130} />
      <div className="max-w-md rounded-4xl bg-white/85 p-8 shadow-chunky">
        <h1 className="mb-4 font-display text-3xl font-extrabold text-purple-700">
          About Tiny Genius Games
        </h1>
        <p className="mb-3 font-body text-lg text-purple-600">
          Tiny Genius Games turns any TV or screen into a fun learning game show!
        </p>
        <p className="mb-3 font-body text-lg text-purple-600">
          One device becomes the big Game Screen, and a phone becomes the
          Controller. Play color memory games and spot-the-difference puzzles
          together!
        </p>
        <p className="font-body text-lg text-purple-600">
          Made with 💜 for curious young minds ages 5–10.
        </p>
      </div>
      <Link href="/">
        <BigButton color="purple">🏠 Back to Menu</BigButton>
      </Link>
    </main>
  );
}
