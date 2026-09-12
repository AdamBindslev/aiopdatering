import Parser from 'rss-parser';
import { FEED_SOURCES } from '../data/sources';
import { FeedItem, FeedSource, FeedsResponse } from '../types';

const parser = new Parser({
  customFields: {
    item: [
      ['yt:videoId', 'ytVideoId'],
      ['media:group', 'mediaGroup'],
      ['category', 'rawCategory'],
    ],
  },
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

const TRACKING_QUERY_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'ref',
  'fbclid',
  'gclid',
  'mc_cid',
  'mc_eid',
  '_hsenc',
  '_hsmi',
]);

function normalizeUrl(url: string, videoId?: string): string {
  if (videoId) {
    return `yt:${videoId.toLowerCase()}`;
  }
  try {
    const parsed = new URL(url);
    const keysToDelete: string[] = [];
    parsed.searchParams.forEach((_, key) => {
      if (TRACKING_QUERY_PARAMS.has(key.toLowerCase()) || key.toLowerCase().startsWith('utm_')) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => parsed.searchParams.delete(key));

    let clean = `${parsed.origin}${parsed.pathname}`;
    const search = parsed.searchParams.toString();
    if (search) {
      clean += `?${search}`;
    }
    return clean.toLowerCase().replace(/\/+$/, '');
  } catch {
    return url.split('?')[0].toLowerCase().replace(/\/+$/, '');
  }
}

function extractCategories(item: any): string[] {
  const cats: string[] = [];
  if (Array.isArray(item.categories)) {
    for (const c of item.categories) {
      if (typeof c === 'string') cats.push(c);
      else if (c && typeof c._ === 'string') cats.push(c._);
      else if (c && typeof c.name === 'string') cats.push(c.name);
    }
  } else if (typeof item.categories === 'string') {
    cats.push(item.categories);
  }
  if (typeof item.category === 'string') {
    cats.push(item.category);
  } else if (Array.isArray(item.category)) {
    for (const c of item.category) {
      if (typeof c === 'string') cats.push(c);
      else if (c && typeof c._ === 'string') cats.push(c._);
    }
  }
  if (typeof item.rawCategory === 'string') {
    cats.push(item.rawCategory);
  }
  return cats;
}

const AI_KEYWORDS_REGEX = new RegExp(
  '\\b(' +
    [
      // General & concepts (DA & EN)
      'ai',
      'a\\.i\\.',
      'artificial intelligence',
      'kunstig intelligens',
      'kunstige intelligenser',
      'maskinlæring',
      'machine learning',
      'deep learning',
      'dyb læring',
      'neuralt netværk',
      'neurale netværk',
      'neural network',
      'neural networks',
      'sprogmodel',
      'sprogmodeller',
      'sprogmodellen',
      'sprogmodellerne',
      'language model',
      'language models',
      'large language model',
      'large language models',
      'llm',
      'llms',
      "llm['’]er",
      'generativ ai',
      'generative ai',
      'generativ kunstig intelligens',
      'generative modeller',
      'generative models',
      'foundation model',
      'foundation models',
      'frontier model',
      'frontier models',
      'post-training',
      'reinforcement learning',
      'rlhf',
      'transformer-model',
      'transformer-modeller',
      'transformers',
      'prompt engineering',
      'prompting',
      'prompts',
      'ai-agent',
      'ai-agenter',
      'ai agent',
      'ai agents',
      'autonome agenter',
      'autonomous agents',
      'computervision',
      'computer vision',
      'natural language processing',
      'nlp',
      'ai act',
      'ai-forordning',
      'ai-forordningen',
      'ai-lov',
      'ai-lovgivning',
      'ai-regulering',
      'ai-sikkerhed',
      'ai safety',
      'ai-etik',
      'ai ethics',
      'alignment',
      'superintelligens',
      'superintelligence',
      'agi',
      'asi',
      'syntetisk data',
      'syntetiske data',
      'deepfake',
      'deepfakes',
      'copilot',
      'copilots',
      // Labs, tools & models
      'chatgpt',
      'openai',
      'anthropic',
      'claude',
      'deepmind',
      'gemini',
      'mistral',
      'deepseek',
      'qwen',
      'llama',
      'llama-3',
      'llama-4',
      'gpt-3',
      'gpt-4',
      'gpt-4o',
      'gpt-5',
      'gpt-o1',
      'gpt-o3',
      'grok',
      'xai',
      'perplexity',
      'midjourney',
      'stable diffusion',
      'dall-e',
      'sora',
      'runway',
      'elevenlabs',
      'hugging face',
      'huggingface',
      'ollama',
      'langchain',
      'tensorrt',
      // Robotics & hardware
      'robot',
      'robotter',
      'robotik',
      'robotics',
      'humanoid',
      'humanoide',
      'ai-chip',
      'ai-chips',
      'gpu-klynge',
      'gpu-klynger',
      'compute-klynge',
    ].join('|') +
  ')\\b',
  'i'
);

function isCategoryAi(category: string): boolean {
  const lower = category.toLowerCase().trim();
  return (
    lower.includes('kunstig intelligens') ||
    lower.includes('artificial intelligence') ||
    lower.includes('machine learning') ||
    lower.includes('maskinlæring') ||
    lower.includes('deep learning') ||
    lower.includes('sprogmodel') ||
    lower.includes('llm') ||
    lower.includes('robot') ||
    lower.includes('generativ') ||
    lower === 'ai'
  );
}

function isItemAiRelevant(
  title: string,
  snippet: string,
  categories: string[],
  customKeywords?: string[]
): boolean {
  // Check categories first
  for (const cat of categories) {
    if (isCategoryAi(cat)) {
      return true;
    }
  }

  // Check custom keywords if configured
  if (customKeywords && customKeywords.length > 0) {
    const combined = `${title} ${snippet}`.toLowerCase();
    for (const kw of customKeywords) {
      if (combined.includes(kw.toLowerCase())) {
        return true;
      }
    }
  }

  // Check standard AI regex on title and snippet
  if (AI_KEYWORDS_REGEX.test(title) || AI_KEYWORDS_REGEX.test(snippet)) {
    return true;
  }

  return false;
}

async function fetchSingleFeed(source: FeedSource): Promise<{ sourceId: string; items: FeedItem[] }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    let feed: any = null;

    try {
      const res = await fetch(source.feedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 (AI-Opdatering/1.0)',
          'Accept': 'application/rss+xml, application/xml, application/atom+xml, text/xml;q=0.9, */*;q=0.8',
        },
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const text = await res.text();
        const sanitized = sanitizeXml(text);
        feed = await parser.parseString(sanitized);
      }
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      // Only attempt parser fallback if it wasn't a network abort/timeout
      if (fetchErr?.name !== 'AbortError') {
        try {
          feed = await parser.parseURL(source.feedUrl);
        } catch {
          // Both approaches failed
        }
      }
    }

    if (!feed || !Array.isArray(feed.items)) {
      return { sourceId: source.id, items: [] };
    }

    let candidateItems = feed.items;

    // Filter broad sources for AI relevance if enabled
    if (source.filterOnlyAi) {
      candidateItems = candidateItems.filter((item: any) => {
        const title = typeof item.title === 'string' ? item.title : '';
        const rawSnippet = item.contentSnippet || item.summary || item.content || '';
        const cleanSnippet = stripHtml(typeof rawSnippet === 'string' ? rawSnippet : '');
        const categories = extractCategories(item);
        return isItemAiRelevant(title, cleanSnippet, categories, source.filterKeywords);
      });
    }

    const items: FeedItem[] = candidateItems.slice(0, 15).map((item: any, index: number): FeedItem => {
      const rawDate = item.isoDate || item.pubDate || item.date;
      let dateObj: Date | null = null;
      if (rawDate) {
        const parsed = new Date(rawDate);
        if (!isNaN(parsed.getTime())) {
          dateObj = parsed;
        }
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

      // Safe link extraction
      let linkStr = source.url;
      if (typeof item.link === 'string' && (item.link.startsWith('http://') || item.link.startsWith('https://'))) {
        linkStr = item.link.trim();
      } else if (item.link && typeof item.link === 'object' && typeof item.link.href === 'string') {
        linkStr = item.link.href.trim();
      }

      // Extract YouTube video ID if applicable
      let videoId: string | undefined = undefined;
      if (item.ytVideoId && typeof item.ytVideoId === 'string') {
        videoId = item.ytVideoId.trim();
      } else if (linkStr) {
        const match = linkStr.match(/(?:v=|youtu\.be\/|embed\/|videos\/)([\w-]{11})/);
        if (match && match[1]) {
          videoId = match[1];
        }
      }

      let thumbnailUrl: string | undefined = undefined;
      if (videoId) {
        thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      }

      // Format clean snippet
      let rawSnippet = item.contentSnippet || item.summary || item.content || '';
      if (!rawSnippet && item.mediaGroup) {
        const mediaDesc = item.mediaGroup['media:description'];
        if (typeof mediaDesc === 'string') {
          rawSnippet = mediaDesc;
        } else if (Array.isArray(mediaDesc) && typeof mediaDesc[0] === 'string') {
          rawSnippet = mediaDesc[0];
        }
      }

      let cleanSnippet = stripHtml(typeof rawSnippet === 'string' ? rawSnippet : '');
      if (cleanSnippet.length > 240) {
        cleanSnippet = cleanSnippet.slice(0, 237) + '...';
      }

      return {
        id,
        title: titleStr,
        link: linkStr,
        pubDate: dateObj ? dateObj.toISOString() : new Date(0).toISOString(),
        timestamp: dateObj ? dateObj.getTime() : 0,
        sourceId: source.id,
        sourceName: source.name,
        category: source.category,
        language: source.language,
        snippet: cleanSnippet,
        author: extractCleanAuthor(item.creator || item.author || item['dc:creator']),
        badgeColor: source.badgeColor,
        videoId,
        thumbnailUrl,
        videoCategory: source.videoCategory,
        videoCategories: source.videoCategories,
        technicalLevel: source.technicalLevel,
        beginnerFriendly: source.beginnerFriendly,
        signalToNoise: source.signalToNoise,
        statusType: source.statusType,
      };
    });

    return { sourceId: source.id, items };
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn(`[RSS Warning] Failed to fetch feed for ${source.name} (${source.feedUrl}):`, (error as Error).message);
    return { sourceId: source.id, items: [] };
  }
}

