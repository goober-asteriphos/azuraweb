import React from 'react';
import { Play, Pause, Heart, Radio, Music, Volume2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { AzuraCastNowPlaying } from '../types/azuracast';

interface GuideViewProps {
  stations: AzuraCastNowPlaying[];
}

export const GuideView: React.FC<GuideViewProps> = ({ stations }) => {
  const {
    currentStation,
    isPlaying,
    playStation,
    togglePlayPause,
    toggleFavorite,
    isFavorite,
  } = usePlayer();

  // Sort channels numerically by channel number
  const sortedStations = [...stations].sort(
    (a, b) => (a.channel_number || a.station.id) - (b.channel_number || b.station.id)
  );

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
          <h2 className="text-lg font-black tracking-tight text-white">
            CHANNEL GUIDE
          </h2>
          <p className="text-xs text-sxm-muted">
            All channels broadcasting on your AzuraCast instance
          </p>
        </div>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sxm-card border border-sxm-border text-sxm-muted">
          {sortedStations.length} Channels
        </span>
      </div>

      {sortedStations.length === 0 ? (
        <div className="text-center py-20 px-6 space-y-3 bg-sxm-surface rounded-3xl border border-sxm-border/60">
          <div className="w-14 h-14 rounded-full bg-sxm-card flex items-center justify-center mx-auto text-sxm-muted">
            <Radio className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">No Channels to Display</h3>
          <p className="text-xs text-sxm-muted">
            No stations found matching this category or connection.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-sxm-border/40 bg-sxm-surface rounded-3xl border border-sxm-border/60 overflow-hidden shadow-xl">
          {sortedStations.map((station) => {
          const isPlayingThis = isCurrentPlayingStation(station);
          const isFav = isFavorite(station.station.id);
          const channelNum = station.channel_number || station.station.id;
          const song = station.now_playing?.song;

          return (
            <div
              key={station.station.id}
              onClick={() => handleStationClick(station)}
              className={`flex items-center justify-between p-3.5 transition-colors cursor-pointer active:bg-sxm-card-hover ${
                isPlayingThis ? 'bg-sxm-card/90' : 'hover:bg-sxm-card/50'
              }`}
            >
              {/* Channel Number Block (SiriusXM Signature Badge) */}
              <div className="flex items-center space-x-3.5 min-w-0 flex-1 pr-3">
                <div
                  className="flex flex-col items-center justify-center w-11 h-11 rounded-2xl bg-sxm-card border border-sxm-border flex-shrink-0 shadow-sm"
                  style={{
                    borderColor: isPlayingThis ? station.accent_color || '#00e5ff' : undefined,
                  }}
                >
                  <span
                    className="text-sm font-black tracking-tighter"
                    style={{ color: station.accent_color || '#00e5ff' }}
                  >
                    {channelNum < 10 ? `0${channelNum}` : channelNum}
                  </span>
                  <span className="text-[8px] font-bold text-sxm-muted uppercase tracking-widest leading-none">
                    CH
                  </span>
                </div>

                {/* Station & Live Metadata */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-white truncate">
                      {station.station.name}
                    </span>
                    <span className="text-[10px] font-semibold text-sxm-muted px-1.5 py-0.2 rounded bg-black/40 border border-white/5 whitespace-nowrap">
                      {station.category}
                    </span>
                  </div>

                  <div className="text-xs text-sxm-light/90 font-medium truncate mt-0.5">
                    {song?.title || 'Live Stream'}
                  </div>
                  <div className="text-[11px] text-sxm-muted truncate">
                    {song?.artist || station.station.description}
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(station.station.id);
                  }}
                  className="p-2 text-sxm-muted hover:text-white rounded-full active:scale-90 transition-transform"
                  aria-label="Favorite channel"
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      isFav ? 'text-red-500 fill-red-500' : 'text-sxm-muted'
                    }`}
                  />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStationClick(station);
                  }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    isPlayingThis
                      ? 'bg-sxm-accent text-black scale-105 shadow-glow-accent'
                      : 'bg-sxm-card text-sxm-light hover:bg-white hover:text-black border border-sxm-border'
                  }`}
                  aria-label={isPlayingThis ? 'Pause' : 'Play'}
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
