/* eslint-disable @typescript-eslint/no-unused-vars */
import MillionLint from '@million/lint';
import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    // MillionLint.vite(),
    react(),
    dts({ include: ['lib'] })
  ],
  server: {
    fs: {
      // Allow serving files from the linked package source
      allow: [
        '..',
        '../timedtext-player',
      ],
    },
  },
  resolve: {
    dedupe: ['react', 'react-dom', '@emotion/react', '@emotion/styled'],
    // Only use local package aliases in development mode
    // In production builds, use the published npm packages from node_modules
    ...(mode === 'development' && {
      alias: {
        '@theirstoryinc/timedtext-player': resolve(__dirname, '../timedtext-player'),
      },
    }),
  },
  build: {
    sourcemap: 'inline',
    minify: false,
    copyPublicDir: false,
    lib: {
      entry: resolve(__dirname, 'lib/main.ts'),
      formats: ['es']
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime'],
    }
  },
  optimizeDeps: {
    force: true,
    exclude: mode === 'development' ? ['@theirstoryinc/timedtext-player'] : [],
    esbuildOptions: {
      sourcemap: true,
    },
  }
}))
