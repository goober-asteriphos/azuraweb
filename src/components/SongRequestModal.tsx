import React, { useState, useEffect } from 'react';
import { X, Search, Radio, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { AzuraCastRequestSong } from '../types/azuracast';
import { AzuraCastService } from '../services/azuracast';

export const SongRequestModal: React.FC = () => {
  const { currentStation, isRequestsOpen, setIsRequestsOpen, serverConfig } = usePlayer();
  const [requests, setRequests] = useState<AzuraCastRequestSong[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!isRequestsOpen || !currentStation) return;

    const loadRequests = async () => {
      setIsLoading(true);
      setStatusMessage(null);
      const service = new AzuraCastService(serverConfig);
      const data = await service.fetchRequests(currentStation.station.id);
      setRequests(data);
      setIsLoading(false);
    };

    loadRequests();
  }, [isRequestsOpen, currentStation, serverConfig]);

  if (!isRequestsOpen || !currentStation) return null;

  const filteredRequests = requests.filter(
    (r) =>
      r.song.title.toLowerCase().includes(search.toLowerCase()) ||
      r.song.artist.toLowerCase().includes(search.toLowerCase())
  );

  const handleRequestSubmit = async (req: AzuraCastRequestSong) => {
    setIsLoading(true);
    setStatusMessage(null);
    const service = new AzuraCastService(serverConfig);
    const result = await service.submitRequest(req.request_url);
    setIsLoading(false);

    if (result.success) {
      setStatusMessage({ text: result.message, type: 'success' });
      setTimeout(() => {
        setIsRequestsOpen(false);
      }, 2500);
    } else {
      setStatusMessage({ text: result.message, type: 'error' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-sxm-surface border-t border-sxm-border rounded-t-3xl max-h-[85vh] flex flex-col overflow-hidden pb-[env(safe-area-inset-bottom,16px)] animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-sxm-border/60">
          <div className="flex items-center space-x-2">
            <Radio className="w-5 h-5 text-sxm-neon" />
            <div>
              <h3 className="text-base font-bold text-white">Request a Song</h3>
              <p className="text-[11px] text-sxm-muted">{currentStation.station.name}</p>
            </div>
          </div>

          <button
            onClick={() => setIsRequestsOpen(false)}
            className="p-1.5 rounded-full bg-sxm-card text-sxm-muted hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback message */}
        {statusMessage && (
          <div
            className={`mx-4 mt-3 p-3 rounded-xl flex items-center space-x-2 text-xs font-semibold ${
              statusMessage.type === 'success'
                ? 'bg-sxm-neon/15 text-sxm-neon border border-sxm-neon/30'
                : 'bg-red-500/15 text-red-400 border border-red-500/30'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Search */}
        <div className="p-4 border-b border-sxm-border/40">
          <div className="relative">
            <Search className="w-4 h-4 text-sxm-muted absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search library by song title or artist..."
              className="w-full bg-sxm-card border border-sxm-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-sxm-muted focus:outline-none focus:border-sxm-accent"
            />
          </div>
        </div>

        {/* Request list */}
        <div className="overflow-y-auto p-4 space-y-2.5 flex-1">
          {isLoading && requests.length === 0 ? (
            <div className="text-center py-10 text-xs text-sxm-muted">
              Loading station request library...
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-10 text-xs text-sxm-muted">
              No matching tracks found in this station's request library.
            </div>
          ) : (
            filteredRequests.map((req) => (
              <div
                key={req.request_id}
                className="flex items-center justify-between p-3 rounded-2xl bg-sxm-card/70 border border-sxm-border/60 hover:bg-sxm-card transition-colors"
              >
                <div className="flex items-center space-x-3 overflow-hidden pr-2">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-black flex-shrink-0">
                    <img
                      src={req.song.art || '/logo.svg'}
                      alt={req.song.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white truncate">
                      {req.song.title}
                    </div>
                    <div className="text-[11px] text-sxm-muted truncate">
                      {req.song.artist}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleRequestSubmit(req)}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded-full bg-sxm-accent text-black font-bold text-xs flex items-center space-x-1 hover:brightness-110 active:scale-95 transition-all flex-shrink-0"
                >
                  <Send className="w-3 h-3" />
                  <span>Request</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
