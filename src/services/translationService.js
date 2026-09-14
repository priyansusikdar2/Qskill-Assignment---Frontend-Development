/**
 * Enterprise Translation Service
 * Supports RapidAPI endpoints with automatic resilient fallback
 * Includes metadata, latency metrics, and language directory
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

const STORAGE_KEY_RAPIDAPI = 'qskill_rapidapi_config';

export function getStoredApiConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RAPIDAPI);
    if (!raw) return { apiKey: '', apiHost: 'google-translate1.p.rapidapi.com' };
    return JSON.parse(raw);
  } catch {
    return { apiKey: '', apiHost: 'google-translate1.p.rapidapi.com' };
  }
}

export function saveApiConfig(config) {
  localStorage.setItem(STORAGE_KEY_RAPIDAPI, JSON.stringify(config));
}

/**
 * Perform translation using RapidAPI if key is provided,
 * otherwise seamlessly fallback to MyMemory public translation service.
 */
export async function translateText({ text, sourceLang = 'en', targetLang, rapidConfig = null }) {
  if (!text || !text.trim()) {
    return { translatedText: '', engine: 'None', latencyMs: 0 };
  }

  const startTime = performance.now();
  const config = rapidConfig || getStoredApiConfig();

  // If RapidAPI key is provided, try RapidAPI first
  if (config.apiKey && config.apiKey.trim()) {
    try {
      const response = await fetch(
        `https://${config.apiHost}/language/translate/v2`,
        {
          method: 'POST',
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'Accept-Encoding': 'application/gzip',
            'X-RapidAPI-Key': config.apiKey.trim(),
            'X-RapidAPI-Host': config.apiHost.trim(),
          },
          body: new URLSearchParams({
            q: text.trim(),
            target: targetLang,
            source: sourceLang,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const translated =
          data?.data?.translations?.[0]?.translatedText ||
          data?.translations?.[0]?.text;
        
        if (translated) {
          const latencyMs = Math.round(performance.now() - startTime);
          return {
            translatedText: decodeHtmlEntities(translated),
            engine: 'RapidAPI (Google Translate)',
            latencyMs,
            source: 'rapidapi',
          };
        }
      }
      console.warn('RapidAPI returned non-OK status, falling back to resilient public engine...');
    } catch (err) {
      console.warn('RapidAPI network error, using resilient fallback:', err);
    }
  }

  // Resilient High-Availability Fallback: MyMemory API
  try {
    const langPair = `${sourceLang}|${targetLang}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      text.trim()
    )}&langpair=${encodeURIComponent(langPair)}`;

    const fallbackResponse = await fetch(url);
    if (!fallbackResponse.ok) {
      throw new Error(`Fallback HTTP ${fallbackResponse.status}`);
    }

    const json = await fallbackResponse.json();
    const translatedText = json?.responseData?.translatedText;
    const latencyMs = Math.round(performance.now() - startTime);

    if (translatedText) {
      return {
        translatedText: decodeHtmlEntities(translatedText),
        engine: config.apiKey ? 'Fallback Engine (MyMemory - RapidAPI had issue)' : 'Resilient Free Provider (MyMemory)',
        latencyMs,
        source: 'fallback',
        matchQuality: json?.responseData?.match,
      };
    }
    throw new Error('No translation response received');
  } catch (error) {
    const latencyMs = Math.round(performance.now() - startTime);
    throw new Error(`Translation failed: ${error.message}`);
  }
}

function decodeHtmlEntities(str) {
  if (!str) return '';
  const txt = document.createElement('textarea');
  txt.innerHTML = str;
  return txt.value;
}
