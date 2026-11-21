import React from "react";
import { Bookmark, ArrowUpRight } from "lucide-react";

export default function ArticleCard({
  article,
  onToggleBookmark,
  isBookmarked,
}) {
  const formattedDateTime = new Date(article.publishedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <article className="group flex flex-row sm:flex-col justify-between border border-paper-border dark:border-obsidian-border bg-paper-card dark:bg-obsidian-card rounded-xl sm:rounded-2xl overflow-hidden shadow-paper hover:shadow-paper-hover transition-all duration-300">
      {/* Small Image on Left (Mobile), Top (Desktop) */}
      <a
        href={article.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative w-24 h-24 sm:w-full sm:h-48 flex-shrink-0 bg-zinc-100 dark:bg-zinc-900 overflow-hidden block rounded-lg sm:rounded-none m-2.5 sm:m-0 self-center sm:self-auto"
        title={`Read on ${article.source}`}
      >
        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=80";
          }}
        />
        {/* Category Pill over image (Desktop) */}
        <div className="hidden sm:flex absolute top-3 left-3 items-center space-x-1.5">
          <span className="px-2 py-0.5 bg-black/75 backdrop-blur-md text-white font-mono text-[10px] font-semibold uppercase tracking-wider rounded">
            {article.category}
          </span>
          {article.tag && article.tag !== "Key Brief" && article.tag !== "Report" && (
            <span className="px-1.5 py-0.5 bg-red-600/90 text-white font-mono text-[10px] font-bold uppercase rounded">
              {article.tag}
            </span>
          )}
        </div>
      </a>

      {/* Headline & Info on Right (Mobile), Bottom (Desktop) - NO summary or overview */}
      <div className="flex-1 flex flex-col justify-between p-2.5 sm:p-5 min-w-0">
        <div>
          {/* Source Name + Date and Time */}
          <div className="flex items-center justify-between text-xs mb-1 sm:mb-2 text-ink-muted dark:text-zinc-400">
            <div className="flex items-center space-x-1.5 truncate mr-2">
              {article.sourceIcon && (
                <img
                  src={article.sourceIcon}
                  alt={article.source}
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full object-contain flex-shrink-0"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              )}
              <span className="font-semibold text-ink dark:text-zinc-200 text-xs truncate">
                {article.source}
              </span>
            </div>
            <span className="font-mono text-[10px] sm:text-[11px] text-ink-muted dark:text-zinc-400 flex-shrink-0">
              {formattedDateTime}
            </span>
          </div>

          {/* Headline */}
          <h3 className="mb-1 sm:mb-3">
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-editorial text-xs sm:text-lg lg:text-xl font-bold text-ink dark:text-white leading-snug hover:text-neutral-700 dark:hover:text-zinc-300 transition line-clamp-2 sm:line-clamp-3 block"
              title={`Read on ${article.source}`}
            >
              {article.aiHeadline || article.title}
            </a>
          </h3>
        </div>

        {/* Footer Actions */}
        <div className="pt-1.5 sm:pt-3 sm:border-t border-paper-border dark:border-obsidian-borderSubtle flex items-center justify-between">
          {/* Bookmark Button */}
          <button
            onClick={() => onToggleBookmark(article)}
            className={`p-1 sm:p-1.5 rounded-lg border transition ${
              isBookmarked
                ? "bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-900 text-red-600"
                : "border-transparent text-ink-muted dark:text-zinc-400 hover:text-ink hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
            title={isBookmarked ? "Remove bookmark" : "Save story"}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-current" : ""}`} />
          </button>

          {/* Direct Link to Original Website */}
          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-[11px] sm:text-xs font-semibold text-ink dark:text-zinc-200 hover:underline hover:text-red-600 dark:hover:text-red-400 transition"
            title={`Visit original article on ${article.source}`}
          >
            <span>Read on {article.source}</span>
            <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
}
