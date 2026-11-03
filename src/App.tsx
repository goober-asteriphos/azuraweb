import React, { useState, useMemo } from 'react';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { MiniPlayer } from './components/MiniPlayer';
import { NowPlayingModal } from './components/NowPlayingModal';
import { HomeView } from './components/HomeView';
import { GuideView } from './components/GuideView';
import { FavoritesView } from './components/FavoritesView';
import { SongHistoryModal } from './components/SongHistoryModal';
import { SongRequestModal } from './components/SongRequestModal';
import { SleepTimerModal } from './components/SleepTimerModal';
import { SettingsModal } from './components/SettingsModal';
import { IosInstallPrompt } from './components/IosInstallPrompt';

const AppContent: React.FC = () => {
  const { stations, favorites } = usePlayer();

  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);

  // Extract unique categories dynamically + 'All' and 'Favorites'
  const categories = useMemo(() => {
    const set = new Set<string>();
    stations.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return ['All', 'Favorites', ...Array.from(set)];
  }, [stations]);

  // Filter stations based on category & search
  const filteredStations = useMemo(() => {
    return stations.filter((station) => {
      // Category filter
      if (selectedCategory === 'Favorites') {
        if (!favorites.includes(station.station.id)) return false;
      } else if (selectedCategory !== 'All') {
        if (station.category !== selectedCategory) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = station.station.name.toLowerCase().includes(q);
        const matchesSong = station.now_playing?.song?.title?.toLowerCase().includes(q);
        const matchesArtist = station.now_playing?.song?.artist?.toLowerCase().includes(q);
        const matchesCategory = station.category?.toLowerCase().includes(q);
        const matchesChannel = station.channel_number?.toString().includes(q);
        return matchesName || matchesSong || matchesArtist || matchesCategory || matchesChannel;
      }

      return true;
    });
  }, [stations, selectedCategory, searchQuery, favorites]);

  return (
    <div className="flex flex-col min-h-screen bg-sxm-bg text-sxm-light font-sans max-w-md mx-auto relative shadow-2xl overflow-x-hidden">
      {/* Top Header */}
      <Header
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        categories={categories}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isSearchActive={isSearchActive}
        setIsSearchActive={setIsSearchActive}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {currentTab === 'home' && <HomeView filteredStations={filteredStations} />}
        {currentTab === 'guide' && <GuideView stations={filteredStations} />}
        {currentTab === 'favorites' && <FavoritesView />}
      </main>

      {/* Floating Mini Player (docked directly above the bottom tab bar) */}
      <MiniPlayer />

      {/* Bottom Navigation */}
      <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Modals & Full Screen Sheets */}
      <NowPlayingModal />
      <SongHistoryModal />
      <SongRequestModal />
      <SleepTimerModal />
      <SettingsModal />
      <IosInstallPrompt />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <PlayerProvider>
      <AppContent />
    </PlayerProvider>
  );
};

export default App;
