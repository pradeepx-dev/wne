import React from "react";
import { ArrowUpRight } from "lucide-react";

export default function Footer({ sources = [] }) {
  return (
    <footer className="mt-20 border-t border-paper-border dark:border-obsidian-border bg-paper dark:bg-obsidian transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-paper-border dark:border-obsidian-borderSubtle">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-ink dark:bg-zinc-100 text-paper dark:text-obsidian flex items-center justify-center font-serif text-lg font-bold">
                W
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-ink dark:text-white">
                WNE
              </span>
            </div>
            <p className="text-sm text-ink-secondary dark:text-zinc-400 font-sans leading-relaxed max-w-sm">
              World News Echo is a high-contrast editorial platform curating top reporting from world-class newsrooms. All articles direct readers straight to original publishers.
            </p>
          </div>

          {/* Monitored Media Outlets */}
          <div className="md:col-span-7 space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-ink dark:text-white">
              Syndicated Media Channels ({sources.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {sources.map((s) => (
                <a
                  key={s.id}
                  href={s.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-zinc-900 border border-paper-border dark:border-zinc-800 text-ink-secondary dark:text-zinc-300 hover:text-ink hover:border-zinc-400 dark:hover:border-zinc-600 transition"
                >
                  {s.icon && (
                    <img
                      src={s.icon}
                      alt={s.name}
                      className="w-3.5 h-3.5 rounded-full object-contain"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  )}
                  <span>{s.name}</span>
                  <ArrowUpRight className="w-3 h-3 text-ink-muted" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Legal & Editorial Disclaimer */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-ink-muted dark:text-zinc-500 font-mono gap-4">
          <p className="text-center md:text-left leading-relaxed max-w-2xl">
            Disclaimer: WNE is an independent news aggregator. All original stories, reporting, and trademarks belong strictly to their respective publishers. Every story directs readers to the primary author's website.
          </p>
          <div className="flex-shrink-0">
            <span>© {new Date().getFullYear()} WNE • World News Echo</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
