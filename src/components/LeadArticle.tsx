'use client';

import React from 'react';
import { FeedItem } from '@/types';
import { ExternalLink, Flame, Clock, User, Bookmark } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { da } from 'date-fns/locale';

interface LeadArticleProps {
  item: FeedItem;
  isBookmarked?: boolean;
  onToggleBookmark?: (item: FeedItem) => void;
}

export const LeadArticle: React.FC<LeadArticleProps> = ({
  item,
  isBookmarked = false,
  onToggleBookmark,
}) => {
  let timeAgo = '';
  try {
    timeAgo = formatDistanceToNow(new Date(item.pubDate), { addSuffix: true, locale: da });
  } catch (e) {
    timeAgo = 'Nyligt';
  }

  const exactDate = format(new Date(item.pubDate), "d. MMMM yyyy, 'kl.' HH:mm");

  return (
    <div className="relative border-2 border-cyan-500/40 bg-gradient-to-b from-[#0f1622] to-[#0a0e14] p-6 sm:p-8 rounded-lg shadow-xl shadow-cyan-950/20 hud-corner mb-8">
      {/* Top Banner Tag */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 text-xs font-mono font-bold uppercase tracking-widest rounded">
            <Flame className="w-3.5 h-3.5 text-cyan-400" />
            TOPHISTORIE // LEAD STORY
          </span>
          <span className="px-2 py-0.5 rounded bg-gray-900 border border-gray-700 text-gray-300 text-xs font-mono font-semibold">
            {item.sourceName}
          </span>
          {item.language === 'da' && (
            <span className="px-2 py-0.5 rounded bg-red-950/60 border border-red-700 text-red-400 text-xs font-mono font-bold">
              DANSK KILDE
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-gray-400">
          <span title={exactDate} className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-cyan-500" />
            {timeAgo}
          </span>
          {onToggleBookmark && (
            <button
              onClick={() => onToggleBookmark(item)}
              className={`p-1.5 rounded hover:bg-gray-800 transition-colors ${
                isBookmarked ? 'text-cyan-400' : 'text-gray-400'
              }`}
              title={isBookmarked ? 'Fjern bogmærke' : 'Gem artikel'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-cyan-400' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Main Headline */}
      <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold font-serif tracking-tight text-white hover:text-cyan-400 transition-colors leading-[1.15] mb-4">
        <a href={item.link} target="_blank" rel="noopener noreferrer">
          {item.title}
        </a>
      </h2>

      {/* Excerpt / Story Body */}
      {item.snippet && (
        <p className="text-base sm:text-lg text-gray-300 font-sans leading-relaxed mb-6 max-w-4xl">
          {item.snippet}
        </p>
      )}

      {/* Footer Info & Action */}
      <div className="pt-4 border-t border-gray-800/80 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-4 text-gray-400">
          {item.author && (
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyan-500" />
              Forfatter: <strong className="text-gray-200">{item.author}</strong>
            </span>
          )}
          <span className="text-gray-500">|</span>
          <span className="text-gray-400">{exactDate}</span>
        </div>

        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-semibold font-mono text-xs transition-transform active:scale-95 shadow-md shadow-cyan-500/20"
        >
          <span>LÆS ORIGINAL ARTIKEL</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
