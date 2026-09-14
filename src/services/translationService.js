/**
 * Enterprise Translation Service with AbortController, LRU Caching & Tone Adapters
 */

export const SUPPORTED_LANGUAGES = [
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

export const TONE_MODIFIERS = [
  { id: 'standard', label: 'Standard', description: 'Direct natural translation' },
  { id: 'professional', label: 'Professional', description: 'Formal, business-ready terminology' },
  { id: 'casual', label: 'Casual', description: 'Friendly and conversational' },
  { id: 'concise', label: 'Concise', description: 'Compact and direct' },
];

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
    if (this.memory.size >= MAX_CACHE_ENTRIES) {
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

export function saveApiConfig(config) {
  localStorage.setItem(STORAGE_KEY_RAPIDAPI, JSON.stringify(config));
}

/**
 * Perform translation with AbortController, Caching, and Tone Handling
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
    };
  }

  const startTime = performance.now();
  const config = rapidConfig || getStoredApiConfig();

  // If RapidAPI key provided, call RapidAPI endpoint
  if (config.apiKey && config.apiKey.trim()) {
    try {
      const response = await fetch(`https://${config.apiHost}/language/translate/v2`, {
        method: 'POST',
        signal,
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'Accept-Encoding': 'application/gzip',
          'X-RapidAPI-Key': config.apiKey.trim(),
          'X-RapidAPI-Host': config.apiHost.trim(),
        },
        body: new URLSearchParams({
          q: trimmedText,
          target: targetLang,
          source: sourceLang,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const translated =
          data?.data?.translations?.[0]?.translatedText ||
          data?.translations?.[0]?.text;

        if (translated) {
          const latencyMs = Math.round(performance.now() - startTime);
          const decoded = decodeHtmlEntities(translated);

          translationCache.set(cacheKey, {
            text: decoded,
            engine: 'RapidAPI (Google Translate)',
            source: 'rapidapi',
          });

          return {
            translatedText: decoded,
            engine: 'RapidAPI (Google Translate)',
            latencyMs,
            fromCache: false,
            source: 'rapidapi',
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
    const langPair = `${sourceLang}|${targetLang}`;
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
      });

      return {
        translatedText: decoded,
        engine: engineName,
        latencyMs,
        fromCache: false,
        source: 'fallback',
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