// In-memory cache for fast response
let cachedData: FeedsResponse | null = null;
let lastFetchTimestamp = 0;
let inFlightFetchPromise: Promise<FeedsResponse> | null = null;
const CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes cache

export async function getAllFeeds(forceRefresh = false): Promise<FeedsResponse> {
  const now = Date.now();

  if (!forceRefresh && cachedData && now - lastFetchTimestamp < CACHE_TTL_MS) {
    return cachedData;
  }

  // Deduplicate concurrent fetch requests (coalescing)
  if (inFlightFetchPromise) {
    return inFlightFetchPromise;
  }

  inFlightFetchPromise = (async () => {
    try {
      // Batch fetch feeds with concurrency limit (chunks of 10) to avoid socket exhaustion
      const BATCH_SIZE = 10;
      const allItems: FeedItem[] = [];
      const successfulSourceIds = new Set<string>();

      for (let i = 0; i < FEED_SOURCES.length; i += BATCH_SIZE) {
        const batch = FEED_SOURCES.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.allSettled(batch.map((source) => fetchSingleFeed(source)));

        batchResults.forEach((res) => {
          if (res.status === 'fulfilled' && res.value.items.length > 0) {
            successfulSourceIds.add(res.value.sourceId);
            allItems.push(...res.value.items);
          }
        });
      }

      // Deduplicate items safely:
      // Preserves distinct YouTube videos by using normalizeUrl (yt:videoId)
      // Removes tracking params on regular URLs without destroying valid query parameters
      const seenKeys = new Set<string>();
      const uniqueItems: FeedItem[] = [];

      // Sort descending by timestamp first so freshest items take priority
      allItems.sort((a, b) => b.timestamp - a.timestamp);

      for (const item of allItems) {
        const dedupKey = normalizeUrl(item.link, item.videoId);
        if (!seenKeys.has(dedupKey)) {
          seenKeys.add(dedupKey);
          uniqueItems.push(item);
        }
      }

      const response: FeedsResponse = {
        items: uniqueItems,
        lastUpdated: new Date().toISOString(),
        totalSources: FEED_SOURCES.length,
        successfulSources: successfulSourceIds.size,
        sources: FEED_SOURCES,
      };

      cachedData = response;
      lastFetchTimestamp = Date.now();

      return response;
    } finally {
      inFlightFetchPromise = null;
    }
  })();

  return inFlightFetchPromise;
}
