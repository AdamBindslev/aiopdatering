'use client';

import React from 'react';
import { FeedItem } from '@/types';
import { Radio } from 'lucide-react';

interface LiveTickerProps {
  items: FeedItem[];
}

export const LiveTicker: React.FC<LiveTickerProps> = ({ items }) => {
  if (!items || items.length === 0) return null;

  // Take the 12 most recent items for the ticker
  const tickerItems = items.slice(0, 12);

  return (
    <div className="w-full bg-[#05070a] border-b border-gray-800 text-xs font-mono py-2 px-4 flex items-center overflow-hidden select-none">
      <div className="flex items-center gap-2 pr-4 z-10 bg-[#05070a] border-r border-gray-800 text-red-500 font-bold shrink-0">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
        <span className="tracking-wider uppercase flex items-center gap-1">
          <Radio className="w-3.5 h-3.5 inline" /> LIVE WIRE
        </span>
      </div>

      <div className="overflow-hidden whitespace-nowrap relative w-full mask-gradient">
        <div className="animate-marquee flex items-center gap-8 pl-4">
          {[...tickerItems, ...tickerItems].map((item, idx) => (
            <a
              key={`${item.id}-${idx}`}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-gray-300 hover:text-cyan-400 transition-colors"
            >
              <span className="text-cyan-500 font-semibold">[{item.sourceName}]:</span>
              <span className="text-gray-200">{item.title}</span>
              <span className="text-gray-600 text-[10px]">///</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
