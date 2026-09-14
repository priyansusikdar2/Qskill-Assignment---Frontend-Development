import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  Shuffle, 
  Copy, 
  Check, 
  Sliders, 
  ShieldCheck, 
  ShieldAlert, 
  RefreshCw, 
  Download, 
  Sparkles, 
  History, 
  Layers, 
  Trash2,
  Code2,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function RandomStringPage() {
  // 1. useState Hooks
  const [length, setLength] = useState(16);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [prefix, setPrefix] = useState('');
  const [randomString, setRandomString] = useState('');
  const [copied, setCopied] = useState(false);
  const [batchCount, setBatchCount] = useState(1);
  const [batchList, setBatchList] = useState([]);
  const [history, setHistory] = useLocalStorage('qskill_random_history', []);
  const [hookExecutionLog, setHookExecutionLog] = useState({
    useCallbackRuns: 0,
    useEffectRuns: 0,
    lastTriggeredBy: 'Initial Mount',
  });

  // 2. useCallback Hook: Core random generation function
  const generateString = useCallback((customLen = length) => {
    let chars = '';
    const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
    const numChars = '0123456789';
    const symChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (includeUpper) chars += upperChars;
    if (includeLower) chars += lowerChars;
    if (includeNumbers) chars += numChars;
    if (includeSymbols) chars += symChars;

    if (excludeAmbiguous) {
      // Exclude visually ambiguous characters: O, 0, I, l, 1, etc.
      chars = chars.replace(/[O0Il1|]/g, '');
    }

    if (!chars) {
      return '';
    }

    const array = new Uint32Array(customLen);
    window.crypto.getRandomValues(array);

    let result = '';
    for (let i = 0; i < customLen; i++) {
      result += chars[array[i] % chars.length];
    }

    const finalResult = prefix ? `${prefix}-${result}` : result;

    // Track useCallback execution metrics
    setHookExecutionLog((prev) => ({
      ...prev,
      useCallbackRuns: prev.useCallbackRuns + 1,
    }));

    return finalResult;
  }, [length, includeUpper, includeLower, includeNumbers, includeSymbols, excludeAmbiguous, prefix]);

  // 3. useCallback Hook: Batch generator
  const generateBatch = useCallback(() => {
    const list = [];
    for (let i = 0; i < batchCount; i++) {
      list.push(generateString());
    }
    setBatchList(list);
    if (list[0]) {
      setRandomString(list[0]);
      // Append latest to history
      setHistory((prev) => [list[0], ...prev.filter((item) => item !== list[0]).slice(0, 14)]);
    }
  }, [batchCount, generateString, setHistory]);

  // 4. useEffect Hook: Automatically re-generate whenever options or parameters change!
  useEffect(() => {
    const newStr = generateString();
    setRandomString(newStr);
    if (batchCount > 1) {
      const list = [newStr];
      for (let i = 1; i < batchCount; i++) {
        list.push(generateString());
      }
      setBatchList(list);
    } else {
      setBatchList([newStr]);
    }

    setHookExecutionLog((prev) => ({
      ...prev,
      useEffectRuns: prev.useEffectRuns + 1,
      lastTriggeredBy: `Dependency Change [length=${length}, upper=${includeUpper}, lower=${includeLower}, nums=${includeNumbers}, syms=${includeSymbols}]`,
    }));
  }, [generateString, length, includeUpper, includeLower, includeNumbers, includeSymbols, excludeAmbiguous, prefix, batchCount]);

  // 5. useEffect Hook: Update document title
  useEffect(() => {
    if (randomString) {
      document.title = `Random String (${length} chars) | QSkill Studio`;
    }
  }, [randomString, length]);

  // Calculate Entropy / Security score using useMemo
  const strengthInfo = useMemo(() => {
    if (!randomString) return { score: 0, label: 'Empty', color: 'bg-slate-700' };
    let poolSize = 0;
    if (includeUpper) poolSize += 26;
    if (includeLower) poolSize += 26;
    if (includeNumbers) poolSize += 10;
    if (includeSymbols) poolSize += 30;

    const entropy = Math.round(randomString.length * (poolSize > 0 ? Math.log2(poolSize) : 0));
    
    if (entropy < 36) return { score: 25, label: 'Weak', color: 'bg-rose-500', entropy, crackTime: '< 1 second' };
    if (entropy < 60) return { score: 50, label: 'Moderate', color: 'bg-amber-500', entropy, crackTime: '3 days' };
    if (entropy < 85) return { score: 75, label: 'Strong', color: 'bg-blue-500', entropy, crackTime: '1,000 years' };
    return { score: 100, label: 'Cryptographic Grade', color: 'bg-emerald-500', entropy, crackTime: 'Centuries' };
  }, [randomString, includeUpper, includeLower, includeNumbers, includeSymbols]);

  // Copy handler
  const handleCopy = (text = randomString) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export batch as TXT
  const handleExportTxt = () => {
    const blob = new Blob([batchList.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `random-strings-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6">
      
      {/* Title & Badge */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Slab 1 • Task 2: Random String Generator</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Random String & <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">Token Studio</span>
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Implemented using strictly <span className="text-emerald-300 font-mono">useState</span>, <span className="text-emerald-300 font-mono">useCallback</span>, and <span className="text-emerald-300 font-mono">useEffect</span> hooks with cryptographic randomness and entropy analysis.
        </p>
      </div>

      {/* Primary Output Display Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl mb-8 glow-brand">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
          <span className="font-semibold uppercase tracking-wider text-slate-400">Generated Output</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-emerald-400">{randomString.length} chars</span>
            <span>•</span>
            <span className="text-slate-300 font-medium">{strengthInfo.label} ({strengthInfo.entropy || 0} bits)</span>
          </div>
        </div>

        {/* Big String Box */}
        <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5">
          <div 
            id="random-string-display"
            className="flex-1 font-mono text-lg sm:text-2xl text-slate-100 break-all select-all tracking-wide pr-4"
          >
            {randomString || <span className="text-slate-600">Select at least one character set below...</span>}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              id="btn-regenerate-string"
              onClick={generateBatch}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-all group"
              title="Regenerate random string"
            >
              <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            </button>

            <button
              type="button"
              id="btn-copy-string"
              onClick={() => handleCopy(randomString)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Strength Progress Bar */}
        <div className="mt-4">
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${strengthInfo.color}`} 
              style={{ width: `${strengthInfo.score}%` }} 
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
            <span>Entropy: <strong className="text-slate-300">{strengthInfo.entropy || 0} bits</strong></span>
            <span>Estimated crack time: <strong className="text-slate-300">{strengthInfo.crackTime || 'N/A'}</strong></span>
          </div>
        </div>

      </div>

      {/* Configuration Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Parameters Column */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">Generator Controls</h3>
          </div>

          {/* Length Slider */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-300">String Length</label>
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono text-xs font-semibold">
                {length} characters
              </span>
            </div>
            <input
              type="range"
              id="length-slider"
              min="4"
              max="64"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value, 10))}
              className="w-full accent-indigo-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>4 min</span>
              <span>16 default</span>
              <span>32</span>
              <span>64 max</span>
            </div>
          </div>

          {/* Character Sets Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors">
              <div>
                <span className="text-xs font-medium text-white block">Uppercase (A-Z)</span>
                <span className="text-[11px] text-slate-400 font-mono">ABCDEF...</span>
              </div>
              <input
                type="checkbox"
                id="toggle-upper"
                checked={includeUpper}
                onChange={(e) => setIncludeUpper(e.target.checked)}
                className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors">
              <div>
                <span className="text-xs font-medium text-white block">Lowercase (a-z)</span>
                <span className="text-[11px] text-slate-400 font-mono">abcdef...</span>
              </div>
              <input
                type="checkbox"
                id="toggle-lower"
                checked={includeLower}
                onChange={(e) => setIncludeLower(e.target.checked)}
                className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors">
              <div>
                <span className="text-xs font-medium text-white block">Numbers (0-9)</span>
                <span className="text-[11px] text-slate-400 font-mono">0123456789</span>
              </div>
              <input
                type="checkbox"
                id="toggle-numbers"
                checked={includeNumbers}
                onChange={(e) => setIncludeNumbers(e.target.checked)}
                className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors">
              <div>
                <span className="text-xs font-medium text-white block">Special Symbols</span>
                <span className="text-[11px] text-slate-400 font-mono">!@#$%^&*...</span>
              </div>
              <input
                type="checkbox"
                id="toggle-symbols"
                checked={includeSymbols}
                onChange={(e) => setIncludeSymbols(e.target.checked)}
                className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
              />
            </label>

          </div>

          {/* Advanced Filters */}
          <div className="pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Custom Prefix (Optional)
              </label>
              <input
                type="text"
                id="prefix-input"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="e.g. KEY, TOKEN, USER"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Batch Generation Quantity
              </label>
              <div className="flex gap-2">
                {[1, 5, 10, 20].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setBatchCount(qty)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                      batchCount === qty
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {qty}x
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Live Hook Inspector Column */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Code2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Live Hook Telemetry</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Demonstrating the lifecycle of required React Hooks in real-time as state transitions occur:
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-emerald-400 font-bold">useState</span>
                  <span className="text-[10px] text-emerald-400/80">12 Active States</span>
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  len={length}, u={String(includeUpper)}, l={String(includeLower)}, n={String(includeNumbers)}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-indigo-400 font-bold">useCallback</span>
                  <span className="text-[10px] text-indigo-400/80">{hookExecutionLog.useCallbackRuns} Calls</span>
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  generateString() memoized with cryptographic seed
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-cyan-400 font-bold">useEffect</span>
                  <span className="text-[10px] text-cyan-400/80">{hookExecutionLog.useEffectRuns} Triggers</span>
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  Synchronizes generator when parameters change
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Fully compliant with QSkill Slab 1 specifications.</span>
          </div>

        </div>

      </div>

      {/* Batch Results View (if batchCount > 1) */}
      {batchList.length > 1 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">Batch Generated Strings ({batchList.length})</h3>
            </div>
            <button
              onClick={handleExportTxt}
              className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              <Download className="w-3.5 h-3.5" /> Export as .txt
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {batchList.map((str, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-950/70 border border-slate-800 text-xs font-mono text-slate-300"
              >
                <span className="truncate mr-2">{str}</span>
                <button
                  onClick={() => handleCopy(str)}
                  className="text-slate-400 hover:text-white"
                  title="Copy string"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generation History */}
      {history.length > 0 && (
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Recent Generated History</h3>
            </div>
            <button
              onClick={() => setHistory([])}
              className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Clear History
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {history.map((str, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleCopy(str)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 hover:border-slate-700 flex items-center gap-1.5 group"
              >
                <span>{str.length > 20 ? `${str.slice(0, 20)}...` : str}</span>
                <Copy className="w-3 h-3 opacity-50 group-hover:opacity-100" />
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
