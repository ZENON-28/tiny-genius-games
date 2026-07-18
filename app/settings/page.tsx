"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Background from "@/components/Background";
import Mascot from "@/components/Mascot";
import BigButton from "@/components/BigButton";

export default function SettingsPage() {
  const [sound, setSound] = useState(true);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const s = localStorage.getItem("tgg_sound");
    const d = localStorage.getItem("tgg_dark");
    if (s !== null) setSound(s === "true");
    if (d !== null) setDark(d === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("tgg_sound", String(sound));
  }, [sound]);

  useEffect(() => {
    localStorage.setItem("tgg_dark", String(dark));
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-12">
      <Background />
      <Mascot mood="thinking" size={120} />

      <div className="w-full max-w-sm rounded-4xl bg-white/85 p-8 shadow-chunky">
        <h1 className="mb-6 text-center font-display text-3xl font-extrabold text-purple-700">
          Settings
        </h1>

        <div className="mb-4 flex items-center justify-between rounded-3xl bg-purple-50 px-5 py-4">
          <span className="font-display text-lg font-bold text-purple-700">🔊 Sound</span>
          <button
            onClick={() => setSound((v) => !v)}
            className={`h-8 w-16 rounded-full transition-colors ${
              sound ? "bg-candy-green" : "bg-gray-300"
            }`}
          >
            <div
              className={`h-6 w-6 translate-y-1 rounded-full bg-white shadow transition-transform ${
                sound ? "translate-x-9" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between rounded-3xl bg-purple-50 px-5 py-4">
          <span className="font-display text-lg font-bold text-purple-700">🌙 Dark Mode</span>
          <button
            onClick={() => setDark((v) => !v)}
            className={`h-8 w-16 rounded-full transition-colors ${
              dark ? "bg-candy-purple" : "bg-gray-300"
            }`}
          >
            <div
              className={`h-6 w-6 translate-y-1 rounded-full bg-white shadow transition-transform ${
                dark ? "translate-x-9" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      <Link href="/">
        <BigButton color="purple">🏠 Back to Menu</BigButton>
      </Link>
    </main>
  );
}
