import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getArticles, getBreakingNews, refreshAllFeeds } from "./services/feedService.js";
import { scrapeAndSummarizeUrl } from "./services/scraperService.js";
import { NEWS_SOURCES, CATEGORIES } from "./data/sources.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initial feed fetch on startup in background
refreshAllFeeds().catch(err => {
  console.error("Initial feed fetch error:", err.message);
});

// Periodic background sync every 10 minutes
setInterval(() => {
  refreshAllFeeds().catch(err => console.error("Periodic sync error:", err.message));
}, 10 * 60 * 1000);

/**
 * GET /api/news
 * Query parameters: category, source, search, limit
 */
app.get("/api/news", async (req, res) => {
  try {
    const { category, source, search, limit } = req.query;
    const result = await getArticles({ category, source, search, limit: limit ? parseInt(limit, 10) : 20 });
    res.json(result);
  } catch (err) {
    console.error("API /api/news error:", err);
    res.status(500).json({ error: "Failed to retrieve news articles", details: err.message });
  }
});

/**
 * GET /api/news/breaking
 * Ticker news stream
 */
app.get("/api/news/breaking", async (req, res) => {
  try {
    const breaking = await getBreakingNews();
    res.json(breaking);
  } catch (err) {
    console.error("API /api/news/breaking error:", err);
    res.status(500).json({ error: "Failed to retrieve breaking news", details: err.message });
  }
});

/**
 * GET /api/sources
 * List of media channels and categories
 */
app.get("/api/sources", (req, res) => {
  res.json({
    sources: NEWS_SOURCES.map(s => ({
      id: s.id,
      name: s.name,
      category: s.category,
      website: s.website,
      icon: s.icon,
      accentColor: s.accentColor
    })),
    categories: CATEGORIES
  });
});

/**
 * POST /api/summarize-url
 * Ingest and AI-summarize any user-submitted article link
 */
app.post("/api/summarize-url", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "A valid news article URL is required." });
    }

    const summarizedArticle = await scrapeAndSummarizeUrl(url);
    res.json({
      success: true,
      article: summarizedArticle
    });
  } catch (err) {
    console.error("API /api/summarize-url error:", err);
    res.status(422).json({ error: err.message || "Could not process this article URL" });
  }
});

/**
 * POST /api/refresh
 * Force immediate refresh of RSS feeds
 */
app.post("/api/refresh", async (req, res) => {
  try {
    const articles = await refreshAllFeeds();
    res.json({ success: true, count: articles.length, message: "Feeds refreshed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to refresh feeds", details: err.message });
  }
});

/**
 * GET /api/health
 */
app.get("/api/health", (req, res) => {
  const hasGroq = Boolean(process.env.GROQ_API_KEY);
  res.json({
    status: "healthy",
    engine: "WNE Core v1.0",
    aiProvider: hasGroq ? "Groq (llama-3.3-70b-versatile)" : "WNE Intelligent NLP Core",
    groqConfigured: hasGroq,
    activeSources: NEWS_SOURCES.length,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`📰 WNE (World News Echo) Backend running on http://localhost:${PORT}`);
  console.log(`🤖 AI Engine: ${process.env.GROQ_API_KEY ? "Groq API (llama-3.3-70b)" : "Intelligent NLP Engine (Add GROQ_API_KEY to server/.env for Groq)"}`);
  console.log(`📡 Monitored Media Outlets: ${NEWS_SOURCES.length} active channels`);
  console.log(`======================================================\n`);
});
