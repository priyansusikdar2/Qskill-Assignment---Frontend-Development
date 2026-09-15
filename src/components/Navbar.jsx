import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Languages, Shuffle, KeyRound, Code2, Volume2, VolumeX, Command } from 'lucide-react';
import { sounds } from '../utils/audioFeedback';

export default function Navbar({ onOpenApiModal, hasApiKey, apiSource, onOpenCommandPalette }) {
  const [audioEnabled, setAudioEnabled] = useState(true);

  const toggleSound = () => {
    sounds.enabled = !sounds.enabled;
    setAudioEnabled(sounds.enabled);
    if (sounds.enabled) sounds.playTone(600, 'sine', 0.05, 0.04);
  };

  const getStatusLabel = () => {
    if (apiSource === '.env') return 'RapidAPI (.env)';
    if (hasApiKey) return 'RapidAPI (Custom)';
    return 'Public Fallback';
  };

  return (
    <header className="sticky top-0 z-40 w-full hairline-b bg-bg/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Logo & Product Identity */}
          <Link to="/translator" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-panel-elevated hairline flex items-center justify-center text-zinc-100 group-hover:border-zinc-500 transition-colors">
              <span className="font-mono font-bold text-xs tracking-tighter">QS</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-zinc-100 tracking-tight">QSkill<span className="text-zinc-500 font-normal">Suite</span></span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                Slab 1
              </span>
            </div>
          </Link>

          {/* Precision Segmented Navigation */}
          <nav className="hidden md:flex items-center p-1 rounded-lg bg-panel hairline">
            <NavLink
              to="/translator"
              id="nav-translator"
              onClick={() => sounds.playClick()}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-panel-elevated text-zinc-100 shadow-subtle hairline text-white'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                }`
              }
            >
              <Languages className="w-3.5 h-3.5 text-zinc-400" />
              <span>Translator</span>
            </NavLink>

            <NavLink
              to="/random-string"
              id="nav-random-string"
              onClick={() => sounds.playClick()}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-panel-elevated text-zinc-100 shadow-subtle hairline text-white'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                }`
              }
            >
              <Shuffle className="w-3.5 h-3.5 text-zinc-400" />
              <span>Random Studio</span>
            </NavLink>

            <NavLink
              to="/architecture"
              id="nav-architecture"
              onClick={() => sounds.playClick()}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-panel-elevated text-zinc-100 shadow-subtle hairline text-white'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                }`
              }
            >
              <Code2 className="w-3.5 h-3.5 text-status-emerald" />
              <span>Hook Specs</span>
            </NavLink>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2">
            {/* Quick Command Trigger */}
            <button
              onClick={onOpenCommandPalette}
              className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-md hairline bg-panel text-xs text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-colors font-mono"
              title="Open Command Palette (Ctrl+K)"
            >
              <Command className="w-3 h-3 text-zinc-500" />
              <span className="text-[11px] text-zinc-500">Ctrl K</span>
            </button>

            {/* Tactile Audio Switch */}
            <button
              onClick={toggleSound}
              className={`p-1.5 rounded-md hairline text-xs transition-colors ${
                audioEnabled
                  ? 'bg-panel text-zinc-300 hover:text-white hover:border-zinc-600'
                  : 'bg-panel text-zinc-600 hover:text-zinc-400'
              }`}
              title={audioEnabled ? 'Interface audio: Enabled' : 'Interface audio: Muted'}
            >
              {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            {/* API Key Status Pill */}
            <button
              onClick={onOpenApiModal}
              id="btn-rapidapi-settings"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md hairline bg-panel hover:bg-panel-elevated hover:border-zinc-600 text-xs font-mono text-zinc-300 transition-colors"
              title="Configure RapidAPI Key & Endpoint"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${hasApiKey ? 'bg-status-emerald' : 'bg-status-amber'}`} />
              <KeyRound className="w-3 h-3 text-zinc-400" />
              <span className="text-[11px] hidden sm:inline">
                {getStatusLabel()}
              </span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden hairline-t py-1.5 gap-1.5 overflow-x-auto">
          <NavLink
            to="/translator"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                isActive ? 'bg-panel-elevated text-white hairline' : 'text-zinc-400 hover:text-zinc-200'
              }`
            }
          >
            <Languages className="w-3 h-3" />
            Translator
          </NavLink>
          <NavLink
            to="/random-string"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                isActive ? 'bg-panel-elevated text-white hairline' : 'text-zinc-400 hover:text-zinc-200'
              }`
            }
          >
            <Shuffle className="w-3 h-3" />
            Random Studio
          </NavLink>
          <NavLink
            to="/architecture"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                isActive ? 'bg-panel-elevated text-white hairline' : 'text-zinc-400 hover:text-zinc-200'
              }`
            }
          >
            <Code2 className="w-3 h-3 text-status-emerald" />
            Hook Specs
          </NavLink>
        </div>
      </div>
    </header>
  );
}
