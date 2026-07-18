import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./games/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sky: {
          50: "#f0f9ff",
          100: "#e0f2fe",
        },
        candy: {
          pink: "#FF6FB5",
          purple: "#8B5CF6",
          blue: "#38BDF8",
          yellow: "#FFD166",
          green: "#34D399",
          orange: "#FF9F5B",
          red: "#FB6F92",
        },
      },
      fontFamily: {
        display: ["Baloo 2", "system-ui", "sans-serif"],
        body: ["Quicksand", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        chunky: "0 8px 0 rgba(0,0,0,0.12)",
        "chunky-sm": "0 5px 0 rgba(0,0,0,0.12)",
        glow: "0 0 40px rgba(255,209,102,0.5)",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        wiggle: {
          "0%,100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        "bounce-tiny": {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        sparkle: {
          "0%,100%": { opacity: "0.3", transform: "scale(0.8)" },
          "50%": { opacity: "1", transform: "scale(1.2)" },
        },
        "shake-sm": {
          "0%,100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-8px)" },
          "40%": { transform: "translateX(8px)" },
          "60%": { transform: "translateX(-6px)" },
          "80%": { transform: "translateX(6px)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        wiggle: "wiggle 3s ease-in-out infinite",
        "bounce-tiny": "bounce-tiny 2s ease-in-out infinite",
        sparkle: "sparkle 2.5s ease-in-out infinite",
        "shake-sm": "shake-sm 0.5s ease-in-out",
      },
    },
  },
  plugins: [],
};
export default config;
