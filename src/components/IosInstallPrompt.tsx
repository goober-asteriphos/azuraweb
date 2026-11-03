import React, { useState, useEffect } from 'react';
import { Share, PlusSquare, X, Smartphone } from 'lucide-react';

export const IosInstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(userAgent);
    
    // Check if running as standalone web app (PWA)
    const isStandalone = (window.navigator as any).standalone === true || window.matchMedia('(display-mode: standalone)').matches;

    // Check if dismissed previously in localStorage
    const dismissed = localStorage.getItem('azurawave_ios_prompt_dismissed');

    if (isIos && !isStandalone && !dismissed) {
      // Show after 3 seconds so user gets oriented first
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('azurawave_ios_prompt_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 bg-sxm-surface/95 backdrop-blur-xl border border-sxm-accent/40 rounded-2xl p-3.5 shadow-2xl animate-slideUp">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 pr-2">
          <div className="w-9 h-9 rounded-xl bg-sxm-accent/15 border border-sxm-accent/30 flex items-center justify-center flex-shrink-0 text-sxm-accent mt-0.5">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white leading-tight">
              Install AzuraWave on iPhone
            </h4>
            <p className="text-[11px] text-sxm-muted mt-1 leading-snug">
              Tap <Share className="w-3.5 h-3.5 inline mx-0.5 text-sxm-accent" /> then{' '}
              <strong className="text-white">"Add to Home Screen"</strong> for lock-screen media controls & SiriusXM fullscreen mode.
            </p>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-sxm-muted hover:text-white p-1 rounded-full"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
