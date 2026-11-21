import React, { useState, useEffect, useMemo, useRef } from "react";
import Navbar from "./components/Navbar";
import NewsTicker from "./components/NewsTicker";
import CategoryNav from "./components/CategoryNav";
import ArticleCard from "./components/ArticleCard";
import BookmarksDrawer from "./components/BookmarksDrawer";
import Footer from "./components/Footer";
import { Newspaper, AlertCircle } from "lucide-react";

const API_BASE = "http://localhost:5050/api";

export default function App() {
  const [articles, setArticles] = useState([]);
  const [breakingNews, setBreakingNews] = useState([]);
  const [sources, setSources] = useState([]);
  const [categories, setCategories] = useState([
    "All",
    "Technology",
    "World",
    "Business",
    "Science",
    "Entertainment",
    "Sports",
  ]);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ref to cancel in-flight fetch when category changes rapidly
  const abortControllerRef = useRef(null);

  // Bookmarks stored in localStorage
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem("wne_bookmarks");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Dark Mode stored in localStorage - DEFAULT IS TRUE (Dark)
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem("wne_dark_mode");
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  // Apply dark mode class to html document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    try {
      localStorage.setItem("wne_dark_mode", JSON.stringify(darkMode));
    } catch (e) {
      console.warn("Could not save dark mode preference:", e);
    }
  }, [darkMode]);

  // Persist bookmarks
  useEffect(() => {
    try {
      localStorage.setItem("wne_bookmarks", JSON.stringify(bookmarks));
    } catch (e) {
      console.warn("Could not save bookmarks:", e);
    }
  }, [bookmarks]);

  // Fetch sources
  const fetchSources = async () => {
    try {
      const res = await fetch(`${API_BASE}/sources`);
      if (res.ok) {
        const data = await res.json();
        setSources(data.sources || []);
        if (data.categories) setCategories(data.categories);
      }
    } catch (e) {
      console.warn("Could not fetch sources:", e.message);
    }
  };

  // Fetch breaking news ticker
  const fetchBreakingNews = async () => {
    try {
      const res = await fetch(`${API_BASE}/news/breaking`);
      if (res.ok) {
        const data = await res.json();
        setBreakingNews(data || []);
      }
    } catch (e) {
      console.warn("Could not fetch breaking news:", e.message);
    }
  };

  // Fetch news feed by category — cancels any previous in-flight request
  const fetchNews = async (category = "All") => {
    // Cancel any previous in-flight fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (category && category !== "All") {
        params.append("category", category);
        params.append("limit", "50");
      } else {
        params.append("limit", "30");
      }

      const res = await fetch(`${API_BASE}/news?${params.toString()}`, { signal });
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
      const data = await res.json();
      setArticles(data.articles || []);
    } catch (err) {
      if (err.name === "AbortError") return; // Stale request — safely ignore
      console.error("Error loading news feed:", err);
      setError("Unable to load latest news feeds. Please make sure the backend server is running.");
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  };

  // Initial load: sources + breaking news (news fetch handled by [selectedCategory] effect)
  useEffect(() => {
    fetchSources();
    fetchBreakingNews();
  }, []);

  // Fetch news whenever selected category changes (also fires on initial mount with "All")
  useEffect(() => {
    fetchNews(selectedCategory);
  }, [selectedCategory]);

  // Bookmark Toggle
  const bookmarkedIds = useMemo(() => new Set(bookmarks.map((b) => b.id)), [bookmarks]);

  const handleToggleBookmark = (article) => {
    setBookmarks((prev) => {
      if (prev.some((b) => b.id === article.id)) {
        return prev.filter((b) => b.id !== article.id);
      } else {
        return [article, ...prev];
      }
    });
  };

  const handleRemoveBookmark = (id) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleClearAllBookmarks = () => {
    if (window.confirm("Are you sure you want to clear your reading list?")) {
      setBookmarks([]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink dark:bg-obsidian dark:text-zinc-100 selection:bg-neutral-900 selection:text-white transition-colors duration-200">
      {/* 1. Global Navigation Bar with Centered Masthead */}
      <Navbar
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        bookmarksCount={bookmarks.length}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* 2. Live Breaking Wire Ticker */}
      <NewsTicker breakingNews={breakingNews} />

      {/* 3. Category Filter Bar */}
      <CategoryNav
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* 4. Main Editorial Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Loading Skeletons */}
        {loading ? (
          <div className="space-y-4 sm:space-y-6 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <div key={i} className="h-28 sm:h-72 bg-zinc-200 dark:bg-zinc-850 rounded-xl sm:rounded-2xl skeleton-shimmer"></div>
              ))}
            </div>
          </div>
        ) : error ? (
          /* Error State */
          <div className="py-16 text-center border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 rounded-2xl p-8 max-w-xl mx-auto">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="font-serif text-xl font-bold text-ink dark:text-white mb-2">
              Unable to Sync News Feeds
            </h3>
            <p className="text-sm text-ink-secondary dark:text-zinc-400 mb-6 font-sans">
              {error}
            </p>
            <button
              onClick={() => fetchNews(selectedCategory)}
              className="px-5 py-2.5 rounded-xl bg-ink text-paper dark:bg-zinc-100 dark:text-zinc-950 font-semibold text-xs shadow-paper"
            >
              Try Reconnecting
            </button>
          </div>
        ) : articles.length === 0 ? (
          /* Empty State */
          <div className="py-20 text-center max-w-md mx-auto">
            <Newspaper className="w-12 h-12 text-ink-muted dark:text-zinc-600 mx-auto mb-4" />
            <h3 className="font-serif text-xl font-bold text-ink dark:text-white mb-2">
              No articles available in this category
            </h3>
            <p className="text-xs text-ink-secondary dark:text-zinc-400 font-sans mb-6">
              Please check back shortly as the live news wire synchronizes fresh reporting.
            </p>
            <button
              onClick={() => setSelectedCategory("All")}
              className="px-5 py-2.5 rounded-xl bg-ink text-paper dark:bg-zinc-100 dark:text-zinc-950 font-semibold text-xs shadow-paper"
            >
              View All Stories
            </button>
          </div>
        ) : (
          <>
            {/* Curated Stories Heading */}
            <div className="mb-4 sm:mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-ink dark:text-white">
                  {selectedCategory === "All" ? "Top Stories" : `${selectedCategory} Stories`}
                </h3>
                <span className="font-mono text-xs text-ink-muted dark:text-zinc-500">
                  ({articles.length} stories)
                </span>
              </div>
            </div>

            {/* All Articles Grid: Compact horizontal on mobile, clean grid on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onToggleBookmark={handleToggleBookmark}
                  isBookmarked={bookmarkedIds.has(article.id)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* 5. Saved Reading List Drawer */}
      <BookmarksDrawer
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarks={bookmarks}
        onRemoveBookmark={handleRemoveBookmark}
        onClearAll={handleClearAllBookmarks}
      />

      {/* 6. Editorial Footer */}
      <Footer sources={sources} />
    </div>
  );
}
