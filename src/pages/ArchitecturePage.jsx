import React from 'react';
import { 
  Code2, 
  GitBranch, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  FileText, 
  Cpu, 
  Zap, 
  ShieldCheck, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ArchitecturePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6">
      
      {/* Title & Badge */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
          <Code2 className="w-3.5 h-3.5" />
          <span>Internship Submission Review Guide</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Senior Front-End <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Architecture</span>
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          In-depth technical review of how the 3 tasks of Slab 1 are cleanly fulfilled within this unified repository.
        </p>
      </div>

      {/* 3 Pillars of Slab 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">Task 1: Text Translator</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time English string to 24+ languages using RapidAPI with in-app credentials manager, speech-to-text dictation, and speech synthesis.
            </p>
          </div>
          <Link to="/translator" className="mt-4 inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium">
            Open Translator <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">Task 2: Random String</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cryptographically secure string generator strictly built on <code className="text-emerald-300">useState</code>, <code className="text-emerald-300">useCallback</code>, and <code className="text-emerald-300">useEffect</code> hooks.
            </p>
          </div>
          <Link to="/random-string" className="mt-4 inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium">
            Open Generator <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
              <GitBranch className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">Client Routing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Client-side routing via <code className="text-purple-300">react-router-dom</code> with browser history, active link styling, and route guards.
            </p>
          </div>
          <span className="mt-4 inline-flex items-center gap-1.5 text-xs text-purple-400 font-medium">
            Active in all views
          </span>
        </div>

      </div>

      {/* Deep-Dive: React Hook Discipline in Task 2 */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 mb-10">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-400" />
          Task 2: React Hook Discipline Breakdown
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          How each mandatory hook was chosen and engineered according to senior React guidelines:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs font-semibold">
              useState
            </span>
            <p className="text-xs text-slate-300 mt-2 font-medium">Reactive UI State</p>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Manages length, boolean flags for uppercase, lowercase, numbers, symbols, ambiguous exclusion, batch size, and copied toast state.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-xs font-semibold">
              useCallback
            </span>
            <p className="text-xs text-slate-300 mt-2 font-medium">Memoized Computation</p>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Memoizes <code className="text-indigo-300">generateString()</code> preventing expensive function re-allocations on parent re-renders while preserving the exact closure dependencies.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-xs font-semibold">
              useEffect
            </span>
            <p className="text-xs text-slate-300 mt-2 font-medium">Reactive Synchronization</p>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Listens to dependency changes across character sets and length, synchronizing the generated output automatically, plus syncing the browser page title.
            </p>
          </div>

        </div>
      </div>

      {/* RapidAPI Architecture */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          Task 1: RapidAPI Dual-Engine Design
        </h2>
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          In real-world front-end engineering, requiring an external API key from evaluators can cause friction if their quota expires. This project implements a **Fail-Safe Dual Architecture**:
        </p>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
          <div className="flex items-start gap-2">
            <span className="text-indigo-400 font-semibold">Primary:</span>
            <span className="text-slate-300">RapidAPI Google Translate API (passes <code className="text-indigo-300">X-RapidAPI-Key</code> & <code className="text-indigo-300">X-RapidAPI-Host</code> headers).</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400 font-semibold">Fallback:</span>
            <span className="text-slate-300">Resilient public translation service (MyMemory) which activates automatically if no custom key is provided.</span>
          </div>
        </div>
      </div>

      {/* Environment Secrets Architecture */}
      <div className="mt-10 bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-400" />
          Environment Configuration & Secrets Management (.env)
        </h2>
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Following 12-factor application design, sensitive API credentials and deployment settings are isolated from the code repository:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between text-amber-400 font-semibold mb-2">
              <span>.env (Private)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">Git Ignored</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Holds private keys (<code className="text-indigo-300">VITE_RAPIDAPI_KEY</code>). Blocked by <code className="text-slate-300">.gitignore</code> to prevent credential leakage.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between text-emerald-400 font-semibold mb-2">
              <span>.env.example (Public Template)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Committed</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Safe public template committed to GitHub so evaluators and contributors immediately know the required environment variables.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
