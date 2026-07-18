"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import clsx from "clsx";

interface BigButtonProps {
  children: ReactNode;
  onClick?: () => void;
  color?: "pink" | "purple" | "blue" | "yellow" | "green" | "orange";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  fullWidth?: boolean;
}

const COLOR_MAP: Record<string, string> = {
  pink: "bg-candy-pink shadow-[0_8px_0_#c94886]",
  purple: "bg-candy-purple shadow-[0_8px_0_#5f3ec4]",
  blue: "bg-candy-blue shadow-[0_8px_0_#1a8fce]",
  yellow: "bg-candy-yellow shadow-[0_8px_0_#e0a92e] text-purple-800",
  green: "bg-candy-green shadow-[0_8px_0_#1fa87a]",
  orange: "bg-candy-orange shadow-[0_8px_0_#e07a2c]",
};

export default function BigButton({
  children,
  onClick,
  color = "purple",
  className = "",
  disabled = false,
  type = "button",
  fullWidth = false,
}: BigButtonProps) {
  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      whileTap={disabled ? {} : { y: 6, boxShadow: "0 2px 0 rgba(0,0,0,0.12)" }}
      className={clsx(
        "select-none rounded-4xl px-8 py-5 font-display text-xl font-extrabold text-white transition-opacity active:translate-y-1",
        COLOR_MAP[color],
        fullWidth && "w-full",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      {children}
    </motion.button>
  );
}
