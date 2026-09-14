'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Zap, Shield, Sun, Moon, Database, Bookmark } from 'lucide-react';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

interface MastheadProps {
  lastUpdated: string;
  totalSources: number;
  successfulSources: number;
  totalItems: number;
  onRefresh: () => void;
  isRefreshing: boolean;
  onGoHome?: () => void;
  bookmarkCount?: number;
  onSelectBookmarks?: () => void;
  isBookmarksActive?: boolean;
}

export const Masthead: React.FC<MastheadProps> = ({
  lastUpdated,
  totalSources,
  successfulSources,
  totalItems,
  onRefresh,
  isRefreshing,
  onGoHome,
  bookmarkCount = 0,
  onSelectBookmarks,
  isBookmarksActive = false,
}) => {
  const [currentDate, setCurrentDate] = useState<string>('');
  const [isLightMode, setIsLightMode] = useState<boolean>(false);

  useEffect(() => {
    // Sync with HTML class
    const isLight = document.documentElement.classList.contains('light');
    setIsLightMode(isLight);

    const updateTime = () => {
      const now = new Date();
      const formattedDate = format(now, "EEEE, MMMM d, yyyy • HH:mm:ss", { locale: enUS });
      setCurrentDate(formattedDate.toUpperCase());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    const nextLight = !isLightMode;
    setIsLightMode(nextLight);
    if (nextLight) {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      try {
        localStorage.setItem('ai_opdatering_theme', 'light');
      } catch (e) {}
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      try {
        localStorage.setItem('ai_opdatering_theme', 'dark');
      } catch (e) {}
    }
  };

  return (
    <header className="border-b border-gray-800 bg-[#0a0d12]/95 backdrop-blur-md">
      {/* Top Telemetry & Status Bar */}
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex flex-wrap items-center justify-between text-[11px] font-mono text-gray-400 border-b border-gray-900">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            SYSTEM NORMAL
          </span>
          <span className="hidden sm:inline text-gray-600">|</span>
          <span className="hidden sm:inline text-gray-400">
            SOURCES ACTIVE: <strong className="text-gray-200">{successfulSources}/{totalSources}</strong>
          </span>
          <span className="hidden md:inline text-gray-600">|</span>
          <span className="hidden md:inline text-gray-400">
            INDEXED ARTICLES: <strong className="text-gray-200">{totalItems}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-gray-400 hidden lg:inline">
            UPDATED: <strong className="text-cyan-400">{lastUpdated ? format(new Date(lastUpdated), 'HH:mm:ss') : '--:--'}</strong>
          </span>

          {/* Bookmarks Button */}
          {onSelectBookmarks && (
            <button
              onClick={onSelectBookmarks}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-all active:scale-95 text-[11px] font-mono ${
                isBookmarksActive
                  ? 'bg-cyan-950 text-cyan-400 border-cyan-500 font-bold shadow-sm shadow-cyan-950/40'
                  : 'bg-gray-900 hover:bg-gray-800 border-gray-700 hover:border-cyan-500 text-gray-300 hover:text-cyan-400'
              }`}
              title="View saved articles and reading list"
            >
              <Bookmark className={`w-3 h-3 ${isBookmarksActive ? 'fill-cyan-400 text-cyan-400' : 'text-cyan-400'}`} />
              <span>Saved</span>
              {bookmarkCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isBookmarksActive
                      ? 'bg-cyan-500 text-black'
                      : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                  }`}
                >
                  {bookmarkCount}
                </span>
              )}
            </button>
          )}

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1 px-2.5 py-1 bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-cyan-500 text-gray-300 hover:text-cyan-400 rounded transition-all active:scale-95 text-[11px]"
            title="Refresh latest feeds now"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{isRefreshing ? 'Fetching...' : 'Refresh'}</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-amber-400 text-gray-300 hover:text-amber-400 transition-all active:scale-95 text-[11px]"
            title={isLightMode ? 'Switch to Dark mode' : 'Switch to Light mode'}
            aria-label={isLightMode ? 'Switch to Dark mode' : 'Switch to Light mode'}
          >
            {isLightMode ? (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/20" />
                <span className="hidden sm:inline text-[10px] font-mono">Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
                <span className="hidden sm:inline text-[10px] font-mono">Light</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Newspaper Masthead */}
      <div className="max-w-7xl mx-auto px-4 py-6 text-center relative">
        {/* Newspaper meta line */}
        <div className="flex items-center justify-between text-[11px] font-mono tracking-widest text-gray-500 uppercase mb-2 border-b border-gray-800 pb-2">
          <span>EDITION: GLOBAL & NORDIC INTELLIGENCE</span>
          <span className="text-cyan-400 font-semibold">{currentDate || 'LOADING DATE...'}</span>
          <span className="hidden sm:inline">VERCEL ISR // HYPERTEXT FEED</span>
        </div>

        {/* Title */}
        <div
          onClick={onGoHome}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onGoHome?.();
            }
          }}
          className="my-3 inline-block cursor-pointer group select-none transition-transform active:scale-[0.99]"
          title="Go to front page"
        >
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-100 to-gray-400 group-hover:from-white group-hover:via-cyan-200 group-hover:to-cyan-400 font-serif drop-shadow-sm transition-all duration-200">
            AI OPDATERING
          </h1>
          <p className="text-xs sm:text-sm font-mono tracking-[0.3em] uppercase text-cyan-500/90 group-hover:text-cyan-400 mt-1 transition-colors">
            THE INTELLIGENCE CHRONICLE // FRONTIER LABS • POLICY • RESEARCH • AGENTS
          </p>
        </div>

        {/* Newspaper Sub-rule */}
        <div className="w-full flex items-center justify-center gap-4 text-xs font-serif text-gray-400 border-t border-b border-gray-800 py-1.5 mt-4">
          <span className="hidden md:inline font-mono text-[10px] text-gray-500">§ 01</span>
          <span className="italic">Independent, continuous curated intelligence from the frontier of artificial intelligence</span>
          <span className="hidden md:inline font-mono text-[10px] text-gray-500">§ 02</span>
        </div>
      </div>
    </header>
  );
};
