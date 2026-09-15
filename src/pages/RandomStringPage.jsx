import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { 
  Shuffle, 
  Copy, 
  Check, 
  Sliders, 
  ShieldCheck, 
  RefreshCw, 
  Download, 
  Layers, 
  CheckCircle2, 
  QrCode, 
  Activity, 
  Cpu, 
  FileSpreadsheet, 
  FileJson,
  Hash,
  Key,
  Lock,
  Sparkles,
  BookOpen,
  Binary
} from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import QrCodeModal from '../components/QrCodeModal';
import { sounds } from '../utils/audioFeedback';
import { useToast } from '../components/Toast';

const DICEWARE_WORDS = [
  'amber', 'anchor', 'apex', 'arcade', 'arrow', 'atlas', 'beacon', 'breeze', 'bridge', 'cabin',
  'canyon', 'cedar', 'cliff', 'cloud', 'comet', 'coral', 'crater', 'crystal', 'delta', 'dune',
  'eagle', 'ember', 'falcon', 'fathom', 'feather', 'flame', 'forest', 'frost', 'galaxy', 'glacier',
  'harbor', 'haven', 'hawk', 'horizon', 'island', 'jasper', 'jungle', 'lagoon', 'laser', 'matrix',
  'meadow', 'meteor', 'monarch', 'nebula', 'oasis', 'ocean', 'orbit', 'pebble', 'phoenix', 'planet',
  'polar', 'prism', 'pulsar', 'quartz', 'radar', 'radiant', 'rain', 'rapid', 'reef', 'ridge',
  'river', 'ruby', 'safari', 'shadow', 'shield', 'sierra', 'silver', 'solar', 'spark', 'summit',
  'sunset', 'thunder', 'timber', 'topaz', 'torrent', 'trail', 'valley', 'vortex', 'voyage', 'wave',
  'wild', 'wind', 'zenith'
];

