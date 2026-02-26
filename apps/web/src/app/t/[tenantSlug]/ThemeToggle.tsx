"use client";

import React from "react";
import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-all relative group" title={theme === "dark" ? "Modo Claro" : "Modo Escuro"}>
      <div className="relative w-[22px] h-[22px]">
        {/* Sun icon */}
        <Sun className={`w-[22px] h-[22px] absolute inset-0 transition-all duration-300 text-amber-500 ${theme === "dark" ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"}`} />
        {/* Moon icon */}
        <Moon className={`w-[22px] h-[22px] absolute inset-0 transition-all duration-300 text-blue-300 ${theme === "dark" ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"}`} />
      </div>
    </button>
  );
}
