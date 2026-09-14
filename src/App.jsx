import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ApiKeyModal from './components/ApiKeyModal';
import TranslatorPage from './pages/TranslatorPage';
import RandomStringPage from './pages/RandomStringPage';
import ArchitecturePage from './pages/ArchitecturePage';
import { getStoredApiConfig } from './services/translationService';
import { Sparkles, Heart } from 'lucide-react';

export default function App() {
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [apiConfig, setApiConfig] = useState(() => getStoredApiConfig());

  const hasApiKey = Boolean(apiConfig.apiKey && apiConfig.apiKey.trim());

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Client-Side Routing Navbar */}
      <Navbar
        onOpenApiModal={() => setIsApiModalOpen(true)}
        hasApiKey={hasApiKey}
      />

      {/* Main Routed Content Area */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/translator" replace />} />
          <Route 
            path="/translator" 
            element={<TranslatorPage onOpenApiModal={() => setIsApiModalOpen(true)} />} 
          />
          <Route path="/random-string" element={<RandomStringPage />} />
          <Route path="/architecture" element={<ArchitecturePage />} />
          <Route path="*" element={<Navigate to="/translator" replace />} />
        </Routes>
      </main>

      {/* Global RapidAPI Config Modal */}
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
            <span>React</span>
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
