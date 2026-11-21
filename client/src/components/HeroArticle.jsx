import React from "react";
import { Clock, Bookmark, ArrowUpRight } from "lucide-react";

export default function HeroArticle({
  article,
  onToggleBookmark,
  isBookmarked,
}) {
  if (!article) return null;

  const formattedDateTime = new Date(article.publishedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      {/* 1. Mobile View: Small image on left, headline on right, NO summary or overview */}
      <div className="block sm:hidden mb-4">
        <article className="flex flex-row justify-between border border-paper-border dark:border-obsidian-border bg-paper-card dark:bg-obsidian-card rounded-xl overflow-hidden shadow-paper transition-all">
          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative w-24 h-24 flex-shrink-0 bg-zinc-100 dark:bg-zinc-900 overflow-hidden block rounded-lg m-2.5 self-center"
            title={`Read story on ${article.source}`}
          >
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=80";
              }}
            />
            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-red-600/90 text-white font-mono text-[8px] font-bold uppercase rounded">
              Lead
            </span>
          </a>

          <div className="flex-1 flex flex-col justify-between p-2.5 min-w-0">
            <div>
              <div className="flex items-center justify-between text-xs mb-1 text-ink-muted dark:text-zinc-400">
                <div className="flex items-center space-x-1.5 truncate mr-2">
                  {article.sourceIcon && (
                    <img
                      src={article.sourceIcon}
                      alt={article.source}
                      className="w-3.5 h-3.5 rounded-full object-contain flex-shrink-0"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  )}
                  <span className="font-semibold text-ink dark:text-zinc-200 text-xs truncate">
                    {article.source}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-ink-muted dark:text-zinc-400 flex-shrink-0">
                  {formattedDateTime}
                </span>
              </div>

              <h2 className="mb-1">
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-editorial text-xs font-bold text-ink dark:text-white leading-snug line-clamp-2 block hover:underline"
                >
                  {article.aiHeadline || article.title}
                </a>
              </h2>
            </div>

            <div className="pt-1 flex items-center justify-between">
              <button
                onClick={() => onToggleBookmark(article)}
                className={`p-1 rounded-lg border transition ${
                  isBookmarked
                    ? "bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-900 text-red-600"
                    : "border-transparent text-ink-muted dark:text-zinc-400 hover:text-ink"
                }`}
                title={isBookmarked ? "Remove bookmark" : "Save story"}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-current" : ""}`} />
              </button>

              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-[11px] font-semibold text-ink dark:text-zinc-200 hover:underline"
              >
                <span>Read on {article.source}</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </article>
      </div>

      {/* 2. Desktop / Tablet View: Editorial Lead Presentation */}
      <section className="hidden sm:block mb-12 border border-paper-border dark:border-obsidian-border bg-paper-card dark:bg-obsidian-card rounded-2xl overflow-hidden shadow-paper hover:shadow-paper-hover transition-all">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left Column: Image with Lead Badge */}
          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="lg:col-span-7 relative sm:h-56 lg:h-auto lg:min-h-[420px] bg-zinc-900 overflow-hidden group block"
            title={`Read story on ${article.source}`}
          >
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&auto=format&fit=crop&q=80";
              }}
            />
            
            {/* Badges over image */}
            <div className="absolute top-4 left-4 flex items-center space-x-1.5">
              <span className="px-2.5 py-1 bg-black/80 backdrop-blur-md text-white font-mono text-[11px] font-semibold uppercase tracking-wider rounded-md border border-white/10">
                Lead Story
              </span>
              {article.tag && (
                <span className="px-2.5 py-1 bg-red-600/90 text-white font-mono text-[11px] font-bold uppercase tracking-wider rounded-md">
                  {article.tag}
                </span>
              )}
            </div>
          </a>

          {/* Right Column: Editorial Details */}
          <div className="lg:col-span-5 p-6 lg:p-8 flex flex-col justify-between">
            <div>
              {/* Publisher Metadata Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-paper-border dark:border-obsidian-borderSubtle">
                <div className="flex items-center space-x-2">
                  {article.sourceIcon && (
                    <img
                      src={article.sourceIcon}
                      alt={article.source}
                      className="w-5 h-5 rounded-full object-contain bg-white p-0.5 border border-zinc-200 dark:border-zinc-700"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  )}
                  <span className="font-semibold text-xs text-ink dark:text-zinc-200 tracking-wide">
                    {article.source}
                  </span>
                  <span className="text-zinc-300 dark:text-zinc-600">•</span>
                  <span className="text-[11px] font-mono text-ink-muted dark:text-zinc-400">
                    {formattedDateTime}
                  </span>
                </div>

                <span className="px-1.5 py-0.5 text-[10px] uppercase font-mono font-medium rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {article.category}
                </span>
              </div>

              {/* Headline */}
              <h2 className="mb-4">
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-editorial text-2xl lg:text-3xl font-bold text-ink dark:text-white leading-tight hover:text-neutral-700 dark:hover:text-zinc-300 transition line-clamp-3 lg:line-clamp-none block"
                >
                  {article.aiHeadline || article.title}
                </a>
              </h2>

              {/* Overview Snippet */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900/80 rounded-xl border border-paper-border dark:border-zinc-800/80 mb-5">
                <p className="text-sm text-ink-secondary dark:text-zinc-300 leading-relaxed font-sans mb-3">
                  {article.aiSummary}
                </p>

                {/* Key Highlights */}
                {article.keyTakeaways && article.keyTakeaways.length > 0 && (
                  <ul className="space-y-1.5 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                    {article.keyTakeaways.slice(0, 2).map((takeaway, idx) => (
                      <li key={idx} className="flex items-start text-xs text-ink-secondary dark:text-zinc-400">
                        <span className="mr-2 text-ink dark:text-zinc-500 font-bold">•</span>
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Action Row */}
            <div className="flex items-center justify-between pt-4 border-t border-paper-border dark:border-obsidian-borderSubtle">
              <div className="flex items-center space-x-2 text-xs text-ink-muted dark:text-zinc-500 font-mono">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{article.readingTime || "2 min read"}</span>
                </span>
              </div>

              <div className="flex items-center space-x-3">
                {/* Bookmark Toggle */}
                <button
                  onClick={() => onToggleBookmark(article)}
                  className={`p-2 rounded-lg border transition ${
                    isBookmarked
                      ? "bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-900 text-red-600"
                      : "border-paper-border dark:border-zinc-800 text-ink-secondary dark:text-zinc-400 hover:text-ink hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                  title={isBookmarked ? "Remove from bookmarks" : "Save article"}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
                </button>

                {/* Original Website Redirect Button */}
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-ink text-paper dark:bg-zinc-100 dark:text-zinc-950 hover:bg-neutral-800 dark:hover:bg-white shadow-paper transition"
                >
                  <span>Read on {article.source}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
