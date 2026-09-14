# 🚀 QSkill Internship - Slab 1 Front-End Development Suite (Senior Edition)

> **Domain**: Front-End Development (React, Tailwind CSS)  
> **Repository Scope**: Unified production-grade architecture encompassing all three tasks of **Slab 1** connected via **`react-router-dom`**.

[![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react&logoColor=black)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![React Router](https://img.shields.io/badge/React_Router-v6-ca4245?logo=react-router&logoColor=white)](https://reactrouter.com/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![CI](https://img.shields.io/badge/CI-GitHub_Actions-2088ff?logo=github-actions&logoColor=white)](.github/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🌟 Senior Engineering & Feature Highlights

### 1. Task 1: Intelligent Text Translator
- **Dual-Engine RapidAPI Architecture**: Connects to RapidAPI Google Translate with in-app credentials manager + a resilient, zero-friction public fallback engine (MyMemory) ensuring 100% operational uptime without API key hurdles.
- **Race Condition Prevention**: Incorporates `AbortController` to cancel in-flight HTTP requests whenever text or target language changes rapidly.
- **Client-Side LRU / TTL Caching**: Persistent and in-memory cache saves API quota and provides 1ms instant responses for repeated phrases.
- **Multi-Target Split View**: Translates English text simultaneously into 2 target languages side-by-side in real-time.
- **Tone & Formality Modifiers**: Standard, Professional, Casual, and Concise modes.
- **Document / File Drag & Drop**: Accepts `.txt`, `.json`, or `.csv` files, parses text, and exports translated output files.
- **Accessibility & Voice**: Speech-to-Text (Microphone dictation) and Text-to-Speech (Native target language pronunciation).

### 2. Task 2: Advanced Token & String Studio
- **Strict Hook Discipline**: Architectural implementation of **`useState`**, **`useCallback`**, and **`useEffect`**.
- **Live Hook Telemetry & Profiler**: Real-time display of microsecond execution timings (`performance.now()`), memoization hits, and render cycle counts.
- **Dual Generation Modes**:
  - *Standard Cryptographic Mode*: Cryptographic randomness (`window.crypto.getRandomValues`) with custom character pools and length slider (4–64 chars).
  - *Pattern Mask Mode*: Template-based generation using wildcards (e.g. `PROMO-XXXX-####`, `KEY-****-9999`).
- **NIST / OWASP Entropy Audit**: Real-time Shannon entropy calculation (bits), brute-force crack time estimation, and search space metrics.
- **Mobile QR Code Modal**: Instant QR code generation for scanning tokens directly onto mobile devices.
- **Multi-Format Export**: Export batch generated tokens to **TXT**, **JSON**, and **CSV**.

### 3. Task 3: Client-Side Routing & App Shell
- **Dynamic Code-Splitting**: Route pages loaded via `React.lazy()` with custom glassmorphic `Suspense` skeleton loaders.
- **Global Command Palette (`Ctrl+K` / `Cmd+K`)**: Fast keyboard-driven navigation, target language switching, and cache management.
- **Tactile Web Audio Feedback**: Zero-dependency synthesizer using Web Audio API for subtle UI sound feedback (with mute toggle).
- **Network Resiliency Listener**: Active offline detector monitoring `navigator.onLine`.
- **Automated CI/CD**: Pre-configured GitHub Actions workflow verifying clean production builds on every push.

---

## 🏗️ Project Architecture

```
├── .github/
│   └── workflows/
│       └── ci.yml                 # Automated GitHub Actions CI build pipeline
├── src/
│   ├── components/
│   │   ├── ApiKeyModal.jsx        # RapidAPI credentials manager & live tester
│   │   ├── CommandPalette.jsx     # Global Ctrl+K command palette
│   │   ├── Navbar.jsx             # React Router navigation bar with audio controls
│   │   ├── NetworkBanner.jsx      # Offline detection listener
│   │   ├── QrCodeModal.jsx        # Mobile QR Code modal generator
│   │   └── SkeletonLoader.jsx     # Suspense transition skeleton
│   ├── hooks/
│   │   ├── useLocalStorage.js     # Reactive persistent state sync with localStorage
│   │   ├── useSpeechRecognition.js# Web Speech Recognition hook (voice dictation)
│   │   └── useSpeechSynthesis.js  # Web Speech Synthesis hook (audio pronunciation)
│   ├── pages/
│   │   ├── ArchitecturePage.jsx   # Senior engineer technical breakdown for evaluators
│   │   ├── RandomStringPage.jsx   # Task 2: useState, useCallback & useEffect implementation
│   │   └── TranslatorPage.jsx     # Task 1: RapidAPI Text Translator application
│   ├── services/
│   │   └── translationService.js  # RapidAPI Google Translate client, LRU cache & AbortController
│   ├── utils/
│   │   └── audioFeedback.js       # Web Audio API synthesizer for tactile sound feedback
│   ├── App.jsx                    # Lazy routed container with Suspense
│   ├── index.css                  # Tailwind directives and custom glassmorphism styles
│   └── main.jsx                   # React root entry point wrapped with BrowserRouter
├── index.html                     # HTML5 shell with Google Fonts and metadata
├── package.json                   # Dependencies and scripts
├── postcss.config.js              # PostCSS configuration
├── tailwind.config.js             # Tailwind CSS tokens and themes
└── vite.config.js                 # Vite bundler configuration
```

---

## ⚡ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open `http://localhost:5173`.

### 3. Build for Production
```bash
npm run build
```

---

## 🔑 RapidAPI Configuration

1. **Default Mode**: Operates out-of-the-box without requiring API keys using a resilient translation engine.
2. **Custom RapidAPI Key**: Click the **RapidAPI** button in the header or press `Ctrl + K` to enter your personal `X-RapidAPI-Key`. Test connectivity live with the built-in "Test API Key" button.

---

## 🧠 React Hook Discipline (Task 2)

| Hook | Senior Implementation Pattern |
| :--- | :--- |
| **`useState`** | Manages reactive states for length, character flags, pattern masks, batch size, and copied feedback. |
| **`useCallback`** | Memoizes `generateString()` and `generateBatch()` to prevent re-instantiation across renders while retaining strict dependency closures. |
| **`useEffect`** | Automatically synchronizes token regeneration whenever parameters or masks change, tracks live telemetry metrics, and updates `document.title`. |
