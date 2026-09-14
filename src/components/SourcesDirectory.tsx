'use client';

import React, { useState } from 'react';
import { FEED_SOURCES, CATEGORY_LABELS } from '@/data/sources';
import { ExternalLink, Rss, Copy, Check } from 'lucide-react';

export const SourcesDirectory: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Group sources by category
  const categories = Object.keys(CATEGORY_LABELS).filter(c => c !== 'all' && c !== 'core');

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-800 pb-4">
        <h2 className="text-2xl font-bold font-serif text-white mb-2">Source Catalog & RSS Directory</h2>
        <p className="text-sm text-gray-400 font-mono">
          Overview of all {FEED_SOURCES.length} integrated feeds, organized by category. Monitored continuously.
        </p>
      </div>

      {categories.map((catKey) => {
        const catInfo = CATEGORY_LABELS[catKey];
        const catSources = FEED_SOURCES.filter(s => s.category === catKey);

        if (catSources.length === 0) return null;

        return (
          <section key={catKey} className="space-y-3">
            <div className="flex items-center gap-2 border-b border-gray-800/80 pb-2">
              <h3 className="text-lg font-bold font-serif text-cyan-400">{catInfo.label}</h3>
              <span className="text-xs font-mono text-gray-500">({catSources.length} sources)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {catSources.map((source) => (
                <div
                  key={source.id}
                  className="p-3.5 bg-[#0e131b] border border-gray-800 hover:border-gray-700 rounded-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-bold text-gray-100 hover:text-cyan-400 transition-colors flex items-center gap-1 font-serif"
                      >
                        <span>{source.name}</span>
                        <ExternalLink className="w-3 h-3 text-gray-500" />
                      </a>
                      {source.isCore && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-800/80 text-amber-400 text-[9px] font-mono font-bold uppercase">
                          Core
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 font-sans mb-3 line-clamp-2">
                      {source.description || 'Continuous feed ingestion.'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-gray-800/60 flex items-center justify-between font-mono text-[11px] text-gray-500">
                    <span className="truncate max-w-[200px] text-gray-600">
                      {source.feedUrl}
                    </span>
                    <button
                      onClick={() => handleCopy(source.id, source.feedUrl)}
                      className="inline-flex items-center gap-1 text-cyan-500 hover:text-cyan-300 px-2 py-0.5 rounded bg-gray-900 border border-gray-800"
                    >
                      {copiedId === source.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Rss className="w-3 h-3" />
                          <span>Copy RSS</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};
