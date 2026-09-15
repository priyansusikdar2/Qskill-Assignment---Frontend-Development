import React from 'react';
import { X, QrCode, Copy, Check } from 'lucide-react';
import { sounds } from '../utils/audioFeedback';

export default function QrCodeModal({ isOpen, onClose, token }) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !token) return null;

  // Render high-contrast dark QR code
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    token
  )}&bgcolor=09090b&color=f4f4f5&margin=10`;

  const handleCopy = () => {
    sounds.playSuccess();
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-panel hairline shadow-modal rounded-xl overflow-hidden p-5 text-center animate-slide-down">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-zinc-800 text-zinc-200 mb-3 hairline">
          <QrCode className="w-5 h-5" />
        </div>

        <h3 className="text-sm font-semibold text-zinc-100 mb-1">Token QR Code</h3>
        <p className="text-xs text-zinc-400 mb-4">
          Scan to transfer this cryptographically generated string to mobile
        </p>

        {/* QR Image Box */}
        <div className="flex items-center justify-center p-3 bg-bg rounded-lg hairline mb-3">
          <img
            src={qrApiUrl}
            alt="Generated QR Code"
            className="w-44 h-44 rounded-md"
            loading="lazy"
          />
        </div>

        <div className="p-2 rounded-md bg-bg hairline font-mono text-xs text-zinc-300 break-all select-all mb-4 max-h-16 overflow-y-auto">
          {token}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition-colors cursor-pointer shadow-subtle"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-status-emerald" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Token'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
