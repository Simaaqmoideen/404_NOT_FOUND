import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  optimizeDeps: {
    // Include TF.js so Vite pre-bundles & handles CJS → ESM transform
    include: [
      '@tensorflow/tfjs',
      '@tensorflow-models/mobilenet',
    ],
  },
  build: {
    commonjsOptions: { transformMixedEsModules: true },
  },
})
