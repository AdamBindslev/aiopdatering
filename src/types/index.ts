export type FeedCategory = 
  | 'labs'        // Frontier Labs & Model Developers
  | 'experts'     // Independent Experts & Newsletters
  | 'safety'      // Safety, Alignment & Policy
  | 'tools'       // Open Source Runtimes, Agents & Infrastructure
  | 'media'       // Tech Media & Industry
  | 'arxiv'       // Academic arXiv pre-prints
  | 'danish'      // Danish AI sources
  | 'video';      // YouTube & Video Analysis

export interface FeedSource {
  id: string;
  name: string;
  url: string;
  feedUrl: string;
  category: FeedCategory;
  isCore: boolean;
  description?: string;
  language: 'da' | 'en';
  badgeColor?: string;
}

export interface FeedItem {
  id: string;
  title: string;
  link: string;
  pubDate: string; // ISO string
  timestamp: number;
  sourceId: string;
  sourceName: string;
  category: FeedCategory;
  language: 'da' | 'en';
  snippet: string;
  author?: string;
  badgeColor?: string;
  videoId?: string;
  thumbnailUrl?: string;
}

export interface FeedsResponse {
  items: FeedItem[];
  lastUpdated: string;
  totalSources: number;
  successfulSources: number;
  sources: FeedSource[];
}
