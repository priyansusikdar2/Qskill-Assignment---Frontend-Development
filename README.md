# 🚀 QSkill Internship - Slab 1 Front-End Development Suite

> **Domain**: Front-End Development (React, Tailwind CSS)  
> **Repository Scope**: Unified solution encompassing all three tasks of **Slab 1** connected via **`react-router-dom`**.

[![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react&logoColor=black)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![React Router](https://img.shields.io/badge/React_Router-v6-ca4245?logo=react-router&logoColor=white)](https://reactrouter.com/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📋 Slab 1 Task Requirements Checklist

- [x] **Task 1: Text Translator Application**:
  - Built using **React** and **Tailwind CSS**.
  - Takes English string as input and translates to any target language.
  - Features **RapidAPI** integration with in-app credentials modal and seamless zero-friction fallback.
  - Supports **Speech-to-Text (Microphone Dictation)** and **Text-to-Speech (Native Pronunciation)**.
  - Features copy-to-clipboard, recent translation history, latency metrics, and sample presets.
- [x] **Task 2: Random String Generator**:
  - Built using **React** and **Tailwind CSS**.
  - Rigorously adheres to **`useState`**, **`useCallback`**, and **`useEffect`** hooks.
  - Customizable length slider (4 to 64 chars), character set toggles (uppercase, lowercase, numbers, symbols, ambiguous filter).
  - Cryptographic randomness (`crypto.getRandomValues`), batch generation, Shannon entropy security meter, and export to `.txt`.
  - Built-in live **Hook Telemetry Inspector** showing hook executions in real-time.
- [x] **Task 3: Client-Side Routing**:
  - Implemented using **`react-router-dom`** (`BrowserRouter`, `Routes`, `Route`, `NavLink`).
  - Fluid navigation between `/translator`, `/random-string`, and `/architecture` without page reloads.

---

## 🏗️ Architecture & Project Structure

```
├── public/
├── src/
│   ├── components/
│   │   ├── ApiKeyModal.jsx        # RapidAPI key credentials modal & live connection tester
│   │   └── Navbar.jsx             # React Router navigation bar with status badges
│   ├── hooks/
│   │   ├── useLocalStorage.js     # Reactive persistent state sync with localStorage
│   │   ├── useSpeechRecognition.js# Web Speech Recognition hook (voice dictation)
│   │   └── useSpeechSynthesis.js  # Web Speech Synthesis hook (audio pronunciation)
│   ├── pages/
│   │   ├── ArchitecturePage.jsx   # Senior engineer technical breakdown for evaluators
│   │   ├── RandomStringPage.jsx   # Task 2: useState, useCallback & useEffect implementation
│   │   └── TranslatorPage.jsx     # Task 1: RapidAPI Text Translator application
│   ├── services/
│   │   └── translationService.js  # RapidAPI Google Translate client + resilient fallback
│   ├── App.jsx                    # Routing layout and global app shell
│   ├── index.css                  # Tailwind directives and custom glassmorphism styles
│   └── main.jsx                   # React root entry point wrapped with BrowserRouter
├── index.html                     # HTML5 shell with Google Fonts and metadata
├── package.json                   # Dependencies and scripts
├── postcss.config.js              # PostCSS configuration
├── tailwind.config.js             # Tailwind CSS tokens and themes
└── vite.config.js                 # Vite bundler configuration
```

---

## ⚡ Getting Started Locally

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd "Text translator application"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```

---

## 🔑 RapidAPI Configuration (Task 1)

The application features a **Dual-Engine Architecture**:
1. **Out-of-the-Box Mode**: Works immediately without any configuration required using a reliable, free translation fallback provider.
2. **RapidAPI Mode**: Click the **RapidAPI** button in the top navigation bar to input your `X-RapidAPI-Key` and `X-RapidAPI-Host` (e.g., `google-translate1.p.rapidapi.com`). Use the **"Test API Key"** button to verify connectivity.

---

## 🧠 React Hook Discipline (Task 2)

| Hook | Role & Implementation in Task 2 |
| :--- | :--- |
| **`useState`** | Manages length, character set flags, custom prefixes, batch count, and copied feedback states. |
| **`useCallback`** | Memoizes `generateString()` and `generateBatch()` to prevent re-instantiation across renders while retaining strict dependency closures. |
| **`useEffect`** | Automatically re-generates strings whenever any parameter (length, character sets) changes, and synchronizes the document title. |

---

## 🎨 UI/UX Highlights
- **Glassmorphism & Sleek Dark Mode**: Deep slate backgrounds, frosted glass cards, and violet/emerald neon accents.
- **Full Keyboard Accessibility**: `Ctrl + Enter` to trigger translations.
- **Audio Feedback**: Text-to-speech pronunciation in native accents.
- **Micro-animations**: Smooth transitions, loading spinners, and glowing button hover states.
