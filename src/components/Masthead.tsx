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
}

export const Masthead: React.FC<MastheadProps> = ({
  lastUpdated,
  totalSources,
  successfulSources,
  totalItems,
  onRefresh,
  isRefreshing,
}) => {
  const [currentDate, setCurrentDate] = useState<string>('');
  const [isLightMode, setIsLightMode] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formattedDate = format(now, "EEEE d. MMMM yyyy • HH:mm:ss 'CET'", { locale: da });
      setCurrentDate(formattedDate.toUpperCase());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    setIsLightMode(!isLightMode);
    document.documentElement.classList.toggle('light');
  };

  return (
    <header className="border-b border-gray-800 bg-[#0a0d12]/95 backdrop-blur-md sticky top-0 z-40">
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
            className="p-1 text-gray-400 hover:text-yellow-400 transition-colors"
            title="Skift lys/mørk tilstand"
          >
            {isLightMode ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
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
        <div className="my-3">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-100 to-gray-400 font-serif drop-shadow-sm">
            AI OPDATERING
          </h1>
          <p className="text-xs sm:text-sm font-mono tracking-[0.3em] uppercase text-cyan-500/90 mt-1">
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
