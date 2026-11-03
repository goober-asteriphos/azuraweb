import React from 'react';
import { Play, Pause, Heart, Radio, Users, Sparkles, RefreshCw } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { AzuraCastNowPlaying } from '../types/azuracast';

interface HomeViewProps {
  filteredStations: AzuraCastNowPlaying[];
}

export const HomeView: React.FC<HomeViewProps> = ({ filteredStations }) => {
  const {
    currentStation,
    isPlaying,
    isBuffering,
    playStation,
    togglePlayPause,
    toggleFavorite,
    isFavorite,
    recents,
    stations,
    isLoading,
    refreshStations,
  } = usePlayer();

  // Featured station is either the one currently live with DJ, or the first station
  const featuredStation =
    stations.find((s) => s.live?.is_live) || stations[0] || null;

  // Filter recents stations
  const recentStations = recents
    .map((id) => stations.find((s) => s.station.id === id))
    .filter(Boolean) as AzuraCastNowPlaying[];

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

  // Loading Skeleton State
  if (isLoading && stations.length === 0) {
    return (
      <div className="space-y-6 pb-24 px-4 pt-3 animate-pulse">
        {/* Hero banner skeleton */}
        <div className="h-44 rounded-3xl bg-sxm-card/70 border border-sxm-border/40" />
        
        {/* Recents skeleton */}
        <div className="space-y-2">
          <div className="h-4 w-24 bg-sxm-card rounded" />
          <div className="flex space-x-3 overflow-hidden">
            <div className="w-32 h-36 bg-sxm-card/70 rounded-2xl flex-shrink-0" />
            <div className="w-32 h-36 bg-sxm-card/70 rounded-2xl flex-shrink-0" />
            <div className="w-32 h-36 bg-sxm-card/70 rounded-2xl flex-shrink-0" />
          </div>
        </div>

        {/* List skeleton */}
        <div className="space-y-2">
          <div className="h-4 w-32 bg-sxm-card rounded" />
          <div className="h-20 bg-sxm-card/60 rounded-2xl" />
          <div className="h-20 bg-sxm-card/60 rounded-2xl" />
          <div className="h-20 bg-sxm-card/60 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Empty State (if offline or server unreachable)
  if (stations.length === 0) {
    return (
      <div className="text-center py-20 px-6 space-y-4">
        <div className="w-16 h-16 rounded-full bg-sxm-accent/15 border border-sxm-accent/30 flex items-center justify-center mx-auto text-sxm-accent">
          <Radio className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-black text-white">No Channels Found</h3>
          <p className="text-xs text-sxm-muted max-w-xs mx-auto mt-1">
            Could not retrieve stations from your AzuraCast instance. Check your connection or server status.
          </p>
        </div>
        <button
          onClick={() => refreshStations()}
          className="px-5 py-2.5 rounded-2xl bg-sxm-accent text-black font-black text-xs inline-flex items-center space-x-2 active:scale-95 transition-transform"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 px-4 pt-3">
      {/* SiriusXM Signature Featured Hero Banner */}
      {featuredStation && (
        <div
          onClick={() => handleStationClick(featuredStation)}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sxm-surface via-sxm-card to-[#0d1017] border border-white/10 p-5 shadow-xl cursor-pointer group active:scale-[0.99] transition-transform"
        >
          {/* Blurred Background Art */}
          <div
            className="absolute inset-0 opacity-20 filter blur-xl scale-125 pointer-events-none group-hover:opacity-30 transition-opacity"
            style={{
              backgroundImage: `url(${featuredStation.now_playing?.song?.art || '/logo.svg'})`,
              backgroundPosition: 'center',
              backgroundSize: 'cover',
            }}
          />

          <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-sxm-accent/20 border border-sxm-accent/40 text-[11px] font-black text-sxm-accent uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-sxm-accent inline" />
                  <span>FEATURED</span>
                </span>
                <span className="text-[11px] font-black px-2 py-0.5 rounded bg-black/60 border border-white/10 text-white">
                  CH {featuredStation.channel_number || featuredStation.station.id}
                </span>
              </div>

              {featuredStation.live?.is_live && (
                <div className="flex items-center space-x-1 text-[11px] font-bold text-sxm-neon bg-sxm-neon/15 px-2.5 py-0.5 rounded-full border border-sxm-neon/30">
                  <span className="w-2 h-2 rounded-full bg-sxm-neon animate-pulse" />
                  <span>ON AIR</span>
                </div>
              )}
            </div>

            <div className="flex items-end justify-between">
              <div className="space-y-1 pr-3">
                <h2 className="text-2xl font-black text-white leading-tight">
                  {featuredStation.station.name}
                </h2>
                <p className="text-xs font-semibold text-sxm-muted line-clamp-1">
                  {featuredStation.now_playing?.song?.title
                    ? `${featuredStation.now_playing.song.title} • ${featuredStation.now_playing.song.artist}`
                    : featuredStation.station.description}
                </p>
                {featuredStation.listeners?.current > 0 && (
                  <div className="flex items-center space-x-1 text-[11px] text-white/70 pt-1">
                    <Users className="w-3 h-3 text-sxm-accent" />
                    <span>{featuredStation.listeners.current.toLocaleString()} listening now</span>
                  </div>
                )}
              </div>

              {/* Play Action Button */}
              <div className="flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStationClick(featuredStation);
                  }}
                  className="w-13 h-13 w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-glow-blue active:scale-95 transition-transform"
                >
                  {isCurrentPlayingStation(featuredStation) ? (
                    <Pause className="w-6 h-6 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 fill-current translate-x-0.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Tune / Recent Stations Horizontal Row */}
      {recentStations.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black tracking-wide text-white uppercase">
              Quick Tune
            </h3>
            <span className="text-[11px] font-semibold text-sxm-muted">
              Recent Channels
            </span>
          </div>

          <div className="flex items-center space-x-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
            {recentStations.map((station) => {
              const isPlayingThis = isCurrentPlayingStation(station);
              const channelNum = station.channel_number || station.station.id;

              return (
                <div
                  key={station.station.id}
                  onClick={() => handleStationClick(station)}
                  className="flex-shrink-0 w-32 bg-sxm-card rounded-2xl p-2.5 border border-sxm-border/60 hover:border-sxm-border transition-all cursor-pointer group active:scale-95"
                >
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black mb-2 shadow-md">
                    <img
                      src={station.now_playing?.song?.art || '/logo.svg'}
                      alt={station.station.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                    <div className="absolute top-1.5 left-1.5 text-[9px] font-black px-1.5 py-0.2 rounded bg-black/80 text-sxm-accent backdrop-blur-sm">
                      CH {channelNum}
                    </div>

                    {isPlayingThis && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center">
                        <div className="flex items-end space-x-0.5">
                          <span className="w-1 bg-sxm-accent rounded-full animate-eq-1" />
                          <span className="w-1 bg-sxm-neon rounded-full animate-eq-2" />
                          <span className="w-1 bg-sxm-accent rounded-full animate-eq-3" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-xs font-bold text-white truncate">
                    {station.station.name}
                  </div>
                  <div className="text-[10px] text-sxm-muted truncate">
                    {station.now_playing?.song?.title || station.category}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Main Channel Grid / List */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black tracking-wide text-white uppercase">
            Live Channels ({filteredStations.length})
          </h3>
        </div>

        <div className="space-y-2.5">
          {filteredStations.map((station) => {
            const isPlayingThis = isCurrentPlayingStation(station);
            const isFav = isFavorite(station.station.id);
            const channelNum = station.channel_number || station.station.id;
            const song = station.now_playing?.song;

            return (
              <div
                key={station.station.id}
                onClick={() => handleStationClick(station)}
                className={`relative flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer active:scale-[0.99] ${
                  isPlayingThis
                    ? 'bg-sxm-card border-sxm-accent/40 shadow-glow-accent'
                    : 'bg-sxm-card/70 border-sxm-border/60 hover:bg-sxm-card'
                }`}
              >
                {/* Left: Artwork, Channel Badge, Title, Song */}
                <div className="flex items-center space-x-3 overflow-hidden pr-2">
                  <div className="relative flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-black shadow-md border border-white/5">
                    <img
                      src={song?.art || '/logo.svg'}
                      alt={station.station.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-1 left-1 text-[9px] font-black px-1.5 py-0.2 rounded bg-black/80 text-white backdrop-blur-sm">
                      {channelNum}
                    </div>

                    {isPlayingThis && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="flex items-end space-x-0.5">
                          <span className="w-1 bg-sxm-accent rounded-full animate-eq-1" />
                          <span className="w-1 bg-sxm-neon rounded-full animate-eq-2" />
                          <span className="w-1 bg-sxm-accent rounded-full animate-eq-3" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1.5 mb-0.5">
                      <span className="text-xs font-bold text-white truncate">
                        {station.station.name}
                      </span>
                      {station.live?.is_live && (
                        <span className="text-[9px] font-bold text-sxm-neon uppercase">
                          • DJ
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-white/90 font-medium truncate">
                      {song?.title || station.station.description}
                    </div>
                    <div className="text-[11px] text-sxm-muted truncate">
                      {song?.artist || station.category}
                    </div>
                  </div>
                </div>

                {/* Right: Favorite + Play Trigger */}
                <div className="flex items-center space-x-1 flex-shrink-0">
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
                        ? 'bg-sxm-accent text-black scale-105'
                        : 'bg-white/10 text-white hover:bg-white hover:text-black'
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
      </section>
    </div>
  );
};
