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
  Video,
  Newspaper
} from 'lucide-react';

interface CategoryNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  counts: Record<string, number>;
}

const TABS = [
  { id: 'core', label: 'Kerne-Sæt', icon: Flame, color: 'text-amber-400' },
  { id: 'video', label: 'AI Video', icon: Video, color: 'text-red-400' },
  { id: 'danish', label: 'Dansk AI', icon: Flag, color: 'text-red-400' },
  { id: 'labs', label: 'Frontier Labs', icon: Cpu, color: 'text-cyan-400' },
  { id: 'experts', label: 'Eksperter & Analyse', icon: Lightbulb, color: 'text-emerald-400' },
  { id: 'media', label: 'Tech Medier', icon: Newspaper, color: 'text-rose-400' },
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
}) => {
  return (
    <nav className="w-full border-b border-gray-800 bg-[#0a0d12]/95 backdrop-blur-md sticky top-0 z-30 mb-6">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto sm:flex-wrap sm:justify-center no-scrollbar py-0.5">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const count = counts[tab.id] ?? 0;

            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`group flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-md text-xs sm:text-[13px] font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/90 shadow-sm shadow-cyan-950/50 font-semibold'
                    : 'bg-[#0f141c]/90 text-gray-300 hover:text-white hover:bg-gray-800/90 border border-gray-800/90 hover:border-gray-700'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 transition-opacity ${
                    isActive ? `${tab.color} opacity-100` : `${tab.color} opacity-75 group-hover:opacity-100`
                  }`}
                />
                <span className="tracking-tight">{tab.label}</span>
                {tab.id !== 'sources' && count > 0 && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full transition-colors ${
                      isActive
                        ? 'bg-cyan-900/90 text-cyan-200 border border-cyan-700/80'
                        : 'bg-gray-800 text-gray-400 border border-gray-700/60 group-hover:text-gray-300'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
