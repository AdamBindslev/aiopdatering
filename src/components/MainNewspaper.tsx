'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FeedItem, FeedSource, FeedsResponse } from '@/types';
import { Masthead } from './Masthead';
import { LiveTicker } from './LiveTicker';
import { CategoryNav } from './CategoryNav';
import { FilterBar } from './FilterBar';
import { LeadArticle } from './LeadArticle';
import { TrendingStory } from './TrendingStory';
import { ArticleCard } from './ArticleCard';
import { VideoCard } from './VideoCard';
import { VideoModal } from './VideoModal';
import { VideoSection } from './VideoSection';
import { SourcesDirectory } from './SourcesDirectory';
import { Cpu, Flag, Lightbulb, ShieldAlert, Sparkles, Bookmark, Search, Youtube, ArrowRight } from 'lucide-react';

interface MainNewspaperProps {
  initialData: FeedsResponse;
}

export const MainNewspaper: React.FC<MainNewspaperProps> = ({ initialData }) => {
  const [data, setData] = useState<FeedsResponse>(initialData);
  const [activeTab, setActiveTab] = useState<string>('core');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [bookmarkedItems, setBookmarkedItems] = useState<FeedItem[]>([]);
  const [activeVideo, setActiveVideo] = useState<FeedItem | null>(null);

  const bookmarkedIds = useMemo(() => bookmarkedItems.map((i) => i.id), [bookmarkedItems]);

  // Load bookmarks from localStorage with fallback migration
  useEffect(() => {
    try {
      const savedItems = localStorage.getItem('ai_opdatering_bookmarked_items');
      if (savedItems) {
        setBookmarkedItems(JSON.parse(savedItems));
      } else {
        const oldIds = localStorage.getItem('ai_opdatering_bookmarks');
        if (oldIds) {
          const parsedIds: string[] = JSON.parse(oldIds);
          const matched = data.items.filter((i) => parsedIds.includes(i.id));
          setBookmarkedItems(matched);
        }
      }
    } catch (e) {
      console.warn('Could not read bookmarks from localStorage');
    }
  }, [data.items]);

  const toggleBookmark = (item: FeedItem) => {
    setBookmarkedItems((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      const updated = exists ? prev.filter((i) => i.id !== item.id) : [item, ...prev];
      try {
        localStorage.setItem('ai_opdatering_bookmarked_items', JSON.stringify(updated));
        localStorage.setItem('ai_opdatering_bookmarks', JSON.stringify(updated.map((i) => i.id)));
      } catch (e) {
        console.warn('Could not write bookmarks');
      }
      return updated;
    });
  };

  // Manual refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/feeds?refresh=true');
      if (res.ok) {
        const freshData: FeedsResponse = await res.json();
        setData(freshData);
      }
    } catch (err) {
      console.error('Failed to refresh feeds:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter items based on time, source, search query
  const filteredItems = useMemo(() => {
    const now = Date.now();
    let maxAgeMs = Infinity;

    if (timeFilter === '24h') maxAgeMs = 24 * 60 * 60 * 1000;
    else if (timeFilter === '48h') maxAgeMs = 48 * 60 * 60 * 1000;
    else if (timeFilter === '7d') maxAgeMs = 7 * 24 * 60 * 60 * 1000;

    return data.items.filter((item) => {
      // Time filter
      if (timeFilter !== 'all' && now - item.timestamp > maxAgeMs) {
        return false;
      }

      // Source filter
      if (selectedSource !== 'all' && item.sourceId !== selectedSource) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchSnippet = item.snippet.toLowerCase().includes(q);
        const matchSource = item.sourceName.toLowerCase().includes(q);
        const matchAuthor = item.author ? item.author.toLowerCase().includes(q) : false;
        if (!matchTitle && !matchSnippet && !matchSource && !matchAuthor) {
          return false;
        }
      }

      return true;
    });
  }, [data.items, timeFilter, selectedSource, searchQuery]);

  // Counts for category badges
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: filteredItems.length,
      core: filteredItems.filter(i => {
        const src = data.sources.find(s => s.id === i.sourceId);
        return src?.isCore;
      }).length,
      video: filteredItems.filter(i => i.category === 'video' || i.videoId).length,
      labs: filteredItems.filter(i => i.category === 'labs').length,
      danish: filteredItems.filter(i => i.category === 'danish').length,
      experts: filteredItems.filter(i => i.category === 'experts').length,
      media: filteredItems.filter(i => i.category === 'media').length,
      safety: filteredItems.filter(i => i.category === 'safety').length,
      tools: filteredItems.filter(i => i.category === 'tools').length,
      arxiv: filteredItems.filter(i => i.category === 'arxiv').length,
    };
    return counts;
  }, [filteredItems, data.sources]);

  // Display items for the current active tab
  const tabItems = useMemo(() => {
    if (activeTab === 'bookmarks') {
      return bookmarkedItems;
    }
    if (activeTab === 'all') {
      return filteredItems;
    }
    if (activeTab === 'core') {
      return filteredItems.filter(i => {
        const src = data.sources.find(s => s.id === i.sourceId);
        return src?.isCore;
      });
    }
    return filteredItems.filter(i => i.category === activeTab);
  }, [activeTab, filteredItems, bookmarkedItems, data.sources]);

  const trendingStoryIds = useMemo(() => {
    const ids = new Set<string>();
    if (data.trendingTopic) {
      if (data.trendingTopic.primaryArticle?.id) ids.add(data.trendingTopic.primaryArticle.id);
      data.trendingTopic.supportingStories?.forEach((s) => ids.add(s.id));
    }
    return ids;
  }, [data.trendingTopic]);

  // For the 'core' broadsheet view:
  const hasTrending = Boolean(data.trendingTopic);
  const leadArticle = !hasTrending ? tabItems[0] || null : null;
  const remainingCoreItems = useMemo(() => {
    if (hasTrending) {
      return tabItems.filter((i) => !trendingStoryIds.has(i.id));
    }
    return tabItems.slice(1);
  }, [tabItems, hasTrending, trendingStoryIds]);

  const labsItems = useMemo(() => remainingCoreItems.filter(i => i.category === 'labs').slice(0, 6), [remainingCoreItems]);
  const expertsAndMediaItems = useMemo(() => remainingCoreItems.filter(i => i.category === 'experts' || i.category === 'media').slice(0, 6), [remainingCoreItems]);
  const danishAndSafetyItems = useMemo(() => remainingCoreItems.filter(i => i.category === 'danish' || i.category === 'safety').slice(0, 6), [remainingCoreItems]);
  const coreVideoItems = useMemo(() => filteredItems.filter(i => i.category === 'video' || i.videoId).slice(0, 3), [filteredItems]);

  // Track items already rendered in top sections so they are not repeated and no category is omitted
  const displayedItemIds = useMemo(() => {
    const ids = new Set<string>();
    if (hasTrending) {
      trendingStoryIds.forEach((id) => ids.add(id));
    } else if (leadArticle) {
      ids.add(leadArticle.id);
    }
    labsItems.forEach((i) => ids.add(i.id));
    expertsAndMediaItems.forEach((i) => ids.add(i.id));
    danishAndSafetyItems.forEach((i) => ids.add(i.id));
    coreVideoItems.forEach((i) => ids.add(i.id));
    return ids;
  }, [hasTrending, trendingStoryIds, leadArticle, labsItems, expertsAndMediaItems, danishAndSafetyItems, coreVideoItems]);

  const moreCoreItems = useMemo(() => {
    return remainingCoreItems.filter((i) => !displayedItemIds.has(i.id)).slice(0, 18);
  }, [remainingCoreItems, displayedItemIds]);

  // Reset to frontpage view
  const handleGoHome = () => {
    setActiveTab('core');
    setSearchQuery('');
    setSelectedSource('all');
    setTimeFilter('all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0a0d12] text-gray-100 flex flex-col">
      {/* Live Breaking News Ticker */}
      <LiveTicker items={data.items} />

      {/* Futuristic Newspaper Masthead */}
      <Masthead
        lastUpdated={data.lastUpdated}
        totalSources={data.totalSources}
        successfulSources={data.successfulSources}
        totalItems={data.items.length}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        onGoHome={handleGoHome}
        bookmarkCount={bookmarkedIds.length}
        onSelectBookmarks={() => {
          setActiveTab('bookmarks');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isBookmarksActive={activeTab === 'bookmarks'}
      />

      {/* Category Navigation Bar */}
      <CategoryNav
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        counts={categoryCounts}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 w-full flex-grow pb-16">
        {activeTab !== 'sources' && activeTab !== 'video' && (
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedSource={selectedSource}
            onSourceChange={setSelectedSource}
            timeFilter={timeFilter}
            onTimeFilterChange={setTimeFilter}
            sources={data.sources}
          />
        )}

        {/* View 1: Sources Directory */}
        {activeTab === 'sources' ? (
          <SourcesDirectory />
        ) : activeTab === 'video' ? (
          /* View 2: Video Section */
          <VideoSection
            items={filteredItems}
            sources={data.sources}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={toggleBookmark}
            onPlayVideo={(v) => setActiveVideo(v)}
          />
        ) : activeTab === 'bookmarks' ? (
          /* View 2: Bookmarks */
          <div>
            <div className="border-b border-gray-800 pb-3 mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold font-serif text-white flex items-center gap-2">
                <Bookmark className="w-6 h-6 text-cyan-400 fill-cyan-400" />
                Saved Articles & Reading List
              </h2>
              <span className="text-xs font-mono text-gray-400">
                {tabItems.length} {tabItems.length === 1 ? 'article' : 'articles'}
              </span>
            </div>
            {tabItems.length === 0 ? (
              <div className="text-center py-20 bg-[#0e131b] border border-gray-800 rounded-lg p-6">
                <Bookmark className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 font-serif text-lg">You have no saved articles yet.</p>
                <p className="text-xs font-mono text-gray-500 mt-1">
                  Click the bookmark icon on any article to save it here for later reading.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tabItems.map((item) => (
                  item.category === 'video' || item.videoId ? (
                    <VideoCard
                      key={item.id}
                      item={item}
                      onPlay={(v) => setActiveVideo(v)}
                      isBookmarked={true}
                      onToggleBookmark={toggleBookmark}
                    />
                  ) : (
                    <ArticleCard
                      key={item.id}
                      item={item}
                      isBookmarked={true}
                      onToggleBookmark={toggleBookmark}
                    />
                  )
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'core' && !searchQuery && selectedSource === 'all' && timeFilter === 'all' ? (
          /* View 3: Futuristic Broadsheet Front Page */
          <div>
            {/* Lead Story: Trending Techmeme-Style Cluster or Lead Article Fallback */}
            {data.trendingTopic ? (
              <TrendingStory
                trending={data.trendingTopic}
                bookmarkedIds={bookmarkedIds}
                onToggleBookmark={toggleBookmark}
              />
            ) : leadArticle ? (
              <LeadArticle
                item={leadArticle}
                isBookmarked={bookmarkedIds.includes(leadArticle.id)}
                onToggleBookmark={toggleBookmark}
              />
            ) : null}

            {/* 3-Column Newspaper Broadsheet Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 border-t border-gray-800">
              {/* Column 1: Frontier Labs */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b-2 border-cyan-500/80 pb-2">
                  <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    Frontier Labs
                  </h3>
                  <span className="text-[11px] font-mono text-cyan-500 uppercase font-semibold tracking-wider">
                    Model Developers
                  </span>
                </div>
                <div className="space-y-3">
                  {labsItems.map((item) => (
                    <ArticleCard
                      key={item.id}
                      item={item}
                      isBookmarked={bookmarkedIds.includes(item.id)}
                      onToggleBookmark={toggleBookmark}
                    />
                  ))}
                </div>
              </div>

              {/* Column 2: Experts & Analysis */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b-2 border-emerald-500/80 pb-2">
                  <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-emerald-400" />
                    Analysis & Insights
                  </h3>
                  <span className="text-[11px] font-mono text-emerald-500 uppercase font-semibold tracking-wider">
                    Experts
                  </span>
                </div>
                <div className="space-y-3">
                  {expertsAndMediaItems.map((item) => (
                    <ArticleCard
                      key={item.id}
                      item={item}
                      isBookmarked={bookmarkedIds.includes(item.id)}
                      onToggleBookmark={toggleBookmark}
                    />
                  ))}
                </div>
              </div>

              {/* Column 3: Policy & Safety / Nordic AI */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b-2 border-red-500/80 pb-2">
                  <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
                    <Flag className="w-4 h-4 text-red-400" />
                    Policy & Nordic AI
                  </h3>
                  <span className="text-[11px] font-mono text-red-500 uppercase font-semibold tracking-wider">
                    EU & Regional
                  </span>
                </div>
                <div className="space-y-3">
                  {danishAndSafetyItems.map((item) => (
                    <ArticleCard
                      key={item.id}
                      item={item}
                      isBookmarked={bookmarkedIds.includes(item.id)}
                      onToggleBookmark={toggleBookmark}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Frontpage Video Spotlight */}
            {coreVideoItems.length > 0 && (
              <div className="mt-12 pt-6 border-t border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-red-950/80 border border-red-800/80 flex items-center justify-center text-red-400">
                      <Youtube className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold font-serif text-white">Latest AI Videos & Breakdowns</h3>
                      <p className="text-xs text-gray-400 font-mono">In-depth paper reviews and technical walkthroughs from YouTube</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('video');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                  >
                    <span>View all videos</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {coreVideoItems.map((item) => (
                    <VideoCard
                      key={item.id}
                      item={item}
                      onPlay={(v) => setActiveVideo(v)}
                      isBookmarked={bookmarkedIds.includes(item.id)}
                      onToggleBookmark={toggleBookmark}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Section: More Stories from Core */}
            {moreCoreItems.length > 0 && (
              <div className="mt-12 pt-6 border-t border-gray-800">
                <h3 className="text-xl font-bold font-serif text-white mb-4">More Stories from Core Sources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {moreCoreItems.map((item) => (
                    item.category === 'video' || item.videoId ? (
                      <VideoCard
                        key={item.id}
                        item={item}
                        onPlay={(v) => setActiveVideo(v)}
                        isBookmarked={bookmarkedIds.includes(item.id)}
                        onToggleBookmark={toggleBookmark}
                      />
                    ) : (
                      <ArticleCard
                        key={item.id}
                        item={item}
                        variant="standard"
                        isBookmarked={bookmarkedIds.includes(item.id)}
                        onToggleBookmark={toggleBookmark}
                      />
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* View 4: Standard Category Grid / Search Results */
          <div>
            <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-6">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold font-serif text-white">
                  {searchQuery ? `Search results for "${searchQuery}"` : 'Articles'}
                </h2>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800 px-2 py-0.5 rounded">
                  {tabItems.length} found
                </span>
              </div>
            </div>

            {tabItems.length === 0 ? (
              <div className="text-center py-20 bg-[#0e131b] border border-gray-800 rounded-lg p-6">
                <Search className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400 font-serif text-lg">No articles match your selected criteria.</p>
                <p className="text-xs font-mono text-gray-500 mt-1">Try resetting the search query or time filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tabItems.map((item) => (
                  item.category === 'video' || item.videoId ? (
                    <VideoCard
                      key={item.id}
                      item={item}
                      onPlay={(v) => setActiveVideo(v)}
                      isBookmarked={bookmarkedIds.includes(item.id)}
                      onToggleBookmark={toggleBookmark}
                    />
                  ) : (
                    <ArticleCard
                      key={item.id}
                      item={item}
                      isBookmarked={bookmarkedIds.includes(item.id)}
                      onToggleBookmark={toggleBookmark}
                    />
                  )
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Video Modal Player */}
      <VideoModal
        item={activeVideo}
        onClose={() => setActiveVideo(null)}
      />

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-[#070a0f] py-8 text-xs font-mono text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <button
              onClick={handleGoHome}
              className="text-left text-gray-300 hover:text-cyan-400 font-bold font-serif text-sm transition-colors cursor-pointer block"
              title="Go to front page"
            >
              AI OPDATERING // THE INTELLIGENCE CHRONICLE
            </button>
            <p className="text-gray-600 mt-0.5">Independent real-time intelligence aggregator for artificial intelligence and machine learning.</p>
          </div>

          <div className="flex items-center gap-6 text-gray-400">
            <button onClick={() => setActiveTab('sources')} className="hover:text-cyan-400 transition-colors">
              Source Catalog ({data.totalSources})
            </button>
            <span>•</span>
            <a
              href="https://github.com/AdamBindslev/aiopdatering"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 transition-colors"
            >
              GitHub Repo
            </a>
            <span>•</span>
            <span>Auto-updating via Vercel ISR</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
