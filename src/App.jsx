import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ApiKeyModal from './components/ApiKeyModal';
import CommandPalette from './components/CommandPalette';
import NetworkBanner from './components/NetworkBanner';
import SkeletonLoader from './components/SkeletonLoader';
import { getStoredApiConfig } from './services/translationService';
import { Sparkles, Heart } from 'lucide-react';

import FloatingAurora from './components/FloatingAurora';
import { ToastProvider } from './components/Toast';

// Code-splitting via React.lazy
const TranslatorPage = lazy(() => import('./pages/TranslatorPage'));
const RandomStringPage = lazy(() => import('./pages/RandomStringPage'));
const ArchitecturePage = lazy(() => import('./pages/ArchitecturePage'));

export default function App() {
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [apiConfig, setApiConfig] = useState(() => getStoredApiConfig());
  const [selectedLanguageCode, setSelectedLanguageCode] = useState('es');

  const hasApiKey = Boolean(apiConfig.apiKey && apiConfig.apiKey.trim());

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <ToastProvider>
      <div className="min-h-screen relative flex flex-col bg-bg ambient-glow text-zinc-100 font-sans selection:bg-accent-600 selection:text-white overflow-hidden">
        {/* Living Drifting Aurora Atmosphere */}
        <FloatingAurora />

        {/* Network offline detector */}
        <NetworkBanner />

        {/* Client-Side Routing Navbar */}
        <Navbar
          onOpenApiModal={() => setIsApiModalOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          hasApiKey={hasApiKey}
          apiSource={apiConfig.source}
        />

        {/* Main Routed Content Area with Suspense and bespoke Skeleton */}
        <main className="flex-1">
          <Suspense fallback={<SkeletonLoader />}>
            <Routes>
              <Route path="/" element={<Navigate to="/translator" replace />} />
              <Route 
                path="/translator" 
                element={
                  <TranslatorPage 
                    onOpenApiModal={() => setIsApiModalOpen(true)} 
                    initialTargetLang={selectedLanguageCode}
                  />
                } 
              />
              <Route path="/random-string" element={<RandomStringPage />} />
              <Route path="/architecture" element={<ArchitecturePage />} />
              <Route path="*" element={<Navigate to="/translator" replace />} />
            </Routes>
          </Suspense>
        </main>

        {/* Command Palette (Ctrl+K) */}
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          onOpenApiModal={() => setIsApiModalOpen(true)}
          onSelectLanguage={(langCode) => setSelectedLanguageCode(langCode)}
        />

        {/* RapidAPI Credentials Modal */}
        <ApiKeyModal
          isOpen={isApiModalOpen}
          onClose={() => setIsApiModalOpen(false)}
          onConfigSaved={(newCfg) => setApiConfig(newCfg)}
        />

        {/* Minimalist Production Footer */}
        <footer className="hairline-t bg-bg-subtle/80 py-4 text-xs text-zinc-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-medium text-zinc-300">QSkill Developer Suite</span>
              <span className="text-zinc-600">/</span>
              <span className="text-zinc-400">Enterprise Edition</span>
            </div>

            <div className="flex items-center gap-3 text-zinc-500 font-mono text-[11px]">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-status-emerald"></span>
                System Healthy
              </span>
              <span className="text-zinc-700">•</span>
              <span>React 18.3</span>
              <span className="text-zinc-700">•</span>
              <span>Vite 6</span>
              <span className="text-zinc-700">•</span>
              <span>WebCrypto</span>
            </div>
          </div>
        </footer>
      </div>
    </ToastProvider>
  );
}
