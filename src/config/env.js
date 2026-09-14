/**
 * Centralized Environment Configuration
 * Safely parses and provides typed access to Vite environment variables
 */

export const ENV = {
  APP_TITLE: import.meta.env.VITE_APP_TITLE || 'QSkill Slab 1 Suite',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  RAPIDAPI_KEY: (import.meta.env.VITE_RAPIDAPI_KEY || '').trim(),
  RAPIDAPI_HOST: import.meta.env.VITE_RAPIDAPI_HOST || 'google-translate1.p.rapidapi.com',
  DEFAULT_TARGET_LANG: import.meta.env.VITE_DEFAULT_TARGET_LANG || 'es',
  DEFAULT_SOURCE_LANG: import.meta.env.VITE_DEFAULT_SOURCE_LANG || 'en',
  ENABLE_AUDIO: import.meta.env.VITE_ENABLE_SOUND !== 'false',
  MODE: import.meta.env.MODE || 'development',
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
};

/**
 * Check if RapidAPI Key is provided directly via .env file
 */
export function hasEnvApiKey() {
  return Boolean(ENV.RAPIDAPI_KEY && ENV.RAPIDAPI_KEY.length > 0);
}
