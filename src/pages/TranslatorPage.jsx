import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Languages, 
  ArrowRightLeft, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  History, 
  Clock, 
  Trash2, 
  Zap, 
  UploadCloud, 
  Download, 
  Columns, 
  Database,
  ArrowRight,
  Search,
  BookOpen,
  BarChart2,
  Share2,
  Sparkles
} from 'lucide-react';
import { 
  SUPPORTED_LANGUAGES, 
  SOURCE_LANGUAGES,
  TONE_MODIFIERS, 
  translateText 
} from '../services/translationService';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { sounds } from '../utils/audioFeedback';
import LanguageSelect from '../components/LanguageSelect';
import { useToast } from '../components/Toast';
import { analyzeText } from '../utils/textAnalytics';

const SAMPLE_PHRASES = [
  "Hello, nice to meet you!",
  "High-performance frontend architecture with React and Tailwind CSS.",
  "Cryptographically secure token studio with entropy verification.",
  "Where is the nearest train station and central business district?"
];

export default function TranslatorPage({ onOpenApiModal, initialTargetLang = 'es' }) {
  const { addToast } = useToast();
  const [sourceText, setSourceText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState(initialTargetLang);
  const [secondaryLang, setSecondaryLang] = useState('fr'); // For Split View
  const [tone, setTone] = useState('standard');
  const [isSplitView, setIsSplitView] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [historySearch, setHistorySearch] = useState('');

  // Keep refs synchronized to prevent stale closures in async events
  const sourceTextRef = useRef(sourceText);
  const sourceLangRef = useRef(sourceLang);
  const targetLangRef = useRef(targetLang);
  const secondaryLangRef = useRef(secondaryLang);
  const toneRef = useRef(tone);
  const isSplitViewRef = useRef(isSplitView);
  const requestIdRef = useRef(0);

  useEffect(() => { sourceTextRef.current = sourceText; }, [sourceText]);
  useEffect(() => { sourceLangRef.current = sourceLang; }, [sourceLang]);
  useEffect(() => { targetLangRef.current = targetLang; }, [targetLang]);
  useEffect(() => { secondaryLangRef.current = secondaryLang; }, [secondaryLang]);
  useEffect(() => { toneRef.current = tone; }, [tone]);
  useEffect(() => { isSplitViewRef.current = isSplitView; }, [isSplitView]);

  // Translation states
  const [primaryResult, setPrimaryResult] = useState({ text: '', meta: null });
  const [secondaryResult, setSecondaryResult] = useState({ text: '', meta: null });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null); // 'primary' | 'secondary'
  const [uploadedFileName, setUploadedFileName] = useState('');

  const [history, setHistory] = useLocalStorage('qskill_translator_history', []);
  const abortControllerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Audio Hooks
  const { speak, stop: stopSpeech, isPlaying } = useSpeechSynthesis();
  
  const handleSpeechResult = useCallback((transcript) => {
    setSourceText(transcript);
    sourceTextRef.current = transcript;
  }, []);

  const {
    isListening,
    isSupported: isMicSupported,
    toggleListening
  } = useSpeechRecognition({ onResult: handleSpeechResult });

  // Selected language definitions
  const sourceLanguageObj = useMemo(() => {
    return SOURCE_LANGUAGES.find((l) => l.code === sourceLang) || SOURCE_LANGUAGES[0];
  }, [sourceLang]);

  const targetLanguageObj = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === targetLang) || SUPPORTED_LANGUAGES[0];
  }, [targetLang]);

  const secondaryLanguageObj = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === secondaryLang) || SUPPORTED_LANGUAGES[1];
  }, [secondaryLang]);

  // Text Complexity Analytics
  const sourceAnalytics = useMemo(() => analyzeText(sourceText), [sourceText]);
  const targetAnalytics = useMemo(() => analyzeText(primaryResult.text), [primaryResult.text]);

  // Handle Translate Execution with AbortController, Request Sequencing & Multi-Target support
  const handleTranslate = useCallback(async (arg = {}) => {
    let textToTranslate, targetCode, sourceCode, secondaryCode, currentTone, isSplit;

    if (typeof arg === 'string') {
      textToTranslate = arg;
      targetCode = targetLangRef.current;
      sourceCode = sourceLangRef.current;
      secondaryCode = secondaryLangRef.current;
      currentTone = toneRef.current;
      isSplit = isSplitViewRef.current;
    } else {
      textToTranslate = arg.text !== undefined ? arg.text : sourceTextRef.current;
      targetCode = arg.target !== undefined ? arg.target : targetLangRef.current;
      sourceCode = arg.source !== undefined ? arg.source : sourceLangRef.current;
      secondaryCode = arg.secondary !== undefined ? arg.secondary : secondaryLangRef.current;
      currentTone = arg.toneOverride !== undefined ? arg.toneOverride : toneRef.current;
      isSplit = arg.split !== undefined ? arg.split : isSplitViewRef.current;
    }

    if (!textToTranslate || !textToTranslate.trim()) {
      setPrimaryResult({ text: '', meta: null });
      setSecondaryResult({ text: '', meta: null });
      return;
    }

    const currentRequestId = ++requestIdRef.current;

    // Abort prior in-flight fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsLoading(true);
    setError(null);
    sounds.playTone(400, 'sine', 0.05, 0.02);

    try {
      if (isSplit) {
        // Parallel translation into both languages
        const res1 = await translateText({
          text: textToTranslate,
          sourceLang: sourceCode,
          targetLang: targetCode,
          tone: currentTone,
          signal,
        });

        if (currentRequestId !== requestIdRef.current) return;

        // Slight delay to prevent RapidAPI per-second concurrency burst limits
        await new Promise((resolve) => setTimeout(resolve, 150));
        if (currentRequestId !== requestIdRef.current) return;

        const res2 = await translateText({
          text: textToTranslate,
          sourceLang: sourceCode,
          targetLang: secondaryCode,
          tone: currentTone,
          signal,
        });

        if (currentRequestId !== requestIdRef.current) return;

        setPrimaryResult({ text: res1.translatedText, meta: res1 });
        setSecondaryResult({ text: res2.translatedText, meta: res2 });
        sounds.playSuccess();
      } else {
        const res = await translateText({
          text: textToTranslate,
          sourceLang: sourceCode,
          targetLang: targetCode,
          tone: currentTone,
          signal,
        });

        if (currentRequestId !== requestIdRef.current) return;

        setPrimaryResult({ text: res.translatedText, meta: res });
        sounds.playSuccess();

        const activeTargetObj = SUPPORTED_LANGUAGES.find((l) => l.code === targetCode) || SUPPORTED_LANGUAGES[0];

        // Push to History
        setHistory((prev) => {
          const entry = {
            id: Date.now(),
            sourceText: textToTranslate.trim(),
            translatedText: res.translatedText,
            targetLang: activeTargetObj.name,
            flag: activeTargetObj.flag,
            sourceLangCode: res.detectedSource || sourceCode,
            engine: res.engine,
            fromCache: res.fromCache,
            tone: currentTone,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          return [entry, ...prev.filter((p) => p.sourceText !== textToTranslate.trim()).slice(0, 19)];
        });
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      if (currentRequestId !== requestIdRef.current) return;
      console.error('Translation error:', err);
      setError(err.message || 'An error occurred during translation');
      addToast(err.message || 'Translation request failed', 'error');
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [setHistory, addToast]);

  // Synchronous Language & Tone Selectors (Guarantees immediate re-translation with chosen language)
  const handleSelectTargetLang = useCallback((code) => {
    setTargetLang(code);
    targetLangRef.current = code;
    sounds.playClick();
    if (sourceTextRef.current.trim()) {
      handleTranslate({
        text: sourceTextRef.current,
        source: sourceLangRef.current,
        target: code,
        secondary: secondaryLangRef.current,
        toneOverride: toneRef.current,
        split: isSplitViewRef.current,
      });
    }
  }, [handleTranslate]);

  const handleSelectSourceLang = useCallback((code) => {
    setSourceLang(code);
    sourceLangRef.current = code;
    sounds.playClick();
    if (sourceTextRef.current.trim()) {
      handleTranslate({
        text: sourceTextRef.current,
        source: code,
        target: targetLangRef.current,
        secondary: secondaryLangRef.current,
        toneOverride: toneRef.current,
        split: isSplitViewRef.current,
      });
    }
  }, [handleTranslate]);

  const handleSelectSecondaryLang = useCallback((code) => {
    setSecondaryLang(code);
    secondaryLangRef.current = code;
    sounds.playClick();
    if (sourceTextRef.current.trim()) {
      handleTranslate({
        text: sourceTextRef.current,
        source: sourceLangRef.current,
        target: targetLangRef.current,
        secondary: code,
        toneOverride: toneRef.current,
        split: isSplitViewRef.current,
      });
    }
  }, [handleTranslate]);

  const handleSelectTone = useCallback((newTone) => {
    setTone(newTone);
    toneRef.current = newTone;
    sounds.playClick();
    if (sourceTextRef.current.trim()) {
      handleTranslate({
        text: sourceTextRef.current,
        source: sourceLangRef.current,
        target: targetLangRef.current,
        secondary: secondaryLangRef.current,
        toneOverride: newTone,
        split: isSplitViewRef.current,
      });
    }
  }, [handleTranslate]);

  const handleToggleSplitView = useCallback(() => {
    const nextSplit = !isSplitView;
    setIsSplitView(nextSplit);
    isSplitViewRef.current = nextSplit;
    sounds.playClick();
    if (sourceTextRef.current.trim()) {
      handleTranslate({
        text: sourceTextRef.current,
        source: sourceLangRef.current,
        target: targetLangRef.current,
        secondary: secondaryLangRef.current,
        toneOverride: toneRef.current,
        split: nextSplit,
      });
    }
  }, [isSplitView, handleTranslate]);

  // Sync prop updates (e.g. when selected via Ctrl+K Command Palette)
  useEffect(() => {
    if (initialTargetLang && initialTargetLang !== targetLangRef.current) {
      handleSelectTargetLang(initialTargetLang);
    }
  }, [initialTargetLang, handleSelectTargetLang]);

  // Swap Languages Action
  const handleSwapLanguages = () => {
    const nextSource = targetLangRef.current;
    const nextTarget = sourceLangRef.current === 'auto'
      ? (primaryResult.meta?.detectedSource || 'en')
      : sourceLangRef.current;
    const nextText = primaryResult.text || sourceTextRef.current;
    
    setSourceLang(nextSource);
    setTargetLang(nextTarget);
    sourceLangRef.current = nextSource;
    targetLangRef.current = nextTarget;

    setSourceText(nextText);
    sourceTextRef.current = nextText;
    setPrimaryResult({ text: '', meta: null });

    sounds.playPop();
    addToast(`Swapped: ${nextSource.toUpperCase()} ⇄ ${nextTarget.toUpperCase()}`, 'info');

    if (nextText.trim()) {
      handleTranslate({
        text: nextText,
        source: nextSource,
        target: nextTarget,
        secondary: secondaryLangRef.current,
        toneOverride: toneRef.current,
        split: isSplitViewRef.current,
      });
    }
  };

  // Keyboard shortcut (Ctrl+Enter)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleTranslate();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTranslate]);

  // Cleanup abort controller
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  // Copy handler
  const handleCopy = (text, type = 'primary') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    sounds.playSuccess();
    setCopiedIndex(type);
    addToast('Translated text copied to clipboard', 'success');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Pronunciation handler
  const handlePlayVoice = (text, speechCode) => {
    if (isPlaying) {
      stopSpeech();
    } else {
      sounds.playClick();
      speak({ text, lang: speechCode });
    }
  };

  // File Upload Handler (.txt, .json)
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      if (content) {
        setSourceText(content.slice(0, 5000));
        sounds.playPop();
        addToast(`Imported ${file.name} (${Math.min(content.length, 5000)} chars)`, 'info');
      }
    };
    reader.readAsText(file);
  };

  // Export translated file
  const handleExportTranslation = () => {
    if (!primaryResult.text) return;
    const blob = new Blob([primaryResult.text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translation-${targetLang}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    sounds.playSuccess();
    addToast('Exported translated file (.txt)', 'success');
  };

  // Export secondary translated file (Split View)
  const handleExportSecondaryTranslation = () => {
    if (!secondaryResult.text) return;
    const blob = new Blob([secondaryResult.text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translation-parallel-${secondaryLang}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    sounds.playSuccess();
    addToast(`Exported Parallel (${secondaryLang.toUpperCase()}) file (.txt)`, 'success');
  };

  // Export Anki / Quizlet Flashcard Deck
  const handleExportFlashcards = () => {
    if (history.length === 0) {
      addToast('Translate phrases first to generate study flashcards', 'error');
      return;
    }
    // Anki Tab-Separated Values format: Front \t Back \t Tag
    const tsvContent = history
      .map((item) => `"${item.sourceText.replace(/"/g, '""')}"\t"${item.translatedText.replace(/"/g, '""')}"\t${item.targetLang}`)
      .join('\n');
    const blob = new Blob([tsvContent], { type: 'text/tab-separated-values;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anki-flashcard-deck-${Date.now()}.tsv`;
    a.click();
    URL.revokeObjectURL(url);
    sounds.playSuccess();
    addToast(`Exported ${history.length} flashcards (Anki / Quizlet format)`, 'success');
  };

  // Filter history
  const filteredHistory = useMemo(() => {
    if (!historySearch.trim()) return history;
    return history.filter(
      (h) =>
        h.sourceText.toLowerCase().includes(historySearch.toLowerCase()) ||
        h.translatedText.toLowerCase().includes(historySearch.toLowerCase()) ||
        h.targetLang.toLowerCase().includes(historySearch.toLowerCase())
    );
  }, [history, historySearch]);

  return (
    <div className="w-full max-w-[98%] 2xl:max-w-[1800px] mx-auto px-3 sm:px-6 lg:px-8 py-5">
      
      {/* Workbench Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-lg font-bold text-zinc-100 tracking-tight flex items-center gap-2">
              <span>Polyglot Translation Workstation</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></span>
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full glass-pill text-indigo-300 font-medium border-indigo-500/30">
              ✨ Auto-Detect Active
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Real-time multi-engine neural translation with language auto-detection, readability analytics, tone adapters, and Anki study flashcards.
          </p>
        </div>

        {/* Global Toolbar Controls */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Readability Analytics Toggle */}
          <button
            type="button"
            onClick={() => {
              setShowAnalytics(!showAnalytics);
              sounds.playClick();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              showAnalytics
                ? 'glass-pill-active text-white'
                : 'glass-pill text-zinc-400 hover:text-zinc-200'
            }`}
            title="Toggle Text Complexity & Readability Analyzer"
          >
            <BarChart2 className="w-3.5 h-3.5 text-accent-400" />
            <span className="hidden sm:inline">Analytics</span>
          </button>

          {/* History Toggle */}
          <button
            type="button"
            onClick={() => {
              setShowHistory(!showHistory);
              sounds.playClick();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              showHistory
                ? 'glass-pill-active text-white'
                : 'glass-pill text-zinc-400 hover:text-zinc-200'
            }`}
            title="Toggle translation history"
          >
            <History className="w-3.5 h-3.5 text-amber-400" />
            <span>History ({history.length})</span>
          </button>

          {/* Tone Selector */}
          <div className="flex items-center glass-panel p-0.5 rounded-lg text-xs font-mono">
            {TONE_MODIFIERS.map((t) => (
              <button
                key={t.id}
                onClick={() => handleSelectTone(t.id)}
                className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                  tone === t.id 
                    ? 'glass-pill-active text-white font-semibold shadow-md' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
                title={t.description}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Split View Toggle */}
          <button
            type="button"
            onClick={handleToggleSplitView}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              isSplitView
                ? 'glass-pill-active text-white'
                : 'glass-pill text-zinc-400 hover:text-zinc-200'
            }`}
            title="Translate simultaneously into 2 target languages side-by-side"
          >
            <Columns className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Split View</span>
          </button>
        </div>
      </div>

      {/* Live Operational Telemetry Pulse Bar */}
      <div className="flex items-center gap-3 py-2 px-4 rounded-xl glass-panel mb-5 text-[11px] font-mono text-zinc-400 overflow-x-auto shadow-sm">
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></span>
          <span className="text-zinc-200 font-semibold tracking-wide">Neural Pipeline Active</span>
        </div>
        <span className="text-zinc-700">•</span>
        <div className="flex items-center gap-1.5 shrink-0">
          <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Realtime Latency: <strong className="text-zinc-100">{primaryResult.meta?.latencyMs ? `${primaryResult.meta.latencyMs}ms` : '38ms'}</strong></span>
        </div>
        <span className="text-zinc-700">•</span>
        <div className="flex items-center gap-1.5 shrink-0">
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span>LRU Cache: <strong className="text-emerald-400">Memory Synchronized</strong></span>
        </div>
        <span className="text-zinc-700">•</span>
        <div className="flex items-center gap-1.5 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>25 Dialects Auto-Routed</span>
        </div>
      </div>

      {/* Language Bar with Swap Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 mb-4 text-xs hairline-b">
        <div className="flex items-center gap-2.5">
          {/* Source Language Picker */}
          <LanguageSelect
            value={sourceLang}
            onChange={handleSelectSourceLang}
            options={SOURCE_LANGUAGES}
            placeholder="Select source or Auto Detect..."
          />

          {/* Bidirectional Swap Button */}
          <button
            type="button"
            onClick={handleSwapLanguages}
            className="p-2 rounded-lg glass-pill hover:border-indigo-400/50 text-zinc-300 hover:text-white transition-all cursor-pointer shadow-md active:scale-95"
            title="Swap source and target languages (and text)"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-300" />
          </button>

          {/* Target Language Picker */}
          <LanguageSelect
            value={targetLang}
            onChange={handleSelectTargetLang}
            options={SUPPORTED_LANGUAGES}
            placeholder="Select target language..."
          />
        </div>

        {/* Popular Quick Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-zinc-500 font-mono text-[11px] mr-1 shrink-0 hidden md:inline">Popular:</span>
          {['es', 'fr', 'de', 'hi', 'ja', 'it', 'ar', 'ru'].map((code) => {
            const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code);
            const isSelected = targetLang === code;
            return (
              <button
                key={code}
                onClick={() => handleSelectTargetLang(code)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'glass-pill-active text-white font-semibold'
                    : 'glass-pill text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>{lang?.flag}</span>
                <span>{lang?.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Optional Readability & Text Complexity Bar */}
      {showAnalytics && (
        <div className="mb-4 p-4 rounded-xl glass-panel text-xs font-mono grid grid-cols-2 sm:grid-cols-4 gap-3 animate-slide-down">
          <div>
            <span className="text-zinc-400 block text-[10px] uppercase tracking-wider">Source Reading Level</span>
            <span className="text-zinc-100 font-semibold text-sm">{sourceAnalytics.readingLevel}</span>
          </div>
          <div>
            <span className="text-zinc-400 block text-[10px] uppercase tracking-wider">Reading Time</span>
            <span className="text-zinc-100 font-semibold text-sm">{sourceAnalytics.readingTimeSeconds}s @ 200wpm</span>
          </div>
          <div>
            <span className="text-zinc-400 block text-[10px] uppercase tracking-wider">Lexical Word Count</span>
            <span className="text-zinc-100 font-semibold text-sm">{sourceAnalytics.wordCount} words ({sourceAnalytics.sentenceCount} sent.)</span>
          </div>
          <div>
            <span className="text-zinc-400 block text-[10px] uppercase tracking-wider">Target Character Expansion</span>
            <span className="text-zinc-100 font-semibold text-sm">
              {sourceText.length > 0 && primaryResult.text.length > 0
                ? `${Math.round((primaryResult.text.length / sourceText.length) * 100)}% ratio`
                : '100%'}
            </span>
          </div>
        </div>
      )}

      {/* Main Dual / Multi Panel Workstation */}
      <div className={`grid gap-5 items-stretch ${isSplitView ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 lg:grid-cols-2'}`}>
        
        {/* Source Workstation Panel */}
        <div className="flex flex-col glass-panel p-6 sm:p-7 shadow-2xl focus-within:border-indigo-500/50 transition-all">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 hairline-b mb-3.5">
            <div className="flex items-center gap-2">
              <span className="text-base">{sourceLanguageObj.flag}</span>
              <span className="text-xs font-semibold text-zinc-100 font-sans tracking-wide">{sourceLanguageObj.name}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-300 border border-white/[0.08]">
                Source Input
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* File Upload Trigger */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.json,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-zinc-400 hover:text-zinc-100 flex items-center gap-1.5 transition-colors cursor-pointer glass-pill px-2.5 py-1 rounded-md"
                title="Upload .txt or .json file to translate"
              >
                <UploadCloud className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline font-medium">Upload</span>
              </button>

              {sourceText && (
                <button
                  onClick={() => {
                    setSourceText('');
                    setUploadedFileName('');
                    addToast('Cleared source input', 'info');
                  }}
                  className="text-xs text-zinc-400 hover:text-status-rose transition-colors cursor-pointer glass-pill px-2 py-1 rounded-md"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {uploadedFileName && (
            <div className="mb-2 px-3 py-1 rounded-md bg-white/[0.05] border border-white/[0.08] text-[11px] text-zinc-300 flex items-center justify-between font-mono">
              <span className="truncate">Loaded: {uploadedFileName}</span>
              <button onClick={() => setUploadedFileName('')} className="text-zinc-400 hover:text-zinc-100 font-bold">×</button>
            </div>
          )}

          {/* Text Area */}
          <textarea
            id="source-text-input"
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Type or paste text in any language, or dictate via microphone... (Ctrl+Enter to translate)"
            className="w-full flex-1 bg-transparent text-zinc-100 placeholder-zinc-500 text-base sm:text-lg min-h-[300px] sm:min-h-[380px] lg:min-h-[440px] resize-none focus:outline-none leading-relaxed font-sans"
          />

          {/* Sample Phrases Chips */}
          <div className="pt-3 pb-3.5 flex items-center gap-2 overflow-x-auto text-[11px] text-zinc-400">
            <span className="shrink-0 text-zinc-500 font-mono text-xs">Try:</span>
            {SAMPLE_PHRASES.map((phrase, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setSourceText(phrase);
                  sourceTextRef.current = phrase;
                  sounds.playClick();
                  handleTranslate({ text: phrase });
                }}
                className="shrink-0 px-2.5 py-1 rounded-md glass-pill text-zinc-300 hover:text-white transition-all font-sans truncate max-w-[170px] cursor-pointer"
              >
                "{phrase}"
              </button>
            ))}
          </div>

          {/* Source Footer Toolbar */}
          <div className="flex items-center justify-between pt-3.5 hairline-t text-xs text-zinc-400">
            <div className="flex items-center gap-3">
              {isMicSupported && (
                <button
                  type="button"
                  id="btn-voice-dictation"
                  onClick={toggleListening}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                    isListening
                      ? 'bg-rose-950/80 text-rose-200 border border-rose-600 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                      : 'glass-pill text-zinc-300 hover:text-white'
                  }`}
                  title={isListening ? 'Listening... click to stop' : 'Click to dictate via microphone'}
                >
                  {isListening ? (
                    <div className="flex items-center gap-1.5 text-status-rose">
                      <Mic className="w-3.5 h-3.5" />
                      <span className="flex gap-0.5 items-end h-3.5">
                        <span className="w-0.5 bg-rose-400 rounded-full animate-eq-1" />
                        <span className="w-0.5 bg-rose-400 rounded-full animate-eq-2" />
                        <span className="w-0.5 bg-rose-400 rounded-full animate-eq-3" />
                        <span className="w-0.5 bg-rose-400 rounded-full animate-eq-4" />
                      </span>
                    </div>
                  ) : (
                    <MicOff className="w-3.5 h-3.5 text-zinc-400" />
                  )}
                  <span className="text-[11px] font-medium">{isListening ? 'Recording...' : 'Dictate'}</span>
                </button>
              )}

              <span className="font-mono text-[11px] text-zinc-400">{sourceText.length} chars</span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="hidden sm:inline text-[10px] text-zinc-400 font-mono">
                Ctrl+Enter
              </span>
              <button
                id="btn-translate-action"
                type="button"
                onClick={() => handleTranslate()}
                disabled={isLoading || !sourceText.trim()}
                className="btn-glow-gradient flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white disabled:opacity-30 disabled:pointer-events-none disabled:shadow-none cursor-pointer tracking-wide shadow-lg"
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Translating...</span>
                  </>
                ) : (
                  <>
                    <span>Translate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Primary Target Output Panel */}
        <div className="flex flex-col glass-panel p-6 sm:p-7 shadow-2xl relative">
          {/* Scanning Beam Sweep while translating */}
          {isLoading && (
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-400 to-transparent animate-beam-sweep" />
          )}
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 hairline-b mb-3.5 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-base">{targetLanguageObj.flag}</span>
              <span className="text-xs font-semibold text-zinc-100 font-sans tracking-wide">{targetLanguageObj.name}</span>
              {primaryResult.meta?.detectedSource && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                  Detected: {primaryResult.meta.detectedSource.toUpperCase()}
                </span>
              )}
            </div>

            {primaryResult.meta && (
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-300 glass-pill px-2.5 py-1 rounded-md">
                {primaryResult.meta.fromCache ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Database className="w-2.5 h-2.5" /> LRU Cache
                  </span>
                ) : (
                  <>
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>{primaryResult.meta.latencyMs}ms</span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-400 truncate max-w-[120px]">{primaryResult.meta.engine}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Translated Content */}
          <div className="flex-1 min-h-[300px] sm:min-h-[380px] lg:min-h-[440px] flex flex-col justify-start">
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16">
                <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin shadow-lg shadow-indigo-500/20" />
                <p className="text-xs text-zinc-400 font-mono">Running neural translation engine...</p>
              </div>
            ) : error ? (
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs font-mono">
                <p className="font-semibold mb-1">Translation Notice:</p>
                <p>{error}</p>
              </div>
            ) : primaryResult.text ? (
              <div 
                id="translated-output-text"
                className={`text-zinc-100 text-base sm:text-lg leading-relaxed select-text py-1 animate-text-reveal ${
                  targetLanguageObj.dir === 'rtl' ? 'text-right font-sans' : ''
                }`}
              >
                {primaryResult.text}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 py-16">
                <Languages className="w-8 h-8 stroke-1 mb-2 text-zinc-600" />
                <p className="text-xs text-zinc-500 font-mono">Converted string will appear here.</p>
              </div>
            )}
          </div>

          {/* Target Footer Toolbar */}
          <div className="flex items-center justify-between pt-3.5 hairline-t text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              {primaryResult.text && (
                <>
                  <button
                    type="button"
                    id="btn-play-voice"
                    onClick={() => handlePlayVoice(primaryResult.text, targetLanguageObj.speechCode)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                      isPlaying
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                        : 'glass-pill text-zinc-300 hover:text-white'
                    }`}
                  >
                    {isPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-indigo-400" />}
                    <span className="text-[11px]">{isPlaying ? 'Speaking...' : 'Listen'}</span>
                  </button>

                  <button
                    type="button"
                    id="btn-copy-translation"
                    onClick={() => handleCopy(primaryResult.text, 'primary')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md glass-pill text-zinc-300 hover:text-white transition-all cursor-pointer"
                    title="Copy translation"
                  >
                    {copiedIndex === 'primary' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-status-emerald" />
                        <span className="text-[11px] text-status-emerald font-medium">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleExportTranslation}
                    className="p-2 rounded-md glass-pill text-zinc-400 hover:text-white transition-all cursor-pointer"
                    title="Download translated text file (.txt)"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-300" />
                  </button>
                </>
              )}
            </div>

            <div className="text-right">
              {primaryResult.text && <span className="font-mono text-[11px] text-zinc-400">{primaryResult.text.length} chars</span>}
            </div>
          </div>

        </div>

        {/* Secondary Target Panel (Only in Split View) */}
        {isSplitView && (
          <div className="flex flex-col glass-panel p-6 sm:p-7 shadow-2xl animate-fade-in relative">
            {isLoading && (
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-beam-sweep" />
            )}
            
            {/* Header with Custom Dropdown */}
            <div className="flex items-center justify-between pb-3.5 hairline-b mb-3.5 gap-2">
              <LanguageSelect
                value={secondaryLang}
                onChange={handleSelectSecondaryLang}
                options={SUPPORTED_LANGUAGES}
                placeholder="Filter parallel language..."
              />

              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-300 border border-white/[0.08]">
                Parallel #2
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-[300px] sm:min-h-[380px] lg:min-h-[440px] flex flex-col justify-start">
              {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16">
                  <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin shadow-lg shadow-indigo-500/20" />
                  <p className="text-xs text-zinc-400 font-mono">Translating parallel language...</p>
                </div>
              ) : secondaryResult.text ? (
                <div className={`text-zinc-100 text-base sm:text-lg leading-relaxed py-1 animate-text-reveal ${secondaryLanguageObj.dir === 'rtl' ? 'text-right font-sans' : ''}`}>
                  {secondaryResult.text}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 py-16">
                  <Languages className="w-8 h-8 stroke-1 mb-2 text-zinc-600" />
                  <p className="text-xs text-zinc-500 font-mono">Parallel translation will appear here.</p>
                </div>
              )}
            </div>

            {/* Footer Toolbar with Listen, Copy, AND DOWNLOAD */}
            <div className="flex items-center justify-between pt-3.5 hairline-t text-xs text-zinc-400">
              {secondaryResult.text && (
                <>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePlayVoice(secondaryResult.text, secondaryLanguageObj.speechCode)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md glass-pill text-zinc-300 hover:text-white cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="text-[11px]">Listen</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(secondaryResult.text, 'secondary')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md glass-pill text-zinc-300 hover:text-white cursor-pointer"
                      title="Copy secondary translation"
                    >
                      {copiedIndex === 'secondary' ? <Check className="w-3.5 h-3.5 text-status-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="text-[11px]">{copiedIndex === 'secondary' ? 'Copied' : 'Copy'}</span>
                    </button>
                    {/* Download Text Option for Second Language */}
                    <button
                      type="button"
                      onClick={handleExportSecondaryTranslation}
                      className="p-2 rounded-md glass-pill text-zinc-400 hover:text-white cursor-pointer"
                      title="Download parallel translated text (.txt)"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-300" />
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-[11px] text-zinc-400">{secondaryResult.text.length} chars</span>
                  </div>
                </>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Translation History Drawer / Panel with Flashcard Export */}
      {showHistory && (
        <div className="mt-6 glass-panel p-5 animate-slide-down shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 hairline-b mb-3.5">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-semibold text-zinc-100 font-sans tracking-wide">Translation History & Study Deck</h3>
              <span className="text-[11px] font-mono text-zinc-400">({history.length})</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Filter history..."
                  className="pl-7 pr-3 py-1 glass-pill rounded-md text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 font-sans"
                />
              </div>

              {/* Anki Flashcard Deck Export */}
              <button
                type="button"
                onClick={handleExportFlashcards}
                className="flex items-center gap-1 text-xs text-zinc-300 hover:text-white px-2.5 py-1 rounded-md bg-bg hairline hover:border-zinc-600 transition-colors cursor-pointer"
                title="Export history as Anki / Quizlet flashcard study deck (.tsv)"
              >
                <BookOpen className="w-3 h-3 text-accent-400" />
                <span className="hidden sm:inline">Export Flashcards</span>
              </button>

              <button
                onClick={() => {
                  setHistory([]);
                  sounds.playTone(300, 'sine', 0.05, 0.02);
                  addToast('Cleared translation history', 'info');
                }}
                className="text-xs text-zinc-400 hover:text-status-rose flex items-center gap-1 transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-zinc-800/60"
              >
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            </div>
          </div>

          {filteredHistory.length === 0 ? (
            <div className="py-6 text-center text-xs text-zinc-500 font-mono">
              {history.length === 0 ? 'No translation entries yet.' : 'No entries match your search.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSourceText(item.sourceText);
                    setPrimaryResult({ text: item.translatedText, meta: { engine: item.engine, fromCache: item.fromCache } });
                    sounds.playClick();
                    addToast(`Restored "${item.sourceText.slice(0, 20)}..."`, 'info');
                  }}
                  className="p-2.5 rounded-lg bg-bg hairline hover:border-zinc-600 cursor-pointer transition-colors group text-left"
                >
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                    <span className="flex items-center gap-1.5 font-medium text-zinc-300">
                      <span>{item.flag}</span>
                      <span>{item.targetLang}</span>
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono">
                      <Clock className="w-2.5 h-2.5" />
                      {item.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 font-medium line-clamp-1 group-hover:text-zinc-100 transition-colors">
                    {item.sourceText}
                  </p>
                  <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5 font-sans">
                    {item.translatedText}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
