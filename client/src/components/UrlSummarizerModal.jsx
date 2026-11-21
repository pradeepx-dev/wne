import React, { useState } from "react";
import { X, Sparkles, Link as LinkIcon, ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import ArticleCard from "./ArticleCard";

export default function UrlSummarizerModal({
  isOpen,
  onClose,
  onArticleGenerated,
  onToggleBookmark,
  bookmarkedIds = new Set(),
}) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0); // 0: input, 1: fetching, 2: synthesizing, 3: done
  const [error, setError] = useState(null);
  const [generatedArticle, setGeneratedArticle] = useState(null);

  if (!isOpen) return null;

  const handleSummarize = async (e) => {
    e?.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setGeneratedArticle(null);
    setStep(1);

    try {
      // Step progression animation
      const stepTimer = setTimeout(() => setStep(2), 1200);

      const res = await fetch("http://localhost:5000/api/summarize-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      clearTimeout(stepTimer);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with ${res.status}`);
      }

      const data = await res.json();
      setStep(3);
      setGeneratedArticle(data.article);
      if (onArticleGenerated) {
        onArticleGenerated(data.article);
      }
    } catch (err) {
      setError(err.message || "Failed to process article URL");
      setStep(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSampleClick = (sampleUrl) => {
    setUrl(sampleUrl);
  };

  const handleReset = () => {
    setUrl("");
    setGeneratedArticle(null);
    setError(null);
    setStep(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-paper dark:bg-obsidian-card border border-paper-border dark:border-obsidian-border rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-paper-border dark:border-obsidian-borderSubtle flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-editorial text-xl font-bold text-ink dark:text-white">
                Instant AI Article Summarizer
              </h2>
              <p className="text-xs text-ink-muted dark:text-zinc-400 font-sans">
                Paste any article URL from anywhere on the web to extract and synthesize an executive brief.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-ink-muted hover:text-ink dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!generatedArticle ? (
            <form onSubmit={handleSummarize} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-mono font-semibold uppercase text-ink-secondary dark:text-zinc-400">
                  Article Web Link (HTTP / HTTPS)
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted dark:text-zinc-500" />
                  <input
                    type="url"
                    required
                    placeholder="https://www.theverge.com/... or https://bbc.com/..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-paper-border dark:border-zinc-800 rounded-xl text-sm text-ink dark:text-white placeholder-ink-muted dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-ink dark:focus:ring-zinc-400 transition"
                  />
                </div>
              </div>

              {/* Sample Suggestions */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-ink-muted dark:text-zinc-500">
                  Try sample URLs:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleSampleClick("https://techcrunch.com")}
                    className="text-xs px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-ink-secondary dark:text-zinc-300 font-mono transition"
                  >
                    TechCrunch
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSampleClick("https://www.bbc.com/news")}
                    className="text-xs px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-ink-secondary dark:text-zinc-300 font-mono transition"
                  >
                    BBC News
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSampleClick("https://www.theverge.com")}
                    className="text-xs px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-ink-secondary dark:text-zinc-300 font-mono transition"
                  >
                    The Verge
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl flex items-start space-x-2 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Processing Steps Indicator */}
              {loading && (
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-paper-border dark:border-zinc-800 space-y-3">
                  <div className="flex items-center space-x-3 text-xs font-mono">
                    <Loader2 className="w-4 h-4 animate-spin text-ink dark:text-white" />
                    <span className="font-semibold text-ink dark:text-white">
                      {step === 1 ? "1/2 Fetching webpage & metadata..." : "2/2 AI synthesizing headline & takeaways..."}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-ink dark:bg-zinc-100 h-full transition-all duration-700"
                      style={{ width: step === 1 ? "45%" : "85%" }}
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-ink text-paper dark:bg-zinc-100 dark:text-zinc-950 font-semibold text-sm hover:bg-neutral-800 dark:hover:bg-white shadow-paper transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing with AI...</span>
                  </>
                ) : (
                  <>
                    <span>Generate AI Briefing</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Resulting Card Preview */
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between text-xs font-mono text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/40 p-3 rounded-xl border border-green-200 dark:border-green-900">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Successfully synthesized and added to your feed!</span>
                </div>
                <button
                  onClick={handleReset}
                  className="underline hover:text-green-700 dark:hover:text-green-300"
                >
                  Summarize Another
                </button>
              </div>

              <div className="max-w-md mx-auto">
                <ArticleCard
                  article={generatedArticle}
                  viewMode="grid"
                  onSelectArticle={() => {}}
                  onToggleBookmark={() => onToggleBookmark(generatedArticle)}
                  isBookmarked={bookmarkedIds.has(generatedArticle.id)}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-ink text-paper dark:bg-zinc-100 dark:text-zinc-950 text-xs font-semibold shadow-paper"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
