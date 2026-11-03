import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { AzuraCastNowPlaying, AzuraCastMount, ServerConfig } from '../types/azuracast';
import { AzuraCastService } from '../services/azuracast';
import { DEMO_STATIONS } from '../data/demoStations';

interface PlayerContextType {
  // Data
  stations: AzuraCastNowPlaying[];
  currentStation: AzuraCastNowPlaying | null;
  selectedMount: AzuraCastMount | null;
  serverConfig: ServerConfig;
  isLoading: boolean;
  
  // Playback state
  isPlaying: boolean;
  isBuffering: boolean;
  volume: number;
  isMuted: boolean;
  liveElapsed: number;
  isLiveEdge: boolean;
  
  // Modals & Panels
  isNowPlayingExpanded: boolean;
  isHistoryOpen: boolean;
  isRequestsOpen: boolean;
  isSettingsOpen: boolean;
  isSleepTimerOpen: boolean;
  
  // Sleep timer
  sleepTimerMinutes: number | null;
  sleepTimerRemaining: number | null; // seconds
  
  // Favorites & Recents
  favorites: number[]; // station IDs
  recents: number[];   // station IDs
  
  // Actions
  playStation: (station: AzuraCastNowPlaying) => void;
  togglePlayPause: () => void;
  playNextStation: () => void;
  playPreviousStation: () => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  setMount: (mount: AzuraCastMount) => void;
  jumpToLive: () => void;
  rewind15: () => void;
  
  // UI toggles
  setIsNowPlayingExpanded: (open: boolean) => void;
  setIsHistoryOpen: (open: boolean) => void;
  setIsRequestsOpen: (open: boolean) => void;
  setIsSettingsOpen: (open: boolean) => void;
  setIsSleepTimerOpen: (open: boolean) => void;
  
  // Timer & Favorites
  setSleepTimer: (minutes: number | null) => void;
  toggleFavorite: (stationId: number) => void;
  isFavorite: (stationId: number) => boolean;
  
