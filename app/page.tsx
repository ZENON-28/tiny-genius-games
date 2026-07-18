"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Background from "@/components/Background";
import Mascot from "@/components/Mascot";
import BigButton from "@/components/BigButton";

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-10 px-6 py-12">
      <Background />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-2 text-center"
      >
        <h1 className="font-display text-5xl font-extrabold text-purple-700 drop-shadow-sm sm:text-6xl">
          Tiny Genius Games
        </h1>
        <p className="font-display text-xl font-bold text-pink-500">Play • Learn • Smile</p>
      </motion.div>

      <Mascot mood="waving" message="Hi friend! Ready to play?" size={160} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid w-full max-w-sm grid-cols-1 gap-5"
      >
        <Link href="/host">
          <BigButton color="purple" fullWidth>
            🖥️ Host Game
          </BigButton>
        </Link>
        <Link href="/join">
          <BigButton color="pink" fullWidth>
            📱 Join Game
          </BigButton>
        </Link>
        <Link href="/about">
          <BigButton color="blue" fullWidth>
            ℹ️ About
          </BigButton>
        </Link>
        <Link href="/settings">
          <BigButton color="yellow" fullWidth>
            ⚙️ Settings
          </BigButton>
        </Link>
      </motion.div>
    </main>
  );
}
