<div align="center">

# WNE — World News Echo

**A high-contrast, AI-powered global news aggregator**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)](https://vite.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![Groq](https://img.shields.io/badge/AI-Groq%20LLM-F55036?style=flat-square)](https://groq.com)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

*Curating top reporting from world-class newsrooms — with AI editorial intelligence.*

</div>

---

## Overview

**WNE (World News Echo)** is a full-stack news aggregation platform that pulls live RSS feeds from 19 premier global media outlets, classifies every article by content (not just source), and generates AI-powered editorial summaries using Groq's LLM — all served through a sleek, editorial-grade UI with dark mode, category filtering, breaking news ticker, and a saved reading list.

```
┌─────────────────────────────────────────────────────────┐
│                      WNE Architecture                   │
│                                                         │
│   19 RSS Feeds ──► Feed Parser ──► AI Classifier        │
│                                        │                │
│                              Groq LLM / NLP Engine      │
│                                        │                │
│                              Article Cache (in-memory)  │
│                                        │                │
│                         Express REST API (:5050)        │
│                                        │                │
│                      React 19 + Vite Frontend (:5173)   │
└─────────────────────────────────────────────────────────┘
```

---

## Features

### 📰 News Aggregation
- Fetches live RSS feeds from **19 premier global newsrooms** every 10 minutes
- Pulls up to **6 latest stories per outlet** for a balanced, diverse feed
- **Content-based category classification** — articles are categorised by what they're about, not just which outlet published them (e.g. a TechCrunch article about markets is filed under Business)

### 🤖 AI Editorial Intelligence
- **Groq LLM** (`llama-3.3-70b-versatile`) generates:
  - Concise editorial headlines
  - 1–2 sentence executive summaries ("The Gist")
  - 3 key takeaways per article
  - Estimated reading time
  - Editorial tags (`Breaking`, `Analysis`, `Market Impact`, `Tech Brief`, `Discovery`)
- **Built-in NLP fallback** — works fully without a Groq API key using heuristic sentence extraction

### 🗂️ Category Navigation
- **8 categories**: All · Technology · World · India · Business · Science · Entertainment · Sports
- Strict per-category filtering with **AbortController** — rapid category switches never show stale data
- Full loading skeleton on every category switch for instant visual feedback

### 🔴 Live Breaking News Ticker
- Scrolling wire-style ticker with the 8 most recent headlines
- Direct links to original publishers

### 🔖 Reading List (Bookmarks)
- Save and manage articles in a slide-in drawer
- Persisted to `localStorage` — survives page refreshes
- Clear-all with confirmation guard

### 🌙 Dark / Light Mode
- Defaults to **dark (ink) mode**
- Persisted to `localStorage`
- Smooth transition with editorial paper/obsidian colour palette

### 🔗 Original Source Respect
- Every article links directly to the **original publisher** — WNE never hosts content
- Source logo, name, and accent colour displayed on every card

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Vite | 8 | Dev server & bundler |
| Tailwind CSS | 3 | Utility-first styling |
| Lucide React | 1.61 | Icon system |
| JetBrains Mono | — | Monospace / metadata font |
| Newsreader | — | Editorial serif font |
| Plus Jakarta Sans | — | UI sans-serif font |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 24+ | Runtime |
| Express | 4 | REST API server |
| rss-parser | 3 | RSS/Atom feed ingestion |
| groq-sdk | 0.15 | LLM summarisation |
| cheerio | 1 | HTML scraping (URL summariser) |
| axios | 1.7 | HTTP client |
| dotenv | 16 | Environment config |

---

## News Sources

| Category | Outlets |
|---|---|
| **Technology** | TechCrunch, The Verge, Wired, Ars Technica |
| **World** | BBC News, Al Jazeera, NPR |
| **Business** | CNBC, MarketWatch |
| **Science** | NASA, ScienceDaily |
| **Entertainment** | Variety, Rolling Stone |
| **Sports** | ESPN |
| **India** | The Hindu, Times of India, Indian Express, India Today, NDTV |

---

## Project Structure

```
wne/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx         # Masthead, dark mode toggle, bookmarks button
│   │   │   ├── NewsTicker.jsx     # Live breaking news scrolling ticker
│   │   │   ├── CategoryNav.jsx    # Category filter pill bar
│   │   │   ├── ArticleCard.jsx    # News card (mobile + desktop layout)
│   │   │   ├── ArticleModal.jsx   # Full article detail modal
│   │   │   ├── BookmarksDrawer.jsx # Saved reading list side drawer
│   │   │   ├── HeroArticle.jsx    # Featured hero article display
│   │   │   ├── Footer.jsx         # Source grid + editorial footer
│   │   │   └── UrlSummarizerModal.jsx # Paste-any-URL AI summariser
│   │   ├── App.jsx                # Root component, state, data fetching
│   │   └── main.jsx               # React entry point
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
│
└── server/                    # Express backend
    ├── data/
    │   └── sources.js             # All 19 RSS source definitions + CATEGORIES list
    ├── services/
    │   ├── feedService.js         # RSS ingestion, classification, caching
    │   ├── aiService.js           # Groq LLM + NLP fallback summariser
    │   └── scraperService.js      # URL scraper for the paste-URL feature
    ├── server.js                  # Express app, routes, background sync
    └── .env                       # API keys (not committed)
```

---

## Getting Started

### Prerequisites

- **Node.js** v18 or later
- A **Groq API key** (free at [console.groq.com](https://console.groq.com)) — *optional but recommended*

### 1. Clone the repository

```bash
git clone https://github.com/your-username/wne.git
cd wne
```

### 2. Configure the backend

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=5050
GROQ_API_KEY=your_groq_api_key_here
```

> **Note:** If `GROQ_API_KEY` is omitted, WNE runs in **NLP mode** — all features work, but summaries are generated by the built-in heuristic engine instead of the Groq LLM.

### 3. Install dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 4. Start the servers

**Backend** (in `server/`):
```bash
npm run dev        # development (auto-restarts on file change)
# or
npm start          # production
```

**Frontend** (in `client/`):
```bash
npm run dev
```

The app is now live at **[http://localhost:5173](http://localhost:5173)**

---

## API Reference

Base URL: `http://localhost:5050/api`

| Method | Endpoint | Query Params | Description |
|---|---|---|---|
| `GET` | `/news` | `category`, `source`, `search`, `limit` | Fetch articles with optional filters |
| `GET` | `/news/breaking` | — | Top 8 latest headlines for the ticker |
| `GET` | `/sources` | — | All media sources + category list |
| `POST` | `/summarize-url` | body: `{ url }` | Scrape & summarise any article URL |
| `POST` | `/refresh` | — | Force immediate RSS feed refresh |
| `GET` | `/health` | — | Server health + AI engine status |

### Example

```bash
# Fetch top Technology articles
curl "http://localhost:5050/api/news?category=Technology&limit=20"

# Fetch all India news
curl "http://localhost:5050/api/news?category=India&limit=50"

# Search across all articles
curl "http://localhost:5050/api/news?search=climate+change"

# Check server health
curl "http://localhost:5050/api/health"
```

---

## How Category Filtering Works

WNE uses a two-layer classification system:

1. **Source bias** — every article starts with its outlet's category (e.g. ESPN → Sports) with a bias score of 4
2. **Content scoring** — the article title and snippet are scored against keyword signal banks for all 8 categories (multi-word phrases score 3×, single words score 1×)
3. **Override rule** — the source category is only overridden when another category outscores it by more than the bias threshold, ensuring genuinely off-topic articles are correctly reclassified

This means a TechCrunch article about an IPO is filed as **Business**, while an NDTV article about a cricket match is filed as **Sports** — not just wherever their outlet's default is.

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `5050` | Backend server port |
| `GROQ_API_KEY` | No | — | Groq API key for LLM summarisation. Falls back to NLP engine if absent. |

---

## Scripts

### Backend (`server/`)
| Script | Command | Description |
|---|---|---|
| Development | `npm run dev` | Starts with `--watch` for auto-restart |
| Production | `npm start` | Starts with `node server.js` |

### Frontend (`client/`)
| Script | Command | Description |
|---|---|---|
| Development | `npm run dev` | Vite dev server with HMR |
| Build | `npm run build` | Production bundle to `dist/` |
| Preview | `npm run preview` | Serve the production build locally |
| Lint | `npm run lint` | Run oxlint |

---

## Contributing

Contributions are welcome. To add a new news source:

1. Open `server/data/sources.js`
2. Add an entry to the `NEWS_SOURCES` array:
```js
{
  id: "unique-id",
  name: "Outlet Name",
  category: "Technology",   // one of the 8 categories
  feedUrl: "https://example.com/rss",
  website: "https://example.com",
  icon: "https://example.com/favicon.ico",
  accentColor: "#hexcolor"
}
```
3. The article classifier will handle correct categorisation automatically.

---

## License

MIT © 2026 — WNE (World News Echo)

---

<div align="center">
  <sub>Built with React 19 · Groq AI · Express · Tailwind CSS</sub>
</div>
