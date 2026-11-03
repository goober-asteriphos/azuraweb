import React from 'react';
import { Sparkles, Radio, Heart, Settings } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export type TabType = 'home' | 'guide' | 'favorites' | 'settings';

interface BottomNavProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const { favorites, setIsSettingsOpen } = usePlayer();

  const handleTabClick = (tab: TabType) => {
    if (tab === 'settings') {
      setIsSettingsOpen(true);
    } else {
      onTabChange(tab);
    }
  };

  const navItems = [
    { id: 'home' as TabType, label: 'For You', icon: Sparkles },
    { id: 'guide' as TabType, label: 'Guide', icon: Radio },
    { id: 'favorites' as TabType, label: 'Favorites', icon: Heart, badge: favorites.length },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="z-30 bg-sxm-surface/95 backdrop-blur-xl border-t border-sxm-border/60 pb-[env(safe-area-inset-bottom,14px)] pt-2 transition-all">
      <div className="flex items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 relative ${
                isActive ? 'text-white scale-105' : 'text-sxm-muted hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'text-sxm-accent stroke-[2.5]' : 'stroke-[1.8]'
                  }`}
                />
                {item.badge !== undefined && item.badge > 0 && item.id === 'favorites' && (
                  <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-[14px] flex items-center justify-center text-[9px] font-black rounded-full bg-red-500 text-white leading-none">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-semibold mt-1 tracking-tight ${isActive ? 'text-white font-bold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
