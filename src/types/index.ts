export type FeedCategory = 
  | 'labs'        // Frontier Labs & Model Developers
  | 'experts'     // Independent Experts & Newsletters
  | 'safety'      // Safety, Alignment & Policy
  | 'tools'       // Open Source Runtimes, Agents & Infrastructure
  | 'media'       // Tech Media & Industry
  | 'arxiv'       // Academic arXiv pre-prints
  | 'danish'      // Danish AI sources
  | 'video';      // YouTube & Video Analysis

export type TechnicalLevel = 'Low' | 'Medium' | 'High' | 'Very High';
export type BeginnerFriendly = 'Low' | 'Medium' | 'High';
export type SignalToNoise = 'Medium' | 'High' | 'Very High';
export type StatusType = 'Core' | 'Recommended' | 'Optional' | 'Official source';

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
  // YouTube video specific metadata
  videoCategory?: string;
  videoCategories?: string[];
  technicalLevel?: TechnicalLevel;
  beginnerFriendly?: BeginnerFriendly;
  signalToNoise?: SignalToNoise;
  statusType?: StatusType;
  notes?: string;
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
  // Video specific metadata inherited from source
  videoCategory?: string;
  videoCategories?: string[];
  technicalLevel?: TechnicalLevel;
  beginnerFriendly?: BeginnerFriendly;
  signalToNoise?: SignalToNoise;
  statusType?: StatusType;
}

export interface FeedsResponse {
  items: FeedItem[];
  lastUpdated: string;
  totalSources: number;
  successfulSources: number;
  sources: FeedSource[];
}
