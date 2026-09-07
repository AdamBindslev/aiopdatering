'use client';

import React from 'react';
import { 
  Flame, 
  Globe, 
  Cpu, 
  Flag, 
  Lightbulb, 
  ShieldAlert, 
  Layers, 
  GraduationCap, 
  Database,
  Bookmark
} from 'lucide-react';

interface CategoryNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  counts: Record<string, number>;
  bookmarkCount: number;
}

const TABS = [
  { id: 'core', label: 'Kerne-Sæt', icon: Flame, color: 'text-amber-400' },
  { id: 'danish', label: 'Dansk AI', icon: Flag, color: 'text-red-400' },
  { id: 'labs', label: 'Frontier Labs', icon: Cpu, color: 'text-cyan-400' },
  { id: 'experts', label: 'Eksperter & Analyse', icon: Lightbulb, color: 'text-emerald-400' },
  { id: 'safety', label: 'Sikkerhed & Jura', icon: ShieldAlert, color: 'text-blue-400' },
  { id: 'tools', label: 'Værktøjer & Chips', icon: Layers, color: 'text-purple-400' },
  { id: 'all', label: 'Alle Nyheder', icon: Globe, color: 'text-gray-300' },
  { id: 'arxiv', label: 'Forskning (arXiv)', icon: GraduationCap, color: 'text-yellow-400' },
  { id: 'sources', label: 'Kildekatalog', icon: Database, color: 'text-indigo-400' },
];

export const CategoryNav: React.FC<CategoryNavProps> = ({
  activeTab,
  onSelectTab,
  counts,
  bookmarkCount,
}) => {
  return (
    <nav className="w-full border-b border-gray-800 bg-[#0a0d12]/90 backdrop-blur sticky top-[89px] z-30 mb-6">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between overflow-x-auto no-scrollbar py-2.5 gap-2">
        <div className="flex items-center gap-1.5 shrink-0">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const count = counts[tab.id] ?? 0;

            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gray-800 text-white border border-cyan-500/80 shadow-sm shadow-cyan-950/40 font-bold'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? tab.color : 'text-gray-500'}`} />
                <span>{tab.label}</span>
                {tab.id !== 'sources' && count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bookmarks Tab */}
        <div className="shrink-0 pl-2 border-l border-gray-800">
          <button
            onClick={() => onSelectTab('bookmarks')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all ${
              activeTab === 'bookmarks'
                ? 'bg-gray-800 text-white border border-cyan-500 font-bold'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900 border border-transparent'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${activeTab === 'bookmarks' ? 'fill-cyan-400 text-cyan-400' : 'text-gray-500'}`} />
            <span>Gemte</span>
            {bookmarkCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                {bookmarkCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};
