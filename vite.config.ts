import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/whats-my-grade/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['nyu-logo.png'],
      manifest: {
        name: 'My Grades',
        short_name: 'My Grades',
        description: 'Grade tracking application',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'nyu-logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'nyu-logo.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    host: true,
  },
})
