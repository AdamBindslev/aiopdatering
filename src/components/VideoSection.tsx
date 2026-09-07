'use client';

import React, { useState, useMemo } from 'react';
import { FeedItem, FeedSource, TechnicalLevel, StatusType } from '@/types';
import { VideoCard } from './VideoCard';
import { VIDEO_CATEGORIES, VideoCategory } from '@/data/sources';
import { Youtube, Search, Tv, Filter, SlidersHorizontal, Info, X, ExternalLink, GraduationCap, FileText, Wrench, Newspaper, Mic, ShieldAlert, Building2 } from 'lucide-react';

interface VideoSectionProps {
  items: FeedItem[];
  sources: FeedSource[];
  bookmarkedIds: string[];
  onToggleBookmark: (item: FeedItem) => void;
  onPlayVideo: (item: FeedItem) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Alle': <Youtube className="w-3.5 h-3.5" />,
  'Grundforståelse og undervisning': <GraduationCap className="w-3.5 h-3.5" />,
  'Papers og forskning': <FileText className="w-3.5 h-3.5" />,
  'Praktisk AI og AI engineering': <Wrench className="w-3.5 h-3.5" />,
  'AI-nyheder og analyse': <Newspaper className="w-3.5 h-3.5" />,
  'Interviews og long-form': <Mic className="w-3.5 h-3.5" />,
  'AI safety og alignment': <ShieldAlert className="w-3.5 h-3.5" />,
  'Officielle kilder': <Building2 className="w-3.5 h-3.5" />,
};

