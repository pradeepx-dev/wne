import React, { useState, useEffect } from "react";
import {
  X,
  ExternalLink,
  Sparkles,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Bookmark,
  Clock,
  Share2,
  ArrowUpRight
} from "lucide-react";

export default function ArticleModal({
  article,
  onClose,
  onToggleBookmark,
  isBookmarked,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Stop audio speech when modal closes
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!article) return null;

  const formattedDate = new Date(article.publishedAt).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleToggleSpeech = () => {
    if (!window.speechSynthesis) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const textToRead = `${article.aiHeadline || article.title}. Executive summary: ${article.aiSummary}. Key takeaways: ${article.keyTakeaways?.join(". ") || ""}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 1.0;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  const handleCopySummary = () => {
    const text = `📰 ${article.aiHeadline || article.title}\n\n⚡ THE GIST:\n${article.aiSummary}\n\n📌 KEY TAKEAWAYS:\n${article.keyTakeaways?.map(k => `• ${k}`).join("\n")}\n\nSource: ${article.source} (${article.sourceUrl})\nCurated on WNE`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-3xl bg-paper dark:bg-obsidian-card border border-paper-border dark:border-obsidian-border rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-paper-border dark:border-obsidian-borderSubtle flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {article.sourceIcon && (
              <img
                src={article.sourceIcon}
                alt={article.source}
                className="w-6 h-6 rounded-full object-contain bg-white p-0.5 border border-zinc-200 dark:border-zinc-700"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            )}
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-ink dark:text-zinc-100">{article.source}</span>
                <span className="px-1.5 py-0.5 text-[10px] uppercase font-mono font-medium rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {article.category}
                </span>
                {article.tag && (
                  <span className="px-1.5 py-0.5 text-[10px] uppercase font-mono font-bold rounded bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                    {article.tag}
                  </span>
                )}
              </div>
              <p className="text-xs text-ink-muted dark:text-zinc-400 font-mono mt-0.5">
                Published {formattedDate}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Audio Speech Synthesis Toggle */}
            <button
              onClick={handleToggleSpeech}
              className={`p-2 rounded-lg border transition ${
                isPlaying
                  ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300"
                  : "border-paper-border dark:border-zinc-800 text-ink-secondary dark:text-zinc-400 hover:text-ink hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
              title={isPlaying ? "Stop audio briefing" : "Listen to audio briefing"}
            >
              {isPlaying ? <VolumeX className="w-4 h-4 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Copy Briefing */}
            <button
              onClick={handleCopySummary}
              className="p-2 rounded-lg border border-paper-border dark:border-zinc-800 text-ink-secondary dark:text-zinc-400 hover:text-ink hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              title="Copy executive summary"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Bookmark */}
            <button
              onClick={() => onToggleBookmark(article)}
              className={`p-2 rounded-lg border transition ${
                isBookmarked
                  ? "bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-900 text-red-600"
                  : "border-paper-border dark:border-zinc-800 text-ink-secondary dark:text-zinc-400 hover:text-ink hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
              title={isBookmarked ? "Remove bookmark" : "Save article"}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-ink-muted hover:text-ink dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 max-h-[70vh] overflow-y-auto space-y-6">
          {/* Article Image if available */}
          {article.imageUrl && (
            <div className="w-full h-64 sm:h-80 rounded-xl overflow-hidden bg-zinc-900">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          )}

          {/* AI Headline */}
          <div>
            <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-ink dark:text-white leading-tight">
              {article.aiHeadline || article.title}
            </h1>
            {article.aiHeadline && article.title !== article.aiHeadline && (
              <p className="text-xs text-ink-muted dark:text-zinc-500 font-sans mt-1.5 italic">
                Original Headline: "{article.title}"
              </p>
            )}
          </div>

          {/* AI Executive Summary Card */}
          <div className="p-5 bg-zinc-50 dark:bg-zinc-900/90 rounded-xl border border-paper-border dark:border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 text-xs font-mono font-bold text-ink dark:text-white uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>The Gist</span>
              </div>
              <span className="text-[11px] font-mono text-ink-muted dark:text-zinc-500">
                {article.readingTime || "2 min read"}
              </span>
            </div>
            <p className="text-sm sm:text-base text-ink dark:text-zinc-200 leading-relaxed font-sans">
              {article.aiSummary}
            </p>
          </div>

          {/* Key Takeaways */}
          {article.keyTakeaways && article.keyTakeaways.length > 0 && (
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-ink-muted dark:text-zinc-400 mb-3">
                Key Takeaways & Facts
              </h3>
              <ul className="space-y-2.5">
                {article.keyTakeaways.map((takeaway, idx) => (
                  <li
                    key={idx}
                    className="flex items-start text-sm text-ink-secondary dark:text-zinc-300 bg-white dark:bg-zinc-850/60 p-3 rounded-lg border border-paper-border dark:border-zinc-800/80"
                  >
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-700 text-ink dark:text-white text-xs font-mono font-bold flex items-center justify-center mr-3 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Model Attribution Note */}
          <div className="pt-2 text-center">
            <span className="text-[11px] font-mono text-ink-muted dark:text-zinc-500">
              Curated by WNE AI Engine ({article.modelUsed || "Groq Llama 3.3 / NLP"})
            </span>
          </div>
        </div>

        {/* Modal Footer with Direct External Redirection Button */}
        <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border-t border-paper-border dark:border-obsidian-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-ink-secondary dark:text-zinc-400">
            <span>Read complete reporting, citations & media on original source:</span>
          </div>

          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-ink text-paper dark:bg-zinc-100 dark:text-zinc-950 font-semibold text-sm hover:bg-neutral-800 dark:hover:bg-white shadow-paper transition"
          >
            <span>Continue to Full Story on {article.source}</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