  // Config
  updateServerConfig: (config: ServerConfig) => void;
  refreshStations: () => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

const DEFAULT_CONFIG: ServerConfig = {
  baseUrl: (import.meta as any).env?.VITE_AZURACAST_BASE_URL || '',
  isDemo: !(import.meta as any).env?.VITE_AZURACAST_BASE_URL,
  autoReconnect: true,
  preferredQuality: 'auto',
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved configuration from localStorage
  const [serverConfig, setServerConfig] = useState<ServerConfig>(() => {
    try {
      const saved = localStorage.getItem('azurawave_config');
      return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  const [stations, setStations] = useState<AzuraCastNowPlaying[]>(DEMO_STATIONS);
  const [currentStation, setCurrentStation] = useState<AzuraCastNowPlaying | null>(DEMO_STATIONS[0]);
  const [selectedMount, setSelectedMount] = useState<AzuraCastMount | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [volume, setVolumeState] = useState<number>(0.9);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [liveElapsed, setLiveElapsed] = useState<number>(0);
  const [isLiveEdge, setIsLiveEdge] = useState<boolean>(true);

  // UI state
  const [isNowPlayingExpanded, setIsNowPlayingExpanded] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isRequestsOpen, setIsRequestsOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isSleepTimerOpen, setIsSleepTimerOpen] = useState<boolean>(false);

  // Sleep timer
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);

  // Favorites & Recents
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('azurawave_favorites');
      return saved ? JSON.parse(saved) : [1, 3];
    } catch {
      return [1, 3];
    }
  });

  const [recents, setRecents] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('azurawave_recents');
      return saved ? JSON.parse(saved) : [1, 2, 3];
    } catch {
      return [1, 2, 3];
    }
  });

  // Services & Audio element references
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const azuraServiceRef = useRef<AzuraCastService | null>(null);

  // Initialize service
  if (!azuraServiceRef.current) {
    azuraServiceRef.current = new AzuraCastService(serverConfig);
  }

  // Save favorites & config
  useEffect(() => {
    try {
      localStorage.setItem('azurawave_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.warn('LocalStorage save error', e);
    }
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem('azurawave_recents', JSON.stringify(recents));
    } catch (e) {
      console.warn('LocalStorage save error', e);
    }
  }, [recents]);

  useEffect(() => {
    try {
      localStorage.setItem('azurawave_config', JSON.stringify(serverConfig));
    } catch (e) {
      console.warn('LocalStorage save error', e);
    }
  }, [serverConfig]);

  // Create Audio instance with iOS Safari support
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'none';
    audio.setAttribute('playsinline', 'true');
    audio.setAttribute('webkit-playsinline', 'true');

    audio.onwaiting = () => setIsBuffering(true);
    audio.onplaying = () => {
      setIsBuffering(false);
      setIsPlaying(true);
    };
    audio.onpause = () => {
      setIsPlaying(false);
      setIsBuffering(false);
    };
    audio.onerror = (e) => {
      console.warn('Audio stream error, attempting recovery...', e);
      setIsBuffering(false);
      // Auto reconnect on stream hitch
      if (serverConfig.autoReconnect && isPlaying) {
        setTimeout(() => {
          if (audioRef.current && currentStation) {
            audioRef.current.load();
            audioRef.current.play().catch(() => {});
          }
        }, 1500);
      }
    };

    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Update MediaSession for iPhone Lock Screen & Control Center
  const updateMediaSession = useCallback(() => {
    if (!('mediaSession' in navigator) || !currentStation) return;

    const song = currentStation.now_playing?.song;
    const title = song?.title || currentStation.station.name;
    const artist = song?.artist || 'Live Broadcast';
    const album = `${currentStation.station.name} • Ch. ${currentStation.channel_number || currentStation.station.id}`;
    const art = song?.art || '/logo.svg';

    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist,
      album,
      artwork: [
        { src: art, sizes: '96x96', type: 'image/jpeg' },
        { src: art, sizes: '128x128', type: 'image/jpeg' },
        { src: art, sizes: '192x192', type: 'image/jpeg' },
        { src: art, sizes: '256x256', type: 'image/jpeg' },
        { src: art, sizes: '512x512', type: 'image/jpeg' },
      ],
    });

    navigator.mediaSession.setActionHandler('play', () => {
      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    });

    navigator.mediaSession.setActionHandler('previoustrack', () => {
      playPreviousStation();
    });

    navigator.mediaSession.setActionHandler('nexttrack', () => {
      playNextStation();
    });

    // Update Lock Screen elapsed track progress if supported
    if ('setPositionState' in navigator.mediaSession && currentStation.now_playing?.duration > 0) {
      try {
        navigator.mediaSession.setPositionState({
          duration: currentStation.now_playing.duration,
          playbackRate: 1,
          position: Math.min(liveElapsed, currentStation.now_playing.duration),
        });
      } catch (e) {
        // Safe ignore
      }
    }
  }, [currentStation, liveElapsed]);

  // Sync media session when station or track updates
  useEffect(() => {
    updateMediaSession();
  }, [updateMediaSession]);

  // Elapsed ticker
  useEffect(() => {
    const timer = setInterval(() => {
      if (currentStation?.now_playing) {
        const playedAt = currentStation.now_playing.played_at;
        if (playedAt) {
          const now = Math.floor(Date.now() / 1000);
          const computed = Math.max(0, now - playedAt);
          setLiveElapsed(computed);
        } else {
          setLiveElapsed((prev) => prev + 1);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentStation]);

  // Sleep timer ticker
  useEffect(() => {
    if (sleepTimerRemaining === null || sleepTimerRemaining <= 0) return;

    const interval = setInterval(() => {
      setSleepTimerRemaining((prev) => {
        if (prev === null || prev <= 1) {
          // Timer finished! Fade volume and pause
          if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
          }
          setSleepTimerMinutes(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerRemaining]);

  // Load stations & start real-time updates
  const refreshStations = useCallback(async () => {
    if (!azuraServiceRef.current) return;
    setIsLoading(true);
    try {
      const data = await azuraServiceRef.current.fetchNowPlaying();
      if (data && data.length > 0) {
        setStations(data);
        // If currentStation is set, refresh its info
        setCurrentStation((prev) => {
          if (!prev) return data[0];
          const found = data.find((s) => s.station.id === prev.station.id);
          return found || data[0];
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update server config
  const updateServerConfig = useCallback((newConfig: ServerConfig) => {
    setServerConfig(newConfig);
    if (azuraServiceRef.current) {
      azuraServiceRef.current.updateConfig(newConfig);
    }
    refreshStations();
  }, [refreshStations]);

  // Initial mount & sync hookup
  useEffect(() => {
    refreshStations();
    if (azuraServiceRef.current) {
      azuraServiceRef.current.startSync((updatedList) => {
        if (updatedList && updatedList.length > 0) {
          setStations(updatedList);
          setCurrentStation((prev) => {
            if (!prev) return updatedList[0];
            const updatedCurrent = updatedList.find((s) => s.station.id === prev.station.id);
            return updatedCurrent || prev;
          });
        }
      });
    }

    return () => {
      if (azuraServiceRef.current) {
        azuraServiceRef.current.stopSync();
      }
    };
  }, [refreshStations]);

  // Determine stream URL for a station
  const getStreamUrl = (station: AzuraCastNowPlaying, mount?: AzuraCastMount | null): string => {
    if (mount?.url) return mount.url;
    if (station.station.mounts && station.station.mounts.length > 0) {
      const defaultMount = station.station.mounts.find((m) => m.is_default) || station.station.mounts[0];
      return defaultMount.url;
    }
    return station.station.listen_url;
  };

  // Play a specific station
  const playStation = useCallback((station: AzuraCastNowPlaying, mountOverride?: AzuraCastMount) => {
    setCurrentStation(station);
    const chosenMount = mountOverride || (station.station.mounts?.find((m) => m.is_default) || station.station.mounts?.[0] || null);
    setSelectedMount(chosenMount);

    const streamUrl = getStreamUrl(station, chosenMount);
    if (!audioRef.current || !streamUrl) return;

    // Cache busting / live-edge parameter
    const liveStreamUrl = streamUrl.includes('?')
      ? `${streamUrl}&_live=${Date.now()}`
      : `${streamUrl}?_live=${Date.now()}`;

    setIsBuffering(true);
    audioRef.current.src = liveStreamUrl;
    audioRef.current.load();

    audioRef.current
      .play()
      .then(() => {
        setIsPlaying(true);
        setIsBuffering(false);
        setIsLiveEdge(true);
      })
      .catch((err) => {
        console.warn('Playback initiation error (iOS user gesture required):', err);
        setIsBuffering(false);
        setIsPlaying(false);
      });

    // Add to recents
    setRecents((prev) => {
      const filtered = prev.filter((id) => id !== station.station.id);
      return [station.station.id, ...filtered].slice(0, 8);
    });

    if (station.now_playing?.elapsed) {
      setLiveElapsed(station.now_playing.elapsed);
    }
  }, []);

  // Toggle play / pause
  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (!currentStation && stations.length > 0) {
        playStation(stations[0]);
      } else if (currentStation) {
        // If stream was paused for a while, reconnect to live edge
        const streamUrl = getStreamUrl(currentStation, selectedMount);
        audioRef.current.src = `${streamUrl}${streamUrl.includes('?') ? '&' : '?'}_live=${Date.now()}`;
        audioRef.current.load();
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((e) => console.warn('Play error:', e));
      }
    }
  }, [isPlaying, currentStation, stations, selectedMount, playStation]);

  // Next / Previous station navigation
  const playNextStation = useCallback(() => {
    if (stations.length === 0) return;
    const currentIndex = stations.findIndex((s) => s.station.id === currentStation?.station.id);
    const nextIndex = (currentIndex + 1) % stations.length;
    playStation(stations[nextIndex]);
  }, [stations, currentStation, playStation]);

  const playPreviousStation = useCallback(() => {
    if (stations.length === 0) return;
    const currentIndex = stations.findIndex((s) => s.station.id === currentStation?.station.id);
    const prevIndex = (currentIndex - 1 + stations.length) % stations.length;
    playStation(stations[prevIndex]);
  }, [stations, currentStation, playStation]);

  // Jump to live edge
  const jumpToLive = useCallback(() => {
    if (!currentStation || !audioRef.current) return;
    const streamUrl = getStreamUrl(currentStation, selectedMount);
    audioRef.current.src = `${streamUrl}${streamUrl.includes('?') ? '&' : '?'}_live=${Date.now()}`;
    audioRef.current.load();
    audioRef.current.play().then(() => {
      setIsLiveEdge(true);
      setIsPlaying(true);
    });
  }, [currentStation, selectedMount]);

  // Rewind 15s (simulated stream jump or buffer shift)
  const rewind15 = useCallback(() => {
    setIsLiveEdge(false);
    setLiveElapsed((prev) => Math.max(0, prev - 15));
  }, []);

  // Volume
  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
    if (clamped > 0) setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.muted = false;
      setIsMuted(false);
    } else {
      audioRef.current.muted = true;
      setIsMuted(true);
    }
  }, [isMuted]);

  // Mount selection
  const setMount = useCallback((mount: AzuraCastMount) => {
    setSelectedMount(mount);
    if (currentStation) {
      playStation(currentStation, mount);
    }
  }, [currentStation, playStation]);

  // Sleep timer
  const setSleepTimer = useCallback((minutes: number | null) => {
    setSleepTimerMinutes(minutes);
    setSleepTimerRemaining(minutes ? minutes * 60 : null);
  }, []);

  // Favorite toggle
  const toggleFavorite = useCallback((stationId: number) => {
    setFavorites((prev) => {
      if (prev.includes(stationId)) {
        return prev.filter((id) => id !== stationId);
      }
      // Haptic feedback if available on iOS
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate(25);
        } catch {
          // ignore
        }
      }
      return [...prev, stationId];
    });
  }, []);

  const isFavorite = useCallback((stationId: number) => {
    return favorites.includes(stationId);
  }, [favorites]);

  return (
    <PlayerContext.Provider
      value={{
        stations,
        currentStation,
        selectedMount,
        serverConfig,
        isLoading,
        isPlaying,
        isBuffering,
        volume,
        isMuted,
        liveElapsed,
        isLiveEdge,
        isNowPlayingExpanded,
        isHistoryOpen,
        isRequestsOpen,
        isSettingsOpen,
        isSleepTimerOpen,
        sleepTimerMinutes,
        sleepTimerRemaining,
        favorites,
        recents,
        playStation,
        togglePlayPause,
        playNextStation,
        playPreviousStation,
        setVolume,
        toggleMute,
        setMount,
        jumpToLive,
        rewind15,
        setIsNowPlayingExpanded,
        setIsHistoryOpen,
        setIsRequestsOpen,
        setIsSettingsOpen,
        setIsSleepTimerOpen,
        setSleepTimer,
        toggleFavorite,
        isFavorite,
        updateServerConfig,
        refreshStations,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
