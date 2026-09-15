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
  Share2
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

  // Sync prop updates (e.g. when selected via Ctrl+K Command Palette)
  useEffect(() => {
    if (initialTargetLang) {
      setTargetLang(initialTargetLang);
    }
  }, [initialTargetLang]);

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

  // Handle Translate Execution with AbortController and Multi-Target support
  const handleTranslate = useCallback(async (textToTranslate = sourceText) => {
    if (!textToTranslate || !textToTranslate.trim()) {
      setPrimaryResult({ text: '', meta: null });
      setSecondaryResult({ text: '', meta: null });
      return;
    }

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
      if (isSplitView) {
        // Parallel translation into both languages
        const [res1, res2] = await Promise.all([
          translateText({
            text: textToTranslate,
            sourceLang,
            targetLang,
            tone,
            signal,
          }),
          translateText({
            text: textToTranslate,
            sourceLang,
            targetLang: secondaryLang,
            tone,
            signal,
          }),
        ]);

        setPrimaryResult({ text: res1.translatedText, meta: res1 });
        setSecondaryResult({ text: res2.translatedText, meta: res2 });
        sounds.playSuccess();
      } else {
        const res = await translateText({
          text: textToTranslate,
          sourceLang,
          targetLang,
          tone,
          signal,
        });

        setPrimaryResult({ text: res.translatedText, meta: res });
        sounds.playSuccess();

        // Push to History
        setHistory((prev) => {
          const entry = {
            id: Date.now(),
            sourceText: textToTranslate.trim(),
            translatedText: res.translatedText,
            targetLang: targetLanguageObj.name,
            flag: targetLanguageObj.flag,
            sourceLangCode: res.detectedSource || sourceLang,
            engine: res.engine,
            fromCache: res.fromCache,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          return [entry, ...prev.filter((p) => p.sourceText !== textToTranslate.trim()).slice(0, 19)];
        });
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('Translation error:', err);
      setError(err.message || 'An error occurred during translation');
      addToast(err.message || 'Translation request failed', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [sourceText, sourceLang, targetLang, secondaryLang, isSplitView, tone, targetLanguageObj, setHistory, addToast]);

  // Swap Languages Action
  const handleSwapLanguages = () => {
    let nextSource = targetLang;
    let nextTarget = sourceLang === 'auto' ? (primaryResult.meta?.detectedSource || 'en') : sourceLang;
    
    setSourceLang(nextSource);
    setTargetLang(nextTarget);

    // Also swap text if translated output exists
    if (primaryResult.text) {
      const prevSource = sourceText;
      const prevTranslated = primaryResult.text;
      setSourceText(prevTranslated);
      setPrimaryResult({ text: prevSource, meta: null });
    }

    sounds.playPop();
    addToast(`Swapped: ${nextSource.toUpperCase()} ⇄ ${nextTarget.toUpperCase()}`, 'info');
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
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6">
      
      {/* Workbench Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-base font-semibold text-zinc-100 tracking-tight">Polyglot Translation Workstation</h1>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/60">
              Auto-Detect Ready
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Real-time multi-engine neural translation with language auto-detection, readability analytics, and flashcards.
          </p>
        </div>

        {/* Global Toolbar Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Readability Analytics Toggle */}
          <button
            type="button"
            onClick={() => {
              setShowAnalytics(!showAnalytics);
              sounds.playClick();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hairline text-xs font-medium transition-colors cursor-pointer ${
              showAnalytics
                ? 'bg-zinc-800 text-zinc-100 border-zinc-600'
                : 'bg-panel text-zinc-400 hover:text-zinc-200'
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
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hairline text-xs font-medium transition-colors cursor-pointer ${
              showHistory
                ? 'bg-zinc-800 text-zinc-100 border-zinc-600'
                : 'bg-panel text-zinc-400 hover:text-zinc-200'
            }`}
            title="Toggle translation history"
          >
            <History className="w-3.5 h-3.5" />
            <span>History ({history.length})</span>
          </button>

          {/* Tone Selector */}
          <div className="flex items-center bg-panel hairline rounded-lg p-0.5 text-xs font-mono">
            {TONE_MODIFIERS.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTone(t.id);
                  sounds.playClick();
                  if (sourceText.trim()) setTimeout(() => handleTranslate(sourceText), 50);
                }}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  tone === t.id 
                    ? 'bg-zinc-800 text-zinc-100 shadow-subtle' 
                    : 'text-zinc-400 hover:text-zinc-200'
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
            onClick={() => {
              setIsSplitView(!isSplitView);
              sounds.playClick();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hairline text-xs font-medium transition-colors cursor-pointer ${
              isSplitView
                ? 'bg-zinc-800 text-zinc-100 border-zinc-600'
                : 'bg-panel text-zinc-400 hover:text-zinc-200'
            }`}
            title="Translate simultaneously into 2 target languages side-by-side"
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Split View</span>
          </button>
        </div>
      </div>

      {/* Language Bar with Swap Button */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 text-xs hairline-b">
        <div className="flex items-center gap-2">
          {/* Source Language Picker */}
          <LanguageSelect
            value={sourceLang}
            onChange={(code) => {
              setSourceLang(code);
              if (sourceText.trim()) setTimeout(() => handleTranslate(sourceText), 50);
            }}
            options={SOURCE_LANGUAGES}
            placeholder="Select source or Auto Detect..."
          />

          {/* Bidirectional Swap Button */}
          <button
            type="button"
            onClick={handleSwapLanguages}
            className="p-1.5 rounded-lg bg-panel hairline hover:border-zinc-500 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer shadow-subtle"
            title="Swap source and target languages (and text)"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </button>

          {/* Target Language Picker */}
          <LanguageSelect
            value={targetLang}
            onChange={(code) => {
              setTargetLang(code);
              if (sourceText.trim()) setTimeout(() => handleTranslate(sourceText), 50);
            }}
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
                onClick={() => {
                  setTargetLang(code);
                  sounds.playClick();
                  if (sourceText.trim()) setTimeout(() => handleTranslate(sourceText), 50);
                }}
                className={`px-2 py-0.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 whitespace-nowrap hairline cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-800 text-zinc-100 border-zinc-600 shadow-subtle'
                    : 'bg-panel text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
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
        <div className="mb-4 p-3 rounded-lg bg-panel hairline text-xs font-mono grid grid-cols-2 sm:grid-cols-4 gap-3 animate-slide-down">
          <div>
            <span className="text-zinc-500 block text-[10px]">Source Reading Level</span>
            <span className="text-zinc-200 font-semibold">{sourceAnalytics.readingLevel}</span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[10px]">Reading Time</span>
            <span className="text-zinc-200 font-semibold">{sourceAnalytics.readingTimeSeconds}s @ 200wpm</span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[10px]">Lexical Word Count</span>
            <span className="text-zinc-200 font-semibold">{sourceAnalytics.wordCount} words ({sourceAnalytics.sentenceCount} sentences)</span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[10px]">Target Character Expansion</span>
            <span className="text-zinc-200 font-semibold">
              {sourceText.length > 0 && primaryResult.text.length > 0
                ? `${Math.round((primaryResult.text.length / sourceText.length) * 100)}% ratio`
                : '100%'}
            </span>
          </div>
        </div>
      )}

      {/* Main Dual / Multi Panel Workstation */}
      <div className={`grid gap-4 items-stretch ${isSplitView ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 lg:grid-cols-2'}`}>
        
        {/* Source Workstation Panel */}
        <div className="flex flex-col surface-card p-5 shadow-panel focus-within:border-zinc-500/70 transition-all">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 hairline-b mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm">{sourceLanguageObj.flag}</span>
              <span className="text-xs font-semibold text-zinc-200 font-sans">{sourceLanguageObj.name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
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
                className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors cursor-pointer"
                title="Upload .txt or .json file to translate"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Upload</span>
              </button>

              {sourceText && (
                <button
                  onClick={() => {
                    setSourceText('');
                    setUploadedFileName('');
                    addToast('Cleared source input', 'info');
                  }}
                  className="text-xs text-zinc-400 hover:text-status-rose transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {uploadedFileName && (
            <div className="mb-2 px-2.5 py-1 rounded-md bg-zinc-800/80 hairline text-[11px] text-zinc-300 flex items-center justify-between font-mono">
              <span className="truncate">Loaded: {uploadedFileName}</span>
              <button onClick={() => setUploadedFileName('')} className="text-zinc-400 hover:text-zinc-100">×</button>
            </div>
          )}

          {/* Text Area */}
          <textarea
            id="source-text-input"
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Type or paste text in any language, or dictate via microphone... (Ctrl+Enter to translate)"
            rows={isSplitView ? 9 : 8}
            className="w-full flex-1 bg-transparent text-zinc-100 placeholder-zinc-500 text-sm resize-none focus:outline-none leading-relaxed font-sans"
          />

          {/* Sample Phrases Chips */}
          <div className="pt-2 pb-3 flex items-center gap-1.5 overflow-x-auto text-[11px] text-zinc-400">
            <span className="shrink-0 text-zinc-500 font-mono">Try:</span>
            {SAMPLE_PHRASES.map((phrase, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setSourceText(phrase);
                  sounds.playClick();
                  handleTranslate(phrase);
                }}
                className="shrink-0 px-2 py-0.5 rounded bg-bg hover:bg-zinc-800 text-zinc-300 transition-colors hairline font-sans truncate max-w-[140px] cursor-pointer"
              >
                "{phrase}"
              </button>
            ))}
          </div>

          {/* Source Footer Toolbar */}
          <div className="flex items-center justify-between pt-3 hairline-t text-xs text-zinc-400">
            <div className="flex items-center gap-3">
              {isMicSupported && (
                <button
                  type="button"
                  id="btn-voice-dictation"
                  onClick={toggleListening}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md hairline transition-all cursor-pointer ${
                    isListening
                      ? 'bg-rose-950/60 text-rose-300 border-rose-800 shadow-subtle'
                      : 'bg-bg text-zinc-400 hover:text-zinc-200'
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
                    <MicOff className="w-3.5 h-3.5" />
                  )}
                  <span className="text-[11px] font-medium">{isListening ? 'Recording...' : 'Dictate'}</span>
                </button>
              )}

              <span className="font-mono text-[11px] text-zinc-500">{sourceText.length} chars</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-[10px] text-zinc-500 font-mono">
                Ctrl+Enter
              </span>
              <button
                id="btn-translate-action"
                type="button"
                onClick={() => handleTranslate()}
                disabled={isLoading || !sourceText.trim()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-zinc-100 hover:bg-white disabled:opacity-50 text-zinc-950 transition-colors cursor-pointer shadow-subtle"
              >
                {isLoading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-zinc-400 border-t-zinc-950 rounded-full animate-spin" />
                    <span>Translating...</span>
                  </>
                ) : (
                  <>
                    <span>Translate</span>
                    <ArrowRight className="w-3 h-3" />
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Primary Target Output Panel */}
        <div className="flex flex-col surface-card p-5 shadow-panel">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 hairline-b mb-3 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm">{targetLanguageObj.flag}</span>
              <span className="text-xs font-semibold text-zinc-200 font-sans">{targetLanguageObj.name}</span>
              {primaryResult.meta?.detectedSource && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-status-emerald">
                  From: {primaryResult.meta.detectedSource.toUpperCase()}
                </span>
              )}
            </div>

            {primaryResult.meta && (
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 bg-bg px-2 py-0.5 rounded hairline">
                {primaryResult.meta.fromCache ? (
                  <span className="text-status-emerald flex items-center gap-1">
                    <Database className="w-2.5 h-2.5" /> LRU Cache
                  </span>
                ) : (
                  <>
                    <Zap className="w-3 h-3 text-status-amber" />
                    <span>{primaryResult.meta.latencyMs}ms</span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-400 truncate max-w-[120px]">{primaryResult.meta.engine}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Translated Content */}
          <div className="flex-1 min-h-[160px] flex flex-col justify-start">
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2.5 py-10">
                <div className="w-6 h-6 border-2 border-zinc-700 border-t-zinc-200 rounded-full animate-spin" />
                <p className="text-xs text-zinc-400 font-mono">Running neural translation engine...</p>
              </div>
            ) : error ? (
              <div className="p-3 rounded-md bg-rose-950/40 hairline border-rose-800/60 text-rose-300 text-xs font-mono">
                <p className="font-semibold mb-0.5">Translation Notice:</p>
                <p>{error}</p>
              </div>
            ) : primaryResult.text ? (
              <div 
                id="translated-output-text"
                className={`text-zinc-100 text-sm leading-relaxed select-text py-1 ${
                  targetLanguageObj.dir === 'rtl' ? 'text-right font-sans' : ''
                }`}
              >
                {primaryResult.text}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 py-10">
                <Languages className="w-6 h-6 stroke-1 mb-2 text-zinc-700" />
                <p className="text-xs text-zinc-500 font-mono">Converted string will appear here.</p>
              </div>
            )}
          </div>

          {/* Target Footer Toolbar */}
          <div className="flex items-center justify-between pt-3 hairline-t text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              {primaryResult.text && (
                <>
                  <button
                    type="button"
                    id="btn-play-voice"
                    onClick={() => handlePlayVoice(primaryResult.text, targetLanguageObj.speechCode)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md hairline transition-colors cursor-pointer ${
                      isPlaying
                        ? 'bg-zinc-800 text-white'
                        : 'bg-bg text-zinc-300 hover:text-white'
                    }`}
                  >
                    {isPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span className="text-[11px]">{isPlaying ? 'Speaking...' : 'Listen'}</span>
                  </button>

                  <button
                    type="button"
                    id="btn-copy-translation"
                    onClick={() => handleCopy(primaryResult.text, 'primary')}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-bg hover:bg-zinc-800 text-zinc-300 hairline transition-colors cursor-pointer"
                    title="Copy translation"
                  >
                    {copiedIndex === 'primary' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-status-emerald" />
                        <span className="text-[11px] text-status-emerald">Copied</span>
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
                    className="p-1 rounded-md bg-bg hover:bg-zinc-800 text-zinc-400 hover:text-white hairline transition-colors cursor-pointer"
                    title="Download translated text file (.txt)"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>

            <div className="text-right">
              {primaryResult.text && <span className="font-mono text-[11px] text-zinc-500">{primaryResult.text.length} chars</span>}
            </div>
          </div>

        </div>

        {/* Secondary Target Panel (Only in Split View) */}
        {isSplitView && (
          <div className="flex flex-col surface-card p-5 shadow-panel animate-fade-in">
            
            {/* Header with Custom Dropdown */}
            <div className="flex items-center justify-between pb-3 hairline-b mb-3 gap-2">
              <LanguageSelect
                value={secondaryLang}
                onChange={(code) => {
                  setSecondaryLang(code);
                  if (sourceText.trim()) setTimeout(() => handleTranslate(sourceText), 50);
                }}
                options={SUPPORTED_LANGUAGES}
                placeholder="Filter parallel language..."
              />

              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                Parallel #2
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-[160px] flex flex-col justify-start">
              {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-2.5 py-10">
                  <div className="w-6 h-6 border-2 border-zinc-700 border-t-zinc-200 rounded-full animate-spin" />
                  <p className="text-xs text-zinc-400 font-mono">Translating parallel language...</p>
                </div>
              ) : secondaryResult.text ? (
                <div className={`text-zinc-100 text-sm leading-relaxed py-1 ${secondaryLanguageObj.dir === 'rtl' ? 'text-right font-sans' : ''}`}>
                  {secondaryResult.text}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 py-10">
                  <Languages className="w-6 h-6 stroke-1 mb-2 text-zinc-700" />
                  <p className="text-xs text-zinc-500 font-mono">Parallel translation will appear here.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 hairline-t text-xs text-zinc-400">
              {secondaryResult.text && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePlayVoice(secondaryResult.text, secondaryLanguageObj.speechCode)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-bg text-zinc-300 hairline hover:text-white cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Listen</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(secondaryResult.text, 'secondary')}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-bg hover:bg-zinc-800 text-zinc-300 hairline cursor-pointer"
                  >
                    {copiedIndex === 'secondary' ? <Check className="w-3.5 h-3.5 text-status-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="text-[11px]">{copiedIndex === 'secondary' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Translation History Drawer / Panel with Flashcard Export */}
      {showHistory && (
        <div className="mt-6 bg-panel hairline rounded-xl p-4 animate-slide-down shadow-subtle">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 hairline-b mb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-zinc-400" />
              <h3 className="text-xs font-semibold text-zinc-200">Translation History & Study Deck</h3>
              <span className="text-[11px] font-mono text-zinc-500">({history.length})</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3 h-3 text-zinc-500 absolute left-2 top-2" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Filter history..."
                  className="pl-6 pr-2 py-1 bg-bg hairline rounded-md text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
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
