'use client';

import React from 'react';
import { TrendingTopicData, SupportingStory, FeedItem } from '@/types';
import { ExternalLink, Flame, Clock, Bookmark, Sparkles, Layers, ArrowUpRight } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { da } from 'date-fns/locale';

interface TrendingStoryProps {
  trending: TrendingTopicData;
  bookmarkedIds?: string[];
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

function storyToFeedItem(story: SupportingStory): FeedItem {
  return {
    id: story.id,
    title: story.title,
    link: story.link,
    pubDate: story.pubDate,
    timestamp: new Date(story.pubDate).getTime() || Date.now(),
    sourceId: story.sourceId,
    sourceName: story.sourceName,
    category: 'media',
    language: 'da',
    snippet: story.title,
    badgeColor: story.badgeColor,
  };
}

export const TrendingStory: React.FC<TrendingStoryProps> = ({
  trending,
  bookmarkedIds = [],
  onToggleBookmark,
}) => {
  let timeAgo = '';
  try {
    timeAgo = formatDistanceToNow(new Date(trending.synthesizedAt), { addSuffix: true, locale: da });
  } catch {
    timeAgo = 'Nyligt opdateret';
  }

  const exactDate = (() => {
    try {
      return format(new Date(trending.synthesizedAt), "d. MMMM yyyy, 'kl.' HH:mm");
    } catch {
      return '';
    }
  })();

  const allStories = [
    ...(trending.primaryArticle ? [trending.primaryArticle] : []),
    ...(trending.supportingStories || []),
  ];

  return (
    <section 
      aria-label="Det er vigtigt lige nu" 
      className="relative border-2 border-cyan-500/50 bg-gradient-to-b from-[#111927] via-[#0d131f] to-[#090d14] p-6 sm:p-8 rounded-xl shadow-2xl shadow-cyan-950/30 hud-corner mb-10 overflow-hidden"
    >
      {/* Ambient background glow accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-500/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* Top Meta Bar */}
      <div className="relative flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-gray-800/90">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Live pulsing tag */}
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-950/80 border border-red-500/60 text-red-300 text-xs font-mono font-extrabold uppercase tracking-widest rounded-md shadow-sm shadow-red-950/50">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <Flame className="w-3.5 h-3.5 text-red-400" />
            DET ER VIGTIGT LIGE NU
          </span>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold rounded">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            AI SYNTESE {trending.modelUsed ? `(${trending.modelUsed})` : ''}
          </span>

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-900/80 border border-gray-700/80 text-gray-400 text-xs font-mono">
            <Layers className="w-3 h-3 text-gray-400" />
            {allStories.length} kilder i klyngen
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-gray-400">
          <span title={exactDate} className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            Opdateret {timeAgo}
          </span>
        </div>
      </div>

      {/* Main Narrative Headline */}
      <div className="relative mb-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem] font-serif font-extrabold tracking-tight text-white leading-[1.18] mb-4 hover:text-cyan-300 transition-colors">
          {trending.primaryArticle ? (
            <a 
              href={trending.primaryArticle.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline"
            >
              {trending.headline}
            </a>
          ) : (
            trending.headline
          )}
        </h2>

        {/* Synthesized Overview Paragraph */}
        <p className="text-base sm:text-lg text-gray-200 font-sans leading-relaxed max-w-5xl mb-6">
          {trending.summary}
        </p>
      </div>

      {/* "Why It Matters" Callout Box */}
      {trending.whyItMatters && (
        <div className="relative mb-7 p-4 sm:p-5 rounded-lg bg-[#0e1624]/90 border-l-4 border-cyan-400 border-y border-r border-cyan-500/20 shadow-inner">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Hvorfor det er vigtigt // Redaktionel analyse</span>
          </div>
          <p className="text-gray-100 text-sm sm:text-base leading-relaxed font-sans font-normal">
            {trending.whyItMatters}
          </p>
        </div>
      )}

      {/* Techmeme-Style Supporting Stories Cluster */}
      <div className="relative pt-5 border-t border-gray-800/80">
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400/90 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5" />
            Understøttende dækning & perspektiver // Techmeme Klynge
          </h3>
          <span className="text-[11px] font-mono text-gray-500">
            Kildemateriale fra de seneste 48 timer
          </span>
        </div>

        {/* Stories List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {allStories.map((story, idx) => {
            const isPrimary = idx === 0 && Boolean(trending.primaryArticle);
            const isBookmarked = bookmarkedIds.includes(story.id);
            const badgeClass = BADGE_STYLES[story.badgeColor || 'cyan'] || BADGE_STYLES.cyan;

            let storyTimeAgo = '';
            try {
              storyTimeAgo = formatDistanceToNow(new Date(story.pubDate), { addSuffix: true, locale: da });
            } catch {
              storyTimeAgo = '';
            }

            return (
              <div
                key={story.id || idx}
                className={`group flex flex-col justify-between p-3.5 rounded-lg border transition-all ${
                  isPrimary
                    ? 'bg-cyan-950/20 border-cyan-500/40 hover:border-cyan-400/80 hover:bg-cyan-950/30'
                    : 'bg-[#0e131c]/70 border-gray-800/80 hover:border-gray-700 hover:bg-[#121924]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {isPrimary && (
                        <span className="px-1.5 py-0.5 rounded bg-cyan-500 text-black text-[10px] font-mono font-extrabold uppercase tracking-wider">
                          Primær kilde
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-mono font-semibold uppercase tracking-wider ${badgeClass}`}>
                        {story.sourceName}
                      </span>
                      {story.angle && (
                        <span className="px-1.5 py-0.5 rounded bg-gray-900 border border-gray-700/80 text-gray-300 text-[10px] font-mono">
                          {story.angle}
                        </span>
                      )}
                    </div>

                    {storyTimeAgo && (
                      <span className="text-[11px] font-mono text-gray-500 whitespace-nowrap">
                        {storyTimeAgo}
                      </span>
                    )}
                  </div>

                  <a
                    href={story.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm font-serif font-bold text-gray-100 group-hover:text-cyan-300 transition-colors leading-snug line-clamp-2"
                  >
                    {story.title}
                  </a>
                </div>

                <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-gray-800/50 font-mono text-[11px]">
                  <a
                    href={story.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-cyan-400 group-hover:text-cyan-300 font-semibold"
                  >
                    <span>Læs dækning</span>
                    <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>

                  {onToggleBookmark && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        onToggleBookmark(storyToFeedItem(story));
                      }}
                      className={`p-1 rounded hover:bg-gray-800 transition-colors ${
                        isBookmarked ? 'text-cyan-400' : 'text-gray-500 hover:text-gray-300'
                      }`}
                      title={isBookmarked ? 'Fjern bogmærke' : 'Gem artikel'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-cyan-400' : ''}`} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
