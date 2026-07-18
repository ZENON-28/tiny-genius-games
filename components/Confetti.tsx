"use client";

import confetti from "canvas-confetti";

export function fireConfetti() {
  const colors = ["#FF6FB5", "#8B5CF6", "#38BDF8", "#FFD166", "#34D399", "#FF9F5B"];
  confetti({
    particleCount: 90,
    spread: 75,
    startVelocity: 35,
    origin: { y: 0.6 },
    colors,
  });
  confetti({
    particleCount: 40,
    angle: 60,
    spread: 60,
    origin: { x: 0, y: 0.7 },
    colors,
  });
  confetti({
    particleCount: 40,
    angle: 120,
    spread: 60,
    origin: { x: 1, y: 0.7 },
    colors,
  });
}

export function fireBigCelebration() {
  const colors = ["#FF6FB5", "#8B5CF6", "#38BDF8", "#FFD166", "#34D399", "#FF9F5B"];
  const duration = 2500;
  const end = Date.now() + duration;

  (function frame() {
    confetti({ particleCount: 6, angle: 60, spread: 55, origin: { x: 0 }, colors });
    confetti({ particleCount: 6, angle: 120, spread: 55, origin: { x: 1 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
