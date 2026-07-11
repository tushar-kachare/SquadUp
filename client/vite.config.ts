import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      manifest: false,
      injectRegister: false,
      srcDir: 'src/sw',
      filename: 'service-worker.ts',
      injectManifest: {
        injectionPoint: undefined,
      },
    }),
  ],
})
