'use client';

import React from 'react';
import { FeedItem } from '@/types';
import { Play, ExternalLink, Clock, Bookmark, Youtube } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { da } from 'date-fns/locale';

interface VideoCardProps {
  item: FeedItem;
  onPlay: (item: FeedItem) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (item: FeedItem) => void;
  variant?: 'standard' | 'featured';
}

const BADGE_STYLES: Record<string, string> = {
  emerald: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/30',
  amber: 'border-amber-500/40 text-amber-400 bg-amber-950/30',
  cyan: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/30',
  blue: 'border-blue-500/40 text-blue-400 bg-blue-950/30',
  orange: 'border-orange-500/40 text-orange-400 bg-orange-950/30',
  yellow: 'border-yellow-500/40 text-yellow-400 bg-yellow-950/30',
  purple: 'border-purple-500/40 text-purple-400 bg-purple-950/30',
  green: 'border-green-500/40 text-green-400 bg-green-950/30',
  rose: 'border-rose-500/40 text-rose-400 bg-rose-950/30',
  red: 'border-red-500/40 text-red-400 bg-red-950/30',
  slate: 'border-gray-500/40 text-gray-400 bg-gray-900/40',
  zinc: 'border-zinc-500/40 text-zinc-400 bg-zinc-900/40',
};

export const VideoCard: React.FC<VideoCardProps> = ({
  item,
  onPlay,
  isBookmarked = false,
  onToggleBookmark,
  variant = 'standard',
}) => {
  const badgeClass = BADGE_STYLES[item.badgeColor || 'red'] || BADGE_STYLES.red;

  let timeAgo = '';
  try {
    timeAgo = formatDistanceToNow(new Date(item.pubDate), { addSuffix: true, locale: da });
  } catch (e) {
    timeAgo = 'Nyligt';
  }

  const exactDate = format(new Date(item.pubDate), 'd. MMM yyyy, HH:mm');
  const thumbnail = item.thumbnailUrl || (item.videoId ? `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg` : null);

  if (variant === 'featured') {
    return (
      <div className="bg-[#0e131b] border border-gray-800 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all group grid grid-cols-1 lg:grid-cols-12">
        {/* 16:9 Thumbnail Area */}
        <div 
          onClick={() => onPlay(item)}
          className="relative lg:col-span-7 aspect-video cursor-pointer bg-black/60 overflow-hidden"
        >
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
              <Youtube className="w-16 h-16 text-gray-600" />
            </div>
          )}

          {/* Dark Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-2xl shadow-red-950/60 group-hover:scale-110 group-hover:bg-red-600 transition-all border border-red-400/30">
              <Play className="w-7 h-7 fill-white translate-x-0.5" />
            </div>
          </div>

          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur border border-white/10 text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
              Fremhævet Video
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-5 p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 text-xs font-mono mb-3">
              <span className={`px-2 py-0.5 rounded border text-[10px] uppercase tracking-wider font-semibold ${badgeClass}`}>
                {item.sourceName}
              </span>

              <div className="flex items-center gap-2 text-gray-400 text-[11px]">
                <span title={exactDate} className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-500" />
                  {timeAgo}
                </span>
                {onToggleBookmark && (
                  <button
                    onClick={() => onToggleBookmark(item)}
                    className={`p-1 hover:text-cyan-400 transition-colors ${isBookmarked ? 'text-cyan-400' : 'text-gray-500'}`}
                    title={isBookmarked ? 'Fjern bogmærke' : 'Gem video'}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-cyan-400' : ''}`} />
                  </button>
                )}
              </div>
            </div>

            <h3 
              onClick={() => onPlay(item)}
              className="text-lg sm:text-xl font-bold font-serif text-white group-hover:text-cyan-400 transition-colors cursor-pointer leading-snug mb-3"
            >
              {item.title}
            </h3>

            {item.snippet && (
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-sans line-clamp-4 mb-4">
                {item.snippet}
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between font-mono text-xs">
            <button
              onClick={() => onPlay(item)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800 hover:bg-cyan-900/60 font-semibold transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-cyan-400" />
              <span>Afspil nu</span>
            </button>

            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-white transition-colors"
            >
              <span>YouTube</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <article className="bg-[#0e131b] hover:bg-[#131924] border border-gray-800/80 hover:border-cyan-500/40 transition-all rounded-lg overflow-hidden flex flex-col justify-between group hud-corner shadow-sm hover:shadow-cyan-950/20">
      <div>
        {/* 16:9 Thumbnail with Play Overlay */}
        <div 
          onClick={() => onPlay(item)}
          className="relative aspect-video w-full bg-black/50 overflow-hidden cursor-pointer"
        >
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
              <Youtube className="w-10 h-10 text-gray-600" />
            </div>
          )}

          {/* Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

          {/* Centered Play Badge */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-red-600 transition-all border border-red-400/30">
              <Play className="w-5 h-5 fill-white translate-x-0.5" />
            </div>
          </div>

          <div className="absolute top-2 left-2">
            <span className={`px-1.5 py-0.5 rounded border text-[9px] uppercase tracking-wider font-semibold backdrop-blur ${badgeClass}`}>
              {item.sourceName}
            </span>
          </div>

          <div className="absolute bottom-2 right-2">
            <span className="px-1.5 py-0.5 rounded bg-black/80 backdrop-blur text-[10px] font-mono text-gray-300">
              {timeAgo}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-3.5 sm:p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <Youtube className="w-3 h-3 text-red-500" />
              Videoanalyse
            </span>
            {onToggleBookmark && (
              <button
                onClick={() => onToggleBookmark(item)}
                className={`p-1 hover:text-cyan-400 transition-colors ${isBookmarked ? 'text-cyan-400' : 'text-gray-500'}`}
                title={isBookmarked ? 'Fjern bogmærke' : 'Gem video'}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-cyan-400' : ''}`} />
              </button>
            )}
          </div>

          <h3 
            onClick={() => onPlay(item)}
            className="text-sm sm:text-base font-bold text-gray-100 group-hover:text-cyan-400 transition-colors font-serif leading-snug line-clamp-2 cursor-pointer mb-2"
          >
            {item.title}
          </h3>

          {item.snippet && (
            <p className="text-xs text-gray-400 font-sans line-clamp-2 leading-relaxed mb-1">
              {item.snippet}
            </p>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-3.5 sm:px-4 py-2.5 bg-[#0a0d12]/50 border-t border-gray-800/60 flex items-center justify-between font-mono text-xs">
        <button
          onClick={() => onPlay(item)}
          className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
        >
          <Play className="w-3 h-3 fill-cyan-400" />
          <span>Afspil</span>
        </button>

        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-300 transition-colors"
        >
          <span>YouTube</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </article>
  );
};
