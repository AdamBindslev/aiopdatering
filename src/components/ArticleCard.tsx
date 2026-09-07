'use client';

import React from 'react';
import { FeedItem } from '@/types';
import { ExternalLink, Clock, User, Bookmark } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { da } from 'date-fns/locale';

interface ArticleCardProps {
  item: FeedItem;
  variant?: 'compact' | 'standard' | 'horizontal';
  isBookmarked?: boolean;
  onToggleBookmark?: (item: FeedItem) => void;
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
  teal: 'border-teal-500/40 text-teal-400 bg-teal-950/30',
  indigo: 'border-indigo-500/40 text-indigo-400 bg-indigo-950/30',
};

export const ArticleCard: React.FC<ArticleCardProps> = ({
  item,
  variant = 'standard',
  isBookmarked = false,
  onToggleBookmark,
}) => {
  const badgeClass = BADGE_STYLES[item.badgeColor || 'cyan'] || BADGE_STYLES.cyan;

  let timeAgo = '';
  try {
    timeAgo = formatDistanceToNow(new Date(item.pubDate), { addSuffix: true, locale: da });
  } catch (e) {
    timeAgo = 'Nyligt';
  }

  const exactDate = format(new Date(item.pubDate), "d. MMM yyyy, HH:mm");

  if (variant === 'compact') {
    return (
      <article className="p-3 bg-[#0f141c] hover:bg-[#151c27] border border-gray-800/80 hover:border-gray-700 transition-all rounded group">
        <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-gray-500 mb-1.5">
          <span className={`px-1.5 py-0.5 rounded border text-[9px] uppercase tracking-wider font-semibold ${badgeClass}`}>
            {item.sourceName}
          </span>
          <span title={exactDate} className="flex items-center gap-1 text-gray-400">
            <Clock className="w-2.5 h-2.5" />
            {timeAgo}
          </span>
        </div>
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-gray-200 group-hover:text-cyan-400 transition-colors line-clamp-2 block font-serif"
        >
          {item.title}
        </a>
      </article>
    );
  }

  return (
    <article className="p-4 sm:p-5 bg-[#0e131b] hover:bg-[#131924] border border-gray-800/80 hover:border-cyan-500/40 transition-all rounded flex flex-col justify-between group hud-corner shadow-sm hover:shadow-cyan-950/20">
      <div>
        {/* Card Header Meta */}
        <div className="flex items-center justify-between gap-2 text-xs font-mono mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded border text-[10px] uppercase tracking-wider font-semibold ${badgeClass}`}>
              {item.sourceName}
            </span>
            {item.language === 'da' && (
              <span className="px-1.5 py-0.5 rounded bg-red-950/40 border border-red-800/60 text-red-400 text-[9px] font-bold">
                DK
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-gray-400 text-[11px]">
            <span title={exactDate} className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-500" />
              {timeAgo}
            </span>
            {onToggleBookmark && (
              <button
                onClick={() => onToggleBookmark(item)}
                className={`p-1 hover:text-cyan-400 transition-colors ${isBookmarked ? 'text-cyan-400' : 'text-gray-500'}`}
                title={isBookmarked ? 'Fjern bogmærke' : 'Gem artikel'}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-cyan-400' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-gray-100 group-hover:text-cyan-400 transition-colors font-serif leading-snug mb-2">
          <a href={item.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-baseline gap-1.5">
            <span>{item.title}</span>
          </a>
        </h3>

        {/* Snippet / Excerpt */}
        {item.snippet && (
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-sans line-clamp-3 mb-4">
            {item.snippet}
          </p>
        )}
      </div>

      {/* Footer Meta */}
      <div className="pt-3 border-t border-gray-800/60 flex items-center justify-between text-xs font-mono text-gray-500">
        <div className="flex items-center gap-1.5 truncate max-w-[200px]">
          {item.author && (
            <>
              <User className="w-3 h-3 text-gray-600 shrink-0" />
              <span className="truncate text-gray-400">{item.author}</span>
            </>
          )}
        </div>

        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] text-cyan-500 hover:text-cyan-300 font-semibold group-hover:translate-x-0.5 transition-all"
        >
          <span>Læs artikel</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </article>
  );
};
