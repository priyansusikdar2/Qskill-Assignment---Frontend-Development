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
          message: `Success! Translated with ${res.engine} in ${res.latencyMs}ms: "${res.translatedText}"`,
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
        message: `API verification failed: ${err.message}`,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">RapidAPI & Environment Secrets</h3>
              <p className="text-xs text-slate-400">Configure credentials via .env file or UI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          
          {/* Environment Status Pill */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-slate-300 font-medium block">Credential Source</span>
                <span className="text-[11px] text-slate-400">
                  {config.source === '.env'
                    ? 'Active from project .env file (VITE_RAPIDAPI_KEY)'
                    : config.source === 'localStorage'
                    ? 'Manual UI Override in localStorage'
                    : 'Default Resilient Fallback Engine'}
                </span>
              </div>
            </div>

            {ENV.RAPIDAPI_KEY && config.source === 'localStorage' && (
              <button
                type="button"
                onClick={handleResetToEnv}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 underline"
              >
                Reset to .env
              </button>
            )}
          </div>

          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2.5 leading-relaxed">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />
            <div>
              <strong className="text-indigo-200">Zero-Friction Fallback:</strong> If no RapidAPI key is set in your <code className="text-indigo-300 font-mono">.env</code> file or below, the app automatically translates via our free public fallback engine (MyMemory).
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                RapidAPI Key (VITE_RAPIDAPI_KEY)
              </label>
              <span className="text-[10px] text-slate-500 font-mono">
                {config.source === '.env' ? 'Synced from .env' : 'Custom'}
              </span>
            </div>
            <input
              type="password"
              id="rapidapi-key-input"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value, source: 'localStorage' })}
              placeholder="Paste key or configure in .env file"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              RapidAPI Host (VITE_RAPIDAPI_HOST)
            </label>
            <input
              type="text"
              id="rapidapi-host-input"
              value={config.apiHost}
              onChange={(e) => setConfig({ ...config, apiHost: e.target.value, source: 'localStorage' })}
              placeholder="google-translate1.p.rapidapi.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono transition-colors"
            />
          </div>

          {/* Test connection result display */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                testResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
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
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              {testing ? 'Testing...' : 'Test Connection'}
            </button>

            <a
              href="https://rapidapi.com/googlecloud/api/google-translate1"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              Get Free RapidAPI Key <ExternalLink className="w-3 h-3" />
            </a>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-rose-400 hover:text-rose-300 font-medium cursor-pointer"
          >
            Clear Stored Credentials
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              id="btn-save-rapidapi"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              Save Configuration
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
