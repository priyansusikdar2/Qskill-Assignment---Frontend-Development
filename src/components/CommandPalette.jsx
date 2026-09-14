import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Languages, 
  Shuffle, 
  Code2, 
  KeyRound, 
  Trash2, 
  Sparkles, 
  CornerDownLeft, 
  X 
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, translationCache } from '../services/translationService';
import { sounds } from '../utils/audioFeedback';

export default function CommandPalette({ isOpen, onClose, onOpenApiModal, onSelectLanguage }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
      sounds.playPop();
    }
  }, [isOpen]);

  const commands = [
    {
      id: 'goto-translator',
      title: 'Navigate: Task 1 (Text Translator)',
      category: 'Navigation',
      icon: Languages,
      action: () => navigate('/translator'),
    },
    {
      id: 'goto-random',
      title: 'Navigate: Task 2 (Random String Studio)',
      category: 'Navigation',
      icon: Shuffle,
      action: () => navigate('/random-string'),
    },
    {
      id: 'goto-architecture',
      title: 'Navigate: Hook Architecture Guide',
      category: 'Navigation',
      icon: Code2,
      action: () => navigate('/architecture'),
    },
    {
      id: 'open-rapidapi',
      title: 'Settings: Configure RapidAPI Key',
      category: 'Settings',
      icon: KeyRound,
      action: onOpenApiModal,
    },
    {
      id: 'clear-cache',
      title: 'Cache: Invalidate LRU Translation Cache',
      category: 'System',
      icon: Trash2,
      action: () => {
        translationCache.clear();
        sounds.playSuccess();
      },
    },
    ...SUPPORTED_LANGUAGES.map((l) => ({
      id: `lang-${l.code}`,
      title: `Set Target: ${l.flag} ${l.name} (${l.native})`,
      category: 'Languages',
      icon: Languages,
      action: () => {
        if (onSelectLanguage) onSelectLanguage(l.code);
        navigate('/translator');
      },
    })),
  ];

  const filtered = commands.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  const executeCommand = (cmd) => {
    sounds.playClick();
    cmd.action();
    onClose();
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        executeCommand(filtered[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        {/* Search Header */}
        <div className="relative flex items-center px-4 border-b border-slate-800 bg-slate-950/80">
          <Search className="w-5 h-5 text-indigo-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, route, or target language..."
            className="w-full py-3.5 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <span className="hidden sm:inline text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            Esc to close
          </span>
        </div>

        {/* Command list */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-800/40">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching commands found for "{query}".
            </div>
          ) : (
            filtered.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => executeCommand(cmd)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-xs transition-colors ${
                    isSelected ? 'bg-indigo-600/90 text-white' : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-indigo-400'}`} />
                    <span className="font-medium truncate">{cmd.title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-mono ${
                      isSelected ? 'bg-indigo-700/80 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {cmd.category}
                    </span>
                    {isSelected && <CornerDownLeft className="w-3.5 h-3.5" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-500">
          <span>Navigate with <kbd className="font-mono text-slate-400">↑</kbd> <kbd className="font-mono text-slate-400">↓</kbd></span>
          <span>Select with <kbd className="font-mono text-slate-400">↵ Enter</kbd></span>
        </div>
      </div>
    </div>
  );
}
