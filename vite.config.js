import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'tts-proxy-middleware',
      configureServer(server) {
        server.middlewares.use('/api/tts', async (req, res) => {
          try {
            const urlObj = new URL(req.url, 'http://localhost');
            const q = urlObj.searchParams.get('q');
            const tl = urlObj.searchParams.get('tl') || 'en';
            if (!q) {
              res.statusCode = 400;
              res.end('Missing text query');
              return;
            }
            const targetUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(q)}&tl=${tl}&client=tw-ob`;
            const upstream = await fetch(targetUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
              }
            });
            res.statusCode = upstream.status;
            res.setHeader('Content-Type', upstream.headers.get('content-type') || 'audio/mpeg');
            res.setHeader('Cache-Control', 'public, max-age=86400');
            const buffer = Buffer.from(await upstream.arrayBuffer());
            res.end(buffer);
          } catch (e) {
            res.statusCode = 500;
            res.end(e.message || 'TTS upstream error');
          }
        });
      }
    }
  ],
  server: {
    port: 5173,
    open: false
  }
});

