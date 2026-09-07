'use client';

import React, { useState, useMemo } from 'react';
import { FeedItem, FeedSource } from '@/types';
import { VideoCard } from './VideoCard';
import { Youtube, Search, Tv } from 'lucide-react';

interface VideoSectionProps {
  items: FeedItem[];
  sources: FeedSource[];
  bookmarkedIds: string[];
  onToggleBookmark: (item: FeedItem) => void;
  onPlayVideo: (item: FeedItem) => void;
}

export const VideoSection: React.FC<VideoSectionProps> = ({
  items,
  sources,
  bookmarkedIds,
  onToggleBookmark,
  onPlayVideo,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [videoSearch, setVideoSearch] = useState<string>('');

  // Get video-specific sources
  const videoSources = useMemo(() => {
    return sources.filter((s) => s.category === 'video');
  }, [sources]);

  // Filter video items
  const filteredVideos = useMemo(() => {
    return items
      .filter((item) => item.category === 'video' || item.videoId)
      .filter((item) => {
        if (selectedChannel !== 'all' && item.sourceId !== selectedChannel) {
          return false;
        }
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
  }, [items, selectedChannel, videoSearch]);

  const featuredVideo = filteredVideos[0] || null;
  const gridVideos = filteredVideos.slice(1);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
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
              Tekniske paper-walkthroughs, model-benchmarks og tutorials hentet direkte via officielle YouTube Atom-feeds.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-gray-400 shrink-0">
            <span className="px-2.5 py-1 rounded bg-gray-900 border border-gray-800 text-cyan-400 font-semibold">
              {filteredVideos.length} {filteredVideos.length === 1 ? 'video' : 'videoer'}
            </span>
          </div>
        </div>

        {/* Channel Filter Pills & Search */}
        <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Channel selector chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setSelectedChannel('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all shrink-0 ${
                selectedChannel === 'all'
                  ? 'bg-red-600 text-white font-bold shadow-sm shadow-red-950'
                  : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              Alle kanaler
            </button>
            {videoSources.map((source) => (
              <button
                key={source.id}
                onClick={() => setSelectedChannel(source.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all shrink-0 ${
                  selectedChannel === source.id
                    ? 'bg-red-600 text-white font-bold shadow-sm shadow-red-950'
                    : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                {source.name}
              </button>
            ))}
          </div>

          {/* Video search input */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Søg i videoer..."
              value={videoSearch}
              onChange={(e) => setVideoSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-xs font-mono text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {filteredVideos.length === 0 ? (
        <div className="text-center py-20 bg-[#0e131b] border border-gray-800 rounded-lg p-6">
          <Tv className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 font-serif text-lg">Ingen videoer matcher de valgte kriterier.</p>
          <p className="text-xs font-mono text-gray-500 mt-1">
            Prøv at vælge en anden kanal eller ryd søgefeltet.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Featured Video (Top / Most recent) */}
          {featuredVideo && !videoSearch && selectedChannel === 'all' && (
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
                    : videoSearch
                    ? 'Søgeresultater'
                    : 'Flere videoer og podcasts'}
                </span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(featuredVideo && !videoSearch && selectedChannel === 'all' ? gridVideos : filteredVideos).map(
                (item) => (
                  <VideoCard
                    key={item.id}
                    item={item}
                    onPlay={onPlayVideo}
                    isBookmarked={bookmarkedIds.includes(item.id)}
                    onToggleBookmark={onToggleBookmark}
                  />
                )
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
