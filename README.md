# 🚀 QSkill Front-End Development Suite — Slab 1

> **Domain**: Front-End Web Development (React, JavaScript, Tailwind CSS)  
> **Unified Architecture**: Production-grade Single Page Application (SPA) integrating all three tasks of **Slab 1**, orchestrated through **`react-router-dom`**.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel_Deployment-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://qskill-assignment-frontend-developm.vercel.app/)
[![React](https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![React Router](https://img.shields.io/badge/React_Router-v6-ca4245?style=for-the-badge&logo=react-router&logoColor=white)](https://reactrouter.com/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![CI Build](https://img.shields.io/badge/CI-GitHub_Actions-2088ff?style=for-the-badge&logo=github-actions&logoColor=white)](.github/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## 🌐 Live Application Deployment

Explore the fully deployed, interactive web application here:  
👉 **[https://qskill-assignment-frontend-developm.vercel.app/](https://qskill-assignment-frontend-developm.vercel.app/)**

---

## 📋 Table of Contents

- [Live Application Deployment](#-live-application-deployment)
- [Executive Overview](#-executive-overview)
- [Feature Highlights by Task](#-feature-highlights-by-task)
  - [Task 1: Polyglot Translation Workstation](#task-1-polyglot-translation-workstation)
  - [Task 2: Advanced Token & String Studio](#task-2-advanced-token--string-studio)
  - [Task 3: Client-Side Routing & App Shell](#task-3-client-side-routing--app-shell)
- [Key Engineering Improvements](#-key-engineering-improvements)
- [Project Architecture & File Tree](#-project-architecture--file-tree)
- [React Hook Discipline (Task 2)](#-react-hook-discipline-task-2)
- [Local Setup & Installation](#-local-setup--installation)
- [Environment Variables](#-environment-variables)
- [RapidAPI Credentials Configuration](#-rapidapi-credentials-configuration)
- [Quality Assurance & Testing](#-quality-assurance--testing)

---

## 💡 Executive Overview

This repository represents a senior front-end developer submission for the **QSkill Internship Slab 1 Assessment**. It goes beyond minimal requirements by delivering an enterprise-ready workstation that unifies all tasks under a sleek dark-mode glassmorphic design system:

1. **Task 1 (Text Translator)**: Real-time neural translation with multi-engine fallback, multi-language audio playback, split view, readability analytics, and Anki study deck export.
2. **Task 2 (Random String Generator)**: Strict hook discipline (`useState`, `useCallback`, `useEffect`), NIST entropy auditing, pattern mask generation, QR code sharing, and batch exports.
3. **Task 3 (Client-Side Routing)**: Seamless client-side navigation via `react-router-dom`, code-splitting via `React.lazy()`, tactile Web Audio feedback, offline state listener, and global `Ctrl+K` command palette.

---

## 🌟 Feature Highlights by Task

### Task 1: Polyglot Translation Workstation

- **Dual-Engine Translation Pipeline**:
  - Primary: High-speed RapidAPI Google Translate endpoint (`google-translate113.p.rapidapi.com`).
  - Resilient Fallback: Automatic zero-friction public provider fallback (MyMemory API) guaranteeing 100% uptime even without API keys or when hitting rate limits.
- **Full-Sentence Native Audio Engine (TTS)**:
  - Solved Windows browser voice limitations by integrating native audio streaming for all 25 supported dialects.
  - Pronounces the entire sentence in native accents (including Devanagari Hindi, Japanese Kanji/Kana, Arabic, Greek, Russian, Bengali, Tamil, Telugu, Thai, Urdu, Ukrainian).
  - Automatically breaks multi-paragraph text into sequential phrase chunks so audio never clips or stops midway.
- **Race Condition & Overlap Prevention**:
  - Request sequence counter (`requestIdRef`) and synchronous state dispatch to prevent stale closures or out-of-order responses from lagging or displaying mismatched languages.
  - Instant cancellation of in-flight requests using `AbortController`.
- **High-Performance LRU & LocalStorage Cache**:
  - Instant (1ms) retrieval for repeated translations, saving API credits and bandwidth.
- **Multi-Target Parallel Split View**:
  - Simultaneous side-by-side translation into two target languages simultaneously with independent voice pronunciation and copy controls.
- **Speech-to-Text Voice Dictation**:
  - Hands-free dictation using Web Speech API with real-time audio visualizer waves.
- **Text Complexity & Readability Analytics**:
  - Real-time Flesch-Kincaid reading level, reading time estimation (at 200 wpm), lexical word count, and character expansion ratio.
- **Tone & Formality Modifiers**:
  - Dynamically adapts phrasing for Standard, Professional (business-ready), Casual, and Concise tones.
- **Document Import & Export**:
  - Drag-and-drop or upload `.txt`, `.json`, and `.csv` files up to 5,000 characters.
  - Export translated text files (`.txt`) or generate study flashcards (`.tsv`) formatted for **Anki** and **Quizlet**.

---

### Task 2: Advanced Token & String Studio

- **Cryptographic Randomness**:
  - Uses `window.crypto.getRandomValues()` for CSPRNG-grade entropy (immune to `Math.random()` predictability).
- **Dual Operating Modes**:
  1. *Character Matrix Mode*: Adjustable length slider (4 to 64 characters) with granular toggles for Uppercase, Lowercase, Digits, Symbols, and Ambiguous Character Exclusion (`0`, `O`, `l`, `1`, `I`).
  2. *Pattern Mask Mode*: Template-based generator supporting dynamic wildcards:
     - `X` = Uppercase character
     - `x` = Lowercase character
     - `#` = Digit (0–9)
     - `!` = Special symbol
     - `*` = Any alphanumeric character
     - Example templates: `PROMO-XXXX-####`, `UUID-****-****`, `HEX-####-####`
- **NIST / OWASP Entropy Audit**:
  - Real-time Shannon entropy calculation (bits).
  - Search space metric (e.g. $62^{16}$ permutations).
  - Brute-force crack time estimation against high-performance computing clusters ($10^{10}$ guesses/sec).
- **Live React Hook Telemetry & Profiler**:
  - Microsecond generation timing benchmark (`performance.now()`).
  - Memoization hit counter and render cycle tracker validating zero unnecessary re-renders.
- **Batch Generation & Multi-Format Export**:
  - Generates 1 to 100 tokens at once with instant export to **TXT**, **JSON**, or **CSV**.
- **Mobile QR Code Modal**:
  - Generates scannable QR codes for instantaneous transfer of tokens/keys to mobile devices.

---

### Task 3: Client-Side Routing & App Shell

- **SPA Routing with React Router v6**:
  - `/translator` — Task 1: Polyglot Translation Workstation.
  - `/random-string` — Task 2: Advanced Token Studio.
  - `/architecture` — Technical Deep Dive & Hook Evaluation Guide.
- **Dynamic Route-Level Code-Splitting**:
  - Loaded on-demand using `React.lazy()` and wrapped in glassmorphic `Suspense` skeletons to ensure near-zero initial bundle size.
- **Global Command Palette (`Ctrl + K` / `Cmd + K`)**:
  - Universal keyboard command palette for instant navigation, quick target language switching, clearing LRU cache, and configuring API secrets.
- **Tactile Web Audio Feedback**:
  - Zero-dependency synthesizer using Web Audio API for subtle micro-interaction sounds (clicks, pops, success tones, error buzzes) with a master mute toggle in the navbar.
- **Living Aurora Atmosphere**:
  - Dynamic ambient mesh gradient backdrop (`FloatingAurora.jsx`) built with pure CSS canvas gradients and GPU-accelerated blur filters.
- **Network Resilience Detector**:
  - Active offline banner monitoring `navigator.onLine` with automatic reconnection toasts.

---

## 🛠️ Key Engineering Improvements

| Issue Encountered | Root Cause | Engineering Solution |
| :--- | :--- | :--- |
| **Language Translation Overlapping (1-Step Lag)** | `setTimeout(() => handleTranslate(), 50)` captured stale React state closures from the previous render. | Refactored `handleTranslate` to accept explicit parameters and synchronized `useRef` trackers; selection handlers now pass target codes synchronously. |
| **Out-of-Order Translation Responses** | Fast consecutive clicks triggered overlapping async requests where older responses resolved later. | Implemented active request sequence tracking (`requestIdRef`). Outdated requests are discarded and cannot overwrite the active display. |
| **Audio Only Speaking Certain Words** | Windows default speech engines lack voices for non-Latin scripts (Hindi, Japanese, Arabic, etc.), silently skipping non-Latin characters and only vocalizing embedded English words like "React". | Replaced browser-only TTS with a dual-layer audio engine utilizing native neural audio streaming via a dedicated proxy, with automatic text chunking and Web Speech fallback. |
| **Google TTS 404 Referer Check** | Google TTS rejects requests containing browser `Referer` headers from local or third-party web apps. | Added `<meta name="referrer" content="no-referrer" />` and configured server proxy middleware in `vite.config.js` (`/api/tts`). |

---

## 📂 Project Architecture & File Tree

```
qskill-slab1-frontend/
├── .github/
│   └── workflows/
│       └── ci.yml                 # Automated GitHub Actions CI pipeline
├── public/                        # Static public assets
├── src/
│   ├── components/
│   │   ├── ApiKeyModal.jsx        # RapidAPI credentials manager & connection tester
│   │   ├── CommandPalette.jsx     # Global Ctrl+K command search palette
│   │   ├── FloatingAurora.jsx     # GPU-accelerated dynamic aurora atmosphere
│   │   ├── LanguageSelect.jsx     # Accessible search-filtered language dropdown
│   │   ├── Navbar.jsx             # Top bar navigation, audio toggle, and credentials trigger
│   │   ├── NetworkBanner.jsx      # Live offline/online network listener banner
│   │   ├── QrCodeModal.jsx        # Interactive mobile QR code modal
│   │   ├── SkeletonLoader.jsx     # Glassmorphic Suspense skeleton transition loader
│   │   └── Toast.jsx              # Custom toast notification system (success/error/info)
│   ├── config/
│   │   └── env.js                 # Environment variable loader & fallbacks
│   ├── hooks/
│   │   ├── useLocalStorage.js     # Reactive localStorage synchronization hook
│   │   ├── useSpeechRecognition.js# Web Speech API speech-to-text dictation hook
│   │   └── useSpeechSynthesis.js  # Dual-tier full-sentence audio streaming & TTS hook
│   ├── pages/
│   │   ├── ArchitecturePage.jsx   # Senior engineer evaluation & documentation page
│   │   ├── RandomStringPage.jsx   # Task 2: Advanced Token Studio (useState, useCallback, useEffect)
│   │   └── TranslatorPage.jsx     # Task 1: Polyglot Translation Workstation
│   ├── services/
│   │   └── translationService.js  # RapidAPI translation engine, LRU caching & tone modifiers
│   ├── utils/
│   │   ├── audioFeedback.js       # Web Audio API synthesizer for tactile UI sound effects
│   │   └── textAnalytics.js       # Flesch-Kincaid readability & text complexity analyzer
│   ├── App.jsx                    # Root component with Suspense routing & global modals
│   ├── index.css                  # Tailwind CSS design system, typography, and glass tokens
│   └── main.jsx                   # React 18 createRoot with BrowserRouter wrapper
├── .env.example                   # Environment configuration template
├── index.html                     # HTML5 shell with Google Fonts & no-referrer policy
├── package.json                   # Project scripts and dependencies
├── tailwind.config.js             # Tailored color palette, font definitions, and keyframes
└── vite.config.js                 # Vite bundler configuration with TTS proxy middleware
```

---

## 🧠 React Hook Discipline (Task 2)

| React Hook | Practical Implementation in Project | Optimization Benefit |
| :--- | :--- | :--- |
| **`useState`** | Manages granular reactive states: `length`, `includeUpper`, `includeLower`, `includeNumbers`, `includeSymbols`, `excludeAmbiguous`, `generationMode`, `patternMask`, `batchCount`, `liveTokens`. | Provides atomic state updates, localized re-renders, and instant UI responsiveness. |
| **`useCallback`** | Memoizes core generation engines `generateString()` and `generateBatch()`. | Preserves function reference equality across renders, ensuring child components and `useEffect` dependency graphs do not trigger infinite loops or redundant computations. |
| **`useEffect`** | 1. Automatically regenerates token preview whenever generation parameters change.<br>2. Calculates real-time NIST entropy metrics and crack time estimates.<br>3. Logs execution benchmark timings (`performance.now()`).<br>4. Dynamically synchronizes document title. | Decouples side-effects and telemetry from the UI rendering cycle, keeping the view layer pure and predictable. |

---

## ⚡ Local Setup & Installation

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### 2. Clone the Repository
```bash
git clone https://github.com/priyansusikdar2/Qskill-Assignment---Frontend-Development.git
cd Qskill-Assignment---Frontend-Development
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables (Optional)
Copy the example environment file:
```bash
cp .env.example .env
```
*(The application works out-of-the-box with the default free fallback provider even if no API keys are provided).*

### 5. Launch Development Server
```bash
npm run dev
```
Open your browser at: **`http://localhost:5173`**

### 6. Create Production Build
```bash
npm run build
```

---

## 🔐 Environment Variables

The application can be configured via environment variables prefixed with `VITE_`:

```env
# Application Metadata
VITE_APP_TITLE="QSkill Slab 1 Suite"
VITE_APP_VERSION="1.0.0"

# RapidAPI Credentials (Optional - Default public provider available)
VITE_RAPIDAPI_KEY=your_rapidapi_key_here
VITE_RAPIDAPI_HOST=google-translate113.p.rapidapi.com

# Defaults & Audio Preferences
VITE_DEFAULT_SOURCE_LANG=en
VITE_DEFAULT_TARGET_LANG=es
VITE_ENABLE_SOUND=true
```

---

## 🔑 RapidAPI Credentials Configuration

You can configure your own RapidAPI key through any of the following methods:
1. **In-App Modal**: Click the **RapidAPI** button in the navbar (or press `Ctrl + K` and choose *Credentials: Configure RapidAPI*). Enter your key and test it with live response telemetry. The key is securely saved to your browser's local storage.
2. **Environment File**: Add `VITE_RAPIDAPI_KEY` to your `.env` file before building.
3. **No Key (Zero-Config)**: Leave blank to use the built-in resilient translation provider.

---

## ✅ Quality Assurance & Testing

- **Production Bundle Test**: Verified with Vite production build (`npm run build`), generating optimized, code-split chunks with zero compilation errors.
- **Language Verification**: Verified translations and speech synthesis across multiple script families (Latin, Cyrillic, Devanagari, Arabic, Japanese Kanji/Kana, Hanzi, Thai, Greek).
- **Automated CI**: GitHub Actions workflow verifies linting and build validation on every commit.

---

### 👨‍💻 Author & Submission Details
- **Developer**: Priyansu Sikdar
- **Assignment**: QSkill Internship — Slab 1 Front-End Development
- **Live App**: [https://qskill-assignment-frontend-developm.vercel.app/](https://qskill-assignment-frontend-developm.vercel.app/)
- **License**: [MIT License](LICENSE)
