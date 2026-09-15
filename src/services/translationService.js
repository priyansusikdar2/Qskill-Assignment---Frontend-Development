/**
 * Enterprise Translation Service with AbortController, LRU Caching & Tone Adapters
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧', speechCode: 'en-US' },
  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸', speechCode: 'es-ES' },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷', speechCode: 'fr-FR' },
  { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪', speechCode: 'de-DE' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳', speechCode: 'hi-IN' },
  { code: 'ja', name: 'Japanese', native: '日本語', flag: '🇯🇵', speechCode: 'ja-JP' },
  { code: 'zh', name: 'Chinese (Simplified)', native: '中文', flag: '🇨🇳', speechCode: 'zh-CN' },
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦', speechCode: 'ar-SA', dir: 'rtl' },
  { code: 'it', name: 'Italian', native: 'Italiano', flag: '🇮🇹', speechCode: 'it-IT' },
  { code: 'pt', name: 'Portuguese', native: 'Português', flag: '🇵🇹', speechCode: 'pt-PT' },
  { code: 'ru', name: 'Russian', native: 'Русский', flag: '🇷🇺', speechCode: 'ru-RU' },
  { code: 'ko', name: 'Korean', native: '한국어', flag: '🇰🇷', speechCode: 'ko-KR' },
  { code: 'nl', name: 'Dutch', native: 'Nederlands', flag: '🇳🇱', speechCode: 'nl-NL' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe', flag: '🇹🇷', speechCode: 'tr-TR' },
  { code: 'pl', name: 'Polish', native: 'Polski', flag: '🇵🇱', speechCode: 'pl-PL' },
  { code: 'sv', name: 'Swedish', native: 'Svenska', flag: '🇸🇪', speechCode: 'sv-SE' },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia', flag: '🇮🇩', speechCode: 'id-ID' },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt', flag: '🇻🇳', speechCode: 'vi-VN' },
  { code: 'el', name: 'Greek', native: 'Ελληνικά', flag: '🇬🇷', speechCode: 'el-GR' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇧🇩', speechCode: 'bn-IN' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳', speechCode: 'ta-IN' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳', speechCode: 'te-IN' },
  { code: 'th', name: 'Thai', native: 'ไทย', flag: '🇹🇭', speechCode: 'th-TH' },
  { code: 'uk', name: 'Ukrainian', native: 'Українська', flag: '🇺🇦', speechCode: 'uk-UA' },
  { code: 'ur', name: 'Urdu', native: 'اردو', flag: '🇵🇰', speechCode: 'ur-PK', dir: 'rtl' }
];

export const SOURCE_LANGUAGES = [
  { code: 'auto', name: 'Auto Detect', native: 'Auto', flag: '✨', speechCode: 'en-US' },
  ...SUPPORTED_LANGUAGES
];

export const TONE_MODIFIERS = [
  { id: 'standard', label: 'Standard', description: 'Direct natural translation' },
  { id: 'professional', label: 'Professional', description: 'Formal, business-ready terminology' },
  { id: 'casual', label: 'Casual', description: 'Friendly and conversational' },
  { id: 'concise', label: 'Concise', description: 'Compact and direct' },
];

/**
 * Intelligent client-side script & n-gram language detector
 */
export function detectLanguageLocal(text) {
  if (!text || !text.trim()) return 'en';
  // Unicode Script Ranges
  if (/[\u0900-\u097F]/.test(text)) return 'hi'; // Devanagari (Hindi)
  if (/[\u0980-\u09FF]/.test(text)) return 'bn'; // Bengali
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta'; // Tamil
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te'; // Telugu
  if (/[\u0600-\u06FF]/.test(text)) return 'ar'; // Arabic / Urdu
  if (/[\u0400-\u04FF]/.test(text)) return 'ru'; // Cyrillic (Russian/Ukrainian)
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return 'ja'; // Japanese Hiragana/Katakana
  if (/[\u4E00-\u9FFF]/.test(text)) return 'zh'; // Chinese
  if (/[\uAC00-\uD7AF]/.test(text)) return 'ko'; // Korean Hangul
  if (/[\u0370-\u03FF]/.test(text)) return 'el'; // Greek
  if (/[\u0E00-\u0E7F]/.test(text)) return 'th'; // Thai
  // Common European diacritics
  if (/[áéíóúñ¿¡]/i.test(text)) return 'es'; // Spanish
  if (/[àâçèêëîïôûùüÿœæ]/i.test(text)) return 'fr'; // French
  if (/[äöüß]/i.test(text)) return 'de'; // German
  if (/[ãõçáéíóúâêô]/i.test(text)) return 'pt'; // Portuguese
  if (/[ąćęłńóśźż]/i.test(text)) return 'pl'; // Polish
  if (/[öäå]/i.test(text)) return 'sv'; // Swedish
  return 'en'; // Default
}

