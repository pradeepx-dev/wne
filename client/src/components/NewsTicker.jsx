import React from "react";
import { ExternalLink, Radio } from "lucide-react";

export default function NewsTicker({ breakingNews = [], onSelectArticle }) {
  if (!breakingNews || breakingNews.length === 0) return null;

  // Duplicate items for continuous seamless ticker loop
  const tickerItems = [...breakingNews, ...breakingNews];

  return (
    <div className="w-full bg-zinc-950 text-white dark:bg-black border-y border-zinc-800 py-2 overflow-hidden flex items-center select-none">
      {/* Ticker Label Badge */}
      <div className="flex-shrink-0 z-10 px-3 sm:px-4 flex items-center space-x-2 bg-zinc-950 dark:bg-black font-mono text-[11px] font-bold text-red-400 tracking-wider border-r border-zinc-800">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse-dot"></span>
        <span className="uppercase">WIRE</span>
      </div>

      {/* Marquee Content */}
      <div className="relative flex overflow-x-hidden w-full">
        <div className="animate-ticker flex items-center space-x-8 text-xs font-sans tracking-wide">
          {tickerItems.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="flex items-center space-x-2 flex-shrink-0 text-zinc-300 hover:text-white transition group"
            >
              <span className="font-semibold text-zinc-400 dark:text-zinc-500 font-mono text-[11px] uppercase">
                [{item.source}]
              </span>
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline flex items-center space-x-1"
                title={`Read original story on ${item.source}`}
              >
                <span>{item.title}</span>
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-zinc-400" />
              </a>
              <span className="text-zinc-700 ml-4">•</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
