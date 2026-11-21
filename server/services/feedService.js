import Parser from "rss-parser";
import { NEWS_SOURCES } from "../data/sources.js";
import { summarizeArticle } from "./aiService.js";

const parser = new Parser({
  timeout: 8000,
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  },
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: true }],
      ["media:thumbnail", "mediaThumbnail", { keepArray: true }],
      ["enclosure", "enclosure"],
      ["content:encoded", "contentEncoded"]
    ]
  }
});

let articleCache = [];
let lastFetchedAt = null;
let isFetching = false;

// Fallback high-quality editorial image bank by category when an RSS item lacks a lead image
const CATEGORY_IMAGES = {
  Technology: [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80"
  ],
  World: [
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&auto=format&fit=crop&q=80"
  ],
  Business: [
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=80"
  ],
  Science: [
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=800&auto=format&fit=crop&q=80"
  ],
  Entertainment: [
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80"
  ],
  Sports: [
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80"
  ],
  India: [
    "https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1599030709890-a0d71ba7ceec?w=800&auto=format&fit=crop&q=80"
  ]
};

function getFallbackImage(category, index = 0) {
  const images = CATEGORY_IMAGES[category] || CATEGORY_IMAGES.World;
  return images[index % images.length];
}

function extractImageUrl(item) {
  // Check enclosure
  if (item.enclosure && item.enclosure.url && item.enclosure.type?.startsWith("image")) {
    return item.enclosure.url;
  }
  // Check mediaContent
  if (item.mediaContent && item.mediaContent.length > 0) {
    const found = item.mediaContent.find(m => m.$?.url && (m.$?.medium === "image" || m.$?.type?.startsWith("image") || m.$?.url.match(/\.(jpg|jpeg|png|webp)/i)));
    if (found?.$?.url) return found.$.url;
    if (item.mediaContent[0]?.$?.url) return item.mediaContent[0].$.url;
  }
  // Check mediaThumbnail
  if (item.mediaThumbnail && item.mediaThumbnail.length > 0) {
    if (item.mediaThumbnail[0]?.$?.url) return item.mediaThumbnail[0].$.url;
  }
  // Check img tags inside content or snippet
  const htmlContent = item.contentEncoded || item.content || item.summary || "";
  const imgMatch = htmlContent.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1];
  }
  return null;
}

/**
 * Classify the true category of an article based on its title + content keywords.
 * The sourceCategory is used as a bias: if scores are equal or the match is weak,
 * the article stays in its source's category. This ensures that genuinely off-topic
 * articles (e.g. a music review published by a tech outlet) get correctly reclassified.
 */
