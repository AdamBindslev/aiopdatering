'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Zap, Shield, Sun, Moon, Database } from 'lucide-react';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';

interface MastheadProps {
  lastUpdated: string;
  totalSources: number;
  successfulSources: number;
  totalItems: number;
  onRefresh: () => void;
  isRefreshing: boolean;
  onGoHome?: () => void;
}

export const Masthead: React.FC<MastheadProps> = ({
  lastUpdated,
  totalSources,
  successfulSources,
  totalItems,
  onRefresh,
  isRefreshing,
  onGoHome,
}) => {
  const [currentDate, setCurrentDate] = useState<string>('');
  const [isLightMode, setIsLightMode] = useState<boolean>(false);

  useEffect(() => {
    // Sync with HTML class
    const isLight = document.documentElement.classList.contains('light');
    setIsLightMode(isLight);

    const updateTime = () => {
      const now = new Date();
      const formattedDate = format(now, "EEEE d. MMMM yyyy • HH:mm:ss", { locale: da });
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
            KILDER AKTIVE: <strong className="text-gray-200">{successfulSources}/{totalSources}</strong>
          </span>
          <span className="hidden md:inline text-gray-600">|</span>
          <span className="hidden md:inline text-gray-400">
            INDEKSEREDE ARTIKLER: <strong className="text-gray-200">{totalItems}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-gray-400 hidden lg:inline">
            OPDATERET: <strong className="text-cyan-400">{lastUpdated ? format(new Date(lastUpdated), 'HH:mm:ss') : '--:--'}</strong>
          </span>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1 px-2.5 py-1 bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-cyan-500 text-gray-300 hover:text-cyan-400 rounded transition-all active:scale-95 text-[11px]"
            title="Genindlæs seneste feeds nu"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{isRefreshing ? 'Henter...' : 'Opdater'}</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-amber-400 text-gray-300 hover:text-amber-400 transition-all active:scale-95 text-[11px]"
            title={isLightMode ? 'Skift til mørk tilstand (Dark mode)' : 'Skift til lys tilstand (Light mode)'}
            aria-label={isLightMode ? 'Skift til mørk tilstand' : 'Skift til lys tilstand'}
          >
            {isLightMode ? (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/20" />
                <span className="hidden sm:inline text-[10px] font-mono">Mørk</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
                <span className="hidden sm:inline text-[10px] font-mono">Lys</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Newspaper Masthead */}
      <div className="max-w-7xl mx-auto px-4 py-6 text-center relative">
        {/* Newspaper meta line */}
        <div className="flex items-center justify-between text-[11px] font-mono tracking-widest text-gray-500 uppercase mb-2 border-b border-gray-800 pb-2">
          <span>UDGAVE: NORDISK AI-TELEGRAF</span>
          <span className="text-cyan-400 font-semibold">{currentDate || 'INDLÆSER DATO...'}</span>
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
          title="Gå til forsiden"
        >
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-100 to-gray-400 group-hover:from-white group-hover:via-cyan-200 group-hover:to-cyan-400 font-serif drop-shadow-sm transition-all duration-200">
            AI OPDATERING
          </h1>
          <p className="text-xs sm:text-sm font-mono tracking-[0.3em] uppercase text-cyan-500/90 group-hover:text-cyan-400 mt-1 transition-colors">
            THE INTELLIGENCE CHRONICLE // FRONTIER LABS • POLICY • FORSKNING • DANMARK
          </p>
        </div>

        {/* Newspaper Sub-rule */}
        <div className="w-full flex items-center justify-center gap-4 text-xs font-serif text-gray-400 border-t border-b border-gray-800 py-1.5 mt-4">
          <span className="hidden md:inline font-mono text-[10px] text-gray-500">§ 01</span>
          <span className="italic">Uafhængig, kurateret og uafbrudt nyhedsstrøm fra verdens førende AI-kilder</span>
          <span className="hidden md:inline font-mono text-[10px] text-gray-500">§ 02</span>
        </div>
      </div>
    </header>
  );
};
