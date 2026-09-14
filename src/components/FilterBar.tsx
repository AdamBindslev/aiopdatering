'use client';

import React, { useMemo } from 'react';
import { Search, Filter, Clock, X } from 'lucide-react';
import { FeedSource } from '@/types';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedSource: string;
  onSourceChange: (s: string) => void;
  timeFilter: string;
  onTimeFilterChange: (t: string) => void;
  sources: FeedSource[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedSource,
  onSourceChange,
  timeFilter,
  onTimeFilterChange,
  sources,
}) => {
  const sortedSources = useMemo(() => {
    return [...sources].sort((a, b) => a.name.localeCompare(b.name, 'da'));
  }, [sources]);

  return (
    <div className="bg-[#0e131b] border border-gray-800 rounded-lg p-3 sm:p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-3 font-mono text-xs">
      {/* Search Field */}
      <div className="relative w-full md:w-80">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search headlines, topics, authors..."
          className="w-full bg-[#070a0f] border border-gray-700/80 rounded pl-9 pr-8 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Selectors */}
      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
        {/* Source Dropdown */}
        <div className="flex items-center gap-1.5 bg-[#070a0f] border border-gray-700/80 rounded px-2.5 py-1.5 text-gray-300">
          <Filter className="w-3.5 h-3.5 text-cyan-500" />
          <select
            value={selectedSource}
            onChange={(e) => onSourceChange(e.target.value)}
            className="bg-transparent border-none text-gray-200 focus:outline-none text-xs cursor-pointer max-w-[180px] sm:max-w-[220px] truncate"
          >
            <option value="all" className="bg-[#0e131b]">All sources ({sortedSources.length})</option>
            {sortedSources.map((s) => (
              <option key={s.id} value={s.id} className="bg-[#0e131b]">
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Time Filter Buttons */}
        <div className="flex items-center gap-1 bg-[#070a0f] border border-gray-700/80 rounded p-1">
          <Clock className="w-3 h-3 text-gray-500 ml-1.5 mr-1" />
          {[
            { id: '24h', label: '24h' },
            { id: '48h', label: '48h' },
            { id: '7d', label: '7 days' },
            { id: 'all', label: 'All' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => onTimeFilterChange(t.id)}
              className={`px-2 py-1 rounded text-[11px] transition-colors ${
                timeFilter === t.id
                  ? 'bg-cyan-950 text-cyan-400 border border-cyan-700 font-semibold'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
