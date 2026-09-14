import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ApiKeyModal from './components/ApiKeyModal';
import CommandPalette from './components/CommandPalette';
import NetworkBanner from './components/NetworkBanner';
import SkeletonLoader from './components/SkeletonLoader';
import { getStoredApiConfig } from './services/translationService';
import { Sparkles, Heart } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
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

      {/* Professional Footer */}
      <footer className="border-t border-white/5 bg-slate-950/90 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">QSkill Internship</span>
            <span>•</span>
            <span>Slab 1 Full Suite Submission</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>React 18</span>
            <span>•</span>
            <span>Tailwind CSS</span>
            <span>•</span>
            <span>react-router-dom</span>
            <span>•</span>
            <span>RapidAPI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
