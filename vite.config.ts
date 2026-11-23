import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'コツコツ達成録',
        short_name: 'コツコツ達成録',
        description: '毎日の習慣を楽しく記録するアプリです。',
        theme_color: '#0d9488',
        background_color: '#f8fafc',
        display: 'standalone',
        icons: [
          {
            src: '/icon.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
});
