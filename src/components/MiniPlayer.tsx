import React from 'react';
import { Play, Pause, SkipForward, Radio } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export const MiniPlayer: React.FC = () => {
  const {
    currentStation,
    isPlaying,
    isBuffering,
    togglePlayPause,
    playNextStation,
    setIsNowPlayingExpanded,
    liveElapsed,
  } = usePlayer();

  if (!currentStation) return null;

  const song = currentStation.now_playing?.song;
  const stationName = currentStation.station.name;
  const channelNum = currentStation.channel_number || currentStation.station.id;
  const duration = currentStation.now_playing?.duration || 240;
  const progressPercent = duration > 0 ? Math.min(100, (liveElapsed / duration) * 100) : 0;

  return (
    <div
      onClick={() => setIsNowPlayingExpanded(true)}
      className="relative z-20 cursor-pointer bg-gradient-to-r from-sxm-surface via-[#151821] to-sxm-surface border-t border-sxm-border/70 backdrop-blur-xl shadow-player transition-all active:scale-[0.99]"
      role="button"
      tabIndex={0}
      aria-label="Expand player"
    >
      {/* Top track progress bar */}
      <div className="w-full bg-sxm-border/40 h-[2.5px] overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-sxm-blue via-sxm-accent to-sxm-neon transition-all duration-1000 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between px-3.5 py-2.5">
        {/* Left: Station / Album Artwork with equalizer badge */}
        <div className="flex items-center space-x-3 overflow-hidden pr-2">
          <div className="relative flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-sxm-card shadow-md border border-white/5">
            <img
              src={song?.art || '/logo.svg'}
              alt={song?.title || stationName}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-end justify-center pb-1 space-x-0.5">
                <span className="w-0.5 bg-sxm-accent rounded-full animate-eq-1" />
                <span className="w-0.5 bg-sxm-neon rounded-full animate-eq-2" />
                <span className="w-0.5 bg-sxm-accent rounded-full animate-eq-3" />
              </div>
            )}
          </div>

          {/* Center Info: Channel, Title, Artist */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-1.5 mb-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-sxm-card text-sxm-accent border border-sxm-accent/20">
                CH {channelNum}
              </span>
              <span className="text-xs font-semibold text-sxm-muted truncate">
                {stationName}
              </span>
              {currentStation.live?.is_live && (
                <span className="text-[9px] font-bold text-sxm-neon uppercase tracking-wider">
                  • LIVE DJ
                </span>
              )}
            </div>

            <div className="text-sm font-bold text-white truncate leading-tight">
              {song?.title || stationName}
            </div>
            <div className="text-xs text-sxm-muted truncate leading-tight">
              {song?.artist || (currentStation.live?.is_live ? currentStation.live.streamer_name : 'Streaming live')}
            </div>
          </div>
        </div>

        {/* Right: Controls (Play/Pause, Next) */}
        <div className="flex items-center space-x-1 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlayPause();
            }}
            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isBuffering ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current translate-x-0.5" />
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              playNextStation();
            }}
            className="p-2 text-sxm-muted hover:text-white active:scale-90 transition-transform"
            aria-label="Next channel"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
