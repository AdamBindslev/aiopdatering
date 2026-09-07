'use client';

import React, { useEffect } from 'react';
import { FeedItem } from '@/types';
import { X, ExternalLink, Youtube, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { da } from 'date-fns/locale';

interface VideoModalProps {
  item: FeedItem | null;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ item, onClose }) => {
  // Listen for Escape key and lock body scroll
  useEffect(() => {
    if (!item) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [item, onClose]);

  if (!item) return null;

  let timeAgo = '';
  try {
    timeAgo = formatDistanceToNow(new Date(item.pubDate), { addSuffix: true, locale: da });
  } catch (e) {
    timeAgo = 'Nyligt';
  }

  const embedUrl = item.videoId
    ? `https://www.youtube-nocookie.com/embed/${item.videoId}?autoplay=1&rel=0&modestbranding=1`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      {/* Click backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Window */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-label={item.title}
        className="relative z-10 w-full max-w-4xl bg-[#0c1017] border border-gray-800 rounded-xl shadow-2xl shadow-black/80 flex flex-col overflow-hidden max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-800 bg-[#080b10]">
          <div className="flex items-center gap-2.5 truncate mr-4">
            <Youtube className="w-5 h-5 text-red-500 shrink-0" />
            <span className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider truncate">
              {item.sourceName}
            </span>
            <span className="text-gray-600">•</span>
            <span className="text-xs font-mono text-gray-400 flex items-center gap-1 shrink-0">
              <Clock className="w-3 h-3 text-gray-500" />
              {timeAgo}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors flex items-center gap-1"
            title="Luk video (Esc)"
          >
            <span className="hidden sm:inline text-[10px] font-mono text-gray-500 mr-1">ESC</span>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 16:9 Video Player Container */}
        <div className="relative w-full aspect-video bg-black">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={item.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-gray-400">
              <Youtube className="w-16 h-16 text-gray-600 mb-3" />
              <p className="font-serif text-lg text-white mb-2">Videoen kan ikke indlejres direkte.</p>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold transition-colors"
              >
                <span>Åbn video på YouTube</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        {/* Modal Body / Info */}
        <div className="p-4 sm:p-6 overflow-y-auto">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
            <h2 className="text-base sm:text-xl font-bold font-serif text-white leading-snug">
              {item.title}
            </h2>

            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gray-900 border border-gray-800 text-cyan-400 hover:text-cyan-300 text-xs font-mono shrink-0 transition-colors"
            >
              <span>Se på YouTube</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {item.snippet && (
            <p className="text-xs sm:text-sm text-gray-400 font-sans leading-relaxed whitespace-pre-line border-t border-gray-800/80 pt-3">
              {item.snippet}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
