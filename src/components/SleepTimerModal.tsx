import React from 'react';
import { X, Moon, Check } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export const SleepTimerModal: React.FC = () => {
  const {
    isSleepTimerOpen,
    setIsSleepTimerOpen,
    sleepTimerMinutes,
    sleepTimerRemaining,
    setSleepTimer,
  } = usePlayer();

  if (!isSleepTimerOpen) return null;

  const timerOptions = [15, 30, 45, 60, 90];

  const handleSelect = (mins: number) => {
    setSleepTimer(mins);
    setIsSleepTimerOpen(false);
  };

  const handleCancel = () => {
    setSleepTimer(null);
    setIsSleepTimerOpen(false);
  };

  const formatRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-sxm-surface border-t border-sxm-border rounded-t-3xl p-5 pb-[env(safe-area-inset-bottom,20px)] animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-sxm-border/60">
          <div className="flex items-center space-x-2">
            <Moon className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-base font-bold text-white">Sleep Timer</h3>
              <p className="text-[11px] text-sxm-muted">
                {sleepTimerRemaining
                  ? `Active: ${formatRemaining(sleepTimerRemaining)} remaining`
                  : 'Stops playback automatically'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSleepTimerOpen(false)}
            className="p-1.5 rounded-full bg-sxm-card text-sxm-muted hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="py-4 space-y-2">
          {timerOptions.map((mins) => {
            const isSelected = sleepTimerMinutes === mins;
            return (
              <button
                key={mins}
                onClick={() => handleSelect(mins)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border text-sm font-semibold transition-all ${
                  isSelected
                    ? 'bg-purple-600/20 border-purple-500 text-white'
                    : 'bg-sxm-card/70 border-sxm-border/60 text-sxm-light hover:bg-sxm-card'
                }`}
              >
                <span>{mins} minutes</span>
                {isSelected && <Check className="w-4 h-4 text-purple-400" />}
              </button>
            );
          })}

          {sleepTimerRemaining !== null && (
            <button
              onClick={handleCancel}
              className="w-full py-3 rounded-2xl border border-red-500/40 text-red-400 text-sm font-bold bg-red-500/10 hover:bg-red-500/20 transition-all mt-2"
            >
              Turn Off Timer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
