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
  Sparkles, 
  RotateCcw, 
  History, 
  Clock, 
  Trash2, 
  Zap, 
  UploadCloud, 
  Download, 
  Layers, 
  FileText, 
  Columns, 
  SlidersHorizontal,
  Flame,
  CheckCircle2,
  Database
} from 'lucide-react';
import { 
  SUPPORTED_LANGUAGES, 
  TONE_MODIFIERS, 
  translateText, 
  getStoredApiConfig 
} from '../services/translationService';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { sounds } from '../utils/audioFeedback';

const SAMPLE_PHRASES = [
  "Hello, nice to meet you!",
  "Front-end development with React and Tailwind CSS.",
  "Our internship submission features high-performance architecture.",
  "Could you please guide me to the nearest metro station?"
];

export default function TranslatorPage({ onOpenApiModal, initialTargetLang = 'es' }) {
  const [sourceText, setSourceText] = useState('');
  const [targetLang, setTargetLang] = useState(initialTargetLang);
  const [secondaryLang, setSecondaryLang] = useState('fr'); // For Split View
  const [tone, setTone] = useState('standard');
  const [isSplitView, setIsSplitView] = useState(false);

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
  const targetLanguageObj = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === targetLang) || SUPPORTED_LANGUAGES[0];
  }, [targetLang]);

  const secondaryLanguageObj = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === secondaryLang) || SUPPORTED_LANGUAGES[1];
  }, [secondaryLang]);

  // Handle Translate Execution with AbortController and Multi-Target support
  const handleTranslate = useCallback(async (textToTranslate = sourceText) => {
    if (!textToTranslate || !textToTranslate.trim()) {
      setPrimaryResult({ text: '', meta: null });
      setSecondaryResult({ text: '', meta: null });
      return;
    }

    // Abort any prior in-flight fetch
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
            sourceLang: 'en',
            targetLang: targetLang,
            tone,
            signal,
          }),
          translateText({
            text: textToTranslate,
            sourceLang: 'en',
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
          sourceLang: 'en',
          targetLang: targetLang,
          tone,
          signal,
        });

        setPrimaryResult({ text: res.translatedText, meta: res });
        sounds.playSuccess();

        // Persist to history
        setHistory((prev) => {
          const entry = {
            id: Date.now(),
            sourceText: textToTranslate.trim(),
            translatedText: res.translatedText,
            targetLang: targetLanguageObj.name,
            flag: targetLanguageObj.flag,
            engine: res.engine,
            fromCache: res.fromCache,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          return [entry, ...prev.filter((p) => p.sourceText !== textToTranslate.trim()).slice(0, 9)];
        });
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('Translation error:', err);
      setError(err.message || 'An error occurred during translation');
    } finally {
      setIsLoading(false);
    }
  }, [sourceText, targetLang, secondaryLang, isSplitView, tone, targetLanguageObj, setHistory]);

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
        setSourceText(content.slice(0, 5000)); // Limit to 5000 chars for safety
        sounds.playPop();
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
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6">
      
      {/* Title & Badge */}
      <div className="text-center max-w-2xl mx-auto mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Slab 1 • Task 1: Enterprise Text Translator</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Intelligent Text <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Translator</span>
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Engineered with RapidAPI integration, client-side LRU caching, voice dictation, and multi-language split comparisons.
        </p>
      </div>

      {/* Advanced Toolbar: Split View Toggle & Tone Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
        
        {/* Popular Language Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-1">
          <span className="text-slate-400 text-[11px] font-medium mr-1">Popular:</span>
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
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 whitespace-nowrap ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>{lang?.flag}</span>
                <span>{lang?.name}</span>
              </button>
            );
          })}
        </div>

        {/* View Mode & File Options */}
        <div className="flex items-center gap-2">
          {/* Tone Selector */}
          <div className="flex items-center bg-slate-950 rounded-xl p-1 border border-slate-800 text-xs">
            <span className="px-2 text-[10px] text-slate-500 font-semibold uppercase">Tone:</span>
            {TONE_MODIFIERS.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTone(t.id);
                  sounds.playClick();
                  if (sourceText.trim()) setTimeout(() => handleTranslate(sourceText), 50);
                }}
                className={`px-2 py-0.5 rounded-lg font-medium transition-colors ${
                  tone === t.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title={t.description}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Multi-Target Split View Switcher */}
          <button
            type="button"
            onClick={() => {
              setIsSplitView(!isSplitView);
              sounds.playClick();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
              isSplitView
                ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Translate simultaneously into 2 target languages side-by-side"
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Split View</span>
          </button>
        </div>

      </div>

      {/* Main Dual / Multi Card Translation Grid */}
      <div className={`grid gap-6 items-stretch ${isSplitView ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 lg:grid-cols-2'}`}>
        
        {/* Source Text Area (English) */}
        <div className="flex flex-col bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl transition-all focus-within:border-indigo-500/50">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-base">🇬🇧</span>
              <span className="text-sm font-semibold text-white">English (Source)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">Input</span>
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
                className="text-xs text-slate-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                title="Upload .txt or .json file to translate"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Upload File</span>
              </button>

              {sourceText && (
                <button
                  onClick={() => {
                    setSourceText('');
                    setUploadedFileName('');
                  }}
                  className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {uploadedFileName && (
            <div className="mb-2 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 flex items-center justify-between">
              <span className="truncate">Loaded: {uploadedFileName}</span>
              <button onClick={() => setUploadedFileName('')} className="text-slate-400 hover:text-white">×</button>
            </div>
          )}

          {/* Text Area */}
          <textarea
            id="source-text-input"
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Type or paste English text here, or dictate with the microphone... (Ctrl+Enter to translate)"
            rows={isSplitView ? 8 : 7}
            className="w-full flex-1 bg-transparent text-slate-100 placeholder-slate-500 text-base resize-none focus:outline-none leading-relaxed"
          />

          {/* Sample Phrases Pills */}
          <div className="pt-2 pb-3 flex items-center gap-1.5 overflow-x-auto text-[11px] text-slate-400">
            <span className="shrink-0 text-slate-500">Try:</span>
            {SAMPLE_PHRASES.map((phrase, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setSourceText(phrase);
                  sounds.playClick();
                  handleTranslate(phrase);
                }}
                className="shrink-0 px-2 py-0.5 rounded-md bg-slate-950 hover:bg-slate-800 text-slate-300 transition-colors border border-slate-800"
              >
                "{phrase.slice(0, 20)}..."
              </button>
            ))}
          </div>

          {/* Source Footer Toolbar */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              {isMicSupported && (
                <button
                  type="button"
                  id="btn-voice-dictation"
                  onClick={toggleListening}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all ${
                    isListening
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                  title={isListening ? 'Listening... click to stop' : 'Click to dictate via microphone'}
                >
                  {isListening ? <Mic className="w-3.5 h-3.5 text-rose-400" /> : <MicOff className="w-3.5 h-3.5" />}
                  <span>{isListening ? 'Listening...' : 'Dictate'}</span>
                </button>
              )}

              <span>{sourceText.length} chars</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-[11px] text-slate-500">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px]">Ctrl</kbd>+<kbd className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px]">Enter</kbd>
              </span>
              <button
                id="btn-translate-action"
                type="button"
                onClick={() => handleTranslate()}
                disabled={isLoading || !sourceText.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Translating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Translate</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Primary Target Output Card */}
        <div className="flex flex-col bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
          
          {/* Header & Target Selector */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 gap-2">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-base">{targetLanguageObj.flag}</span>
              <select
                id="target-language-select"
                value={targetLang}
                onChange={(e) => {
                  setTargetLang(e.target.value);
                  sounds.playClick();
                  if (sourceText.trim()) setTimeout(() => handleTranslate(sourceText), 50);
                }}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-medium focus:outline-none focus:border-indigo-500 cursor-pointer max-w-[170px]"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
            </div>

            {primaryResult.meta && (
              <div className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                {primaryResult.meta.fromCache ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Database className="w-2.5 h-2.5" /> LRU Cache
                  </span>
                ) : (
                  <>
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>{primaryResult.meta.latencyMs}ms</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Translated Content */}
          <div className="flex-1 min-h-[160px] flex flex-col justify-start">
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 py-10">
                <div className="w-8 h-8 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-xs text-slate-400 animate-pulse">Translating phrase...</p>
              </div>
            ) : error ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                <p className="font-semibold mb-1">Translation Notice:</p>
                <p>{error}</p>
              </div>
            ) : primaryResult.text ? (
              <div 
                id="translated-output-text"
                className={`text-slate-100 text-base leading-relaxed select-text py-1 ${
                  targetLanguageObj.dir === 'rtl' ? 'text-right font-sans' : ''
                }`}
              >
                {primaryResult.text}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-10">
                <Languages className="w-8 h-8 stroke-1 mb-2 text-slate-600" />
                <p className="text-xs">Converted string will appear here.</p>
              </div>
            )}
          </div>

          {/* Target Footer Toolbar */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              {primaryResult.text && (
                <>
                  <button
                    type="button"
                    id="btn-play-voice"
                    onClick={() => handlePlayVoice(primaryResult.text, targetLanguageObj.speechCode)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                      isPlaying
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 animate-pulse'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white'
                    }`}
                  >
                    {isPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isPlaying ? 'Speaking...' : 'Listen'}</span>
                  </button>

                  <button
                    type="button"
                    id="btn-copy-translation"
                    onClick={() => handleCopy(primaryResult.text, 'primary')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
                  >
                    {copiedIndex === 'primary' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === 'primary' ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportTranslation}
                    className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
                    title="Download translated text file"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>

            <div className="text-right">
              {primaryResult.text && <span className="text-[11px] text-slate-500">{primaryResult.text.length} chars</span>}
            </div>
          </div>

        </div>

        {/* Secondary Target Card (Only in Split View) */}
        {isSplitView && (
          <div className="flex flex-col bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl animate-fade-in">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 gap-2">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-base">{secondaryLanguageObj.flag}</span>
                <select
                  value={secondaryLang}
                  onChange={(e) => {
                    setSecondaryLang(e.target.value);
                    sounds.playClick();
                    if (sourceText.trim()) setTimeout(() => handleTranslate(sourceText), 50);
                  }}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-medium focus:outline-none focus:border-indigo-500 cursor-pointer max-w-[170px]"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                      {l.flag} {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Split #2
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-[160px] flex flex-col justify-start">
              {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 py-10">
                  <div className="w-8 h-8 border-3 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                  <p className="text-xs text-slate-400 animate-pulse">Translating parallel language...</p>
                </div>
              ) : secondaryResult.text ? (
                <div className={`text-slate-100 text-base leading-relaxed py-1 ${secondaryLanguageObj.dir === 'rtl' ? 'text-right font-sans' : ''}`}>
                  {secondaryResult.text}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-10">
                  <Languages className="w-8 h-8 stroke-1 mb-2 text-slate-700" />
                  <p className="text-xs">Parallel translation will appear here.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400">
              {secondaryResult.text && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePlayVoice(secondaryResult.text, secondaryLanguageObj.speechCode)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 text-slate-300 border border-slate-800 hover:text-white"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(secondaryResult.text, 'secondary')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800"
                  >
                    {copiedIndex === 'secondary' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === 'secondary' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Translation History Section */}
      {history.length > 0 && (
        <div className="mt-12 bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">Recent Translation History</h3>
              <span className="text-xs text-slate-500">({history.length})</span>
            </div>
            <button
              onClick={() => {
                setHistory([]);
                sounds.playTone(300, 'sine', 0.05, 0.02);
              }}
              className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" /> Clear History
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSourceText(item.sourceText);
                  setPrimaryResult({ text: item.translatedText, meta: { engine: item.engine, fromCache: item.fromCache } });
                  sounds.playClick();
                }}
                className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                  <span className="flex items-center gap-1 font-medium text-slate-300">
                    <span>{item.flag}</span>
                    <span>{item.targetLang}</span>
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Clock className="w-2.5 h-2.5" />
                    {item.timestamp}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium line-clamp-1 group-hover:text-indigo-300 transition-colors">
                  {item.sourceText}
                </p>
                <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                  {item.translatedText}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
