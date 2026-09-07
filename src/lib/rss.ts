import Parser from 'rss-parser';
import { FEED_SOURCES } from '../data/sources';
import { FeedItem, FeedSource, FeedsResponse } from '../types';

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 (AI-Opdatering/1.0)',
    'Accept': 'application/rss+xml, application/xml, application/atom+xml, text/xml;q=0.9, */*;q=0.8',
  },
  timeout: 8000,
});

function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function extractCleanAuthor(rawAuthor: any): string | undefined {
  if (!rawAuthor) return undefined;
  if (typeof rawAuthor === 'string') {
    const trimmed = rawAuthor.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  if (typeof rawAuthor === 'object') {
    if (typeof rawAuthor.name === 'string') {
      return rawAuthor.name.trim();
    }
    if (Array.isArray(rawAuthor.name) && rawAuthor.name[0]) {
      return String(rawAuthor.name[0]).trim();
    }
    if (typeof rawAuthor._ === 'string') {
      return rawAuthor._.trim();
    }
  }
  return undefined;
}

function sanitizeXml(rawXml: string): string {
  return rawXml.replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;');
}

async function fetchSingleFeed(source: FeedSource): Promise<FeedItem[]> {
  try {
    let feed: any = null;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(source.feedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 (AI-Opdatering/1.0)',
          'Accept': 'application/rss+xml, application/xml, application/atom+xml, text/xml;q=0.9, */*;q=0.8',
        },
        signal: controller.signal,
        cache: 'no-store', // Avoid Next.js data cache 2MB per item warnings
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const text = await res.text();
        const sanitized = sanitizeXml(text);
        feed = await parser.parseString(sanitized);
      }
    } catch (fetchErr) {
      feed = await parser.parseURL(source.feedUrl);
    }

    if (!feed || !Array.isArray(feed.items)) return [];

    return feed.items.slice(0, 15).map((item: any, index: number): FeedItem => {
      const rawDate = item.isoDate || item.pubDate || item.date;
      let dateObj = new Date();
      if (rawDate) {
        const parsed = new Date(rawDate);
        if (!isNaN(parsed.getTime())) {
          dateObj = parsed;
        }
      }

      // Format clean snippet
      const rawSnippet = item.contentSnippet || item.summary || item.content || '';
      let cleanSnippet = stripHtml(typeof rawSnippet === 'string' ? rawSnippet : '');
      if (cleanSnippet.length > 240) {
        cleanSnippet = cleanSnippet.slice(0, 237) + '...';
      }

      // Safe guid resolution
      let guidStr = '';
      if (typeof item.guid === 'string') {
        guidStr = item.guid;
      } else if (item.guid && typeof item.guid === 'object' && typeof item.guid._ === 'string') {
        guidStr = item.guid._;
      } else if (typeof item.id === 'string') {
        guidStr = item.id;
      } else if (typeof item.link === 'string') {
        guidStr = item.link;
      } else {
        guidStr = String(index);
      }

      const id = `${source.id}-${guidStr}`;
      const titleStr = typeof item.title === 'string' ? item.title.trim() : 'Uden titel';
      const linkStr = typeof item.link === 'string' ? item.link.trim() : source.url;

      return {
        id,
        title: titleStr,
        link: linkStr,
        pubDate: dateObj.toISOString(),
        timestamp: dateObj.getTime(),
        sourceId: source.id,
        sourceName: source.name,
        category: source.category,
        language: source.language,
        snippet: cleanSnippet,
        author: extractCleanAuthor(item.creator || item.author || item['dc:creator']),
        badgeColor: source.badgeColor,
      };
    });
  } catch (error) {
    console.warn(`[RSS Warning] Failed to fetch feed for ${source.name} (${source.feedUrl}):`, (error as Error).message);
    return [];
  }
}

// In-memory cache for fast response
let cachedData: FeedsResponse | null = null;
let lastFetchTimestamp = 0;
const CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes cache

export async function getAllFeeds(forceRefresh = false): Promise<FeedsResponse> {
  const now = Date.now();

  if (!forceRefresh && cachedData && now - lastFetchTimestamp < CACHE_TTL_MS) {
    return cachedData;
  }

  const results = await Promise.allSettled(FEED_SOURCES.map(source => fetchSingleFeed(source)));

  const allItems: FeedItem[] = [];
  let successfulSources = 0;

  results.forEach((res) => {
    if (res.status === 'fulfilled' && res.value.length > 0) {
      successfulSources++;
      allItems.push(...res.value);
    }
  });

  // Deduplicate by URL or normalized title
  const seenLinks = new Set<string>();
  const uniqueItems: FeedItem[] = [];

  // Sort descending by timestamp first so freshest items take priority
  allItems.sort((a, b) => b.timestamp - a.timestamp);

  for (const item of allItems) {
    const cleanLink = item.link.split('?')[0].toLowerCase();
    if (!seenLinks.has(cleanLink)) {
      seenLinks.add(cleanLink);
      uniqueItems.push(item);
    }
  }

  const response: FeedsResponse = {
    items: uniqueItems,
    lastUpdated: new Date().toISOString(),
    totalSources: FEED_SOURCES.length,
    successfulSources,
    sources: FEED_SOURCES,
  };

  cachedData = response;
  lastFetchTimestamp = now;

  return response;
}