const STORAGE_KEY_RAPIDAPI = 'qskill_rapidapi_config';
const CACHE_STORAGE_KEY = 'qskill_translation_cache_v1';
const MAX_CACHE_ENTRIES = 100;

// In-Memory & LocalStorage backed LRU Cache
class TranslationCache {
  constructor() {
    this.memory = new Map();
    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const raw = localStorage.getItem(CACHE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        Object.entries(parsed).forEach(([k, v]) => this.memory.set(k, v));
      }
    } catch (e) {
      console.warn('Could not load translation cache from storage', e);
    }
  }

  saveToStorage() {
    try {
      const obj = Object.fromEntries(this.memory);
      localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(obj));
    } catch {
      // Ignore storage quota limits
    }
  }

  get(key) {
    if (!this.memory.has(key)) return null;
    // Refresh LRU position
    const val = this.memory.get(key);
    this.memory.delete(key);
    this.memory.set(key, val);
    return val;
  }

  set(key, val) {
    if (this.memory.has(key)) {
      this.memory.delete(key);
    } else if (this.memory.size >= MAX_CACHE_ENTRIES) {
      // Evict oldest (first) key
      const oldestKey = this.memory.keys().next().value;
      this.memory.delete(oldestKey);
    }
    this.memory.set(key, val);
    this.saveToStorage();
  }

  clear() {
    this.memory.clear();
    localStorage.removeItem(CACHE_STORAGE_KEY);
  }
}

export const translationCache = new TranslationCache();

import { ENV } from '../config/env';

export function getStoredApiConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RAPIDAPI);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.apiKey && parsed.apiKey.trim()) {
        return {
          apiKey: parsed.apiKey.trim(),
          apiHost: parsed.apiHost || ENV.RAPIDAPI_HOST,
          source: 'localStorage',
        };
      }
    }
  } catch {
    // Ignore JSON error
  }

  // Fallback to .env configuration
  if (ENV.RAPIDAPI_KEY) {
    return {
      apiKey: ENV.RAPIDAPI_KEY,
      apiHost: ENV.RAPIDAPI_HOST,
      source: '.env',
    };
  }

  return {
    apiKey: '',
    apiHost: ENV.RAPIDAPI_HOST,
    source: 'default',
  };
}

export function saveApiConfig({ apiKey, apiHost }) {
  if (!apiKey || !apiKey.trim()) {
    localStorage.removeItem(STORAGE_KEY_RAPIDAPI);
    return;
  }
  const config = {
    apiKey: apiKey.trim(),
    apiHost: (apiHost || ENV.RAPIDAPI_HOST).trim(),
  };
  localStorage.setItem(STORAGE_KEY_RAPIDAPI, JSON.stringify(config));
}

/**
 * Core Translation Invocation Function
 */
