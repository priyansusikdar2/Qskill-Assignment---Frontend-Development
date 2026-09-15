import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export default function NetworkBanner() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="bg-amber-950/80 hairline-b border-amber-800/60 text-amber-200 px-4 py-2 text-xs font-mono flex items-center justify-center gap-2 sticky top-0 z-50 animate-slide-down">
      <WifiOff className="w-3.5 h-3.5 text-amber-400" />
      <span>Network Offline: Live RapidAPI endpoints paused. Fallback and cache modes remain active.</span>
    </div>
  );
}
