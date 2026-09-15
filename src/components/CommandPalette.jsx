import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Languages, 
  Shuffle, 
  Code2, 
  KeyRound, 
  Trash2, 
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
      title: 'Credentials: Configure RapidAPI & Secrets',
      category: 'Settings',
      icon: KeyRound,
      action: onOpenApiModal,
    },
    {
      id: 'clear-cache',
      title: 'Cache: Invalidate LRU Memory Translation Cache',
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-xl bg-panel hairline shadow-modal rounded-xl overflow-hidden animate-slide-down"
        onKeyDown={handleKeyDown}
      >
        {/* Search Header */}
        <div className="relative flex items-center px-3.5 hairline-b bg-bg-subtle">
          <Search className="w-4 h-4 text-zinc-400 shrink-0 mr-2.5" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search commands, navigate routes, or set language..."
            className="w-full py-3 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none font-sans"
          />
          <kbd className="hidden sm:inline text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
            Esc
          </kbd>
        </div>

        {/* Command list */}
        <div className="max-h-80 overflow-y-auto p-1.5 space-y-0.5">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500 font-mono">
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
                  className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-xs transition-colors ${
                    isSelected 
                      ? 'bg-zinc-800 text-zinc-100' 
                      : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-accent-400' : 'text-zinc-500'}`} />
                    <span className="truncate font-medium">{cmd.title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      isSelected ? 'bg-zinc-700 text-zinc-200' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                    }`}>
                      {cmd.category}
                    </span>
                    {isSelected && <CornerDownLeft className="w-3 h-3 text-zinc-400" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-3.5 py-2 hairline-t bg-bg-subtle flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <div className="flex items-center gap-2">
            <span><kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-300">↑</kbd> <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-300">↓</kbd> to navigate</span>
            <span className="text-zinc-700">•</span>
            <span><kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-300">↵</kbd> to execute</span>
          </div>
          <span className="text-zinc-600">{filtered.length} items</span>
        </div>
      </div>
    </div>
  );
}
