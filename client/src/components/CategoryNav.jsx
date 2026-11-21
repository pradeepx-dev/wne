import React from "react";

export default function CategoryNav({
  categories = [],
  selectedCategory,
  onSelectCategory,
}) {
  return (
    <div className="py-3.5 border-b border-paper-border dark:border-obsidian-border bg-paper/50 dark:bg-obsidian/50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* News Categories */}
        <div
          className="flex items-center space-x-2 overflow-x-auto no-scrollbar scrollbar-none py-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-ink text-paper dark:bg-zinc-100 dark:text-zinc-950 font-semibold shadow-paper-sm"
                    : "text-ink-secondary dark:text-zinc-400 hover:text-ink dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-850"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
