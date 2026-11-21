import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

let groqClient = null;
if (process.env.GROQ_API_KEY) {
  try {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
    console.log("⚡ Groq AI Engine initialized with model llama-3.3-70b-versatile");
  } catch (err) {
    console.warn("⚠️ Groq client initialization failed, falling back to NLP engine:", err.message);
  }
} else {
  console.log("ℹ️ No GROQ_API_KEY found in .env. Operating in high-speed NLP mode. Add GROQ_API_KEY to enable Groq LLM synthesis.");
}

// In-memory cache for generated AI summaries to save API quota and ensure instant responses
const aiSummaryCache = new Map();

/**
 * Intelligent fallback heuristic NLP summarizer
 */
function heuristicSummarize(title, rawSnippet = "") {
  // Clean HTML tags and entities
  const cleanSnippet = rawSnippet
    .replace(/<[^>]*>?/gm, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

  // Split into sentences
  const sentences = cleanSnippet
    .split(/(?<=[.!?])\s+/)
    .filter(s => s.length > 25 && !s.includes("Read more") && !s.includes("Subscribe") && !s.includes("Terms of Service"));

  const gist = sentences.length > 0 
    ? sentences[0].slice(0, 200) + (sentences[0].length > 200 ? "..." : "")
    : title;

  const keyTakeaways = [];
  if (sentences.length > 1) {
    keyTakeaways.push(sentences[1].slice(0, 160));
  }
  if (sentences.length > 2) {
    keyTakeaways.push(sentences[2].slice(0, 160));
  }
  if (keyTakeaways.length === 0) {
    keyTakeaways.push("Latest updates reported directly from the primary source.");
    keyTakeaways.push("Full context, background statements, and developments available on the original publisher.");
  }

  // Calculate estimated reading time
  const wordCount = (title + " " + cleanSnippet).split(/\s+/).length;
  const readingTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

  // Determine sentiment / editorial tag
  const lower = (title + " " + cleanSnippet).toLowerCase();
  let tag = "Report";
  if (lower.includes("breaking") || lower.includes("alert") || lower.includes("urgent")) tag = "Breaking";
  else if (lower.includes("market") || lower.includes("stocks") || lower.includes("revenue") || lower.includes("billion") || lower.includes("inflation")) tag = "Market Impact";
  else if (lower.includes("ai") || lower.includes("chip") || lower.includes("quantum") || lower.includes("robot") || lower.includes("algorithm")) tag = "Tech Brief";
  else if (lower.includes("investigation") || lower.includes("analysis") || lower.includes("opinion") || lower.includes("why")) tag = "Analysis";
  else if (lower.includes("launch") || lower.includes("space") || lower.includes("discovery") || lower.includes("study")) tag = "Discovery";

  return {
    aiHeadline: title,
    aiSummary: gist,
    keyTakeaways: keyTakeaways.slice(0, 3),
    readingTime,
    tag,
    modelUsed: "WNE-NLP-Core"
  };
}

/**
 * Summarize an article using Groq API (or NLP fallback)
 */
export async function summarizeArticle({ title, content, source, category }) {
  const cacheKey = `${source}:${title}`.slice(0, 120);
  if (aiSummaryCache.has(cacheKey)) {
    return aiSummaryCache.get(cacheKey);
  }

  // If no Groq client, use high-speed NLP summarizer
  if (!groqClient || !process.env.GROQ_API_KEY) {
    const result = heuristicSummarize(title, content);
    aiSummaryCache.set(cacheKey, result);
    return result;
  }

  try {
    const prompt = `You are the chief editorial AI for WNE (World News Echo), a prestigious high-contrast minimalist news briefing platform.
Analyze the following news story from ${source} (${category || "General"}):

TITLE: ${title}
CONTENT / SNIPPET: ${content?.slice(0, 2500) || title}

Respond ONLY with valid JSON conforming to this schema (no extra explanation or markdown wrapping outside the json):
{
  "aiHeadline": "A clear, compelling, clickbait-free editorial headline (max 14 words)",
  "aiSummary": "The Gist: A lucid 1-2 sentence executive briefing explaining what happened and why it matters (max 50 words)",
  "keyTakeaways": [
    "First crucial fact or takeaway",
    "Second key context or implication",
    "Third outcome or next development"
  ],
  "readingTime": "Estimated full reading time (e.g. '2 min read' or '4 min read')",
  "tag": "One categorical tag: 'Breaking' | 'Developing' | 'Market Impact' | 'Analysis' | 'Discovery' | 'Key Brief'"
}`;

    const completion = await groqClient.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are WNE Editorial Engine. You output only raw, parseable JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}");
    const result = {
      aiHeadline: parsed.aiHeadline || title,
      aiSummary: parsed.aiSummary || title,
      keyTakeaways: Array.isArray(parsed.keyTakeaways) && parsed.keyTakeaways.length > 0 ? parsed.keyTakeaways.slice(0, 3) : [title],
      readingTime: parsed.readingTime || "2 min read",
      tag: parsed.tag || "Key Brief",
      modelUsed: "Groq (llama-3.3-70b)"
    };

    aiSummaryCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.warn(`Groq summarization warning for "${title.slice(0, 30)}...":`, error.message);
    const fallback = heuristicSummarize(title, content);
    aiSummaryCache.set(cacheKey, fallback);
    return fallback;
  }
}
