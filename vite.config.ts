import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: [
      {
        // Redirect bare `@shelby-protocol/sdk` to the browser build.
        // Regex anchor (^...$) prevents double-rewriting subpath imports
        // like `@shelby-protocol/sdk/browser` → `…/browser/browser`.
        find: /^@shelby-protocol\/sdk$/,
        replacement: '@shelby-protocol/sdk/browser',
      },
    ],
  },

  define: {
    global: 'globalThis',
    'process.env': '{}',
  },

  // Ensure .wasm files are served as assets (not transformed)
  assetsInclude: ['**/*.wasm'],

  optimizeDeps: {
    include: [
      '@aptos-labs/ts-sdk',
      '@aptos-labs/wallet-adapter-react',
      '@shelby-protocol/react',
      '@shelby-protocol/sdk',
    ],
    // clay-codes uses `new URL("./clay.wasm", import.meta.url)` for WASM loading.
    // Pre-bundling breaks the relative path → browser gets HTML instead of WASM.
    // Excluding lets Vite serve it directly from node_modules with correct path.
    exclude: [
      '@shelby-protocol/clay-codes',
      '@shelby-protocol/reed-solomon',
    ],
  },

  build: {
    chunkSizeWarningLimit: 900,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts')) return 'charts'
            if (id.includes('@aptos-labs/ts-sdk')) return 'aptos-sdk'
            if (id.includes('@aptos-labs/wallet-adapter-react')) return 'aptos-wallet-react'
            if (id.includes('@aptos-labs/wallet-adapter-core')) return 'aptos-wallet-core'
            if (id.includes('@aptos-connect') || id.includes('@identity-connect')) return 'aptos-connect'
            if (id.includes('@wallet-standard')) return 'wallet-standard'
            if (id.includes('@aptos-labs')) return 'aptos-misc'
            if (id.includes('@shelby-protocol')) return 'shelby'
            if (id.includes('react')) return 'react-vendor'
          }
        },
      },
    },
  },
})
