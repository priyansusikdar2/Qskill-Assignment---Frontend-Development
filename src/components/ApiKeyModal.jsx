import React, { useState } from 'react';
import { X, KeyRound, CheckCircle2, AlertCircle, RefreshCw, ExternalLink, ShieldCheck } from 'lucide-react';
import { getStoredApiConfig, saveApiConfig, translateText } from '../services/translationService';

export default function ApiKeyModal({ isOpen, onClose, onConfigSaved }) {
  const [config, setConfig] = useState(() => getStoredApiConfig());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const handleSave = () => {
    saveApiConfig(config);
    if (onConfigSaved) onConfigSaved(config);
    onClose();
  };

  const handleClear = () => {
    const cleared = { apiKey: '', apiHost: 'google-translate1.p.rapidapi.com' };
    setConfig(cleared);
    saveApiConfig(cleared);
    setTestResult(null);
    if (onConfigSaved) onConfigSaved(cleared);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">RapidAPI Settings</h3>
              <p className="text-xs text-slate-400">Configure or test your RapidAPI credentials</p>
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
          
          <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2.5 leading-relaxed">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />
            <div>
              <strong className="text-indigo-200">Zero-Friction Fallback Active:</strong> If you do not have a RapidAPI key yet, the application automatically uses our built-in resilient translation engine (MyMemory). Adding your RapidAPI key enables direct calls to RapidAPI endpoints.
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              RapidAPI Key (X-RapidAPI-Key)
            </label>
            <input
              type="password"
              id="rapidapi-key-input"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              placeholder="e.g. 9b8xxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              RapidAPI Host (X-RapidAPI-Host)
            </label>
            <input
              type="text"
              id="rapidapi-host-input"
              value={config.apiHost}
              onChange={(e) => setConfig({ ...config, apiHost: e.target.value })}
              placeholder="google-translate1.p.rapidapi.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono transition-colors"
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

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleTestKey}
              disabled={testing || !config.apiKey.trim()}
              id="btn-test-rapidapi"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              {testing ? 'Testing...' : 'Test API Key'}
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
            className="text-xs text-rose-400 hover:text-rose-300 font-medium"
          >
            Clear Credentials
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              id="btn-save-rapidapi"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all"
            >
              Save Configuration
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