export const VideoSection: React.FC<VideoSectionProps> = ({
  items,
  sources,
  bookmarkedIds,
  onToggleBookmark,
  onPlayVideo,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory>('Alle');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [videoSearch, setVideoSearch] = useState<string>('');
  const [showChannelDirectory, setShowChannelDirectory] = useState<boolean>(false);

  // Get video-specific sources
  const videoSources = useMemo(() => {
    return sources.filter((s) => s.category === 'video');
  }, [sources]);

  // Channel map for quick lookup
  const channelMap = useMemo(() => {
    const map = new Map<string, FeedSource>();
    videoSources.forEach((s) => map.set(s.id, s));
    return map;
  }, [videoSources]);

  // Channels available under current category
  const availableChannels = useMemo(() => {
    if (selectedCategory === 'Alle') return videoSources;
    return videoSources.filter((s) => {
      if (s.videoCategory === selectedCategory) return true;
      if (s.videoCategories && s.videoCategories.includes(selectedCategory)) return true;
      return false;
    });
  }, [videoSources, selectedCategory]);

  // Reset channel if current channel is not in availableChannels
  const handleCategorySelect = (cat: VideoCategory) => {
    setSelectedCategory(cat);
    if (selectedChannel !== 'all') {
      const isChannelInCat = videoSources.some((s) => {
        if (s.id !== selectedChannel) return false;
        if (cat === 'Alle') return true;
        return s.videoCategory === cat || (s.videoCategories && s.videoCategories.includes(cat));
      });
      if (!isChannelInCat) {
        setSelectedChannel('all');
      }
    }
  };

  // Video counts by category
  const videoCountsByCategory = useMemo(() => {
    const counts: Record<string, number> = { Alle: 0 };
    VIDEO_CATEGORIES.forEach((cat) => {
      counts[cat] = 0;
    });

    items
      .filter((i) => i.category === 'video' || i.videoId)
      .forEach((item) => {
        counts['Alle'] = (counts['Alle'] || 0) + 1;
        const src = channelMap.get(item.sourceId);
        const cats = src?.videoCategories || (item.videoCategory ? [item.videoCategory] : []);
        cats.forEach((c) => {
          counts[c] = (counts[c] || 0) + 1;
        });
      });

    return counts;
  }, [items, channelMap]);

  // Filter video items
  const filteredVideos = useMemo(() => {
    return items
      .filter((item) => item.category === 'video' || item.videoId)
      .filter((item) => {
        const src = channelMap.get(item.sourceId);
        const itemCats = src?.videoCategories || (item.videoCategory ? [item.videoCategory] : []);
        const itemLevel = src?.technicalLevel || item.technicalLevel;
        const itemStatus = src?.statusType || item.statusType;

        // Category filter
        if (selectedCategory !== 'Alle') {
          if (!itemCats.includes(selectedCategory)) {
            return false;
          }
        }

        // Channel filter
        if (selectedChannel !== 'all' && item.sourceId !== selectedChannel) {
          return false;
        }

        // Technical level filter
        if (selectedLevel !== 'all' && itemLevel !== selectedLevel) {
          return false;
        }

        // Status filter
        if (selectedStatus !== 'all' && itemStatus !== selectedStatus) {
          return false;
        }

        // Text search
        if (videoSearch.trim()) {
          const q = videoSearch.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchSnippet = item.snippet.toLowerCase().includes(q);
          const matchSource = item.sourceName.toLowerCase().includes(q);
          if (!matchTitle && !matchSnippet && !matchSource) {
            return false;
          }
        }

        return true;
      });
  }, [items, selectedCategory, selectedChannel, selectedLevel, selectedStatus, videoSearch, channelMap]);

  const hasActiveFilters = selectedCategory !== 'Alle' || selectedChannel !== 'all' || selectedLevel !== 'all' || selectedStatus !== 'all' || videoSearch.trim().length > 0;

  const resetAllFilters = () => {
    setSelectedCategory('Alle');
    setSelectedChannel('all');
    setSelectedLevel('all');
    setSelectedStatus('all');
    setVideoSearch('');
  };

  const featuredVideo = filteredVideos[0] || null;
  const gridVideos = filteredVideos.slice(1);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Section Header */}
      <div className="border-b border-gray-800 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-800/80 flex items-center justify-center text-red-400">
                <Youtube className="w-4 h-4" />
              </div>
              <h2 className="text-2xl font-bold font-serif text-white">AI Video & Gennemgange</h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 font-sans">
              29 kuraterede YouTube-kanaler: Paper-walkthroughs, modelimplementering, interviews, nyheder og AI safety.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-gray-400 shrink-0">
            <button
              onClick={() => setShowChannelDirectory(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-gray-900 border border-gray-800 hover:border-cyan-500/50 text-cyan-400 font-medium transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Kanal-katalog (29 kanaler)</span>
            </button>
            <span className="px-2.5 py-1 rounded bg-gray-900 border border-gray-800 text-white font-semibold">
              {filteredVideos.length} {filteredVideos.length === 1 ? 'video' : 'videoer'}
            </span>
          </div>
        </div>

        {/* Category Pills Tabs */}
        <div className="mt-5 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {VIDEO_CATEGORIES.map((cat) => {
            const count = videoCountsByCategory[cat] || 0;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all shrink-0 ${
                  isSelected
                    ? 'bg-red-600 text-white font-bold shadow-sm shadow-red-950'
                    : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                <span>{CATEGORY_ICONS[cat] || <Youtube className="w-3.5 h-3.5" />}</span>
                <span>{cat}</span>
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-red-800/80 text-white' : 'bg-gray-800 text-gray-400'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Secondary Filter Controls Row */}
        <div className="mt-4 pt-3 border-t border-gray-800/60 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Channel dropdown */}
            <div className="relative">
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-xs font-mono text-gray-200 focus:outline-none focus:border-red-500 transition-colors cursor-pointer"
              >
                <option value="all">Alle kanaler ({availableChannels.length})</option>
                {availableChannels.map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.name}
                  </option>
                ))}
              </select>
              <SlidersHorizontal className="w-3 h-3 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Technical Level selector */}
            <div className="relative">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-xs font-mono text-gray-200 focus:outline-none focus:border-red-500 transition-colors cursor-pointer"
              >
                <option value="all">Alle niveauer</option>
                <option value="Low">Niveau: Low (Begynder)</option>
                <option value="Medium">Niveau: Medium</option>
                <option value="High">Niveau: High</option>
                <option value="Very High">Niveau: Very High (Ekspert)</option>
              </select>
              <Filter className="w-3 h-3 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Status Type selector */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-xs font-mono text-gray-200 focus:outline-none focus:border-red-500 transition-colors cursor-pointer"
              >
                <option value="all">Alle statusser</option>
                <option value="Core">Kerne-kilder (Core)</option>
                <option value="Recommended">Anbefalede (Recommended)</option>
                <option value="Official source">Officielle kilder</option>
                <option value="Optional">Valgfri (Optional)</option>
              </select>
              <SlidersHorizontal className="w-3 h-3 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Clear filters button */}
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono text-red-400 hover:text-red-300 bg-red-950/40 border border-red-800/60 transition-colors"
                title="Nulstil alle filtre"
              >
                <X className="w-3 h-3" />
                <span>Nulstil</span>
              </button>
            )}
          </div>

          {/* Video search input */}
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Søg i videoer..."
              value={videoSearch}
              onChange={(e) => setVideoSearch(e.target.value)}
              className="w-full pl-8 pr-8 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-xs font-mono text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
            />
            {videoSearch && (
              <button
                onClick={() => setVideoSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Video Content Grid */}
      {filteredVideos.length === 0 ? (
        <div className="text-center py-20 bg-[#0e131b] border border-gray-800 rounded-lg p-6">
          <Tv className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 font-serif text-lg">Ingen videoer matcher de valgte kriterier.</p>
          <p className="text-xs font-mono text-gray-500 mt-1">
            Prøv at vælge en anden kategori, kanal eller nulstil filtrene.
          </p>
          <button
            onClick={resetAllFilters}
            className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gray-900 border border-gray-700 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Nulstil filtre</span>
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Featured Video (Top / Most recent when in 'Alle' and no search) */}
          {featuredVideo && !videoSearch && selectedCategory === 'Alle' && selectedChannel === 'all' && selectedLevel === 'all' && selectedStatus === 'all' && (
            <section>
              <VideoCard
                item={featuredVideo}
                variant="featured"
                onPlay={onPlayVideo}
                isBookmarked={bookmarkedIds.includes(featuredVideo.id)}
                onToggleBookmark={onToggleBookmark}
              />
            </section>
          )}

          {/* Video Grid */}
          <section>
            <div className="flex items-center justify-between border-b border-gray-800/80 pb-2.5 mb-4">
              <h3 className="text-lg font-bold font-serif text-white flex items-center gap-2">
                <span>
                  {selectedChannel !== 'all'
                    ? videoSources.find((s) => s.id === selectedChannel)?.name || 'Videoer'
                    : selectedCategory !== 'Alle'
                    ? selectedCategory
                    : videoSearch
                    ? `Søgeresultater for "${videoSearch}"`
                    : 'Seneste videoer & episoder'}
                </span>
                <span className="text-xs font-mono font-normal text-gray-500">
                  ({filteredVideos.length})
                </span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(featuredVideo && !videoSearch && selectedCategory === 'Alle' && selectedChannel === 'all' && selectedLevel === 'all' && selectedStatus === 'all'
                ? gridVideos
                : filteredVideos
              ).map((item) => (
                <VideoCard
                  key={item.id}
                  item={item}
                  onPlay={onPlayVideo}
                  isBookmarked={bookmarkedIds.includes(item.id)}
                  onToggleBookmark={onToggleBookmark}
                />
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Channel Directory Modal */}
      {showChannelDirectory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[85vh] bg-[#0c1017] border border-gray-800 rounded-xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-gray-800 flex items-center justify-between bg-[#0e131b]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-800/80 flex items-center justify-center text-red-400">
                  <Youtube className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-serif text-white">AI YouTube Kanal-katalog</h3>
                  <p className="text-xs text-gray-400 font-sans">
                    Samlet oversigt over alle 29 kuraterede kanaler med teknisk niveau, signal-til-støj og noter.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowChannelDirectory(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content / Table */}
            <div className="overflow-y-auto p-4 sm:p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {videoSources.map((ch) => (
                  <div
                    key={ch.id}
                    className="p-3.5 rounded-lg bg-[#0e131b]/80 border border-gray-800/80 hover:border-gray-700 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <a
                            href={ch.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-bold font-serif text-white hover:text-cyan-400 inline-flex items-center gap-1 transition-colors"
                          >
                            <span>{ch.name}</span>
                            <ExternalLink className="w-3 h-3 text-gray-500" />
                          </a>
                          <p className="text-[11px] font-mono text-cyan-400/90 mt-0.5">
                            {ch.videoCategory}
                          </p>
                        </div>

                        {ch.statusType && (
                          <span className={`px-2 py-0.5 rounded border text-[10px] font-mono shrink-0 ${
                            ch.statusType === 'Core'
                              ? 'text-rose-400 border-rose-500/30 bg-rose-950/30'
                              : ch.statusType === 'Recommended'
                              ? 'text-cyan-400 border-cyan-500/30 bg-cyan-950/30'
                              : ch.statusType === 'Official source'
                              ? 'text-teal-400 border-teal-500/30 bg-teal-950/30'
                              : 'text-gray-400 border-gray-800 bg-gray-900/40'
                          }`}>
                            {ch.statusType}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-300 font-sans leading-relaxed mb-2.5">
                        {ch.description}
                      </p>

                      {ch.notes && (
                        <p className="text-[11px] text-gray-400/80 font-sans italic bg-black/30 p-2 rounded border border-gray-900 mb-3">
                          <span className="text-gray-500 font-medium not-italic">Note: </span>
                          {ch.notes}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-gray-800/60 flex items-center justify-between text-[10px] font-mono text-gray-400">
                      <span>Niveau: <span className="text-gray-200 font-semibold">{ch.technicalLevel}</span></span>
                      <span>Signal/Støj: <span className="text-gray-200 font-semibold">{ch.signalToNoise}</span></span>
                      <span>Begynder: <span className="text-gray-200 font-semibold">{ch.beginnerFriendly}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-[#0e131b] border-t border-gray-800 flex justify-end">
              <button
                onClick={() => setShowChannelDirectory(false)}
                className="px-4 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-mono text-white transition-colors"
              >
                Luk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

