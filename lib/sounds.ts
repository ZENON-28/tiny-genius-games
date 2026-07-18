// Small, dependency-free sound effects generated with the Web Audio API.
// This avoids needing external audio asset files while still giving the
// app cheerful, child-friendly sound feedback.

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

function tone(freq: number, start: number, duration: number, type: OscillatorType = "sine", gain = 0.15) {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.value = gain;
  osc.connect(g);
  g.connect(c.destination);
  const t = c.currentTime + start;
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + duration);
  osc.start(t);
  osc.stop(t + duration + 0.02);
}

export const sounds = {
  click: () => tone(600, 0, 0.06, "square", 0.08),
  correct: () => {
    tone(523.25, 0, 0.12);
    tone(659.25, 0.1, 0.12);
    tone(783.99, 0.2, 0.2);
  },
  wrong: () => {
    tone(300, 0, 0.15, "sine", 0.12);
    tone(220, 0.12, 0.2, "sine", 0.12);
  },
  celebrate: () => {
    [523.25, 587.33, 659.25, 698.46, 783.99, 880].forEach((f, i) =>
      tone(f, i * 0.09, 0.18, "triangle", 0.12)
    );
  },
  countdown: () => tone(440, 0, 0.1, "square", 0.1),
};

export function playSound(name: keyof typeof sounds, enabled: boolean) {
  if (!enabled) return;
  try {
    sounds[name]();
  } catch {
    // Audio can fail silently (e.g. autoplay restrictions) — never crash the game.
  }
}
