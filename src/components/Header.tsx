import React from 'react';
import { Radio, Settings, Search, Heart, Sparkles, Wifi } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

interface HeaderProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categories: string[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isSearchActive: boolean;
  setIsSearchActive: (active: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedCategory,
  onSelectCategory,
  categories,
  searchQuery,
  onSearchChange,
  isSearchActive,
  setIsSearchActive,
}) => {
  const { serverConfig, setIsSettingsOpen } = usePlayer();

  return (
    <header className="sticky top-0 z-30 bg-sxm-bg/90 backdrop-blur-xl border-b border-sxm-border/50 pt-[env(safe-area-inset-top,12px)] transition-all">
      {/* Top Brand Bar */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center space-x-2.5">
          {/* SiriusXM styled satellite wave badge */}
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-sxm-blue via-sxm-accent to-purple-600 shadow-glow-accent">
            <Radio className="w-4 h-4 text-white" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sxm-neon opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sxm-neon"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-black tracking-tight text-lg text-white">AZURA<span className="text-sxm-accent">WAVE</span></span>
              <span className="flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sxm-neon/15 border border-sxm-neon/30 text-sxm-neon uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-sxm-neon animate-pulse" />
                <span>LIVE</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsSearchActive(!isSearchActive)}
            className={`p-2 rounded-full transition-colors ${
              isSearchActive ? 'bg-sxm-accent text-black' : 'bg-sxm-card text-sxm-light hover:bg-sxm-card-hover'
            }`}
            aria-label="Search channels"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-full bg-sxm-card text-sxm-light hover:bg-sxm-card-hover relative transition-colors"
            aria-label="Server settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Input Bar (when expanded) */}
      {isSearchActive && (
        <div className="px-4 pb-2.5 pt-0.5 animate-fadeIn">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-sxm-muted absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search station, artist, or song..."
              className="w-full bg-sxm-card border border-sxm-border rounded-xl pl-9 pr-8 py-2 text-sm text-white placeholder-sxm-muted focus:outline-none focus:border-sxm-accent"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 text-xs text-sxm-muted hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* SiriusXM Category Filter Pills */}
      <div className="flex items-center space-x-2 px-4 py-2 overflow-x-auto no-scrollbar scroll-smooth">
        {categories.map((category) => {
          const isSelected = selectedCategory === category;
          return (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                isSelected
                  ? 'bg-white text-black shadow-md shadow-white/10 scale-105'
                  : 'bg-sxm-card/90 text-sxm-muted border border-sxm-border/60 hover:text-white hover:border-sxm-border'
              }`}
            >
              {category === 'Favorites' ? (
                <span className="flex items-center space-x-1">
                  <Heart className="w-3 h-3 text-red-500 fill-red-500 inline" />
                  <span>Favorites</span>
                </span>
              ) : (
                category
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
