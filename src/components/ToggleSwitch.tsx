"use client";

import { motion } from "framer-motion";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function ToggleSwitch({ checked, onChange }: ToggleSwitchProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-14 h-7 rounded-full p-1 transition-colors duration-300 ${
        checked
          ? "bg-gradient-to-r from-green-500 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
          : "bg-gray-700 shadow-inner"
      }`}
    >
      <motion.div
        className="w-5 h-5 bg-white rounded-full shadow-md"
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        animate={{ x: checked ? 28 : 0 }}
      />
    </button>
  );
}
