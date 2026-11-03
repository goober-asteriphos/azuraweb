import React from 'react';
import { Heart, Play, Pause, Radio } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { AzuraCastNowPlaying } from '../types/azuracast';

export const FavoritesView: React.FC = () => {
  const {
    stations,
    favorites,
    currentStation,
    isPlaying,
    playStation,
    togglePlayPause,
    toggleFavorite,
  } = usePlayer();

  const favoriteStations = stations.filter((s) => favorites.includes(s.station.id));

  const isCurrentPlayingStation = (station: AzuraCastNowPlaying) => {
    return currentStation?.station.id === station.station.id && isPlaying;
  };

  const handleStationClick = (station: AzuraCastNowPlaying) => {
    if (currentStation?.station.id === station.station.id) {
      togglePlayPause();
    } else {
      playStation(station);
    }
  };

  return (
    <div className="space-y-4 pb-24 px-4 pt-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black tracking-tight text-white flex items-center space-x-2">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            <span>MY FAVORITES</span>
          </h2>
          <p className="text-xs text-sxm-muted">
            Quick access to your preferred AzuraCast channels
          </p>
        </div>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sxm-card border border-sxm-border text-sxm-muted">
          {favoriteStations.length} Saved
        </span>
      </div>

      {favoriteStations.length === 0 ? (
        <div className="text-center py-16 px-6 bg-sxm-surface rounded-3xl border border-sxm-border/60">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-3">
            <Heart className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            No Favorite Channels Yet
          </h3>
          <p className="text-xs text-sxm-muted max-w-xs mx-auto mb-4">
            Tap the heart icon on any channel in the Guide or Player to add it to your SiriusXM quick list.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2.5">
          {favoriteStations.map((station) => {
            const isPlayingThis = isCurrentPlayingStation(station);
            const channelNum = station.channel_number || station.station.id;
            const song = station.now_playing?.song;

            return (
              <div
                key={station.station.id}
                onClick={() => handleStationClick(station)}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer active:scale-[0.99] ${
                  isPlayingThis
                    ? 'bg-sxm-card border-sxm-accent/50 shadow-glow-accent'
                    : 'bg-sxm-card/70 border-sxm-border/60 hover:bg-sxm-card'
                }`}
              >
                <div className="flex items-center space-x-3.5 min-w-0 flex-1 pr-2">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-black flex-shrink-0 shadow-md">
                    <img
                      src={song?.art || '/logo.svg'}
                      alt={station.station.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 left-1 text-[8px] font-black px-1 rounded bg-black/80 text-white">
                      CH {channelNum}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-white truncate">
                      {station.station.name}
                    </div>
                    <div className="text-xs text-white/90 truncate">
                      {song?.title || station.category}
                    </div>
                    <div className="text-[11px] text-sxm-muted truncate">
                      {song?.artist || station.station.description}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(station.station.id);
                    }}
                    className="p-2 text-red-500 hover:text-white rounded-full active:scale-90 transition-transform"
                    aria-label="Remove favorite"
                  >
                    <Heart className="w-5 h-5 fill-red-500" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStationClick(station);
                    }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      isPlayingThis
                        ? 'bg-sxm-accent text-black scale-105'
                        : 'bg-white text-black hover:scale-105'
                    }`}
                  >
                    {isPlayingThis ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current translate-x-0.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
