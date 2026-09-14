import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  CornerDownLeft, 
  Search,
  ExternalLink 
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, translateText, getStoredApiConfig } from '../services/translationService';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useLocalStorage } from '../hooks/useLocalStorage';

const SAMPLE_PHRASES = [
  "Hello, nice to meet you!",
  "Front-end development with React and Tailwind CSS.",
  "Learning new technologies opens wonderful opportunities.",
  "Could you please guide me to the nearest train station?"
];

export default function TranslatorPage({ onOpenApiModal }) {
  const [sourceText, setSourceText] = useState('');
  const [targetLang, setTargetLang] = useState('es'); // Default Spanish
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metaInfo, setMetaInfo] = useState(null); // { engine, latencyMs }
  const [copied, setCopied] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  const [history, setHistory] = useLocalStorage('qskill_translator_history', []);

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

  // Selected language object
  const selectedTargetLanguage = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === targetLang) || SUPPORTED_LANGUAGES[0];
  }, [targetLang]);

  // Filtered languages for dropdown / selector
  const filteredLanguages = useMemo(() => {
    if (!langSearch.trim()) return SUPPORTED_LANGUAGES;
    const q = langSearch.toLowerCase();
    return SUPPORTED_LANGUAGES.filter(
      (l) => l.name.toLowerCase().includes(q) || l.native.toLowerCase().includes(q) || l.code.toLowerCase().includes(q)
    );
  }, [langSearch]);

  // Handle Translate Action
  const handleTranslate = useCallback(async (textToTranslate = sourceText) => {
    if (!textToTranslate || !textToTranslate.trim()) {
      setTranslatedText('');
      setMetaInfo(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await translateText({
        text: textToTranslate,
        sourceLang: 'en',
        targetLang: targetLang,
      });

      setTranslatedText(result.translatedText);
      setMetaInfo({
        engine: result.engine,
        latencyMs: result.latencyMs,
      });

      // Append to history (keep latest 10)
      setHistory((prev) => {
        const entry = {
          id: Date.now(),
          sourceText: textToTranslate.trim(),
          translatedText: result.translatedText,
          targetLang: selectedTargetLanguage.name,
          flag: selectedTargetLanguage.flag,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        return [entry, ...prev.filter((p) => p.sourceText !== textToTranslate.trim()).slice(0, 9)];
      });
    } catch (err) {
      console.error('Translation error:', err);
      setError(err.message || 'An error occurred during translation');
    } finally {
      setIsLoading(false);
    }
  }, [sourceText, targetLang, selectedTargetLanguage, setHistory]);

  // Handle Keyboard Shortcut (Ctrl/Cmd + Enter)
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

  // Handle Copy to clipboard
  const handleCopy = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle Audio Speech Playback
  const handlePlayVoice = () => {
    if (isPlaying) {
      stopSpeech();
    } else {
      speak({
        text: translatedText,
        lang: selectedTargetLanguage.speechCode,
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6">
      
      {/* Title & Badge */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Slab 1 • Task 1: RapidAPI Text Translator</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Intelligent Text <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Translator</span>
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Translate any English string into your favourite language in real-time powered by RapidAPI and modern React architecture.
        </p>
      </div>

      {/* Quick Language Chips */}
      <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
        <span className="text-xs text-slate-400 font-medium mr-1">Popular:</span>
        {['es', 'fr', 'de', 'hi', 'ja', 'it', 'ar', 'ru'].map((code) => {
          const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code);
          const isSelected = targetLang === code;
          return (
            <button
              key={code}
              id={`quick-lang-${code}`}
              onClick={() => {
                setTargetLang(code);
                if (sourceText.trim()) {
                  // Re-translate with new language
                  setTimeout(() => handleTranslate(sourceText), 50);
                }
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <span>{lang?.flag}</span>
              <span>{lang?.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Dual Card Translator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* Source Text Area (English) */}
        <div className="flex flex-col bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl transition-all focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-base">🇬🇧</span>
              <span className="text-sm font-semibold text-white">English (Source)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">Input</span>
            </div>

            {sourceText && (
              <button
                onClick={() => setSourceText('')}
                id="btn-clear-source"
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Text Area */}
          <textarea
            id="source-text-input"
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Type or paste English text here... (e.g., 'Hello, how are you?')"
            rows={7}
            className="w-full flex-1 bg-transparent text-slate-100 placeholder-slate-500 text-base resize-none focus:outline-none leading-relaxed"
          />

          {/* Sample Phrases Pill List */}
          <div className="pt-2 pb-3 flex items-center gap-1.5 overflow-x-auto text-[11px] text-slate-400">
            <span className="shrink-0 text-slate-400">Try:</span>
            {SAMPLE_PHRASES.map((phrase, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setSourceText(phrase);
                  handleTranslate(phrase);
                }}
                className="shrink-0 px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 transition-colors border border-slate-700/50"
              >
                "{phrase.slice(0, 22)}..."
              </button>
            ))}
          </div>

          {/* Source Footer Toolbar */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              {isMicSupported && (
                <button
                  type="button"
                  id="btn-voice-dictation"
                  onClick={toggleListening}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all ${
                    isListening
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                  title={isListening ? 'Listening... click to stop' : 'Click to dictate text via microphone'}
                >
                  {isListening ? <Mic className="w-3.5 h-3.5 text-rose-400" /> : <MicOff className="w-3.5 h-3.5" />}
                  <span>{isListening ? 'Listening...' : 'Dictate'}</span>
                </button>
              )}

              <span>{sourceText.length} characters • {sourceText.trim() ? sourceText.trim().split(/\s+/).length : 0} words</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-[11px] text-slate-400 flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px]">Enter</kbd>
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

        {/* Target Output Area */}
        <div className="flex flex-col bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          
          {/* Header & Target Selector */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3 gap-2">
            
            {/* Target Language Dropdown */}
            <div className="flex items-center gap-2 flex-1">
              <span className="text-base">{selectedTargetLanguage.flag}</span>
              <div className="relative flex-1 max-w-[200px]">
                <select
                  id="target-language-select"
                  value={targetLang}
                  onChange={(e) => {
                    const newLang = e.target.value;
                    setTargetLang(newLang);
                    if (sourceText.trim()) {
                      setTimeout(() => handleTranslate(sourceText), 50);
                    }
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                      {l.flag} {l.name} ({l.native})
                    </option>
                  ))}
                </select>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Target
              </span>
            </div>

            {/* Engine / Latency Badge */}
            {metaInfo && (
              <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-800/60 px-2 py-1 rounded-md border border-slate-700/50">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>{metaInfo.latencyMs}ms</span>
                <span>•</span>
                <span className="text-indigo-300 font-medium truncate max-w-[120px]" title={metaInfo.engine}>
                  {metaInfo.engine}
                </span>
              </div>
            )}
          </div>

          {/* Translated Content Area */}
          <div className="flex-1 min-h-[160px] flex flex-col justify-start">
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 py-10">
                <div className="w-8 h-8 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-xs text-slate-400 animate-pulse">Consulting translation service...</p>
              </div>
            ) : error ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                <p className="font-semibold mb-1">Translation Notice:</p>
                <p>{error}</p>
                <button
                  type="button"
                  onClick={() => handleTranslate()}
                  className="mt-2 inline-flex items-center gap-1 text-indigo-400 hover:underline"
                >
                  <RotateCcw className="w-3 h-3" /> Retry Translation
                </button>
              </div>
            ) : translatedText ? (
              <div 
                id="translated-output-text"
                className={`text-slate-100 text-base leading-relaxed select-text py-1 ${
                  selectedTargetLanguage.dir === 'rtl' ? 'text-right font-sans' : ''
                }`}
              >
                {translatedText}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-10">
                <Languages className="w-8 h-8 stroke-1 mb-2 text-slate-600" />
                <p className="text-xs">Your converted translation will appear here.</p>
              </div>
            )}
          </div>

          {/* Target Footer Toolbar */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              {translatedText && (
                <>
                  <button
                    type="button"
                    id="btn-play-voice"
                    onClick={handlePlayVoice}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                      isPlaying
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 animate-pulse'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white'
                    }`}
                    title="Pronounce translation"
                  >
                    {isPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isPlaying ? 'Speaking...' : 'Listen'}</span>
                  </button>

                  <button
                    type="button"
                    id="btn-copy-translation"
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700 transition-colors"
                    title="Copy translated text"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </>
              )}
            </div>

            <div className="text-right">
              {translatedText && (
                <span className="text-[11px] text-slate-400">{translatedText.length} chars</span>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Translation History Section */}
      {history.length > 0 && (
        <div className="mt-12 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">Recent Translation History</h3>
              <span className="text-xs text-slate-400">({history.length})</span>
            </div>
            <button
              onClick={() => setHistory([])}
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
                  setTranslatedText(item.translatedText);
                }}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                  <span className="flex items-center gap-1 font-medium text-slate-300">
                    <span>{item.flag}</span>
                    <span>{item.targetLang}</span>
                  </span>
                  <span className="flex items-center gap-1">
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