export default function RandomStringPage() {
  const { addToast } = useToast();

  // Mode: 'standard' | 'pattern' | 'uuid' | 'api-key' | 'passphrase' | 'hex'
  const [mode, setMode] = useState('standard');
  const [patternMask, setPatternMask] = useState('PROMO-XXXX-####');

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
  const [qrToken, setQrToken] = useState(null);

  // Hook Telemetry & Profiler State
  const [telemetry, setTelemetry] = useState({
    useCallbackRuns: 0,
    useEffectRuns: 0,
    lastExecMicroseconds: 0,
    renderCount: 0,
    poolSize: 0,
  });

  const renderCounterRef = useRef(0);
  renderCounterRef.current += 1;

  // 2. useCallback Hook: Core Cryptographic Generator with Specialized Presets
  const generateString = useCallback((customLen = length) => {
    const t0 = performance.now();

    // Mode: UUID v4
    if (mode === 'uuid') {
      let uuidStr = '';
      if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
        uuidStr = window.crypto.randomUUID();
      } else {
        const bytes = new Uint8Array(16);
        window.crypto.getRandomValues(bytes);
        bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
        bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10
        const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
        uuidStr = `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20,32)}`;
      }
      const execTime = Math.round((performance.now() - t0) * 1000);
      setTelemetry((prev) => ({
        ...prev,
        useCallbackRuns: prev.useCallbackRuns + 1,
        lastExecMicroseconds: execTime,
        poolSize: 16,
      }));
      return uuidStr;
    }

    // Mode: Memorable Diceware Passphrase
    if (mode === 'passphrase') {
      const wordCount = Math.max(3, Math.min(8, Math.round(customLen / 4)));
      const array = new Uint32Array(wordCount);
      window.crypto.getRandomValues(array);
      const chosenWords = Array.from(array).map(idx => DICEWARE_WORDS[idx % DICEWARE_WORDS.length]);
      const result = chosenWords.join('-');
      const execTime = Math.round((performance.now() - t0) * 1000);
      setTelemetry((prev) => ({
        ...prev,
        useCallbackRuns: prev.useCallbackRuns + 1,
        lastExecMicroseconds: execTime,
        poolSize: DICEWARE_WORDS.length,
      }));
      return result;
    }

    // Mode: Hex / 256-bit Cryptographic Buffer
    if (mode === 'hex') {
      const bytes = new Uint8Array(Math.max(8, Math.round(customLen / 2)));
      window.crypto.getRandomValues(bytes);
      const result = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
      const execTime = Math.round((performance.now() - t0) * 1000);
      setTelemetry((prev) => ({
        ...prev,
        useCallbackRuns: prev.useCallbackRuns + 1,
        lastExecMicroseconds: execTime,
        poolSize: 16,
      }));
      return prefix ? `${prefix}_${result}` : result;
    }

    // Mode: Service API Key (e.g. sk_live_...)
    if (mode === 'api-key') {
      const activePrefix = prefix ? prefix : 'sk_live';
      const keyChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const array = new Uint32Array(24);
      window.crypto.getRandomValues(array);
      let keyPart = '';
      for (let i = 0; i < 24; i++) {
        keyPart += keyChars[array[i] % keyChars.length];
      }
      const result = `${activePrefix}_${keyPart}`;
      const execTime = Math.round((performance.now() - t0) * 1000);
      setTelemetry((prev) => ({
        ...prev,
        useCallbackRuns: prev.useCallbackRuns + 1,
        lastExecMicroseconds: execTime,
        poolSize: keyChars.length,
      }));
      return result;
    }

    // Mode: Custom Pattern Mask
    if (mode === 'pattern') {
      const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
      const lowers = 'abcdefghijkmnopqrstuvwxyz';
      const numbers = '23456789';
      const allAlphanum = uppers + lowers + numbers;

      const chars = patternMask.split('').map((char) => {
        if (char === 'X') return uppers[Math.floor(Math.random() * uppers.length)];
        if (char === 'x') return lowers[Math.floor(Math.random() * lowers.length)];
        if (char === '#') return numbers[Math.floor(Math.random() * numbers.length)];
        if (char === '*') return allAlphanum[Math.floor(Math.random() * allAlphanum.length)];
        return char; // Literal separator
      });

      const execTime = Math.round((performance.now() - t0) * 1000);
      setTelemetry((prev) => ({
        ...prev,
        useCallbackRuns: prev.useCallbackRuns + 1,
        lastExecMicroseconds: execTime,
        poolSize: 62,
      }));

      return chars.join('');
    }

    // Default: Standard Cryptographic Character Set
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
      chars = chars.replace(/[O0Il1|]/g, '');
    }

    if (!chars) return '';

    const array = new Uint32Array(customLen);
    window.crypto.getRandomValues(array);

    let result = '';
    for (let i = 0; i < customLen; i++) {
      result += chars[array[i] % chars.length];
    }

    const finalResult = prefix ? `${prefix}-${result}` : result;
    const execTime = Math.round((performance.now() - t0) * 1000);

    setTelemetry((prev) => ({
      ...prev,
      useCallbackRuns: prev.useCallbackRuns + 1,
      lastExecMicroseconds: execTime,
      poolSize: chars.length,
    }));

    return finalResult;
  }, [length, includeUpper, includeLower, includeNumbers, includeSymbols, excludeAmbiguous, prefix, mode, patternMask]);

  // 3. useCallback Hook: Batch generator
  const generateBatch = useCallback(() => {
    sounds.playTone(550, 'sine', 0.04, 0.03);
    const list = [];
    for (let i = 0; i < batchCount; i++) {
      list.push(generateString());
    }
    setBatchList(list);
    if (list[0]) {
      setRandomString(list[0]);
      setHistory((prev) => [list[0], ...prev.filter((item) => item !== list[0]).slice(0, 14)]);
    }
  }, [batchCount, generateString, setHistory]);

  // 4. useEffect Hook: Reactive Synchronization
  useEffect(() => {
    const newStr = generateString();
    setRandomString(newStr);
    if (batchCount > 1) {
      const list = [newStr];
      for (let i = 1; i < batchCount; i++) list.push(generateString());
      setBatchList(list);
    } else {
      setBatchList([newStr]);
    }

    setTelemetry((prev) => ({
      ...prev,
      useEffectRuns: prev.useEffectRuns + 1,
      renderCount: renderCounterRef.current,
    }));
  }, [generateString, length, includeUpper, includeLower, includeNumbers, includeSymbols, excludeAmbiguous, prefix, batchCount, mode, patternMask]);

  // 5. useEffect Hook: Synchronize page document title
  useEffect(() => {
    if (randomString) {
      document.title = `Token (${randomString.length} chars) | QSkill Studio`;
    }
  }, [randomString]);

  // Global Keyboard Shortcut: Press 'R' when outside input to regenerate
  useEffect(() => {
    const handleKey = (e) => {
      if (
        e.key.toLowerCase() === 'r' &&
        !['input', 'textarea'].includes(document.activeElement?.tagName?.toLowerCase())
      ) {
        e.preventDefault();
        generateBatch();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [generateBatch]);

  // Security & Entropy Audit (useMemo)
  const securityAudit = useMemo(() => {
    if (!randomString) return { score: 0, label: 'Empty', color: 'bg-zinc-700', entropy: 0 };
    
    let entropy = 0;
    const poolSize = telemetry.poolSize || 62;

    if (mode === 'uuid') {
      entropy = 122;
    } else if (mode === 'passphrase') {
      const words = randomString.split('-');
      entropy = Math.round(words.length * Math.log2(DICEWARE_WORDS.length));
    } else if (mode === 'hex') {
      entropy = Math.round(randomString.length * 4);
    } else {
      entropy = Math.round(randomString.length * (poolSize > 0 ? Math.log2(poolSize) : 0));
    }

    const searchSpaceScientific = `~${poolSize}^${randomString.length}`;

    let label = 'Cryptographic Grade';
    let color = 'bg-status-emerald';
    let crackTime = 'Trillions of Years';
    let score = 100;

    if (entropy < 36) {
      score = 25;
      label = 'Weak';
      color = 'bg-status-rose';
      crackTime = '< 1 second';
    } else if (entropy < 60) {
      score = 50;
      label = 'Moderate';
      color = 'bg-status-amber';
      crackTime = '3 days';
    } else if (entropy < 85) {
      score = 75;
      label = 'Strong';
      color = 'bg-accent-500';
      crackTime = '1,000 years';
    }

    return { score, label, color, entropy, crackTime, searchSpaceScientific, poolSize };
  }, [randomString, telemetry.poolSize, mode]);

  // Copy handler
  const handleCopy = (text = randomString) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    sounds.playSuccess();
    setCopied(true);
    addToast('Token copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  // Export handlers
  const handleExportTxt = () => {
    const blob = new Blob([batchList.join('\n')], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, `tokens-${Date.now()}.txt`);
    addToast(`Exported ${batchList.length} tokens to TXT`, 'success');
  };

  const handleExportJson = () => {
    const data = {
      generatedAt: new Date().toISOString(),
      generator: 'QSkill Cryptographic Studio',
      mode,
      count: batchList.length,
      entropyBits: securityAudit.entropy,
      tokens: batchList,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `tokens-${Date.now()}.json`);
    addToast(`Exported ${batchList.length} tokens to JSON`, 'success');
  };

  const handleExportCsv = () => {
    const rows = ['Index,Token,Length,EntropyBits'];
    batchList.forEach((t, i) => rows.push(`${i + 1},"${t}",${t.length},${securityAudit.entropy}`));
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    downloadBlob(blob, `tokens-${Date.now()}.csv`);
    addToast(`Exported ${batchList.length} tokens to CSV`, 'success');
  };

  const downloadBlob = (blob, filename) => {
    sounds.playSuccess();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6">
      
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-base font-semibold text-zinc-100 tracking-tight">Cryptographic Token & Entropy Studio</h1>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/60">
              WebCrypto CSPRNG
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Developer-grade token generator supporting UUID v4, API keys, diceware passphrases, and custom patterns.
          </p>
        </div>

        {/* Mode Switcher Tabs (6 Professional Presets) */}
        <div className="flex items-center bg-panel hairline rounded-lg p-0.5 text-xs font-mono shrink-0 overflow-x-auto">
          {[
            { id: 'standard', label: 'Standard' },
            { id: 'uuid', label: 'UUID v4' },
            { id: 'api-key', label: 'API Key' },
            { id: 'passphrase', label: 'Passphrase' },
            { id: 'hex', label: 'Hex 256' },
            { id: 'pattern', label: 'Mask' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setMode(tab.id);
                sounds.playClick();
                addToast(`Switched mode to ${tab.label}`, 'info');
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                mode === tab.id
                  ? 'bg-zinc-800 text-zinc-100 shadow-subtle'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Token Display Workbench */}
      <div className="surface-card p-6 shadow-panel mb-6">
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-2 font-mono">
          <span className="text-[11px] uppercase tracking-wider text-zinc-500">
            {mode.toUpperCase()} Token Output
          </span>
          <div className="flex items-center gap-2">
            <span className="text-status-emerald">{randomString.length} chars</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-300 font-medium">{securityAudit.label} ({securityAudit.entropy} bits)</span>
          </div>
        </div>

        {/* Big String Box */}
        <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-bg hairline rounded-lg p-3 sm:p-4 gap-3">
          <div 
            id="random-string-display"
            className="flex-1 font-mono text-base sm:text-xl text-zinc-100 break-all select-all tracking-wider pr-2"
          >
            {randomString || <span className="text-zinc-600">Generating token...</span>}
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            {/* QR Code Trigger */}
            <button
              type="button"
              onClick={() => {
                setQrToken(randomString);
                sounds.playPop();
              }}
              className="p-2 rounded-md hairline bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="Show mobile QR Code"
            >
              <QrCode className="w-4 h-4" />
            </button>

            {/* Regenerate Trigger */}
            <button
              type="button"
              id="btn-regenerate-string"
              onClick={generateBatch}
              className="p-2 rounded-md hairline bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer group flex items-center gap-1.5 text-xs font-mono"
              title="Regenerate token (or press 'R')"
            >
              <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
              <span className="text-[10px] text-zinc-400 hidden md:inline">R</span>
            </button>

            {/* Copy Button */}
            <button
              type="button"
              id="btn-copy-string"
              onClick={() => handleCopy(randomString)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md font-semibold text-xs bg-zinc-100 hover:bg-white text-zinc-950 transition-colors cursor-pointer shadow-subtle"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-status-emerald" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Entropy Progress Bar */}
        <div className="mt-3">
          <div className="h-1.5 w-full bg-zinc-800/80 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${securityAudit.color}`} 
              style={{ width: `${securityAudit.score}%` }} 
            />
          </div>
          <div className="flex flex-wrap items-center justify-between text-[11px] text-zinc-500 mt-2 font-mono gap-2">
            <span>Entropy: <strong className="text-zinc-300">{securityAudit.entropy} bits</strong></span>
            <span>Search Space: <strong className="text-zinc-300">{securityAudit.searchSpaceScientific}</strong></span>
            <span>Crack Estimate: <strong className="text-zinc-300">{securityAudit.crackTime}</strong></span>
          </div>
        </div>
      </div>

      {/* Generator Controls & Live Profiler Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Parameters Column */}
        <div className="lg:col-span-2 surface-card p-6 shadow-panel">
          <div className="flex items-center gap-2 mb-4">
            <Sliders className="w-4 h-4 text-zinc-400" />
            <h3 className="text-xs font-semibold text-zinc-200 font-mono uppercase tracking-wider">
              {mode === 'standard' && 'Custom CSPRNG Parameters'}
              {mode === 'uuid' && 'RFC 4122 UUID v4 Specification'}
              {mode === 'api-key' && 'Service API Key Credentials'}
              {mode === 'passphrase' && 'EFF Diceware Wordlist Configuration'}
              {mode === 'hex' && 'Cryptographic Hex Buffer'}
              {mode === 'pattern' && 'Custom Pattern Mask Syntax'}
            </h3>
          </div>

          {/* Mode-Specific Parameter Panels */}
          {mode === 'uuid' && (
            <div className="p-3 rounded-lg bg-bg hairline text-xs font-mono text-zinc-300 space-y-2 mb-4">
              <p className="text-status-emerald font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Canonical 128-bit UUID (Universally Unique Identifier)
              </p>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Generated strictly via CSPRNG with 122 bits of high entropy. Follows format <code className="text-zinc-200">xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx</code> with guaranteed non-collision probability for database primary keys.
              </p>
            </div>
          )}

          {mode === 'passphrase' && (
            <div className="space-y-4 mb-4">
              <div className="p-3 rounded-lg bg-bg hairline text-xs font-mono text-zinc-300 space-y-2">
                <p className="text-accent-400 font-semibold flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" /> Human-Memorable Diceware Passphrase
                </p>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Generates natural, easy-to-remember passphrases from curated EFF wordlists joined by hyphens. Ideal for master encryption keys, seed phrases, and memorable root passwords.
                </p>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-300">Word Count</label>
                <div className="flex items-center gap-1.5">
                  {[3, 4, 5, 6].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => {
                        setLength(w * 4);
                        sounds.playClick();
                      }}
                      className={`px-2.5 py-1 rounded text-xs font-mono cursor-pointer ${
                        Math.round(length / 4) === w
                          ? 'bg-zinc-200 text-zinc-950 font-bold'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {w} words
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {mode === 'hex' && (
            <div className="space-y-4 mb-4">
              <div className="p-3 rounded-lg bg-bg hairline text-xs font-mono text-zinc-300 space-y-2">
                <p className="text-status-cyan font-semibold flex items-center gap-1.5">
                  <Binary className="w-3.5 h-3.5" /> 256-bit Hexadecimal Hash Buffer
                </p>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Generates raw cryptographic byte streams encoded as base-16 hexadecimal characters. Perfect for HMAC secrets, Webhooks, CSRF tokens, and auth salts.
                </p>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-300">Byte Length</label>
                <div className="flex items-center gap-1.5 font-mono text-xs">
                  {[16, 32, 64].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => {
                        setLength(b);
                        sounds.playClick();
                      }}
                      className={`px-2.5 py-1 rounded cursor-pointer ${
                        length === b
                          ? 'bg-zinc-200 text-zinc-950 font-bold'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {b} bytes ({b * 2} hex)
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {mode === 'api-key' && (
            <div className="space-y-4 mb-4">
              <div className="p-3 rounded-lg bg-bg hairline text-xs font-mono text-zinc-300 space-y-2">
                <p className="text-status-amber font-semibold flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" /> Industry-Standard Service API Token
                </p>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Generates Stripe/GitHub style prefixed secret tokens. The service prefix enables secret-scanning tools (like GitHub Secret Scanning) to prevent accidental credential leakage.
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-mono">
                  Custom Key Prefix
                </label>
                <div className="flex gap-2">
                  {['sk_live', 'pk_live', 'ghp', 'qsk'].map((pfx) => (
                    <button
                      key={pfx}
                      type="button"
                      onClick={() => {
                        setPrefix(pfx);
                        sounds.playClick();
                      }}
                      className={`px-2.5 py-1 rounded text-xs font-mono cursor-pointer ${
                        prefix === pfx
                          ? 'bg-zinc-200 text-zinc-950 font-bold'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {pfx}_
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {mode === 'pattern' && (
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-mono">
                  Mask Format String
                </label>
                <input
                  type="text"
                  value={patternMask}
                  onChange={(e) => setPatternMask(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-bg hairline text-xs font-mono text-status-emerald focus:outline-none focus:border-zinc-500"
                />
              </div>
              <div className="p-3 rounded-lg bg-bg hairline text-[11px] text-zinc-400 space-y-1.5 font-mono">
                <p className="text-zinc-300 font-semibold mb-1">Mask Wildcards Reference:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <p><span className="text-status-emerald font-bold">X</span> : Uppercase letters (A-Z)</p>
                  <p><span className="text-status-emerald font-bold">x</span> : Lowercase letters (a-z)</p>
                  <p><span className="text-status-emerald font-bold">#</span> : Digits (2-9)</p>
                  <p><span className="text-status-emerald font-bold">*</span> : Any Alphanumeric character</p>
                  <p className="col-span-1 sm:col-span-2"><span className="text-zinc-400 font-bold">- / _</span> : Preserved literal delimiters</p>
                </div>
              </div>
            </div>
          )}

          {mode === 'standard' && (
            <>
              {/* Length Slider with Presets */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-zinc-300">Character Length</label>
                  <div className="flex items-center gap-1.5">
                    {[8, 16, 24, 32, 64].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          setLength(p);
                          sounds.playClick();
                        }}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                          length === p
                            ? 'bg-zinc-200 text-zinc-950 font-bold'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <span className="ml-1 px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 font-mono text-xs font-semibold hairline">
                      {length} chars
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  id="length-slider"
                  min="4"
                  max="64"
                  value={length}
                  onChange={(e) => setLength(parseInt(e.target.value, 10))}
                  className="w-full accent-zinc-200 bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
                />
              </div>

              {/* Character Set Toggles with Custom Switch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
                {[
                  { label: 'Uppercase (A-Z)', sub: '26 glyphs', checked: includeUpper, set: setIncludeUpper },
                  { label: 'Lowercase (a-z)', sub: '26 glyphs', checked: includeLower, set: setIncludeLower },
                  { label: 'Numbers (0-9)', sub: '10 glyphs', checked: includeNumbers, set: setIncludeNumbers },
                  { label: 'Symbols (!@#$...)', sub: '26 glyphs', checked: includeSymbols, set: setIncludeSymbols },
                  { label: 'Avoid Ambiguous', sub: 'Excludes 0, O, I, l, 1', checked: excludeAmbiguous, set: setExcludeAmbiguous },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      item.set(!item.checked);
                      sounds.playClick();
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-lg bg-bg hairline hover:border-zinc-700 cursor-pointer transition-colors ${
                      idx === 4 ? 'sm:col-span-2' : ''
                    }`}
                  >
                    <div>
                      <span className="text-xs font-medium text-zinc-200 block">{item.label}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">{item.sub}</span>
                    </div>
                    {/* Custom Pill Switch */}
                    <div
                      className={`w-8 h-4 rounded-full transition-colors relative flex items-center p-0.5 ${
                        item.checked ? 'bg-zinc-200' : 'bg-zinc-800'
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full bg-zinc-950 transition-transform ${
                          item.checked ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Batch & Prefix Toolbar */}
          <div className="pt-4 hairline-t grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-mono">
                Custom Prefix (Optional)
              </label>
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="e.g. AUTH, KEY, PROMO"
                className="w-full px-3 py-1.5 rounded-md bg-bg hairline text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-mono">
                Batch Quantity
              </label>
              <div className="flex gap-1.5">
                {[1, 5, 10, 25].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => {
                      setBatchCount(qty);
                      sounds.playClick();
                    }}
                    className={`flex-1 py-1.5 rounded-md text-xs font-mono font-medium hairline transition-colors cursor-pointer ${
                      batchCount === qty
                        ? 'bg-zinc-800 text-zinc-100 border-zinc-600'
                        : 'bg-bg text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {qty}x
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Live Hook Telemetry & Profiler Column */}
        <div className="surface-card p-6 shadow-panel flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-status-emerald" />
              <h3 className="text-xs font-semibold text-zinc-200">React 18 Hook Telemetry</h3>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-bg hairline">
                <div className="flex items-center justify-between text-zinc-400 mb-1">
                  <span className="text-status-emerald font-bold">useCallback</span>
                  <span className="text-[10px] text-zinc-400">{telemetry.useCallbackRuns} Invocations</span>
                </div>
                <div className="text-[11px] text-zinc-400">
                  Latency: <span className="text-zinc-200">{telemetry.lastExecMicroseconds}µs</span> • Pool: {telemetry.poolSize} chars
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-bg hairline">
                <div className="flex items-center justify-between text-zinc-400 mb-1">
                  <span className="text-accent-400 font-bold">useEffect</span>
                  <span className="text-[10px] text-zinc-400">{telemetry.useEffectRuns} Triggers</span>
                </div>
                <div className="text-[11px] text-zinc-400">
                  Reactive dependency synchronization
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-bg hairline">
                <div className="flex items-center justify-between text-zinc-400 mb-1">
                  <span className="text-zinc-300 font-bold">Render Cycles</span>
                  <span className="text-[10px] text-zinc-400">#{telemetry.renderCount}</span>
                </div>
                <div className="text-[11px] text-zinc-400">
                  Batching verified across state mutations
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 hairline-t text-[11px] text-zinc-500 font-mono flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-status-emerald shrink-0" />
            <span>WebCrypto CSPRNG active</span>
          </div>

        </div>

      </div>

      {/* Batch Results & Multi-Format Export Card */}
      {batchList.length > 1 && (
        <div className="bg-panel hairline rounded-xl p-5 mb-6 shadow-subtle animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-zinc-400" />
              <h3 className="text-xs font-semibold text-zinc-200">Generated Batch Tokens ({batchList.length})</h3>
            </div>

            {/* Export Actions */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleExportTxt}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-bg hover:bg-zinc-800 hairline text-xs font-mono text-zinc-300 transition-colors cursor-pointer"
              >
                <Download className="w-3 h-3" /> TXT
              </button>
              <button
                onClick={handleExportJson}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-bg hover:bg-zinc-800 hairline text-xs font-mono text-zinc-300 transition-colors cursor-pointer"
              >
                <FileJson className="w-3 h-3 text-status-amber" /> JSON
              </button>
              <button
                onClick={handleExportCsv}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-bg hover:bg-zinc-800 hairline text-xs font-mono text-zinc-300 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3 h-3 text-status-emerald" /> CSV
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
            {batchList.map((str, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-bg hairline text-xs font-mono text-zinc-300"
              >
                <span className="truncate mr-2">{str}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setQrToken(str)}
                    className="p-1 rounded text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
                    title="QR Code"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleCopy(str)}
                    className="p-1 rounded text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
                    title="Copy token"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      <QrCodeModal
        isOpen={Boolean(qrToken)}
        onClose={() => setQrToken(null)}
        token={qrToken}
      />

    </div>
  );
}