function classifyArticleCategory(sourceCategory, title = "", content = "") {
  const text = (title + " " + content).toLowerCase();

  const SIGNALS = {
    Technology: [
      "ai", "artificial intelligence", "machine learning", "neural network", "deep learning",
      "robot", "robotics", "chip", "semiconductor", "quantum computing", "software", "hardware",
      "startup", "tech", "cybersecurity", "hack", "breach", "malware", "ransomware",
      "coding", "programming", "algorithm", "smartphone", "iphone", "android", "app",
      "cloud computing", "data center", "server", "microsoft", "google", "apple", "amazon",
      "meta", "openai", "chatgpt", "llm", "gpt", "elon musk", "spacex", "tesla",
      "5g", "6g", "blockchain", "crypto", "bitcoin", "ethereum", "nft", "vr", "ar",
      "processor", "gpu", "cpu", "operating system", "browser", "internet"
    ],
    Business: [
      "stock", "stocks", "market", "markets", "economy", "economic", "gdp", "inflation",
      "revenue", "profit", "loss", "earnings", "ipo", "merger", "acquisition", "deal",
      "fed", "federal reserve", "interest rate", "recession", "nasdaq", "dow jones",
      "s&p 500", "wall street", "trade", "tariff", "bank", "banking", "finance",
      "investment", "investor", "fund", "hedge fund", "shares", "dividend", "bond",
      "commodity", "oil", "gold", "currency", "dollar", "euro", "yen", "imf",
      "world bank", "startup funding", "venture capital", "private equity"
    ],
    World: [
      "war", "conflict", "military", "army", "troops", "attack", "bombing", "missile",
      "treaty", "diplomat", "diplomacy", "sanction", "embargo", "un", "nato",
      "election", "president", "prime minister", "parliament", "government", "politics",
      "protest", "rally", "riot", "revolution", "coup", "refugee", "migrant",
      "geopolitic", "foreign policy", "white house", "kremlin", "g7", "g20"
    ],
    Science: [
      "science", "scientific", "research", "study", "discovery", "experiment",
      "space", "nasa", "asteroid", "planet", "galaxy", "universe", "telescope",
      "climate change", "global warming", "carbon", "emission", "environment",
      "biology", "genetics", "dna", "genome", "cancer", "vaccine", "virus",
      "physics", "chemistry", "mathematics", "paleontology", "fossil",
      "psychology", "neuroscience", "brain", "cognition", "evolution"
    ],
    Entertainment: [
      "movie", "film", "cinema", "box office", "streaming", "netflix", "hbo",
      "tv show", "television", "series", "season", "episode", "premiere", "trailer",
      "music", "album", "song", "singer", "band", "concert", "tour", "grammy",
      "celebrity", "actor", "actress", "director", "producer", "oscar", "emmy",
      "award", "hollywood", "disney", "marvel", "comic", "gaming", "video game",
      "review", "critique", "fashion", "celebrity"
    ],
    Sports: [
      "nba", "nfl", "nhl", "mlb", "mls", "fifa", "uefa", "la liga", "premier league",
      "football", "basketball", "baseball", "hockey", "tennis", "golf", "cricket",
      "rugby", "swimming", "athletics", "olympics", "championship", "tournament",
      "league", "cup", "medal", "athlete", "player", "coach", "team", "stadium",
      "match", "game", "goal", "score", "transfer", "ipl", "bcci"
    ],
    India: [
      "india", "indian", "delhi", "new delhi", "mumbai", "bangalore", "bengaluru",
      "chennai", "kolkata", "hyderabad", "pune", "modi", "bjp", "congress",
      "lok sabha", "rajya sabha", "supreme court of india", "ipl", "bollywood",
      "rupee", "rbi", "sebi", "sensex", "nifty", "pakistan", "china border",
      "kashmir", "northeast india", "maharashtra", "tamil nadu", "kerala"
    ]
  };

  // Score each category
  const scores = {};
  for (const [cat, keywords] of Object.entries(SIGNALS)) {
    let score = 0;
    for (const kw of keywords) {
      // Multi-word phrases score higher than single words
      if (text.includes(kw)) {
        score += kw.includes(" ") ? 3 : 1;
      }
    }
    scores[cat] = score;
  }

  // Apply a bias toward the source's own category to avoid misclassification on ambiguous articles
  const SOURCE_BIAS = 4;
  scores[sourceCategory] = (scores[sourceCategory] || 0) + SOURCE_BIAS;

  // Find the category with the highest score
  const best = Object.entries(scores).reduce((a, b) => b[1] > a[1] ? b : a);

  // Only override source category when the winning category has meaningful signal (> bias alone)
  if (best[0] !== sourceCategory && best[1] > SOURCE_BIAS + 2) {
    return best[0];
  }

  return sourceCategory;
}

/**
 * Fetch and process feeds from all media channels
 */
