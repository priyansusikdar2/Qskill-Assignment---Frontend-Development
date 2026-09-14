import React from 'react';
import { X, QrCode, Download, Copy, Check } from 'lucide-react';
import { sounds } from '../utils/audioFeedback';

export default function QrCodeModal({ isOpen, onClose, token }) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !token) return null;

  // Use reliable lightweight QR SVG data representation
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    token
  )}&bgcolor=111827&color=6366f1&margin=10`;

  const handleCopy = () => {
    sounds.playSuccess();
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 text-center">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 mb-4 border border-indigo-500/20">
          <QrCode className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-white mb-1">Mobile Token QR Code</h3>
        <p className="text-xs text-slate-400 mb-5">
          Scan to quickly transfer this generated token to mobile devices
        </p>

        {/* QR Image Box */}
        <div className="flex items-center justify-center p-4 bg-slate-950 rounded-2xl border border-slate-800 mb-4">
          <img
            src={qrApiUrl}
            alt="Generated QR Code"
            className="w-48 h-48 rounded-xl"
            loading="lazy"
          />
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-slate-300 break-all select-all mb-4 max-h-20 overflow-y-auto">
          {token}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy String'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
