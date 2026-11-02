import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Minecraft Enchantment Order',
        short_name: 'Enchant Order',
        description:
          'Calculate the optimal enchantment order for your Minecraft items to minimize anvil costs.',
        theme_color: '#1a1612',
        background_color: '#1a1612',
        display: 'standalone',
        orientation: 'any',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        // Item images and language files are cached too, so the tool works offline
        globPatterns: ['**/*.{js,css,html,gif,json}'],
      },
    }),
  ],
  base: process.env.BASE ?? './',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react';
          }
        },
      },
    },
  },
});