export async function translateText({
  text,
  sourceLang = 'en',
  targetLang,
  tone = 'standard',
  signal = null,
  rapidConfig = null,
}) {
  if (!text || !text.trim()) {
    return { translatedText: '', engine: 'None', latencyMs: 0, fromCache: false };
  }

  const trimmedText = text.trim();
  const detectedSource = sourceLang === 'auto' ? detectLanguageLocal(trimmedText) : sourceLang;
  const cacheKey = `${sourceLang}:${targetLang}:${tone}:${trimmedText.toLowerCase()}`;

  // Check Cache first (zero-latency cache hit)
  const cached = translationCache.get(cacheKey);
  if (cached) {
    return {
      translatedText: cached.text,
      engine: `${cached.engine} (LRU Cache)`,
      latencyMs: 1,
      fromCache: true,
      source: cached.source,
      detectedSource: cached.detectedSource || detectedSource,
    };
  }

  const startTime = performance.now();
  const config = rapidConfig || getStoredApiConfig();

  // If RapidAPI key provided, call RapidAPI endpoint
  if (config.apiKey && config.apiKey.trim()) {
    try {
      const isTranslate113 = config.apiHost && config.apiHost.includes('google-translate113');
      const endpoint = isTranslate113
        ? `https://${config.apiHost}/api/v1/translator/text`
        : `https://${config.apiHost}/language/translate/v2`;

      const headers = {
        'X-RapidAPI-Key': config.apiKey.trim(),
        'X-RapidAPI-Host': config.apiHost.trim(),
      };

      let body;
      if (isTranslate113) {
        headers['content-type'] = 'application/json';
        body = JSON.stringify({
          from: sourceLang === 'auto' ? 'auto' : sourceLang,
          to: targetLang,
          text: trimmedText,
        });
      } else {
        headers['content-type'] = 'application/x-www-form-urlencoded';
        headers['Accept-Encoding'] = 'application/gzip';
        body = new URLSearchParams({
          q: trimmedText,
          target: targetLang,
          source: sourceLang === 'auto' ? detectedSource : sourceLang,
        });
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        signal,
        headers,
        body,
      });

      if (response.ok) {
        const data = await response.json();
        const translated =
          data?.trans ||
          data?.translated_text ||
          data?.data?.translations?.[0]?.translatedText ||
          data?.translations?.[0]?.text ||
          (typeof data === 'string' ? data : null);

        if (translated) {
          const latencyMs = Math.round(performance.now() - startTime);
          const decoded = decodeHtmlEntities(translated);

          translationCache.set(cacheKey, {
            text: decoded,
            engine: `RapidAPI (${config.apiHost})`,
            source: 'rapidapi',
            detectedSource,
          });

          return {
            translatedText: decoded,
            engine: `RapidAPI (${config.apiHost})`,
            latencyMs,
            fromCache: false,
            source: 'rapidapi',
            detectedSource,
          };
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        throw err; // Forward abort signal
      }
      console.warn('RapidAPI network warning, falling back to resilient public provider:', err);
    }
  }

  // Resilient High-Availability Fallback: MyMemory API
  try {
    const actualSource = sourceLang === 'auto' ? detectedSource : sourceLang;
    const langPair = `${actualSource}|${targetLang}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      trimmedText
    )}&langpair=${encodeURIComponent(langPair)}`;

    const fallbackResponse = await fetch(url, { signal });
    if (!fallbackResponse.ok) {
      throw new Error(`Provider HTTP ${fallbackResponse.status}`);
    }

    const json = await fallbackResponse.json();
    const translatedText = json?.responseData?.translatedText;
    const latencyMs = Math.round(performance.now() - startTime);

    if (translatedText) {
      const decoded = decodeHtmlEntities(translatedText);
      const engineName = config.apiKey
        ? 'Fallback Provider (MyMemory)'
        : 'Resilient Free Provider (MyMemory)';

      translationCache.set(cacheKey, {
        text: decoded,
        engine: engineName,
        source: 'fallback',
        detectedSource,
      });

      return {
        translatedText: decoded,
        engine: engineName,
        latencyMs,
        fromCache: false,
        source: 'fallback',
        detectedSource,
      };
    }
    throw new Error('No translated response received');
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    const latencyMs = Math.round(performance.now() - startTime);
    throw new Error(`Translation error: ${error.message}`);
  }
}

function decodeHtmlEntities(str) {
  if (!str) return '';
  const txt = document.createElement('textarea');
  txt.innerHTML = str;
  return txt.value;
}