export async function refreshAllFeeds() {
  if (isFetching) return articleCache;
  isFetching = true;

  console.log("🌐 WNE Engine: Synchronizing multi-channel news feeds...");
  const aggregatedArticles = [];

  const promises = NEWS_SOURCES.map(async (source, sourceIndex) => {
    try {
      const feed = await parser.parseURL(source.feedUrl);
      if (!feed || !feed.items) return [];

      // Take top 6 latest stories per outlet to maintain balanced diversity
      const latestItems = feed.items.slice(0, 6);

      const sourceArticles = await Promise.all(
        latestItems.map(async (item, itemIndex) => {
          const rawContent = item.contentSnippet || item.content || item.summary || item.title;

          // Classify the true category of this article based on its title + content
          const articleCategory = classifyArticleCategory(source.category, item.title, rawContent);

          const imageUrl = extractImageUrl(item) || getFallbackImage(articleCategory, sourceIndex + itemIndex);

          // Generate AI executive summary & takeaways
          const aiData = await summarizeArticle({
            title: item.title,
            content: rawContent,
            source: source.name,
            category: articleCategory
          });

          return {
            id: `${source.id}-${Buffer.from(item.guid || item.link || item.title).toString("base64").slice(0, 16)}`,
            title: item.title,
            aiHeadline: aiData.aiHeadline,
            aiSummary: aiData.aiSummary,
            keyTakeaways: aiData.keyTakeaways,
            readingTime: aiData.readingTime,
            tag: aiData.tag,
            source: source.name,
            sourceId: source.id,
            sourceUrl: item.link, // Direct original publisher link
            sourceIcon: source.icon,
            sourceColor: source.accentColor,
            category: articleCategory,  // ← content-based, not just source-based
            imageUrl,
            publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
            modelUsed: aiData.modelUsed
          };
        })
      );

      return sourceArticles;
    } catch (err) {
      console.warn(`[Feed Warning] Could not fetch ${source.name} (${source.feedUrl}):`, err.message);
      return [];
    }
  });

  const results = await Promise.all(promises);
  for (const list of results) {
    aggregatedArticles.push(...list);
  }

  // Sort by publication date descending
  aggregatedArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  if (aggregatedArticles.length > 0) {
    articleCache = aggregatedArticles;
    lastFetchedAt = new Date();
    console.log(`✅ WNE Engine: Successfully synchronized ${articleCache.length} articles across ${NEWS_SOURCES.length} media channels.`);
  }

  isFetching = false;
  return articleCache;
}

/**
 * Get cached articles or fetch if cache is empty or older than 5 minutes
 */
export async function getArticles({ category, source, search, limit = 20 } = {}) {
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  if (!lastFetchedAt || lastFetchedAt.getTime() < fiveMinutesAgo || articleCache.length === 0) {
    await refreshAllFeeds();
  }

  let filtered = [...articleCache];

  // Filter by category first (strict match, case-insensitive)
  if (category && category !== "All") {
    filtered = filtered.filter(a => a.category.toLowerCase() === category.toLowerCase());
  }

  if (source && source !== "All") {
    filtered = filtered.filter(a => a.source.toLowerCase() === source.toLowerCase() || a.sourceId === source);
  }

  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(a => 
      a.title?.toLowerCase().includes(q) ||
      a.aiHeadline?.toLowerCase().includes(q) ||
      a.aiSummary?.toLowerCase().includes(q) ||
      a.source?.toLowerCase().includes(q)
    );
  }

  const totalCount = filtered.length;

  // Apply limit after all filters; cap at 100 to prevent huge payloads
  const numLimit = Math.min(parseInt(limit, 10) || 20, 100);
  const paginated = numLimit > 0 ? filtered.slice(0, numLimit) : filtered;

  return {
    articles: paginated,
    total: totalCount,
    lastFetchedAt,
    sourcesCount: NEWS_SOURCES.length
  };
}

/**
 * Get breaking news for ticker
 */
export async function getBreakingNews() {
  if (articleCache.length === 0) {
    await refreshAllFeeds();
  }
  // Return top 8 most recent stories
  return articleCache.slice(0, 8).map(a => ({
    id: a.id,
    title: a.aiHeadline || a.title,
    source: a.source,
    sourceUrl: a.sourceUrl,
    publishedAt: a.publishedAt,
    tag: a.tag
  }));
}
