import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Languages, Shuffle, KeyRound, Sparkles, Code2, Volume2, VolumeX, Command } from 'lucide-react';
import { sounds } from '../utils/audioFeedback';

export default function Navbar({ onOpenApiModal, hasApiKey, onOpenCommandPalette }) {
  const [audioEnabled, setAudioEnabled] = useState(true);

  const toggleSound = () => {
    sounds.enabled = !sounds.enabled;
    setAudioEnabled(sounds.enabled);
    if (sounds.enabled) sounds.playTone(600, 'sine', 0.05, 0.04);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo / Branding */}
          <Link to="/translator" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">QSkill<span className="text-indigo-400">Hub</span></span>
                <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Slab 1
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Senior Front-End Suite</p>
            </div>
          </Link>

          {/* Primary Navigation - react-router-dom */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-xl border border-white/5">
            <NavLink
              to="/translator"
              id="nav-translator"
              onClick={() => sounds.playClick()}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Languages className="w-4 h-4" />
              <span>Task 1: Text Translator</span>
            </NavLink>

            <NavLink
              to="/random-string"
              id="nav-random-string"
              onClick={() => sounds.playClick()}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Shuffle className="w-4 h-4" />
              <span>Task 2: Random String Studio</span>
            </NavLink>

            <NavLink
              to="/architecture"
              id="nav-architecture"
              onClick={() => sounds.playClick()}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Code2 className="w-4 h-4 text-emerald-400" />
              <span>Hook Architecture</span>
            </NavLink>
          </nav>

          {/* Right Action: Command Palette, Sound Toggle, RapidAPI */}
          <div className="flex items-center gap-2.5">
            {/* Command Palette Trigger */}
            <button
              onClick={onOpenCommandPalette}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/90 text-xs font-mono text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
              title="Open Command Palette (Ctrl+K)"
            >
              <Command className="w-3.5 h-3.5" />
              <span>Ctrl K</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-lg border text-xs transition-colors ${
                audioEnabled
                  ? 'bg-slate-900 border-slate-800 text-indigo-400 hover:text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-600'
              }`}
              title={audioEnabled ? 'Tactile Audio: ON' : 'Tactile Audio: OFF'}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* RapidAPI Key Settings */}
            <button
              onClick={onOpenApiModal}
              id="btn-rapidapi-settings"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900/90 hover:bg-slate-800/90 text-xs font-medium text-slate-300 transition-all shadow-sm group"
              title="Configure RapidAPI Key"
            >
              <span className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <KeyRound className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
              <span className="hidden sm:inline">
                {hasApiKey ? 'RapidAPI Active' : 'RapidAPI (Default)'}
              </span>
            </button>
          </div>

        </div>

        {/* Mobile Subnav */}
        <div className="flex md:hidden border-t border-white/5 py-2 gap-2 overflow-x-auto">
          <NavLink
            to="/translator"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-slate-900'
              }`
            }
          >
            <Languages className="w-3.5 h-3.5" />
            Translator
          </NavLink>
          <NavLink
            to="/random-string"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-slate-900'
              }`
            }
          >
            <Shuffle className="w-3.5 h-3.5" />
            Random String
          </NavLink>
          <NavLink
            to="/architecture"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-slate-900'
              }`
            }
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-400" />
            Hook Architecture
          </NavLink>
        </div>
      </div>
    </header>
  );
}
