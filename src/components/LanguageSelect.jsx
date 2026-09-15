import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../services/translationService';
import { sounds } from '../utils/audioFeedback';

export default function LanguageSelect({ 
  value, 
  onChange, 
  options = SUPPORTED_LANGUAGES, 
  placeholder = "Filter languages...",
  className = '' 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const selectedLang = options.find((l) => l.code === value) || options[0];

  // Filter languages
  const filteredLanguages = options.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      (l.native && l.native.toLowerCase().includes(search.toLowerCase())) ||
      l.code.toLowerCase().includes(search.toLowerCase())
  );

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (code) => {
    sounds.playClick();
    onChange(code);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          sounds.playClick();
          setIsOpen(!isOpen);
          setSearch('');
        }}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-bg hairline hover:border-zinc-600 text-xs text-zinc-100 font-medium transition-all cursor-pointer shadow-subtle group"
      >
        <span className="text-sm shrink-0">{selectedLang.flag}</span>
        <span className="truncate max-w-[110px] font-sans">{selectedLang.name}</span>
        {selectedLang.code !== 'auto' && (
          <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">({selectedLang.code.toUpperCase()})</span>
        )}
        <ChevronDown className={`w-3 h-3 text-zinc-400 group-hover:text-zinc-200 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-50 w-64 bg-panel hairline shadow-modal rounded-xl overflow-hidden animate-slide-down">
          {/* Search Header */}
          <div className="p-2 hairline-b bg-bg-subtle flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-transparent text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none font-sans"
            />
          </div>

          {/* List of Languages */}
          <div className="max-h-56 overflow-y-auto p-1 space-y-0.5">
            {filteredLanguages.length === 0 ? (
              <div className="py-4 text-center text-xs text-zinc-500 font-mono">
                No language found
              </div>
            ) : (
              filteredLanguages.map((l) => {
                const isSelected = l.code === value;
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => handleSelect(l.code)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer text-left ${
                      isSelected
                        ? 'bg-zinc-800 text-zinc-100 font-semibold'
                        : 'text-zinc-300 hover:bg-zinc-800/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-sm">{l.flag}</span>
                      <span className="truncate">{l.name}</span>
                      {l.native && <span className="text-[10px] text-zinc-500 font-normal">({l.native})</span>}
                    </div>
                    {isSelected && <Check className="w-3 h-3 text-status-emerald shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
