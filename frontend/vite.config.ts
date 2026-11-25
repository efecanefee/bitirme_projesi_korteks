/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
        manifest: {
          name: 'Korteks – Öğrenci Platformu',
          short_name: 'Korteks',
          description: 'PSG, Pusula ve OBS tek panelde; yapay zekâ destekli öğrenci asistanı.',
          lang: 'tr',
          start_url: '/',
          display: 'standalone',
          background_color: '#F5F6F8',
          theme_color: '#1D4F91',
          icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          // Kişisel veri (KVKK) önbelleğe alınmaz; yalnızca uygulama kabuğu önbelleklenir.
          navigateFallbackDenylist: [/^\/api\//],
          globIgnores: ['**/mockServiceWorker.js'],
        },
      }),
    ],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              { name: 'react', test: /node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/ },
              { name: 'mui', test: /node_modules[\\/](@mui|@emotion|@popperjs)[\\/]/ },
              { name: 'data', test: /node_modules[\\/](@tanstack|zustand|dayjs|zod|react-hook-form|@hookform)[\\/]/ },
            ],
          },
        },
      },
    },
    server: {
      port: 5173,
      proxy: { '/api': { target: env.VITE_PROXY_TARGET || 'http://localhost:8000', changeOrigin: true } },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      css: false,
      exclude: ['e2e/**', 'node_modules/**'],
    },
  };
});
