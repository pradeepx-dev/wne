import axios from "axios";
import * as cheerio from "cheerio";
import { summarizeArticle } from "./aiService.js";

/**
 * Scrapes and AI-summarizes any arbitrary news article URL
 */
export async function scrapeAndSummarizeUrl(url) {
  try {
    // Validate URL
    const parsedUrl = new URL(url);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new Error("Invalid URL protocol. Please provide an http or https link.");
    }

    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Extract OpenGraph and standard metadata
    const title = 
      $('meta[property="og:title"]').attr("content") ||
      $('meta[name="twitter:title"]').attr("content") ||
      $("title").text().trim() ||
      "Untitled Article";

    const description = 
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="description"]').attr("content") ||
      $('meta[name="twitter:description"]').attr("content") ||
      "";

    const imageUrl = 
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content") ||
      $('meta[name="twitter:image:src"]').attr("content") ||
      null;

    const siteName = 
      $('meta[property="og:site_name"]').attr("content") ||
      parsedUrl.hostname.replace(/^www\./, "").split(".")[0].toUpperCase();

    const publishedTime = 
      $('meta[property="article:published_time"]').attr("content") ||
      $('meta[name="publish-date"]').attr("content") ||
      $('time').attr("datetime") ||
      new Date().toISOString();

    // Extract article body paragraphs
    let articleText = "";
    $("article p, main p, .article-body p, .story-content p, .post-content p, p").each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 50 && !text.includes("cookie") && !text.includes("subscribe")) {
        articleText += text + " ";
      }
    });

    const fullContent = (description + " " + articleText).trim() || title;

    // Detect approximate category
    const lowerContent = (title + " " + fullContent).toLowerCase();
    let category = "General";
    if (lowerContent.includes("ai") || lowerContent.includes("tech") || lowerContent.includes("software") || lowerContent.includes("app")) category = "Technology";
    else if (lowerContent.includes("stock") || lowerContent.includes("market") || lowerContent.includes("economy") || lowerContent.includes("fed")) category = "Business";
    else if (lowerContent.includes("planet") || lowerContent.includes("nasa") || lowerContent.includes("climate") || lowerContent.includes("biology")) category = "Science";
    else if (lowerContent.includes("movie") || lowerContent.includes("music") || lowerContent.includes("film") || lowerContent.includes("celebrity")) category = "Entertainment";
    else if (lowerContent.includes("nba") || lowerContent.includes("fifa") || lowerContent.includes("football") || lowerContent.includes("game")) category = "Sports";
    else if (lowerContent.includes("war") || lowerContent.includes("treaty") || lowerContent.includes("election") || lowerContent.includes("minister")) category = "World";

    // Run through AI summarizer
    const aiResult = await summarizeArticle({
      title,
      content: fullContent,
      source: siteName,
      category
    });

    const favicon = `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=128`;

    return {
      id: "custom-" + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      title,
      aiHeadline: aiResult.aiHeadline,
      aiSummary: aiResult.aiSummary,
      keyTakeaways: aiResult.keyTakeaways,
      readingTime: aiResult.readingTime,
      tag: aiResult.tag,
      source: siteName,
      sourceUrl: url,
      sourceIcon: favicon,
      category,
      imageUrl,
      publishedAt: publishedTime,
      isUserPasted: true
    };
  } catch (err) {
    throw new Error(`Failed to ingest and summarize article: ${err.message}`);
  }
}
