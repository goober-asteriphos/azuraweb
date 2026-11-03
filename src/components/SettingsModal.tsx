import React, { useState } from 'react';
import {
  X,
  Server,
  Key,
  Wifi,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Share,
  PlusSquare,
  RefreshCw,
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { ServerConfig } from '../types/azuracast';
import { AzuraCastService } from '../services/azuracast';

export const SettingsModal: React.FC = () => {
  const { isSettingsOpen, setIsSettingsOpen, serverConfig, updateServerConfig } = usePlayer();

  const [baseUrl, setBaseUrl] = useState(serverConfig.baseUrl);
  const [apiKey, setApiKey] = useState(serverConfig.apiKey || '');
  const [autoReconnect, setAutoReconnect] = useState(serverConfig.autoReconnect);
  const [preferredQuality, setPreferredQuality] = useState(serverConfig.preferredQuality);

  const [testStatus, setTestStatus] = useState<{
    testing: boolean;
    success?: boolean;
    message?: string;
  }>({ testing: false });

  if (!isSettingsOpen) return null;

  const handleTestConnection = async () => {
    if (!baseUrl) {
      setTestStatus({
        testing: false,
        success: false,
        message: 'Please enter your AzuraCast server URL first.',
      });
      return;
    }

    setTestStatus({ testing: true });
    const res = await AzuraCastService.testConnection(baseUrl, apiKey || undefined);
    if (res.ok) {
      setTestStatus({
        testing: false,
        success: true,
        message: `Connected successfully! Found ${res.count} station(s).`,
      });
    } else {
      setTestStatus({
        testing: false,
        success: false,
        message: res.error || 'Could not connect. Ensure CORS or SSL is enabled.',
      });
    }
  };

  const handleSave = () => {
    const updated: ServerConfig = {
      baseUrl: baseUrl.trim(),
      apiKey: apiKey.trim() || undefined,
      isDemo: false,
      autoReconnect,
      preferredQuality,
    };
    updateServerConfig(updated);
    setIsSettingsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-sxm-surface border-t border-sxm-border rounded-t-3xl max-h-[90vh] flex flex-col overflow-hidden pb-[env(safe-area-inset-bottom,20px)] animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-sxm-border/60">
          <div className="flex items-center space-x-2">
            <Server className="w-5 h-5 text-sxm-accent" />
            <div>
              <h3 className="text-base font-bold text-white">AzuraCast Settings</h3>
              <p className="text-[11px] text-sxm-muted">Configure server connection & audio</p>
            </div>
          </div>

          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1.5 rounded-full bg-sxm-card text-sxm-muted hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="overflow-y-auto p-5 space-y-5">
          {/* Active Connected Instance Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-sxm-card to-sxm-surface border border-sxm-neon/30 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-sxm-neon animate-pulse" />
                <span className="text-sm font-bold text-white">Connected AzuraCast Instance</span>
              </div>
              <p className="text-[11px] text-sxm-muted truncate max-w-[280px]">
                {baseUrl || 'No instance URL configured'}
              </p>
            </div>
          </div>

          {/* AzuraCast Instance URL */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-white uppercase tracking-wider">
              AzuraCast Server URL
            </label>
            <div className="relative">
              <input
                type="url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://radio.asteriphos.com"
                className="w-full bg-sxm-card border border-sxm-border rounded-xl px-4 py-3 text-sm text-white placeholder-sxm-muted focus:outline-none focus:border-sxm-accent"
              />
            </div>
            <p className="text-[11px] text-sxm-muted">
              Defaulted from your <code className="text-sxm-accent font-mono text-[10px]">VITE_AZURACAST_BASE_URL</code> environment variable.
            </p>

            {/* Test connection button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testStatus.testing || !baseUrl}
                className="px-4 py-2 rounded-xl bg-sxm-card hover:bg-sxm-card-hover border border-sxm-border text-xs font-bold text-white flex items-center space-x-2 active:scale-95 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testStatus.testing ? 'animate-spin' : ''}`} />
                <span>{testStatus.testing ? 'Testing Connection...' : 'Test Server Connection'}</span>
              </button>
            </div>

            {testStatus.message && (
              <div
                className={`p-3 rounded-xl flex items-center space-x-2 text-xs font-semibold ${
                  testStatus.success
                    ? 'bg-sxm-neon/15 text-sxm-neon border border-sxm-neon/30'
                    : 'bg-red-500/15 text-red-400 border border-red-500/30'
                }`}
              >
                {testStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{testStatus.message}</span>
              </div>
            )}
          </div>

          {/* API Key (Optional) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-white uppercase tracking-wider">
                AzuraCast API Key (Optional)
              </label>
              <span className="text-[10px] text-sxm-muted">For restricted stations/requests</span>
            </div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Your AzuraCast API key..."
              className="w-full bg-sxm-card border border-sxm-border rounded-xl px-4 py-3 text-sm text-white placeholder-sxm-muted focus:outline-none focus:border-sxm-accent"
            />
          </div>

          {/* Audio stream preferences */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-white uppercase tracking-wider">
              Preferred Stream Bitrate
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['auto', 'high', 'standard', 'low'] as const).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setPreferredQuality(q)}
                  className={`py-2 rounded-xl text-xs font-bold capitalize border transition-all ${
                    preferredQuality === q
                      ? 'bg-sxm-accent text-black border-sxm-accent shadow-sm'
                      : 'bg-sxm-card text-sxm-muted border-sxm-border hover:text-white'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* iPhone Home Screen Guide */}
          <div className="p-4 rounded-2xl bg-sxm-card border border-sxm-border space-y-2.5">
            <div className="flex items-center space-x-2 text-white">
              <Smartphone className="w-4 h-4 text-sxm-accent" />
              <span className="text-xs font-bold uppercase tracking-wider">
                iPhone Safari Installation Guide
              </span>
            </div>
            <p className="text-[11px] text-sxm-muted leading-relaxed">
              To enjoy lock screen playback, Dynamic Island controls, and a full-screen app experience without Safari address bars:
            </p>
            <ol className="text-xs text-white/90 space-y-1.5 pl-1">
              <li className="flex items-center space-x-2">
                <span className="w-4 h-4 rounded-full bg-sxm-border flex items-center justify-center text-[10px] font-bold">
                  1
                </span>
                <span>
                  Tap the <Share className="w-3.5 h-3.5 inline mx-1 text-sxm-accent" /> Share button in Safari
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-4 h-4 rounded-full bg-sxm-border flex items-center justify-center text-[10px] font-bold">
                  2
                </span>
                <span>
                  Scroll down & select <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-sxm-accent" /> "Add to Home Screen"
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-4 h-4 rounded-full bg-sxm-border flex items-center justify-center text-[10px] font-bold">
                  3
                </span>
                <span>Launch from your iPhone home screen!</span>
              </li>
            </ol>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-sxm-border/60 bg-sxm-surface">
          <button
            onClick={handleSave}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sxm-blue to-sxm-accent text-black font-black text-sm tracking-wide shadow-glow-accent hover:brightness-110 active:scale-[0.98] transition-all"
          >
            Save & Connect
          </button>
        </div>
      </div>
    </div>
  );
};
