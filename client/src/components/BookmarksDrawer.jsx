import React from "react";
import { X, Bookmark, Trash2, ArrowUpRight } from "lucide-react";

export default function BookmarksDrawer({
  isOpen,
  onClose,
  bookmarks = [],
  onRemoveBookmark,
  onClearAll,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-paper dark:bg-obsidian-card border-l border-paper-border dark:border-obsidian-border h-full flex flex-col justify-between shadow-2xl animate-slide-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-paper-border dark:border-obsidian-borderSubtle flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bookmark className="w-5 h-5 text-red-600 fill-current" />
            <h2 className="font-editorial text-xl font-bold text-ink dark:text-white">
              Reading List ({bookmarks.length})
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            {bookmarks.length > 0 && (
              <button
                onClick={onClearAll}
                className="p-2 text-ink-muted hover:text-red-600 transition"
                title="Clear all bookmarks"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-ink-muted hover:text-ink dark:hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {bookmarks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-ink-muted mb-3">
                <Bookmark className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-ink dark:text-zinc-200">
                Your reading list is empty
              </h3>
              <p className="text-xs text-ink-muted dark:text-zinc-500 max-w-xs mt-1">
                Save stories while browsing to quickly access them here.
              </p>
            </div>
          ) : (
            bookmarks.map((article) => {
              const formattedDate = new Date(article.publishedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={article.id}
                  className="p-3 bg-white dark:bg-zinc-900 border border-paper-border dark:border-zinc-800 rounded-xl flex items-center space-x-3 hover:border-zinc-400 dark:hover:border-zinc-600 transition"
                >
                  {/* Small Image on Left */}
                  <a
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-16 h-16 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex-shrink-0 block"
                  >
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&auto=format&fit=crop&q=80";
                      }}
                    />
                  </a>

                  {/* Headline & Info on Right */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-[11px] text-ink-muted dark:text-zinc-400 mb-1">
                      <div className="flex items-center space-x-1.5 truncate mr-2">
                        {article.sourceIcon && (
                          <img
                            src={article.sourceIcon}
                            alt={article.source}
                            className="w-3.5 h-3.5 rounded-full object-contain"
                            onError={(e) => (e.target.style.display = "none")}
                          />
                        )}
                        <span className="font-semibold text-ink dark:text-zinc-200 truncate">
                          {article.source}
                        </span>
                      </div>
                      <button
                        onClick={() => onRemoveBookmark(article.id)}
                        className="text-zinc-400 hover:text-red-600 transition"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="mb-1.5">
                      <a
                        href={article.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-editorial text-xs font-bold text-ink dark:text-white leading-snug hover:underline line-clamp-2 block"
                      >
                        {article.aiHeadline || article.title}
                      </a>
                    </h4>

                    <div className="flex items-center justify-between text-[10px] text-ink-muted dark:text-zinc-500 font-mono">
                      <span>{formattedDate}</span>
                      <a
                        href={article.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 font-sans text-xs text-ink dark:text-zinc-300 font-semibold hover:text-red-600 dark:hover:text-red-400"
                      >
                        <span>Read ↗</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-paper-border dark:border-obsidian-borderSubtle bg-zinc-50 dark:bg-zinc-900/50">
          <p className="text-[11px] text-ink-muted dark:text-zinc-500 font-mono text-center">
            Saved articles are stored locally in your browser.
          </p>
        </div>
      </div>
    </div>
  );
}
