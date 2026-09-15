import React, { useState, useEffect } from 'react';
import { X, KeyRound, CheckCircle2, AlertCircle, RefreshCw, ExternalLink, ShieldCheck, FileCode } from 'lucide-react';
import { getStoredApiConfig, saveApiConfig, translateText } from '../services/translationService';
import { ENV } from '../config/env';

export default function ApiKeyModal({ isOpen, onClose, onConfigSaved }) {
  const [config, setConfig] = useState(() => getStoredApiConfig());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setConfig(getStoredApiConfig());
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveApiConfig(config);
    if (onConfigSaved) onConfigSaved(config);
    onClose();
  };

  const handleClear = () => {
    const cleared = { apiKey: '', apiHost: ENV.RAPIDAPI_HOST };
    setConfig(cleared);
    saveApiConfig(cleared);
    setTestResult(null);
    if (onConfigSaved) onConfigSaved(cleared);
  };

  const handleResetToEnv = () => {
    localStorage.removeItem('qskill_rapidapi_config');
    const envConfig = {
      apiKey: ENV.RAPIDAPI_KEY,
      apiHost: ENV.RAPIDAPI_HOST,
      source: ENV.RAPIDAPI_KEY ? '.env' : 'default',
    };
    setConfig(envConfig);
    setTestResult(null);
    if (onConfigSaved) onConfigSaved(envConfig);
  };

  const handleTestKey = async () => {
    if (!config.apiKey.trim()) {
      setTestResult({ success: false, message: 'Please enter a RapidAPI key to test.' });
      return;
    }
    setTesting(true);
    setTestResult(null);

    try {
      const res = await translateText({
        text: 'Hello, welcome to QSkill!',
        sourceLang: 'en',
        targetLang: 'es',
        rapidConfig: config,
      });

      if (res && res.translatedText) {
        setTestResult({
          success: true,
          message: `Verified (${res.engine}) in ${res.latencyMs}ms: "${res.translatedText}"`,
        });
      } else {
        setTestResult({
          success: false,
          message: 'Unable to verify response. Check API key and endpoint host.',
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: `Verification failed: ${err.message}`,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-panel hairline shadow-modal rounded-xl overflow-hidden animate-slide-down">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 hairline-b bg-bg-subtle">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-zinc-800 text-zinc-300 hairline">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">API Credentials & Endpoint Secrets</h3>
              <p className="text-[11px] text-zinc-400">RapidAPI Google Translate configuration & local overrides</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          
          {/* Credential Source Status */}
          <div className="p-3 rounded-lg bg-bg hairline flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FileCode className="w-4 h-4 text-status-emerald shrink-0" />
              <div>
                <span className="text-zinc-200 font-medium block">Credential Source</span>
                <span className="text-[11px] text-zinc-400 font-mono">
                  {config.source === '.env'
                    ? 'Active from project .env file (VITE_RAPIDAPI_KEY)'
                    : config.source === 'localStorage'
                    ? 'Custom UI Override in LocalStorage'
                    : 'Default Resilient Fallback Engine'}
                </span>
              </div>
            </div>

            {ENV.RAPIDAPI_KEY && config.source === 'localStorage' && (
              <button
                type="button"
                onClick={handleResetToEnv}
                className="text-[11px] text-accent-400 hover:text-accent-300 underline font-mono cursor-pointer"
              >
                Reset to .env
              </button>
            )}
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/70 hairline text-[11px] text-zinc-300 flex items-start gap-2.5 leading-relaxed">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-zinc-400" />
            <div>
              <strong className="text-zinc-200">Resilient Architecture:</strong> If no custom RapidAPI key is set, the application automatically translates via our public fallback engine (MyMemory) so translation remains 100% functional.
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-300">
                RapidAPI Key
              </label>
              <span className="text-[10px] text-zinc-500 font-mono">
                {config.source === '.env' ? 'Synced from .env' : 'Custom'}
              </span>
            </div>
            <input
              type="password"
              id="rapidapi-key-input"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value, source: 'localStorage' })}
              placeholder="Paste X-RapidAPI-Key"
              className="w-full px-3 py-2 rounded-lg bg-bg hairline text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 font-mono transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-300 mb-1.5">
              RapidAPI Host
            </label>
            <input
              type="text"
              id="rapidapi-host-input"
              value={config.apiHost}
              onChange={(e) => setConfig({ ...config, apiHost: e.target.value, source: 'localStorage' })}
              placeholder="google-translate113.p.rapidapi.com"
              className="w-full px-3 py-2 rounded-lg bg-bg hairline text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 font-mono transition-colors"
            />
          </div>

          {/* Test connection result display */}
          {testResult && (
            <div
              className={`p-2.5 rounded-lg hairline text-[11px] font-mono flex items-start gap-2 ${
                testResult.success
                  ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-status-emerald" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-status-rose" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleTestKey}
              disabled={testing || !config.apiKey.trim()}
              id="btn-test-rapidapi"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium hairline bg-zinc-800 hover:bg-zinc-700 text-zinc-200 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${testing ? 'animate-spin' : ''}`} />
              {testing ? 'Testing...' : 'Test Connection'}
            </button>

            <a
              href="https://rapidapi.com/hub"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors"
            >
              Open RapidAPI Hub <ExternalLink className="w-3 h-3" />
            </a>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 hairline-t bg-bg-subtle">
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-zinc-400 hover:text-rose-400 font-medium transition-colors cursor-pointer"
          >
            Clear Stored Key
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              id="btn-save-rapidapi"
              onClick={handleSave}
              className="px-3.5 py-1.5 rounded-md text-xs font-semibold bg-zinc-100 hover:bg-white text-zinc-950 transition-colors cursor-pointer shadow-subtle"
            >
              Save Credentials
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
