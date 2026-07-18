import type { OddOneOutQuestion } from "@/types";

// Each category has a pool of emoji items. The generator below combines
// three "same" items with one "odd" item from the same category to build
// a large bank of randomized multiple-choice questions.
const CATEGORY_POOLS: Record<string, string[]> = {
  // ── Numbers (digit strings so host renders them as big text) ──────────────
  Numbers: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],

  // ── Emoji categories ──────────────────────────────────────────────────────
  Animals: [
    "🐶", "🐱", "🐰", "🐻", "🐼", "🦁", "🐸", "🐵", "🐷", "🐮",
    "🐯", "🦊", "🐺", "🦝", "🐨", "🦘", "🦔", "🐭", "🐹", "🐗",
  ],
  Fruits: ["🍎", "🍌", "🍇", "🍊", "🍓", "🍑", "🍍", "🥝", "🍒", "🍉"],
  Vehicles: ["🚗", "🚕", "🚌", "🚓", "🚑", "🚒", "🚜", "🚲", "✈️", "🚁"],
  Food: ["🍕", "🍔", "🌭", "🍟", "🍩", "🍪", "🧁", "🍦", "🥞", "🍰"],
  Shapes: ["⭐", "❤️", "🔺", "🔵", "🟩", "🟨", "🟪", "⬛", "🔶", "🔷"],
  Colors: ["🔴", "🟢", "🔵", "🟡", "🟣", "🟠", "⚪", "⚫", "🟤", "🩷"],
  "School Items": ["✏️", "📏", "📚", "🎒", "✂️", "📎", "🖍️", "📐", "🖊️", "📝"],
  Sports: ["⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏉", "🎱", "🏓", "🥎"],
  Nature: ["🌳", "🌲", "🌵", "🌻", "🌷", "🌼", "🍄", "🌸", "🍁", "🌺"],
  Emojis: ["😀", "😂", "😍", "😎", "🥳", "😴", "🤔", "😭", "🥰", "😜"],
  Toys: ["🧸", "🪀", "🎲", "🪁", "🧩", "🎯", "🚀", "🎈", "🪆", "🧶"],
  Planets: ["🪐", "🌍", "🌕", "☀️", "⭐", "🌟", "🌙", "💫", "🌎", "🌏"],

  // ── New categories ────────────────────────────────────────────────────────
  Ocean: ["🐠", "🐳", "🦈", "🐙", "🦑", "🐡", "🦞", "🦀", "🐚", "🪸"],
  Birds: ["🐦", "🦅", "🦆", "🦉", "🦚", "🦜", "🐧", "🦢", "🦩", "🪶"],
  Weather: ["☀️", "🌧️", "⛅", "❄️", "🌩️", "🌈", "🌪️", "🌫️", "🌊", "☁️"],
  Music: ["🎵", "🎸", "🥁", "🎹", "🎺", "🎻", "🪗", "🎷", "🪘", "🎙️"],
  Space: ["🚀", "🛸", "🌌", "☄️", "🛰️", "👨‍🚀", "🌠", "🔭", "💥", "🪐"],
  Bugs: ["🐛", "🦋", "🐝", "🐞", "🦗", "🪲", "🦟", "🪳", "🐜", "🦠"],
};

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildBank(): OddOneOutQuestion[] {
  const bank: OddOneOutQuestion[] = [];
  const categories = Object.keys(CATEGORY_POOLS);

  categories.forEach((category, catIdx) => {
    const pool = CATEGORY_POOLS[category];
    // For every "same" item, pair it with every other "odd" item in the pool.
    // This naturally yields pool.length * (pool.length - 1) questions per
    // category (10 * 9 = 90), far exceeding the 100-question minimum across
    // all 12 categories combined.
    pool.forEach((sameItem, i) => {
      pool.forEach((oddItem, j) => {
        if (i === j) return;
        const oddIndex = Math.floor(seededShuffle([0, 1, 2, 3], i * 31 + j * 7 + catIdx)[0]);
        const options = [sameItem, sameItem, sameItem];
        options.splice(oddIndex, 0, oddItem);
        bank.push({ category, options, oddIndex });
      });
    });
  });

  return seededShuffle(bank, 42);
}

// Pre-built, deterministic bank generated at module load time.
export const ODD_ONE_OUT_BANK: OddOneOutQuestion[] = buildBank();

export function getOddOneOutQuestion(index: number): OddOneOutQuestion {
  return ODD_ONE_OUT_BANK[index % ODD_ONE_OUT_BANK.length];
}
