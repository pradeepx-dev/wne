import React, { useState, useEffect } from "react";
import { Bookmark, Sun, Moon } from "lucide-react";

export default function Navbar({
  onOpenBookmarks,
  bookmarksCount,
  darkMode,
  setDarkMode,
}) {
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    const now = new Date();
    setFormattedDate(
      now.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    );
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-paper/95 dark:bg-obsidian/95 backdrop-blur-md border-b border-paper-border dark:border-obsidian-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 sm:py-4">
          {/* Left Column: Live Indicator & Date */}
          <div className="flex-1 flex items-center justify-start">
            <div className="flex items-center space-x-2 text-xs text-ink-muted dark:text-zinc-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-400 animate-pulse-dot"></span>
              <span className="hidden sm:inline font-medium text-ink-secondary dark:text-zinc-300">
                {formattedDate}
              </span>
              <span className="sm:hidden font-bold text-red-600 dark:text-red-400 text-[11px] tracking-wider">
                LIVE
              </span>
            </div>
          </div>

          {/* Center Column: Centered Brand Name Masthead (No box logo) */}
          <div className="flex-shrink-0 text-center px-4">
            <a href="/" className="inline-block group focus:outline-none">
              <h1 className="font-serif text-2xl sm:text-4xl font-extrabold tracking-tight text-ink dark:text-white leading-none group-hover:text-neutral-700 dark:group-hover:text-zinc-200 transition">
                WNE
              </h1>
              <p className="text-[9px] sm:text-[11px] uppercase tracking-widest text-ink-muted dark:text-zinc-400 font-mono mt-1">
                World News Echo
              </p>
            </a>
          </div>

          {/* Right Column: Reading List & Dark Mode Toggle */}
          <div className="flex-1 flex items-center justify-end space-x-2 sm:space-x-3">
            {/* Reading List Drawer Button */}
            <button
              onClick={onOpenBookmarks}
              className="relative p-2 rounded-lg text-ink-secondary dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-paper-border dark:border-zinc-800 transition"
              title="Saved Articles"
            >
              <Bookmark className="w-4 h-4" />
              {bookmarksCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center font-mono animate-scale-in">
                  {bookmarksCount}
                </span>
              )}
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-ink-secondary dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-paper-border dark:border-zinc-800 transition"
              title={darkMode ? "Switch to Light Paper Mode" : "Switch to Dark Ink Mode"}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
