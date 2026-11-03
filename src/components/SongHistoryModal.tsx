import React from 'react';
import { X, Clock, Music } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export const SongHistoryModal: React.FC = () => {
  const { currentStation, isHistoryOpen, setIsHistoryOpen } = usePlayer();

  if (!isHistoryOpen || !currentStation) return null;

  const history = currentStation.song_history || [];

  const formatPlayedAt = (timestamp: number) => {
    const diff = Math.floor(Date.now() / 1000) - timestamp;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-sxm-surface border-t border-sxm-border rounded-t-3xl max-h-[80vh] flex flex-col overflow-hidden pb-[env(safe-area-inset-bottom,16px)] animate-slideUp">
        {/* Top bar with drag handle */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-sxm-border/60">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-sxm-accent" />
            <div>
              <h3 className="text-base font-bold text-white">Recently Played</h3>
              <p className="text-[11px] text-sxm-muted">{currentStation.station.name}</p>
            </div>
          </div>

          <button
            onClick={() => setIsHistoryOpen(false)}
            className="p-1.5 rounded-full bg-sxm-card text-sxm-muted hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of past songs */}
        <div className="overflow-y-auto p-4 space-y-2.5">
          {history.length === 0 ? (
            <div className="text-center py-10 text-sxm-muted text-xs">
              No recent song history recorded yet on this station.
            </div>
          ) : (
            history.map((item, index) => {
              const song = item.song;
              return (
                <div
                  key={item.sh_id || index}
                  className="flex items-center space-x-3 p-2.5 rounded-xl bg-sxm-card/70 border border-sxm-border/40"
                >
                  <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-black flex-shrink-0">
                    <img
                      src={song.art || '/logo.svg'}
                      alt={song.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white truncate">
                      {song.title}
                    </div>
                    <div className="text-[11px] text-sxm-muted truncate">
                      {song.artist}
                    </div>
                  </div>
                  <div className="text-[10px] font-semibold text-sxm-muted flex-shrink-0">
                    {formatPlayedAt(item.played_at)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
