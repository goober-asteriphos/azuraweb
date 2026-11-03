import React from 'react';
import {
  ChevronDown,
  Heart,
  Share2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Zap,
  ListMusic,
  Moon,
  Radio,
  Sliders,
  Users,
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export const NowPlayingModal: React.FC = () => {
  const {
    currentStation,
    isPlaying,
    isBuffering,
    togglePlayPause,
    playNextStation,
    playPreviousStation,
    rewind15,
    jumpToLive,
    isLiveEdge,
    liveElapsed,
    isNowPlayingExpanded,
    setIsNowPlayingExpanded,
    toggleFavorite,
    isFavorite,
    setIsHistoryOpen,
    setIsRequestsOpen,
    setIsSleepTimerOpen,
    sleepTimerRemaining,
    selectedMount,
    setMount,
  } = usePlayer();

  if (!isNowPlayingExpanded || !currentStation) return null;

  const song = currentStation.now_playing?.song;
  const station = currentStation.station;
  const channelNum = currentStation.channel_number || station.id;
  const isFav = isFavorite(station.id);
  const duration = currentStation.now_playing?.duration || 240;
  const remaining = Math.max(0, duration - liveElapsed);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleShare = async () => {
    const text = `Listening to ${song?.title || 'music'} by ${song?.artist || station.name} on ${station.name}!`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: station.name,
          text: text,
          url: window.location.href,
        });
      } catch {
        // user cancelled
      }
    } else {
      navigator.clipboard?.writeText(text);
      alert('Track info copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-sxm-bg text-white animate-slideUp overflow-hidden">
      {/* Dynamic blurred ambient artwork background */}
      <div
        className="absolute inset-0 opacity-25 filter blur-3xl scale-125 pointer-events-none transition-all duration-1000"
        style={{
          backgroundImage: `url(${song?.art || '/logo.svg'})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      />
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0b0e]/80 via-[#0a0b0e]/95 to-[#0a0b0e] pointer-events-none" />

      {/* Sheet Content Container */}
      <div className="relative z-10 flex flex-col h-full justify-between pt-[env(safe-area-inset-top,16px)] pb-[env(safe-area-inset-bottom,20px)] px-6">
        
        {/* Top Header: Dismiss, Station Name, Favorite & Share */}
        <div>
          <div className="flex items-center justify-between py-2">
            <button
              onClick={() => setIsNowPlayingExpanded(false)}
              className="p-2 -ml-2 text-sxm-muted hover:text-white rounded-full active:scale-90 transition-transform"
              aria-label="Collapse player"
            >
              <ChevronDown className="w-7 h-7" />
            </button>

            {/* Station Title & Channel Number */}
            <div className="text-center">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-sxm-card/80 border border-sxm-border text-xs font-bold">
                <span className="text-sxm-accent">CH {channelNum}</span>
                <span className="text-white/40">•</span>
                <span className="text-white">{station.name}</span>
              </div>
            </div>

            <div className="flex items-center space-x-1 -mr-2">
              <button
                onClick={() => toggleFavorite(station.id)}
                className="p-2 text-sxm-muted hover:text-white rounded-full active:scale-90 transition-transform"
                aria-label="Favorite station"
              >
                <Heart
                  className={`w-6 h-6 transition-colors ${
                    isFav ? 'text-red-500 fill-red-500 scale-110' : 'text-sxm-muted'
                  }`}
                />
              </button>
              <button
                onClick={handleShare}
                className="p-2 text-sxm-muted hover:text-white rounded-full active:scale-90 transition-transform"
                aria-label="Share"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Live DJ Streamer Banner if active */}
          {currentStation.live?.is_live && (
            <div className="mt-1 flex items-center justify-center space-x-2 text-xs font-semibold text-sxm-neon bg-sxm-neon/10 border border-sxm-neon/20 py-1 px-3 rounded-full mx-auto w-fit">
              <span className="w-2 h-2 rounded-full bg-sxm-neon animate-pulse" />
              <span>LIVE DJ: {currentStation.live.streamer_name || 'On Air'}</span>
            </div>
          )}
        </div>

        {/* Center: Album Artwork */}
        <div className="flex-1 flex items-center justify-center my-4 py-2">
          <div className="relative w-full max-w-[320px] aspect-square rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
            <img
              src={song?.art || '/logo.svg'}
              alt={song?.title || station.name}
              className="w-full h-full object-cover transition-transform duration-700 ease-out"
            />
            {/* Subtle gloss reflection overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10 pointer-events-none" />

            {/* Equalizer animation badge */}
            {isPlaying && (
              <div className="absolute top-4 left-4 flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                <span className="w-1 bg-sxm-accent rounded-full animate-eq-1" />
                <span className="w-1 bg-sxm-neon rounded-full animate-eq-2" />
                <span className="w-1 bg-sxm-accent rounded-full animate-eq-3" />
                <span className="text-[11px] font-bold text-white tracking-wider ml-1 uppercase">
                  LIVE
                </span>
              </div>
            )}

            {/* Listener count badge */}
            {currentStation.listeners?.current > 0 && (
              <div className="absolute bottom-4 right-4 flex items-center space-x-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-medium text-white/90">
                <Users className="w-3.5 h-3.5 text-sxm-accent" />
                <span>{currentStation.listeners.current.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Track Metadata & Scrubber */}
        <div className="space-y-4">
          <div className="text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-sxm-accent uppercase">
                {currentStation.category || song?.genre || 'SiriusXM AzuraCast'}
              </span>
              {/* Mount / Quality Pill */}
              {station.mounts && station.mounts.length > 1 && (
                <div className="flex items-center space-x-1">
                  {station.mounts.map((mount) => {
                    const isMountSelected = selectedMount?.id === mount.id || (!selectedMount && mount.is_default);
                    return (
                      <button
                        key={mount.id}
                        onClick={() => setMount(mount)}
                        className={`text-[10px] px-2 py-0.5 rounded font-bold transition-colors ${
                          isMountSelected
                            ? 'bg-sxm-accent text-black'
                            : 'bg-sxm-card text-sxm-muted hover:text-white'
                        }`}
                      >
                        {mount.bitrate ? `${mount.bitrate}k` : mount.format || 'Live'}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <h1 className="text-2xl font-black text-white mt-1 leading-tight tracking-tight line-clamp-1">
              {song?.title || station.name}
            </h1>
            <p className="text-base font-semibold text-sxm-muted mt-0.5 line-clamp-1">
              {song?.artist || station.description}
            </p>
            {song?.album && (
              <p className="text-xs text-sxm-muted/80 mt-0.5 truncate">
                {song.album}
              </p>
            )}
          </div>

          {/* Scrubber & Live status */}
          <div className="space-y-1.5">
            <div className="relative w-full bg-sxm-border h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sxm-blue via-sxm-accent to-sxm-neon rounded-full transition-all duration-1000 ease-linear"
                style={{
                  width: `${Math.min(100, (liveElapsed / duration) * 100)}%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-medium text-sxm-muted">
              <span>{formatTime(liveElapsed)}</span>

              <button
                onClick={jumpToLive}
                className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                  isLiveEdge
                    ? 'text-sxm-neon bg-sxm-neon/10'
                    : 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isLiveEdge ? 'bg-sxm-neon animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <span>{isLiveEdge ? 'LIVE' : 'GO LIVE'}</span>
              </button>

              <span>-{formatTime(remaining)}</span>
            </div>
          </div>

          {/* Main SiriusXM Transport Controls */}
          <div className="flex items-center justify-between px-2 pt-2 pb-1">
            {/* Previous Station */}
            <button
              onClick={playPreviousStation}
              className="p-3 text-sxm-light hover:text-white active:scale-90 transition-transform"
              aria-label="Previous station"
            >
              <SkipBack className="w-7 h-7" />
            </button>

            {/* Rewind 15s */}
            <button
              onClick={rewind15}
              className="p-2 text-sxm-muted hover:text-white active:scale-90 transition-transform flex flex-col items-center"
              aria-label="Rewind 15 seconds"
            >
              <RotateCcw className="w-5 h-5" />
              <span className="text-[9px] font-bold mt-0.5">15</span>
            </button>

            {/* Main Play / Pause glowing circle button */}
            <button
              onClick={togglePlayPause}
              className="w-18 h-18 w-[72px] h-[72px] rounded-full bg-white text-black flex items-center justify-center shadow-glow-blue active:scale-95 transition-transform"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isBuffering ? (
                <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-8 h-8 fill-current" />
              ) : (
                <Play className="w-8 h-8 fill-current translate-x-0.5" />
              )}
            </button>

            {/* Jump to Live Button */}
            <button
              onClick={jumpToLive}
              className="p-2 text-sxm-muted hover:text-white active:scale-90 transition-transform flex flex-col items-center"
              aria-label="Jump to live"
            >
              <Zap className={`w-5 h-5 ${isLiveEdge ? 'text-sxm-neon' : 'text-sxm-muted'}`} />
              <span className="text-[9px] font-bold mt-0.5">LIVE</span>
            </button>

            {/* Next Station */}
            <button
              onClick={playNextStation}
              className="p-3 text-sxm-light hover:text-white active:scale-90 transition-transform"
              aria-label="Next station"
            >
              <SkipForward className="w-7 h-7" />
            </button>
          </div>

          {/* Bottom Feature Actions: History, Request Song, Sleep Timer */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-sxm-border/40">
            {/* Song History */}
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-sxm-card/70 hover:bg-sxm-card border border-sxm-border/60 text-xs font-semibold text-sxm-light active:scale-95 transition-all"
            >
              <ListMusic className="w-4 h-4 text-sxm-accent" />
              <span>History</span>
            </button>

            {/* Request Song */}
            <button
              onClick={() => setIsRequestsOpen(true)}
              className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-sxm-card/70 hover:bg-sxm-card border border-sxm-border/60 text-xs font-semibold text-sxm-light active:scale-95 transition-all"
            >
              <Radio className="w-4 h-4 text-sxm-neon" />
              <span>Request</span>
            </button>

            {/* Sleep Timer */}
            <button
              onClick={() => setIsSleepTimerOpen(true)}
              className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-sxm-card/70 hover:bg-sxm-card border border-sxm-border/60 text-xs font-semibold text-sxm-light active:scale-95 transition-all relative"
            >
              <Moon className="w-4 h-4 text-purple-400" />
              <span>{sleepTimerRemaining ? `${Math.ceil(sleepTimerRemaining / 60)}m` : 'Sleep'}</span>
              {sleepTimerRemaining && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-purple-500 rounded-full animate-ping" />
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
