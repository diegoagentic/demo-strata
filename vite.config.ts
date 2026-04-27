import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES === 'true' ? '/demo-strata/' : '/',
  server: {
    port: 8085,
    strictPort: false,
  },
  resolve: {
    alias: {
      // strata-ds doesn't have a library build — resolve to source
      // directly so both dev and prod builds work.
      'strata-design-system': path.resolve(__dirname, 'packages/strata-ds/src/components/index.ts'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'vendor-react';
          if (id.includes('node_modules/lucide-react')) return 'vendor-lucide';
          if (id.includes('node_modules/@heroicons')) return 'vendor-heroicons';
          if (id.includes('node_modules/')) return 'vendor';
          if (id.includes('/features/leland/') || id.includes('/config/profiles/leland')) return 'feature-leland';
          if (id.includes('/components/mbi/') || id.includes('/features/mbi/')) return 'feature-mbi';
          if (id.includes('/components/simulations/') || id.includes('/features/strata-estimator')) return 'feature-simulations';
        },
      },
    },
  },
})
