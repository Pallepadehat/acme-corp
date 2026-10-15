import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { precompress } from './precompress.ts'

const api = 'http://localhost:4000'

export default defineConfig({
  plugins: [
    // Generates src/routeTree.gen.ts from src/routes, and puts each page in its own chunk.
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    // React Compiler: memoizes components and hooks for you, so there is no
    // useMemo / useCallback / memo to write and nothing re-renders needlessly.
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
    precompress(),
  ],
  resolve: {
    alias: { '@': new URL('./src', import.meta.url).pathname },
  },
  // One .env at the repo root, shared with the API.
  envDir: '../../',
  server: {
    port: 3000,
    strictPort: true,
    // The browser only ever talks to its own origin, so auth cookies just work
    // and there is no CORS. In production the API serves the app the same way.
    proxy: { '/api': api },
  },
  preview: { port: 3000, strictPort: true, proxy: { '/api': api } },
  build: {
    target: 'baseline-widely-available',
    sourcemap: true,
    rolldownOptions: {
      output: {
        codeSplitting: {
          // Libraries that rarely change get their own long-cached files, so a
          // deploy that only touches your code does not make users re-download React.
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
            { name: 'router', test: /node_modules[\\/]@tanstack[\\/]/ },
            { name: 'i18n', test: /node_modules[\\/](i18next|react-i18next)/ },
          ],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
})
